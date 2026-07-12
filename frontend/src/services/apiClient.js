import { useAuthStore, getStoredToken } from '@/context/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// The backend speaks snake_case (Python/Postgres convention); every page
// and component in this app was built against the mock services' camelCase
// shape. Rather than touch every consuming component, translate keys at the
// network boundary — both directions, recursively.
function toSnakeKey(key) {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
}
function toCamelKey(key) {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}
function transformKeys(value, transformer) {
  if (Array.isArray(value)) return value.map((item) => transformKeys(item, transformer))
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [transformer(k), transformKeys(v, transformer)]))
  }
  return value
}
export const toSnake = (obj) => transformKeys(obj, toSnakeKey)
export const toCamel = (obj) => transformKeys(obj, toCamelKey)

export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors ?? [message]
  }
}

function getToken() {
  // Prefer the live store (covers the just-logged-in-this-tick case before
  // storage has necessarily been read back), fall back to storage directly.
  return useAuthStore.getState().token ?? getStoredToken()
}

function buildUrl(path, params) {
  const url = new URL(path.replace(/^\//, ''), `${BASE_URL}/`)
  if (params) {
    for (const [key, value] of Object.entries(toSnake(params))) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    }
  }
  return url.toString()
}

async function request(method, path, { body, params, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(toSnake(body)) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the TransitOps server. Check your connection and try again.', {
      status: 0,
      errors: ['Could not reach the TransitOps server. Check your connection and try again.'],
    })
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // no body (e.g. some error responses) — fall through with data=null
  }

  if (!response.ok) {
    const message = data?.detail ?? `Request failed (${response.status}).`
    if (response.status === 401 && auth) {
      // Session expired/invalid — clear it so the app falls back to the
      // login screen instead of silently failing every subsequent call.
      useAuthStore.getState().logout()
    }
    throw new ApiError(message, { status: response.status, errors: data?.errors ?? [message] })
  }

  return toCamel(data)
}

export const api = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
}
