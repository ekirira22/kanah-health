"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type Language = "english" | "swahili"

interface LanguageToggleProps {
  initialLanguage?: Language
  onLanguageChange?: (language: Language) => void
}

export function LanguageToggle({ initialLanguage = "english", onLanguageChange }: LanguageToggleProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage)

  const toggleLanguage = () => {
    const newLanguage = language === "english" ? "swahili" : "english"
    setLanguage(newLanguage)
    if (onLanguageChange) {
      onLanguageChange(newLanguage)
    }
  }

  return (
    <Button variant="outline" size="sm" className="rounded-full px-3 py-1 text-xs" onClick={toggleLanguage}>
      {language === "english" ? "EN | SW" : "SW | EN"}
    </Button>
  )
}
