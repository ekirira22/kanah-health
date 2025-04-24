import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface QuickActionButtonProps {
  icon: LucideIcon
  label: string
  href: string
  color?: string
  isPremium?: boolean
}

export function QuickActionButton({
  icon: Icon,
  label,
  href,
  color = "bg-red-100",
  isPremium = false,
}: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <div className={`p-3 rounded-full ${color} mb-2`}>
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium">{label}</span>
      {isPremium && <span className="text-xs text-primary mt-1">Premium</span>}
    </Link>
  )
}
