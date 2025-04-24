import { getSupabaseClient } from "@/lib/supabase/client"
import { User, Mother, Baby } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

// Client-side phone authentication
export async function sendOTP(phoneNumber: string) {
  try {
    const supabase = getSupabaseClient()

    // First, check if the user exists
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
    // For testing purposes, always accept "1234" as valid OTP
    if (otpInput === "1234") {
      // Store phone number for onboarding
      sessionStorage.setItem("temp_phone_number", phoneNumber)
      toast({
        title: "OTP Verified",
        description: "Proceeding with registration",
      })
      return { success: true, isNewUser: true }
    }

    // In a real app, you would verify with your SMS service
    // For demo purposes, we'll check against our simulated OTP
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

    // Check if user exists
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
    return { success: false, error: "Failed to verify OTP" }
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
        id: userData.authUserId, // Use the Supabase auth user ID
        phone_number: userData.phoneNumber,
        full_name: userData.fullName,
        email: userData.email,
        user_type: "mother",
      })
      .select()
      .single() as { data: User | null, error: any }

    if (userError) {
      console.error("Error creating user:", userError)
      toast({
        title: "Failed to create account",
        description: userError.message || "Please try again",
        variant: "destructive",
      })
      throw userError
    }

    if (!newUser) {
      toast({
        title: "Registration failed",
        description: "Please try again later",
        variant: "destructive",
      })
      throw new Error("Failed to create user")
    }

    // Convert location string to coordinates (in a real app, use a geocoding service)
    const [latitude, longitude] = [0, 0] // Placeholder values

    // Create mother record with location data
    const { data: newMother, error: motherError } = await supabase
      .from("mothers")
      .insert({
        user_id: newUser.id,
        birth_type: userData.birthType,
        subscription_status: "free",
        language_preference: userData.language || "english",
        latitude,
        longitude,
      })
      .select()
      .single() as { data: Mother | null, error: any }

    if (motherError) {
      console.error("Error creating mother:", motherError)
      toast({
        title: "Failed to create profile",
        description: motherError.message || "Please try again",
        variant: "destructive",
      })
      throw motherError
    }

    if (!newMother) {
      toast({
        title: "Profile creation failed",
        description: "Please try again later",
        variant: "destructive",
      })
      throw new Error("Failed to create mother record")
    }

    // Create baby record
    const { error: babyError } = await supabase
      .from("babies")
      .insert({
        mother_id: newMother.id,
        birth_date: userData.babyBirthDate,
      }) as { data: Baby | null, error: any }

    if (babyError) {
      console.error("Error creating baby:", babyError)
      toast({
        title: "Failed to add baby details",
        description: babyError.message || "Please try again",
        variant: "destructive",
      })
      throw babyError
    }

    // For demo purposes, we'll create a session in localStorage
    localStorage.setItem("auth_user_id", newUser.id)

    toast({
      title: "Welcome to Kanah Health!",
      description: "Your account has been created successfully",
    })

    return { success: true }
  } catch (error) {
    console.error("Error creating new user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

// Check if user is authenticated (for client-side)
export function isAuthenticated() {
  return !!localStorage.getItem("auth_user_id")
}

// Sign out user
export async function signOut() {
  try {
    localStorage.removeItem("auth_user_id")
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
