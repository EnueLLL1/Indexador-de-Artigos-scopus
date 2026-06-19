import { useState, useEffect } from 'react'

export function useDarkMode(initialValue = false) {
  const [darkMode, setDarkMode] = useState(initialValue)

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
  }, [darkMode])

  return [darkMode, setDarkMode]
}
