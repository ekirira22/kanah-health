"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Phone, Settings } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-around items-center py-2">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center p-2 ${
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/calendar"
          className={`flex flex-col items-center p-2 ${
            pathname === "/calendar" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">Calendar</span>
        </Link>
        <Link
          href="/consultations"
          className={`flex flex-col items-center p-2 ${
            pathname === "/consultations" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Phone size={20} />
          <span className="text-xs mt-1">Consultations</span>
        </Link>
        <Link
          href="/settings"
          className={`flex flex-col items-center p-2 ${
            pathname === "/settings" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Settings size={20} />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </div>
  )
}
