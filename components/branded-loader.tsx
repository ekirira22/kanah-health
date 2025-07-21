import { Logo } from "./logo"

export function BrandedLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] animate-pulse-slow" aria-busy="true" aria-label="Loading">
      <Logo className="mb-4" />
      <p className="text-muted-foreground text-sm">{message}</p>
      <style jsx global>{`
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
} 