"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/language-toggle"
import { createNewUser } from "@/lib/auth-utils"
import { toast } from "@/components/ui/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function BirthType() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<"natural" | "cesarean" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const checkEmailVerification = async () => {
    try {
      const supabase = getSupabaseClient()
      // First refresh the session to get latest data
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
      
      if (refreshedSession?.user?.email_confirmed_at) {
        setIsVerified(true)
        toast({
          title: "Email Verified!",
          description: "You can now complete your registration.",
        })
        return true
      }

      // If no refreshed session, try getting current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true)
        toast({
          title: "Email Verified!",
          description: "You can now complete your registration.",
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking email verification:", error)
      return false
    }
  }

  useEffect(() => {
    // Initial check
    checkEmailVerification()

    // Set up polling
    const interval = setInterval(async () => {
      const verified = await checkEmailVerification()
      if (verified) {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleNext = async () => {
    if (!selectedType) {
      toast({
        title: "Selection Required",
        description: "Please select a birth type to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get stored user details
      const fullName = sessionStorage.getItem("temp_mother_name")
      const email = sessionStorage.getItem("temp_mother_email")
      const authUserId = sessionStorage.getItem("temp_auth_user_id")
      const phoneNumber = sessionStorage.getItem("temp_phone_number")
      const numberOfBabies = sessionStorage.getItem("temp_number_of_babies")
      const babyBirthDates = sessionStorage.getItem("temp_baby_birth_dates")

      if (!fullName || !email || !authUserId || !phoneNumber || !numberOfBabies || !babyBirthDates) {
        throw new Error("Missing user information. Please start the registration process again.")
      }

      const birthDates = JSON.parse(babyBirthDates)

      // Create user in custom table
      await createNewUser({
        authUserId,
        phoneNumber,
        fullName,
        email,
        birthType: selectedType === "natural" ? "vaginal" : "c_section",
        numberOfBabies: parseInt(numberOfBabies),
        babyBirthDates: birthDates,
        language: "english"
      })

      // Clear temporary storage
      sessionStorage.clear()

      toast({
        title: "Registration Complete",
        description: "Your account has been created successfully!",
      })

      // Navigate to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error creating user:", error)
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem completing your registration. Please try again.",
        variant: "destructive",
      })
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
          <h1 className="text-2xl font-bold text-primary text-center mb-2">Birth Type</h1>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">Step 4 of 4</p>
            <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full ml-4">
              <div className="h-full bg-primary rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
          <p className="text-center text-muted-foreground mb-6">How was your baby born?</p>

          <div className="space-y-4">
            <div className="grid gap-4">
              <div
                className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedType === "natural"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
                onClick={() => setSelectedType("natural")}
              >
                <h3 className="text-lg font-semibold mb-2">Vaginal Birth</h3>
                <p className="text-sm text-muted-foreground">
                  A natural birth through the birth canal
                </p>
              </div>

              <div
                className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedType === "cesarean"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                }`}
                onClick={() => setSelectedType("cesarean")}
              >
                <h3 className="text-lg font-semibold mb-2">C-Section</h3>
                <p className="text-sm text-muted-foreground">
                  A surgical procedure to deliver the baby
                </p>
              </div>
            </div>

            {isVerified ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm">
                Your email is verified! You can now complete registration.
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
                Please verify your email to continue. Check your inbox for the verification link.
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={isLoading || !selectedType} 
                className="flex-1"
              >
                {isLoading ? "Completing Registration..." : "Complete Registration"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
