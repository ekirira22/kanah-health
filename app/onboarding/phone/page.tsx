"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LanguageToggle } from "@/components/language-toggle"
import { Logo } from "@/components/logo"
import { sendOTP, verifyOTP } from "@/lib/auth-utils"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft } from "lucide-react"
import { BrandedLoader } from "@/components/branded-loader"

export default function PhoneVerification() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const formattedPhone = `+254${phoneNumber}`
      const result = await sendOTP(formattedPhone)

      if (result.success) {
        setOtpSent(true)
      } else {
        setError(result.error || "Failed to send verification code")
      }
    } catch (error) {
      setError("Failed to send verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 4) {
      setError("Please enter the complete verification code")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const formattedPhone = `+254${phoneNumber}`
      const result = await verifyOTP(formattedPhone, otpValue)

      if (result.success) {
        if (result.isNewUser) {
          // New user - continue with onboarding
          router.push("/onboarding/mother-details")
        } else {
          // Existing user - go to dashboard
          router.push("/dashboard")
        }
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (error) {
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }

    // Auto-submit when all digits are entered and valid
    if (index === 3 && value) {
      setTimeout(() => {
        const completeOtp = [...newOtp.slice(0, 3), value].join("")
        if (completeOtp.length === 4) {
          handleVerifyOTP()
        }
      }, 100)
    }
  }

  const handleResendOTP = () => {
    setOtpSent(false)
    handleSendOTP()
  }

  if (isLoading) {
    return <BrandedLoader message={otpSent ? "Verifying code..." : "Sending code..."} />
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 relative">
        <div className="absolute top-4 left-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>

        <div className="py-8">
          <div className="flex flex-col items-center mb-6">
            <Logo variant="horizontal" className="mb-4" />
            <h1 className="text-2xl font-bold text-primary text-center">Welcome to Kanah Health</h1>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">Step 1 of 4</p>
            <div className="w-full max-w-[200px] h-2 bg-gray-200 rounded-full ml-4">
              <div className="h-full bg-primary rounded-full" style={{ width: "25%" }}></div>
            </div>
          </div>

          {!otpSent ? (
            <>
              <p className="mb-4">Your phone number</p>
              <div className="flex gap-2 mb-6">
                <Input value="+254" disabled className="w-20" />
                <Input
                  type="tel"
                  placeholder="7XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
              </div>

              {error && <p className="text-destructive text-sm mb-4">{error}</p>}

              <Button onClick={handleSendOTP} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? "Sending..." : "Verify"}
              </Button>
            </>
          ) : (
            <>
              <p className="mb-4">Enter the 4-digit code sent to your phone</p>
              <div className="flex justify-between mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-14 h-14 text-center text-xl"
                  />
                ))}
              </div>

              <Button variant="link" onClick={handleResendOTP} className="w-full mb-4 text-primary">
                Resend code
              </Button>

              {error && <p className="text-destructive text-sm mb-4">{error}</p>}

              <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? "Verifying..." : "Next"}
              </Button>

              <p className="text-xs text-center mt-4 text-muted-foreground">For testing, use code: 1234</p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
