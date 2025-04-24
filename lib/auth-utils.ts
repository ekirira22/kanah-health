import { getSupabaseClient } from "@/lib/supabase/client"
import { User, Mother, Baby } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

// Client-side phone authentication
export async function sendOTP(phoneNumber: string) {
  try {
    const supabase = getSupabaseClient()

    // First, check if the user exists - use the phone number as is since it's stored with + in the database
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, phone_number")
      .eq("phone_number", phoneNumber)
      .single()

    if (existingUser) {
      toast({
        title: "Phone number already registered",
        description: "Please use a different phone number or try logging in",
        variant: "destructive",
      })
      return { success: false, error: "Phone number already registered" }
    }

    // In a real app, you would integrate with an SMS service like Twilio or Africa's Talking
    // For demo purposes, we'll simulate sending an OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString() // 4-digit OTP

    // Store OTP in a secure way (in a real app, you'd hash this)
    // For demo, we'll use localStorage, but in production use a more secure method
    localStorage.setItem(`otp_${phoneNumber}`, otp)

    alert(`OTP for ${phoneNumber}: ${otp}`) // For demo purposes only
    console.log(`OTP for ${phoneNumber}: ${otp}`) // For demo purposes only

    toast({
      title: "OTP Sent",
      description: "Please check your phone for the verification code",
    })

    return { success: true, isExistingUser: false }
  } catch (error) {
    console.error("Error sending OTP:", error)
    toast({
      title: "Failed to send OTP",
      description: "Please try again later",
      variant: "destructive",
    })
    return { success: false, error: "Failed to send OTP" }
  }
}

export async function verifyOTP(phoneNumber: string, otpInput: string) {
  try {
    // Remove test case for "1234"
    const storedOTP = localStorage.getItem(`otp_${phoneNumber}`)

    if (storedOTP !== otpInput) {
      toast({
        title: "Invalid OTP",
        description: "Please check the code and try again",
        variant: "destructive",
      })
      return { success: false, error: "Invalid OTP" }
    }

    // Clear the OTP after successful verification
    localStorage.removeItem(`otp_${phoneNumber}`)

    // Check if user exists - use the phone number as is
    const supabase = getSupabaseClient()
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, phone_number")
      .eq("phone_number", phoneNumber)
      .single() as { data: User | null }

    if (existingUser) {
      // Sign in existing user
      await signInExistingUser(existingUser.id)
      toast({
        title: "Welcome back!",
        description: "Successfully signed in",
      })
      return { success: true, isNewUser: false }
    } else {
      // Create temporary session for new user
      sessionStorage.setItem("temp_phone_number", phoneNumber)
      toast({
        title: "Phone verified",
        description: "Let's complete your registration",
      })
      return { success: true, isNewUser: true }
    }
  } catch (error) {
    console.error("Error verifying OTP:", error)
    toast({
      title: "Verification failed",
      description: "Please try again",
      variant: "destructive",
    })
    return { success: false, error: "Verification failed" }
  }
}

// For demo purposes, we'll use a simplified authentication approach
async function signInExistingUser(userId: string) {
  try {
    localStorage.setItem("auth_user_id", userId)
    return { success: true }
  } catch (error) {
    console.error("Error signing in user:", error)
    toast({
      title: "Sign in failed",
      description: "Please try again later",
      variant: "destructive",
    })
    return { success: false, error: "Failed to sign in" }
  }
}

export async function createNewUser(userData: {
  authUserId: string
  phoneNumber: string
  fullName: string
  email: string
  location: string
  birthType: "vaginal" | "c_section"
  babyBirthDate: string
  language?: "english" | "swahili"
}) {
  try {
    const supabase = getSupabaseClient()

    // Check if email is already registered
    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single()

    if (existingEmail) {
      toast({
        title: "Email already registered",
        description: "Please use a different email address",
        variant: "destructive",
      })
      return { success: false, error: "Email already registered" }
    }

    // Create user in our custom users table
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        id: userData.authUserId,
        phone_number: userData.phoneNumber,
        full_name: userData.fullName,
        email: userData.email,
        user_type: "mother"
      })
      .select()
      .single() as { data: User | null, error: any }

    if (userError) throw userError
    if (!newUser) throw new Error("Failed to create user")

    // Create mother record
    const { data: newMother, error: motherError } = await supabase
      .from("mothers")
      .insert({
        user_id: newUser.id,
        birth_type: userData.birthType,
        subscription_status: "free",
        language_preference: userData.language || "english",
        latitude: 0, // Placeholder
        longitude: 0 // Placeholder
      })
      .select()
      .single() as { data: Mother | null, error: any }

    if (motherError) throw motherError
    if (!newMother) throw new Error("Failed to create mother record")

    // Create baby record
    const { error: babyError } = await supabase
      .from("babies")
      .insert({
        mother_id: newMother.id,
        birth_date: userData.babyBirthDate,
      }) as { data: Baby | null, error: any }

    if (babyError) throw babyError

    // Store user ID in localStorage
    localStorage.setItem("auth_user_id", newUser.id)

    toast({
      title: "Welcome to Kanah Health!",
      description: "Your account has been created successfully",
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error creating new user:", error)
    toast({
      title: "Registration failed",
      description: error.message || "Please try again later",
      variant: "destructive",
    })
    return { success: false, error: error.message || "Failed to create user" }
  }
}

// Check if user is authenticated (for client-side)
export function isAuthenticated() {
  const userId = localStorage.getItem("auth_user_id")
  return !!userId
}

// Sign out user
export async function signOut() {
  try {
    // Clear all auth-related storage
    localStorage.removeItem("auth_user_id")
    sessionStorage.clear()
    
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    
    toast({
      title: "Signed out",
      description: "You have been successfully signed out",
    })
    return { success: true }
  } catch (error) {
    toast({
      title: "Sign out failed",
      description: "Please try again",
      variant: "destructive",
    })
    return { success: false, error: "Failed to sign out" }
  }
}

export type AuthError = {
  message: string
  status: number
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (error) {
      console.error("Error checking email:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error checking email:", error)
    return false
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()

    // First check if email exists
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      return {
        error: {
          message: "This email is already registered. Please login instead.",
          status: 409
        } as AuthError,
        data: null
      }
    }

    // Proceed with signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    return {
      error: {
        message: error.message || "An error occurred during signup",
        status: error.status || 500
      } as AuthError,
      data: null
    }
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Handle specific error cases
      let errorMessage = "An error occurred during login"
      
      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Incorrect email or password"
          break
        case "Email not confirmed":
          errorMessage = "Please verify your email before logging in"
          break
        case "Invalid email or password":
          errorMessage = "Invalid email or password"
          break
        default:
          errorMessage = error.message || "Login failed. Please try again."
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      })

      return { data: null, error: { message: errorMessage, status: error.status } as AuthError }
    }

    // Verify we have a session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const errorMessage = "Failed to create session. Please try again."
      toast({
        title: "Login error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000, // Show for 5 seconds
      })
      return {
        error: {
          message: errorMessage,
          status: 500
        } as AuthError,
        data: null
      }
    }

    return { data, error: null }
  } catch (error: any) {
    const errorMessage = error.message || "Something went wrong. Please try again later."
    
    toast({
      title: "Login error",
      description: errorMessage,
      variant: "destructive",
      duration: 5000, // Show for 5 seconds
    })

    return {
      error: {
        message: errorMessage,
        status: error.status || 500
      } as AuthError,
      data: null
    }
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    return {
      error: {
        message: error.message || "Could not connect to Google",
        status: error.status || 500
      } as AuthError,
      data: null
    }
  }
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

export async function isEmailVerified() {
  const user = await getCurrentUser()
  return user?.email_confirmed_at ? true : false
}

export function showEmailVerificationReminder() {
  toast({
    title: "Please verify your email",
    description: "Check your inbox for a verification link. You need to verify your email to access all features.",
    duration: 5000, // Show for 5 seconds
    variant: "destructive",
  })
}

export async function linkAccounts(provider: 'google') {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?linking=true`,
      },
    })

    if (error) throw error

    return { data, error: null }
  } catch (error: any) {
    return {
      error: {
        message: error.message || `Could not link ${provider} account`,
        status: error.status || 500
      } as AuthError,
      data: null
    }
  }
}
