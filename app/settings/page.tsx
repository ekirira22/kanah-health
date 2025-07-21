"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Moon, Sun, Bell, Shield, HelpCircle, Star, Crown, Settings as SettingsIcon, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { LanguageToggle } from "@/components/language-toggle"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { useThemeState } from "@/hooks/use-theme"
import { BrandedLoader } from "@/components/branded-loader"

export default function Settings() {
  const router = useRouter()
  const { user, mother, signOut, isLoading } = useAuth()
  const { isDark, toggleTheme, mounted } = useThemeState()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <BrandedLoader message="Loading settings..." />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <AppHeader title="Settings" showBack />

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
                  {isDark ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Dark Mode</span>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleTheme} disabled={!mounted} />
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
              <span>Language</span>
              <div className="ml-auto">
                <LanguageToggle initialLanguage={mother?.language_preference || "english"} />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Subscription</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown size={20} className="text-yellow-500" />
                  <div>
                    <span className="font-medium">Current Plan</span>
                    <p className="text-sm text-muted-foreground capitalize">{mother?.subscription_status || "Free"}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade
                </Button>
              </div>
              {mother?.subscription_status === "premium" && mother?.subscription_end_date && (
                <div className="text-sm text-muted-foreground">
                  Expires: {new Date(mother.subscription_end_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Support & Help</h3>
            <div className="space-y-4">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <HelpCircle size={20} />
                <span>Help & Support</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Shield size={20} />
                <span>Privacy Policy</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Star size={20} />
                <span>Rate App</span>
              </Button>
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
