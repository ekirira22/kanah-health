"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { signOut as authSignOut } from "@/lib/auth-utils"
import { syncAuthWithCookies, initAuthSync } from "@/lib/client-auth-utils"
import type { User, Mother } from "@/lib/types"

interface AuthContextType {
  user: User | null
  mother: Mother | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  mother: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mother, setMother] = useState<Mother | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      // Get user ID from localStorage (our simplified auth approach)
      const userId = localStorage.getItem("auth_user_id")

      if (!userId) {
        console.log("No user ID found in localStorage")
        setUser(null)
        setMother(null)
        return
      }

      const supabase = getSupabaseClient()

      // Get user and mother data in a single query
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(`
          *,
          mothers (*)
        `)
        .eq("id", userId)
        .single() as { data: (User & { mothers: Mother[] }) | null, error: any }

      if (userError) {
        console.error("Error fetching user data:", {
          error: userError,
          userId,
          message: userError.message,
          code: userError.code
        })
        setUser(null)
        setMother(null)
        return
      }

      if (!userData) {
        console.error("No user data found for ID:", userId)
        setUser(null)
        setMother(null)
        return
      }

      // Extract mother data from the response
      const { mothers, ...user } = userData
      setUser(user)
      setMother(mothers?.[0] || null)

      // Sync with cookies for middleware
      syncAuthWithCookies()
    } catch (error) {
      console.error("Unexpected error in refreshUser:", error)
      setUser(null)
      setMother(null)
    }
  }

  useEffect(() => {
    // Initialize auth sync
    initAuthSync()

    const initializeAuth = async () => {
      setIsLoading(true)
      await refreshUser()
      setIsLoading(false)
    }

    initializeAuth()

    // Set up a storage event listener to handle auth changes across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "auth_user_id") {
        refreshUser()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const signOut = async () => {
    try {
      await authSignOut()
      setUser(null)
      setMother(null)
      syncAuthWithCookies() // Sync with cookies
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, mother, isLoading, signOut, refreshUser }}>{children}</AuthContext.Provider>
  )
}
