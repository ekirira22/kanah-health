"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import { BrandedLoader } from "@/components/branded-loader"
import type { HealthTip } from "@/lib/types"

export default function HealthTips() {
  const router = useRouter()
  const [healthTips, setHealthTips] = useState<HealthTip[]>([])
  const [filteredTips, setFilteredTips] = useState<HealthTip[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHealthTips = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("health_tips")
          .select("*")
          .eq("language", "english")
          .eq("premium_content", false)

        if (error) {
          throw error
        }

        setHealthTips(data as unknown as HealthTip[])
        setFilteredTips(data as unknown as HealthTip[])
      } catch (error) {
        console.error("Error fetching health tips:", error)
        // For demo purposes, use mock data if the API call fails
        const mockTips = [
          {
            id: "1",
            title: "Stay Hydrated",
            content: "Drinking enough water is crucial for milk production. Aim for at least 8-10 glasses daily.",
            content_type: "text",
            category: "breastfeeding",
            applicable_birth_type: "all",
            applicable_days_postpartum_min: 1,
            applicable_days_postpartum_max: 90,
            language: "english",
            premium_content: false,
          },
          {
            id: "2",
            title: "C-Section Recovery",
            content:
              "Keep your incision clean and dry. Watch for signs of infection like redness, swelling, or discharge.",
            content_type: "text",
            category: "mother_care",
            applicable_birth_type: "c_section",
            applicable_days_postpartum_min: 1,
            applicable_days_postpartum_max: 30,
            language: "english",
            premium_content: false,
          },
          {
            id: "3",
            title: "Baby Sleep Patterns",
            content: "Newborns sleep 14-17 hours a day in short bursts. This is normal and will gradually change.",
            content_type: "text",
            category: "baby_care",
            applicable_birth_type: "all",
            applicable_days_postpartum_min: 1,
            applicable_days_postpartum_max: 30,
            language: "english",
            premium_content: false,
          },
        ] as HealthTip[]

        setHealthTips(mockTips)
        setFilteredTips(mockTips)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHealthTips()
  }, [])

  useEffect(() => {
    let filtered = [...healthTips]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (tip) =>
          tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tip.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((tip) => tip.category === selectedCategory)
    }

    setFilteredTips(filtered)
  }, [searchQuery, selectedCategory, healthTips])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category)
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "breastfeeding":
        return "Breastfeeding"
      case "nutrition":
        return "Nutrition"
      case "mental_health":
        return "Mental Health"
      case "baby_care":
        return "Baby Care"
      case "mother_care":
        return "Mother Care"
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breastfeeding":
        return "bg-blue-100 text-blue-800"
      case "nutrition":
        return "bg-green-100 text-green-800"
      case "mental_health":
        return "bg-purple-100 text-purple-800"
      case "baby_care":
        return "bg-yellow-100 text-yellow-800"
      case "mother_care":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader title="Health Tips" showBack />

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search health tips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {["breastfeeding", "nutrition", "mental_health", "baby_care", "mother_care"].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(category)}
              className={selectedCategory === category ? "bg-primary" : ""}
            >
              {getCategoryLabel(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <BrandedLoader message="Loading health tips..." />
        ) : filteredTips.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">No health tips found</p>
          </div>
        ) : (
          filteredTips.map((tip) => (
            <div key={tip.id} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-medium">{tip.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(tip.category)}`}>
                  {getCategoryLabel(tip.category)}
                </span>
              </div>
              <p className="text-sm">{tip.content}</p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
