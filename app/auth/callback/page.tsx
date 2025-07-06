"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseClient()
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        toast({
          title: "Verification failed",
          description: "Something went wrong. Please try logging in again.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      // If we have a token, this is an email verification
      if (token) {
        // Update the user's email_verified status
        const { error: updateError } = await supabase
          .from('users')
          .update({ email_verified: true })
          .eq('id', session.user.id)

        if (updateError) {
          toast({
            title: "Verification failed",
            description: "Could not verify your email. Please try again.",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        })

        // Close the window after a short delay to show the success message
        setTimeout(() => {
          window.close()
        }, 1500)
        return
      }

      router.push("/dashboard")
    }

    run()
  }, [router, token])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Processing your request...</h1>
        <p className="text-muted-foreground">Please wait while we complete the process.</p>
      </div>
    </main>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we process your request.</p>
        </div>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 