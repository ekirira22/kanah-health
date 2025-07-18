import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("Middleware - Current path:", req.nextUrl.pathname)
  console.log("Middleware - Session exists:", !!session)
  if (session) {
    console.log("Middleware - User ID:", session.user.id)
    console.log("Middleware - User email:", session.user.email)
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/symptom-checker",
    "/call-nurse",
    "/health-tips",
    "/baby-growth",
    "/calendar",
    "/appointments",
    "/settings",
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Check if the current path is an onboarding route
  const isOnboardingRoute = req.nextUrl.pathname.startsWith("/onboarding")

  // If user is not signed in and trying to access a protected route,
  // redirect to login
  if (!session && isProtectedRoute) {
    console.log("Middleware - No session, redirecting to login")
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and trying to access auth pages,
  // redirect to dashboard
  if (session && ['/login', '/signup'].includes(req.nextUrl.pathname)) {
    console.log("Middleware - Has session, redirecting to dashboard")
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user is signed in and trying to access onboarding,
  // allow access (needed for new users)
  if (session && isOnboardingRoute) {
    return res
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/symptom-checker/:path*',
    '/call-nurse/:path*',
    '/health-tips/:path*',
    '/baby-growth/:path*',
    '/calendar/:path*',
    '/appointments/:path*',
    '/settings/:path*',
    '/login',
    '/signup',
    '/onboarding/:path*',
  ],
}
