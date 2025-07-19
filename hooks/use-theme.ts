"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

export function useThemeState() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const isDark = theme === "dark"

  return {
    isDark,
    toggleTheme,
    mounted,
  }
} 