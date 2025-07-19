"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  showProfile?: boolean
}

export function AppHeader({ title, showBack = false, onBack, showProfile = true }: AppHeaderProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleProfileClick = () => {
    router.push("/dashboard/profile")
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-primary text-white p-4 flex items-center justify-between">
      <div className="flex items-center">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white mr-2">
            <ChevronLeft size={24} />
          </Button>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        {showProfile && (
          <Button variant="ghost" size="icon" onClick={handleProfileClick} className="text-white hover:bg-white/10">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                {getInitials(user?.full_name || "U")}
              </AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </div>
  )
} 