"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/language-toggle"

interface Nurse {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  reviews: number
}

const mockNurses: Nurse[] = [
  {
    id: "1",
    name: "Nurse Wanjiku",
    specialty: "Midwife",
    experience: "8 years experience",
    rating: 5.0,
    reviews: 124,
  },
  {
    id: "2",
    name: "Nurse Otieno",
    specialty: "Postnatal Care",
    experience: "5 years experience",
    rating: 4.8,
    reviews: 98,
  },
]

export default function CallNurse() {
  const router = useRouter()
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handleBack = () => {
    router.back()
  }

  const handlePayment = () => {
    setIsProcessingPayment(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingPayment(false)
      // In a real app, we would redirect to a success page or initiate the call
      alert("Payment successful! Connecting to nurse...")
    }, 2000)
  }

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white mr-2">
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Talk to a Nurse</h1>
        </div>
        <LanguageToggle initialLanguage="english" />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <p className="text-sm mb-6">
          Connect with a qualified nurse for personalized advice about your postnatal health concerns.
        </p>

        {/* Payment details */}
        <div className="border rounded-lg p-4 mb-6">
          <h2 className="font-medium mb-4">Teleconsultation Fee</h2>

          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Consultation charge</span>
            <span>Ksh 50</span>
          </div>

          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>Ksh 50</span>
          </div>

          <div className="bg-green-50 text-green-700 p-3 rounded-lg mt-4 text-sm flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <p>Payment is secure through M-Pesa. You'll receive a prompt on your phone.</p>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="w-full mt-4 bg-primary hover:bg-primary/90"
          >
            {isProcessingPayment ? "Processing..." : "Pay with M-Pesa"}
          </Button>
        </div>

        {/* Available nurses */}
        <h2 className="font-medium mb-4">Available Nurses</h2>

        {mockNurses.map((nurse) => (
          <div key={nurse.id} className="border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">👩‍⚕️</span>
              </div>
              <div>
                <h3 className="font-medium">{nurse.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {nurse.specialty}, {nurse.experience}
                </p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(nurse.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm ml-1">
                    {nurse.rating.toFixed(1)} ({nurse.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
