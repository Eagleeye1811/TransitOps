import { create } from 'zustand'

const STORAGE_KEY = 'transitops.theme'

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage unavailable — fall through to OS preference
  }
  return null
}

function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore write failures (e.g. private browsing quota)
  }
}

const initialTheme = readStoredTheme() ?? getSystemPreference()

export const useThemeStore = create((set, get) => ({
  theme: initialTheme,

  setTheme: (theme) => {
    writeStoredTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    writeStoredTheme(next)
    set({ theme: next })
  },
}))
