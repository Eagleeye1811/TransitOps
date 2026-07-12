import { api, toCamel, ApiError } from './apiClient'
import { useAuthStore, getStoredToken } from '@/context/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function getToken() {
  return useAuthStore.getState().token ?? getStoredToken()
}

export async function getDocuments(ownerType, ownerId) {
  return api.get('/documents', { ownerType, ownerId })
}

/**
 * File uploads need multipart/form-data, which the JSON-only `api.*`
 * helpers in apiClient.js don't support — this does a raw fetch with
 * FormData instead (no Content-Type header, the browser sets the
 * multipart boundary itself) but reuses the same Bearer-token logic.
 */
export async function uploadDocument({ ownerType, ownerId, docType, documentNumber, expiryDate, file }) {
  const form = new FormData()
  form.append('owner_type', ownerType)
  form.append('owner_id', ownerId)
  form.append('doc_type', docType)
  if (documentNumber) form.append('document_number', documentNumber)
  if (expiryDate) form.append('expiry_date', expiryDate)
  form.append('file', file)

  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(new URL('documents', `${BASE_URL}/`), {
      method: 'POST',
      headers,
      body: form,
    })
  } catch {
    throw new ApiError('Could not reach the TransitOps server. Check your connection and try again.', {
      status: 0,
      errors: ['Could not reach the TransitOps server. Check your connection and try again.'],
    })
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // no body
  }

  if (!response.ok) {
    const message = data?.detail ?? `Request failed (${response.status}).`
    if (response.status === 401) useAuthStore.getState().logout()
    throw new ApiError(message, { status: response.status, errors: data?.errors ?? [message] })
  }

  return toCamel(data)
}

export async function deleteDocument(id) {
  return api.delete(`/documents/${id}`)
}
