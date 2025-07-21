"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageToggle } from "@/components/language-toggle"
import { Calendar, Plus, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BrandedLoader } from "@/components/branded-loader"

export default function BabyBirthDate() {
  const router = useRouter()
  const [numberOfBabies, setNumberOfBabies] = useState(1)
  const [birthDates, setBirthDates] = useState<string[]>([""])
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

  const handleNumberOfBabiesChange = (value: string) => {
    const num = parseInt(value)
    setNumberOfBabies(num)
    
    // Update birth dates array
    if (num > birthDates.length) {
      // Add new empty birth dates
      setBirthDates([...birthDates, ...Array(num - birthDates.length).fill("")])
    } else if (num < birthDates.length) {
      // Remove extra birth dates
      setBirthDates(birthDates.slice(0, num))
    }
  }

  const handleBirthDateChange = (index: number, value: string) => {
    const newBirthDates = [...birthDates]
    newBirthDates[index] = value
    setBirthDates(newBirthDates)
  }

  const handleNext = async () => {
    // Validate that birth date is filled
    if (!birthDates[0]) {
      setError("Please enter your babies' birth date")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Store birth date in session storage (same date for all babies)
      const allBirthDates = Array(numberOfBabies).fill(birthDates[0])
      sessionStorage.setItem("temp_number_of_babies", numberOfBabies.toString())
      sessionStorage.setItem("temp_baby_birth_dates", JSON.stringify(allBirthDates))

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

  if (isLoading) {
    return <BrandedLoader message="Loading..." />
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
            <p className="text-sm text-muted-foreground">Step 3 of 4</p>
            <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full ml-4">
              <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>

          <p className="mb-4">How many babies do you have?</p>
          <div className="mb-6">
            <Select value={numberOfBabies.toString()} onValueChange={handleNumberOfBabiesChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of babies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Baby</SelectItem>
                <SelectItem value="2">2 Babies (Twins)</SelectItem>
                <SelectItem value="3">3 Babies (Triplets)</SelectItem>
                <SelectItem value="4">4 Babies (Quadruplets)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="mb-4">When were your babies born?</p>
          <div className="relative mb-6">
            <label className="text-sm font-medium mb-2 block">
              Birth Date
            </label>
            <Input
              type="date"
              value={birthDates[0]}
              onChange={(e) => handleBirthDateChange(0, e.target.value)}
              className="w-full pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          {numberOfBabies > 1 && (
            <p className="text-sm text-muted-foreground mb-6">
              All {numberOfBabies} babies were born on the same day
            </p>
          )}

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
