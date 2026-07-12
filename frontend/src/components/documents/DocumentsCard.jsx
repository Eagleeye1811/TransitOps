import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card'
import { Button, IconButton } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { usePermissions } from '@/hooks/usePermissions'
import { useToast } from '@/hooks/useToast'
import { MODULES, ACTIONS } from '@/config/permissions'
import { formatDate } from '@/utils/formatters'
import * as documentService from '@/services/documentService'
import { DocumentUploadModal } from './DocumentUploadModal'

const TODAY = new Date('2026-07-12')

function isExpired(dateStr) {
  return !!dateStr && new Date(dateStr) < TODAY
}

function isExpiringSoon(dateStr, withinDays = 60) {
  if (!dateStr) return false
  const diffDays = Math.ceil((new Date(dateStr) - TODAY) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= withinDays
}

function isImageFile(url) {
  if (!url) return false
  return url.startsWith('data:image/') || /\.(png|jpe?g|gif|webp)$/i.test(url)
}

/**
 * Shared "Documents" card for both VehicleDetailsPage and DriverDetailsPage.
 * Vehicle documents are gated by MODULES.FLEET + ACTIONS.EDIT (same as
 * editing the vehicle); driver documents by MODULES.DRIVERS + (EDIT or
 * EDIT_OPERATIONAL) — Fleet Manager only has EDIT_OPERATIONAL on drivers,
 * mirroring DriverDetailsPage's own edit-button split.
 */
export function DocumentsCard({ ownerType, ownerId }) {
  const { canDo } = usePermissions()
  const toast = useToast()

  const module = ownerType === 'vehicle' ? MODULES.FLEET : MODULES.DRIVERS
  const canManage =
    ownerType === 'driver'
      ? canDo(module, ACTIONS.EDIT) || canDo(module, ACTIONS.EDIT_OPERATIONAL)
      : canDo(module, ACTIONS.EDIT)

  const [documents, setDocuments] = useState(undefined) // undefined = loading
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    documentService.getDocuments(ownerType, ownerId).then(setDocuments)
  }, [ownerType, ownerId])

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDocuments(undefined)
    documentService.getDocuments(ownerType, ownerId).then((data) => {
      if (active) setDocuments(data)
    })
    return () => {
      active = false
    }
  }, [ownerType, ownerId])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await documentService.deleteDocument(deleteTarget.id)
      toast.success('Document deleted.')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Failed to delete document. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>RC, insurance, permits & other uploaded records.</CardDescription>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" />
            Upload
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {documents === undefined ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description={canManage ? 'Upload the first document for this record.' : 'No documents have been uploaded yet.'}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const expired = isExpired(doc.expiryDate)
              const expiringSoon = !expired && isExpiringSoon(doc.expiryDate)
              return (
                <li key={doc.id} className="flex items-center gap-3 py-3">
                  {isImageFile(doc.fileUrl) ? (
                    <img
                      src={doc.fileUrl}
                      alt={doc.docType}
                      className="size-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <FileText className="size-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{doc.docType}</span>
                      {doc.documentNumber && <span className="text-xs text-slate-500 dark:text-slate-400">#{doc.documentNumber}</span>}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {doc.expiryDate && <span>Expires {formatDate(doc.expiryDate)}</span>}
                      {expired && <Badge color="red">Expired</Badge>}
                      {expiringSoon && <Badge color="amber">Expiring soon</Badge>}
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    View
                    <ExternalLink className="size-3.5" />
                  </a>
                  {canManage && (
                    <IconButton aria-label="Delete document" onClick={() => setDeleteTarget(doc)}>
                      <Trash2 className="size-4 text-red-500" />
                    </IconButton>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>

      {canManage && (
        <DocumentUploadModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          ownerType={ownerType}
          ownerId={ownerId}
          onUploaded={load}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        tone="danger"
        title="Delete this document?"
        description={
          deleteTarget
            ? `${deleteTarget.docType}${deleteTarget.documentNumber ? ` (#${deleteTarget.documentNumber})` : ''} will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
      />
    </Card>
  )
}
