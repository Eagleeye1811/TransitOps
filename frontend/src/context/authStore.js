import { create } from 'zustand'

const STORAGE_KEY = 'transitops.session'

function readStoredSession() {
  try {
    const local = localStorage.getItem(STORAGE_KEY)
    if (local) return JSON.parse(local)
    const session = sessionStorage.getItem(STORAGE_KEY)
    if (session) return JSON.parse(session)
  } catch {
    return null
  }
  return null
}

function writeStoredSession(payload, rememberMe) {
  const serialized = JSON.stringify(payload)
  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, serialized)
    sessionStorage.removeItem(STORAGE_KEY)
  } else {
    sessionStorage.setItem(STORAGE_KEY, serialized)
    localStorage.removeItem(STORAGE_KEY)
  }
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

const initialSession = readStoredSession()

// Auth state — the ONLY authoritative source for the current user's role.
// The role picked on the login form is never written here directly; only a
// verified user record returned by authService.login() is.
export const useAuthStore = create((set) => ({
  user: initialSession?.user ?? null,
  token: initialSession?.token ?? null,
  role: initialSession?.user?.role ?? null,
  isAuthenticated: !!initialSession?.user,

  login: (user, token, rememberMe = false) => {
    writeStoredSession(
      { userId: user.id, user, token, role: user.role, loggedInAt: new Date().toISOString() },
      rememberMe
    )
    set({ user, token, role: user.role, isAuthenticated: true })
  },

  logout: () => {
    clearStoredSession()
    set({ user: null, token: null, role: null, isAuthenticated: false })
  },

  updateUser: (patch) =>
    set((state) => {
      const user = state.user ? { ...state.user, ...patch } : state.user
      if (user) {
        const rememberedInLocal = !!localStorage.getItem(STORAGE_KEY)
        writeStoredSession(
          { userId: user.id, user, token: state.token, role: user.role, loggedInAt: new Date().toISOString() },
          rememberedInLocal
        )
      }
      return { user }
    }),
}))

/** Non-reactive token getter for use outside React components (apiClient). */
export function getStoredToken() {
  return readStoredSession()?.token ?? null
}
