"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailVerification = async () => {
      const supabase = getSupabaseClient()
      
      try {
        // Get the code from URL
        const code = searchParams.get('code')
        if (!code) throw new Error('No code found in URL')

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error

        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user?.email) {
          // Check if user exists in our custom users table
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single()

          if (existingUser) {
            // Existing user - redirect to dashboard
            router.push("/dashboard")
          } else {
            // New user - redirect to onboarding
            router.push("/onboarding/phone")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Error in email verification:", error)
        router.push("/login")
      }
    }

    handleEmailVerification()
  }, [router, searchParams])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
        <p className="text-muted-foreground">Please wait while we verify your email address.</p>
      </div>
    </main>
  )
} 