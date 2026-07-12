import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  children,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
            tone === 'danger'
              ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
          }`}
        >
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          {children}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
