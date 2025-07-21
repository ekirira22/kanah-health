import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/language-toggle"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-secondary/30">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6 relative">
        <div className="absolute top-4 right-4">
          <LanguageToggle />
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <Logo variant="vertical" className="mb-4" />
          <p className="text-center mt-4 text-muted-foreground">Your postnatal health companion</p>

          <div className="w-full space-y-4 mt-8">
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
              <Link href="/onboarding/phone">Get Started</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Login</Link>
            </Button>
          </div>

          <p className="text-xs text-center mt-4 text-muted-foreground">
            Helping mothers in Kenya through their postnatal journey
          </p>
        </div>
      </div>
    </main>
  )
}
