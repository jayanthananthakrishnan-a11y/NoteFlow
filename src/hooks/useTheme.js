import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('noteflow:dark')
      if (stored !== null) return stored === '1' ? 'dark' : 'light'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      const root = document.documentElement
      
      // Add transition class for smooth theme switching
      root.classList.add('theme-transitioning')
      
      if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      
      localStorage.setItem('noteflow:dark', theme === 'dark' ? '1' : '0')
      
      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('theme-transitioning')
      }, 300)
    } catch (e) {
      console.error('Theme error:', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
