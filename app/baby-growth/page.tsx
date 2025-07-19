"use client"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"

export default function BabyGrowth() {
  const router = useRouter()

  const handleSubscribe = () => {
    // In a real app, we would redirect to a payment page
    alert("Redirecting to subscription payment...")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader title="Baby Growth" showBack />

      {/* Premium content lock */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Track your baby's growth milestones, get personalized recommendations, and receive vaccination reminders.
        </p>

        <div className="border rounded-lg p-6 w-full max-w-md mb-6">
          <h3 className="font-medium mb-4">Premium Subscription Benefits</h3>

          <ul className="space-y-3 text-left">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Track baby's weight, height, and head circumference</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Personalized developmental milestones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Vaccination schedule and reminders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Ad-free experience throughout the app</span>
            </li>
          </ul>

          <div className="mt-6 text-center">
            <p className="font-medium mb-1">Only 100 KSH per month</p>
            <p className="text-sm text-muted-foreground mb-4">Cancel anytime</p>

            <Button onClick={handleSubscribe} className="w-full bg-primary hover:bg-primary/90">
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
