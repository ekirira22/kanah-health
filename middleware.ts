import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get auth cookie from request
  const authCookie = request.cookies.get("auth_user_id")
  const isAuthenticated = !!authCookie?.value

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/symptom-checker",
    "/call-nurse",
    "/health-tips",
    "/baby-growth",
    "/calendar",
    "/consultations",
    "/settings",
  ]

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Redirect to home page if accessing protected route without session
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect to dashboard if accessing onboarding with session
  if (request.nextUrl.pathname.startsWith("/onboarding") && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/symptom-checker/:path*",
    "/call-nurse/:path*",
    "/health-tips/:path*",
    "/baby-growth/:path*",
    "/calendar/:path*",
    "/consultations/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
  ],
}
