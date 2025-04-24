import { EmailVerificationNotification } from "@/components/email-verification-notification"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <EmailVerificationNotification />
      {children}
    </>
  )
} 