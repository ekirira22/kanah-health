"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, LogOut, Moon, Sun, Globe, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { LanguageToggle } from "@/components/language-toggle"
import { BottomNav } from "@/components/bottom-nav"

export default function Settings() {
  const router = useRouter()
  const { user, mother, signOut, isLoading } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white mr-2">
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <LanguageToggle initialLanguage={mother?.language_preference || "english"} />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* User Profile */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-2xl">👤</span>
          </div>
          <div>
            <h2 className="font-medium">{user?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.phone_number}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Dark Mode</span>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={20} />
                  <span>Push Notifications</span>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Language</h3>
            <div className="flex items-center gap-3">
              <Globe size={20} />
              <span>Language</span>
              <div className="ml-auto">
                <LanguageToggle initialLanguage={mother?.language_preference || "english"} />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full flex items-center gap-2 justify-center"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut size={18} />
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
