import { create } from 'zustand'

let idCounter = 0

export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = ++idCounter
    const entry = { id, type: 'info', duration: 4500, ...toast }
    set((state) => ({ toasts: [...state.toasts, entry] }))
    if (entry.duration) {
      setTimeout(() => get().removeToast(id), entry.duration)
    }
    return id
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
