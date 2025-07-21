"use client"

import { Loader2 } from "lucide-react"
import { Logo } from "./logo"

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ message = "Loading...", size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
      </div>
      {message && (
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  )
}

export function PageLoader({ message = "Loading page..." }: { message?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <div className="text-center space-y-2">
          <Logo variant="horizontal" className="mb-2" />
          <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
        </div>
      </div>
    </main>
  )
}

export function CardLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="h-8 w-8 rounded-full border-2 border-primary/20"></div>
        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
} 