"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = getSupabaseClient()
      
      try {
        // Get the code and type from URL
        const code = searchParams.get('code')
        const type = searchParams.get('type')
        
        if (!code) {
          router.push("/login")
          return
        }

        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error

        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          throw new Error("No session found")
        }

        // Handle different auth types
        switch (type) {
          case 'recovery':
            // Password reset flow
            toast({
              title: "Password reset link valid",
              description: "You can now set your new password.",
            })
            router.push("/auth/update-password")
            break

          case 'magiclink':
            // Magic link login
            toast({
              title: "Login successful",
              description: "You have been logged in successfully.",
            })
            router.push("/dashboard")
            break

          case 'signup':
          case 'invite':
          default:
            // Check if user exists in our custom users table
            const { data: existingUser } = await supabase
              .from("users")
              .select("id")
              .eq("email", session.user.email)
              .single()

            if (existingUser) {
              // Check if user has an associated mother record
              const { data: motherRecord } = await supabase
                .from("mothers")
                .select("id")
                .eq("user_id", existingUser.id)
                .single()

              if (motherRecord) {
                toast({
                  title: "Welcome back!",
                  description: "You have been logged in successfully.",
                })
                router.push("/dashboard")
              } else {
                // User exists but no mother record - redirect to signup
                toast({
                  title: "Account not found",
                  description: "Please sign up to create your account.",
                  variant: "destructive",
                })
                await supabase.auth.signOut()
                router.push("/signup")
              }
            } else {
              // New user - redirect to onboarding
              toast({
                title: "Welcome!",
                description: "Let's complete your registration.",
              })
              router.push("/onboarding/phone")
            }
            break
        }
      } catch (error: any) {
        console.error("Error in auth callback:", error)
        toast({
          title: "Authentication failed",
          description: error.message || "There was a problem with authentication. Please try again.",
          variant: "destructive",
        })
        router.push("/login")
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing...</h1>
        <p className="text-muted-foreground">Please wait while we verify your request.</p>
      </div>
    </main>
  )
} 