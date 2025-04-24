import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// This function should only be used in Server Components or Server Actions
export const createServerClient = () => {
  // Check if we're in a server context
  if (typeof window !== "undefined") {
    console.error("createServerClient should only be called from server components")
    return null
  }

  return createServerComponentClient({ cookies })
}
