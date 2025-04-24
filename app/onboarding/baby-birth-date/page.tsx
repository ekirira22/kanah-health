"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageToggle } from "@/components/language-toggle"
import { Calendar } from "lucide-react"

export default function BabyBirthDate() {
  const router = useRouter()
  const [birthDate, setBirthDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)

  useEffect(() => {
    // Retrieve phone number from session storage
    const storedPhoneNumber = sessionStorage.getItem("temp_phone_number")

    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber)
    } else {
      // If no phone number, redirect back to phone verification
      router.push("/onboarding/phone")
    }
  }, [router])

  const handleNext = async () => {
    if (!birthDate) {
      setError("Please enter your baby's birth date")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Store birth date in session storage
      sessionStorage.setItem("temp_baby_birth_date", birthDate)

      // Navigate to next step
      router.push("/onboarding/birth-type")
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 relative">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>

        <div className="py-8">
          <h1 className="text-2xl font-bold text-primary text-center mb-2">Let&apos;s get to know you</h1>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">Step 2 of 4</p>
            <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full ml-4">
              <div className="h-full bg-primary rounded-full" style={{ width: "50%" }}></div>
            </div>
          </div>

          <p className="mb-4">When was your baby born?</p>
          <div className="relative mb-6">
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <p className="text-sm text-muted-foreground mb-6">This helps us personalize your care journey</p>

          {error && <p className="text-destructive text-sm mb-4">{error}</p>}

          <div className="flex gap-4">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
            <Button onClick={handleNext} disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Loading..." : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
