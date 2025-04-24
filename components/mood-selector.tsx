"use client"

import { useState } from "react"

type Mood = "happy" | "neutral" | "sad" | "distressed"

interface MoodSelectorProps {
  onMoodSelect?: (mood: Mood) => void
}

export function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    if (onMoodSelect) {
      onMoodSelect(mood)
    }
  }

  return (
    <div className="flex justify-between">
      <button
        onClick={() => handleMoodSelect("happy")}
        className={`p-2 rounded-full ${selectedMood === "happy" ? "bg-secondary" : ""}`}
      >
        <span role="img" aria-label="happy" className="text-2xl">
          😊
        </span>
      </button>
      <button
        onClick={() => handleMoodSelect("neutral")}
        className={`p-2 rounded-full ${selectedMood === "neutral" ? "bg-secondary" : ""}`}
      >
        <span role="img" aria-label="neutral" className="text-2xl">
          😐
        </span>
      </button>
      <button
        onClick={() => handleMoodSelect("sad")}
        className={`p-2 rounded-full ${selectedMood === "sad" ? "bg-secondary" : ""}`}
      >
        <span role="img" aria-label="sad" className="text-2xl">
          😔
        </span>
      </button>
      <button
        onClick={() => handleMoodSelect("distressed")}
        className={`p-2 rounded-full ${selectedMood === "distressed" ? "bg-secondary" : ""}`}
      >
        <span role="img" aria-label="distressed" className="text-2xl">
          😫
        </span>
      </button>
    </div>
  )
}
