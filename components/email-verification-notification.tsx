"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sendVerificationEmail } from "@/lib/auth-utils"
import { toast } from "@/components/ui/use-toast"

export function EmailVerificationNotification() {
  const [show, setShow] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const checkVerification = async () => {
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Get the user's verification status from our custom field
        const { data: userData, error } = await supabase
          .from('users')
          .select('email_verified')
          .eq('id', session.user.id)
          .single()

        if (!error && userData && !userData.email_verified) {
          setShow(true)
        } else {
          setShow(false)
        }
      }
    }

    checkVerification()
    // Set up a subscription to listen for changes
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('email_verification_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, () => {
        checkVerification()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      const result = await sendVerificationEmail()
      if (result.success) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        })
      } else {
        toast({
          title: "Failed to send verification email",
          description: result.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  if (!show) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
      <AlertTitle>Email Not Verified</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>Please verify your email to unlock all features. Check your inbox.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResendVerification}
          disabled={isResending}
          className="w-fit"
        >
          {isResending ? "Sending..." : "Resend Verification Email"}
        </Button>
      </AlertDescription>
    </Alert>
  )
} 