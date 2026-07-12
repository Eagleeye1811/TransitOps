import { useToastStore } from '@/context/toastStore'

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)

  return {
    success: (message, opts) => addToast({ type: 'success', message, ...opts }),
    error: (message, opts) => addToast({ type: 'error', message, ...opts }),
    info: (message, opts) => addToast({ type: 'info', message, ...opts }),
    warning: (message, opts) => addToast({ type: 'warning', message, ...opts }),
  }
}
