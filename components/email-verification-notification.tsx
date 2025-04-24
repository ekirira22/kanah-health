"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function EmailVerificationNotification() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user && !session.user.email_confirmed_at) {
        setShow(true)
      }
    }

    checkVerification()
  }, [])

  if (!show) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle>Email Not Verified</AlertTitle>
      <AlertDescription>
        Please verify your email to unlock all features. Check your inbox.
      </AlertDescription>
    </Alert>
  )
} 