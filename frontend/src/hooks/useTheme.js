import { useEffect } from 'react'
import { useThemeStore } from '@/context/themeStore'

/**
 * Reads/writes the current theme and applies the Tailwind v4 class-based
 * dark mode variant (`@custom-variant dark (&:where(.dark, .dark *));`) by
 * toggling a `dark` class on the root <html> element.
 */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  return { theme, isDark: theme === 'dark', setTheme, toggleTheme }
}
