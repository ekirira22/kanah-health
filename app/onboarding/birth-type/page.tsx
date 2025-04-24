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

  useEffect(() => {
    checkEmailVerification()
  }, [])

  const checkEmailVerification = async () => {
    const supabase = getSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user?.email_confirmed_at) {
      setIsVerified(true)
    }
  }

  const handleNext = async () => {
    if (!selectedType) {
      toast({
        title: "Selection Required",
        description: "Please select a birth type to continue.",
        variant: "destructive",
      })
      return
    }

    if (!isVerified) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email before continuing. Check your inbox for the verification link.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Get stored user details
      const fullName = sessionStorage.getItem("temp_mother_name")
      const email = sessionStorage.getItem("temp_mother_email")
      const location = sessionStorage.getItem("temp_mother_location")
      const authUserId = sessionStorage.getItem("temp_auth_user_id")

      if (!fullName || !email || !location || !authUserId) {
        throw new Error("Missing user information. Please start the registration process again.")
      }

      // Create user in custom table
      await createNewUser({
        authUserId,
        phoneNumber: sessionStorage.getItem("temp_phone_number") || "",
        fullName,
        email,
        location,
        birthType: selectedType === "natural" ? "vaginal" : "c_section",
        babyBirthDate: new Date().toISOString(),
        language: "english"
      })

      // Clear temporary storage
      sessionStorage.removeItem("temp_mother_name")
      sessionStorage.removeItem("temp_mother_email")
      sessionStorage.removeItem("temp_mother_location")
      sessionStorage.removeItem("temp_auth_user_id")

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
          <p className="text-center text-muted-foreground mb-6">Select your preferred birth type</p>

          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                variant={selectedType === "natural" ? "default" : "outline"}
                className="w-full py-8"
                onClick={() => setSelectedType("natural")}
              >
                Natural Birth
              </Button>

              <Button
                variant={selectedType === "cesarean" ? "default" : "outline"}
                className="w-full py-8"
                onClick={() => setSelectedType("cesarean")}
              >
                Cesarean Birth
              </Button>
            </div>

            {!isVerified && (
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
                disabled={isLoading || !selectedType || !isVerified} 
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
