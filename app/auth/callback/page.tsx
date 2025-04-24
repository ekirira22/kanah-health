"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseClient()
      // Wait for the session to be restored automatically by Supabase
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        toast({
          title: "Verification failed",
          description: "Something went wrong. Please try logging in again.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      toast({
        title: "Welcome back!",
        description: "You're now logged in.",
      })

      router.push("/dashboard") // Always redirect to dashboard
    }

    run()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Logging you in...</h1>
        <p className="text-muted-foreground">Please wait while we complete your sign-in.</p>
      </div>
    </main>
  )
} 