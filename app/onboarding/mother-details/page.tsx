"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageToggle } from "@/components/language-toggle"
import { PasswordInput } from "@/components/password-input"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function MotherDetails() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const validateForm = () => {
    // Check for empty fields
    if (!fullName.trim()) {
      setError("Full name is required")
      toast({
        title: "Missing Information",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return false
    }

    if (!email.trim()) {
      setError("Email is required")
      toast({
        title: "Missing Information",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return false
    }

    if (!password) {
      setError("Password is required")
      toast({
        title: "Missing Information",
        description: "Please create a password.",
        variant: "destructive",
      })
      return false
    }

    if (!confirmPassword) {
      setError("Please confirm your password")
      toast({
        title: "Missing Information",
        description: "Please confirm your password.",
        variant: "destructive",
      })
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return false
    }

    // Password validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      toast({
        title: "Password Too Short",
        description: "Please use a password that is at least 8 characters long.",
        variant: "destructive",
      })
      return false
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      toast({
        title: "Password Requirements",
        description: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
        variant: "destructive",
      })
      return false
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered don't match. Please try again.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleNext = async () => {
    setError("")
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single()

      if (existingUser) {
        setError("This email is already registered")
        toast({
          title: "Email Already Registered",
          description: "This email is already in use. Please try logging in or use a different email.",
          variant: "destructive",
        })
        return
      }

      // Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("Failed to create account")
      }

      // Store details in session storage
      sessionStorage.setItem("temp_mother_name", fullName)
      sessionStorage.setItem("temp_mother_email", email)
      sessionStorage.setItem("temp_auth_user_id", authData.user.id)

      toast({
        title: "Check Your Email",
        description: "We've sent you a verification link. Please check your email to verify your account.",
      })

      // Navigate to next step
      router.push("/onboarding/baby-birth-date")
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "Something went wrong. Please try again.")
      toast({
        title: "Registration Failed",
        description: error.message || "There was a problem creating your account. Please try again.",
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
          <h1 className="text-2xl font-bold text-primary text-center mb-2">Your Details</h1>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">Step 2 of 4</p>
            <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full ml-4">
              <div className="h-full bg-primary rounded-full" style={{ width: "50%" }}></div>
            </div>
          </div>
          <p className="text-center text-muted-foreground mb-6">Tell us about yourself</p>

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium mb-1 block">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium mb-1 block">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll need to verify this email to complete registration
              </p>
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium mb-1 block">
                Password <span className="text-destructive">*</span>
              </label>
              <PasswordInput
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>



            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={isLoading} className="flex-1">
                {isLoading ? "Creating Account..." : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 