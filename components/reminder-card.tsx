"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ReminderCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onDone?: () => void
  onRemindLater?: () => void
}

export function ReminderCard({ icon, title, description, onDone, onRemindLater }: ReminderCardProps) {
  const [isDone, setIsDone] = useState(false)

  const handleDone = () => {
    setIsDone(true)
    if (onDone) {
      onDone()
    }
  }

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg mb-4">
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-grow">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {!isDone && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleDone}
            >
              Done
            </Button>
            <Button variant="link" size="sm" className="text-primary" onClick={onRemindLater}>
              Remind later
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
