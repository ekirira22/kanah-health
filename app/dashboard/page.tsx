"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Droplet } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { MoodSelector } from "@/components/mood-selector"
import { ReminderCard } from "@/components/reminder-card"
import { QuickActionButton } from "@/components/quick-action-button"
import { AdCard } from "@/components/ad-card"
import { AppHeader } from "@/components/app-header"
import { Heart, Phone, BookOpen, BarChart3, NotebookPen } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { AutomatedReminder, Advertisement } from "@/lib/types"

export default function Dashboard() {
  const { user, mother, isLoading } = useAuth()
  const [daysSinceBirth, setDaysSinceBirth] = useState(0)
  const [reminders, setReminders] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!mother) return

      try {
        setIsLoadingData(true)
        const supabase = getSupabaseClient()

        // Fetch all required data in parallel
        const [
          { data: babyData },
          { data: reminderData },
          { data: adData }
        ] = await Promise.all([
          supabase
            .from("babies")
            .select("birth_date")
            .eq("mother_id", mother.id)
            .single(),
          supabase
            .from("automated_reminders")
            .select("*")
            .eq("language", mother.language_preference)
            .eq("applicable_birth_type", mother.birth_type === "vaginal" ? "vaginal" : "c_section")
            .order("days_postpartum", { ascending: true })
            .limit(3),
          supabase
            .from("advertisements")
            .select("*")
            .eq("active", true)
            .eq("language", mother.language_preference)
            .limit(2)
        ])

        // Calculate days since birth
        if (babyData?.birth_date) {
          const birthDate = new Date(babyData.birth_date as string)
          const today = new Date()
          const diffTime = Math.abs(today.getTime() - birthDate.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setDaysSinceBirth(diffDays)
        }

        // Format reminders
        const formattedReminders = (reminderData || []).map((reminder: any) => {
          let icon
          switch (reminder.category) {
            case "breastfeeding":
              icon = <Droplet className="text-blue-500" />
              break
            case "mental_health":
              icon = <Heart className="text-red-500" />
              break
            default:
              icon = <AlertTriangle className="text-yellow-500" />
          }

          return {
            id: reminder.id,
            icon,
            title: reminder.title,
            description: reminder.message,
          }
        })
        setReminders(formattedReminders)

        // Format ads
        const formattedAds = (adData || []).map((ad: any) => ({
          id: ad.id,
          brand_name: ad.brand_name,
          content: ad.content,
          image_url: ad.image_url,
        }))
        setAds(formattedAds)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (mother && !isLoading) {
      fetchDashboardData()
    }
  }, [mother, isLoading])

  const handleMoodSelect = (mood: string) => {
    console.log("Selected mood:", mood)
    // In a real app, we would send this to the API
  }

  const handleReminderDone = (id: string) => {
    console.log("Reminder marked as done:", id)
    // In a real app, we would update this in the database
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
  }

  const handleReminderLater = (id: string) => {
    console.log("Reminder postponed:", id)
    // In a real app, we would reschedule this reminder
  }

  if (isLoading || isLoadingData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Header */}
      <div className="bg-primary text-white p-6 rounded-b-3xl">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold">Hello, {user?.full_name?.split(' ')[0] || "Mama"}!</h1>
            <p className="text-sm opacity-90">Day {daysSinceBirth} postpartum</p>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-primary-foreground/10 rounded-lg p-4 mt-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Birth Type</span>
              <span className="text-sm font-medium capitalize">{mother?.birth_type || "Not specified"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Language</span>
              <span className="text-sm font-medium capitalize">{mother?.language_preference || "English"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-80">Subscription</span>
              <span className="text-sm font-medium capitalize">{mother?.subscription_status || "Free"}</span>
            </div>
          </div>
        </div>

        {/* Important alert */}
        <div className="bg-primary-foreground/10 rounded-lg p-3 mt-4 flex items-center gap-3">
          <div className="bg-yellow-300 rounded-full p-1">
            <AlertTriangle size={18} className="text-yellow-800" />
          </div>
          <div>
            <p className="font-medium">Important today</p>
            <p className="text-sm opacity-90">Check for excessive bleeding</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <h2 className="font-medium mb-4">Today&apos;s Reminders</h2>

        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              icon={reminder.icon}
              title={reminder.title}
              description={reminder.description}
              onDone={() => handleReminderDone(reminder.id)}
              onRemindLater={() => handleReminderLater(reminder.id)}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-sm mb-6">No reminders for today</p>
        )}

        <div className="mb-6">
          <h3 className="font-medium mb-2">How are you feeling today?</h3>
          <p className="text-sm text-muted-foreground mb-2">Your mental health matters</p>
          <MoodSelector onMoodSelect={handleMoodSelect} />
        </div>

        <h2 className="font-medium mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <QuickActionButton icon={Heart} label="Symptom Checker" href="/symptom-checker" color="bg-red-100" />
          <QuickActionButton icon={Phone} label="Book Appointment" href="/book-appointment" color="bg-green-100" />
          <QuickActionButton icon={BookOpen} label="Health Tips" href="/health-tips" color="bg-blue-100" />
          <QuickActionButton icon={BarChart3} label="Baby Growth" href="/baby-growth" color="bg-yellow-100" isPremium />
          {/* <QuickActionButton icon={NotebookPen} label="Appointments" href="/appointments" color="bg-purple-100" /> */}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">Helpful Tips</h2>
            <span className="text-xs text-muted-foreground">Sponsored</span>
          </div>

          {ads.length > 0 ? (
            ads.map((ad) => (
              <AdCard key={ad.id} brandName={ad.brand_name} content={ad.content} imageUrl={ad.image_url} />
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No sponsored content available</p>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
