import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a singleton instance for the client side
let supabaseClient: ReturnType<typeof createPagesBrowserClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createPagesBrowserClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey
    })
  }
  return supabaseClient
}
