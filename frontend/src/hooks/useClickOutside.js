import { useEffect } from 'react'

export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) handler()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [ref, handler, active])
}
