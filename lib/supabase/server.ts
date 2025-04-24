import { createClient } from "@supabase/supabase-js"

// This function should only be used in Server Components or Server Actions
export const createServerClient = () => {
  // Check if we're in a server context
  if (typeof window !== "undefined") {
    console.error("createServerClient should only be called from server components")
    // Return a dummy client for client-side to prevent errors
    return createClient("https://example.com", "dummy-key")
  }

  // Server-side only imports
  const { cookies } = require("next/headers")

  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
    },
  })
}
