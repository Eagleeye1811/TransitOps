import { useRef, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { Field, Input, Select } from '@/components/common/FormControls'
import { useToast } from '@/hooks/useToast'
import * as documentService from '@/services/documentService'

const DOC_TYPES = ['RC', 'Insurance', 'Permit', 'Licence', 'Fuel Receipt', 'Other']

// Best-effort OCR heuristics — not meant to be highly accurate, just to
// visibly attempt extraction and pre-fill fields the user can review/correct.
function extractExpiryDate(text) {
  const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)
  if (isoMatch) return isoMatch[0]

  const dmyMatch = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/)
  if (dmyMatch) {
    const [, d, m, yRaw] = dmyMatch
    const year = yRaw.length === 2 ? `20${yRaw}` : yRaw
    const month = m.padStart(2, '0')
    const day = d.padStart(2, '0')
    if (Number(month) > 12 || Number(day) > 31) return null
    return `${year}-${month}-${day}`
  }
  return null
}

function extractDocumentNumber(text) {
  const matches = text.replace(/\n/g, ' ').match(/\b[A-Z0-9]{6,}\b/g)
  if (!matches) return null
  // Prefer a token that mixes letters and digits (looks like a real
  // registration/document number rather than a stray run of digits).
  return matches.find((m) => /[A-Z]/.test(m) && /[0-9]/.test(m)) ?? matches[0]
}

export function DocumentUploadModal({ open, onClose, ownerType, ownerId, onUploaded }) {
  const toast = useToast()
  const [docType, setDocType] = useState(DOC_TYPES[0])
  const [documentNumber, setDocumentNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const scanTokenRef = useRef(0)

  function resetForm() {
    setDocType(DOC_TYPES[0])
    setDocumentNumber('')
    setExpiryDate('')
    setFile(null)
    setScanning(false)
  }

  function handleClose() {
    if (submitting) return
    resetForm()
    onClose?.()
  }

  async function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (!selected || !selected.type.startsWith('image/')) return

    const token = ++scanTokenRef.current
    setScanning(true)
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng')
      const {
        data: { text },
      } = await worker.recognize(selected)
      await worker.terminate()

      if (token !== scanTokenRef.current) return // user picked a different file meanwhile

      const guessedDate = extractExpiryDate(text)
      const guessedNumber = extractDocumentNumber(text)
      if (guessedDate) setExpiryDate(guessedDate)
      if (guessedNumber) setDocumentNumber((prev) => prev || guessedNumber)
    } catch {
      // OCR is a best-effort assist — silently fall back to manual entry.
    } finally {
      if (token === scanTokenRef.current) setScanning(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a file to upload.')
      return
    }
    setSubmitting(true)
    try {
      await documentService.uploadDocument({
        ownerType,
        ownerId,
        docType,
        documentNumber: documentNumber || undefined,
        expiryDate: expiryDate || undefined,
        file,
      })
      toast.success('Document uploaded.')
      onUploaded?.()
      resetForm()
      onClose?.()
    } catch {
      toast.error('Failed to upload document. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload Document" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Document Type" htmlFor="doc-type" required>
          <Select id="doc-type" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="File"
          htmlFor="doc-file"
          required
          hint="Images and PDFs supported. Selecting an image attempts to auto-fill the fields below — review before uploading."
        >
          <input
            id="doc-file"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:text-slate-300"
          />
          {scanning && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-brand-600">
              <Loader2 className="size-3.5 animate-spin" />
              Scanning document…
            </p>
          )}
        </Field>

        <Field label="Document Number" htmlFor="doc-number" hint="Optional.">
          <Input
            id="doc-number"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            placeholder="e.g. RC-4471029"
          />
        </Field>

        <Field label="Expiry Date" htmlFor="doc-expiry" hint="Optional.">
          <Input id="doc-expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            <UploadCloud className="size-4" />
            Upload
          </Button>
        </div>
      </form>
    </Modal>
  )
}
