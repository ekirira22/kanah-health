import { getSupabaseClient } from './client'
import type { User } from '@/lib/types'

export async function signUpWithEmail(email: string, password: string, phoneNumber: string, fullName: string) {
  const supabase = getSupabaseClient()
  
  // First, check if user exists in our custom users table
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (existingUser) {
    throw new Error("Email already registered")
  }

  // Create auth user
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        phone_number: phoneNumber,
        full_name: fullName,
      }
    },
  })

  if (authError) throw authError

  // Create user in our custom users table
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      id: data.user?.id, // Use the same ID as auth user
      email,
      phone_number: phoneNumber,
      full_name: fullName,
      user_type: "mother",
    })
    .select()
    .single()

  if (userError) throw userError

  return { user: data.user, customUser: newUser }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseClient()
  
  // Sign in with Supabase Auth
  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) throw authError

  // Get user from our custom users table
  const { data: customUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .single()

  if (userError) throw userError

  return { user: data.user, customUser }
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

export async function getSession() {
  const supabase = getSupabaseClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getCurrentUser(): Promise<{ authUser: any, customUser: User | null }> {
  const supabase = getSupabaseClient()
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError

  if (!session?.user) {
    return { authUser: null, customUser: null }
  }

  const { data: customUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single() as { data: User | null, error: any }

  if (userError) throw userError
  if (!customUser) throw new Error("User not found in custom table")

  return { authUser: session.user, customUser }
}

export async function onAuthStateChange(callback: (session: any) => void) {
  const supabase = getSupabaseClient()
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })

  return subscription
} 