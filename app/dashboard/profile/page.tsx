"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { MapPin, Baby as BabyIcon, User as UserIcon, Calendar, Phone, Mail, Edit3 } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { User, Mother, Baby } from "@/lib/types"

export default function Profile() {
  const { user, mother, isLoading, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [babies, setBabies] = useState<Baby[]>([])
  const [location, setLocation] = useState("")
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    language_preference: "",
    birth_type: "",
    latitude: 0,
    longitude: 0,
  })

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !mother) return

      try {
        const supabase = getSupabaseClient()
        
        // Fetch baby data (support multiple babies)
        const { data: babiesData } = await supabase
          .from("babies")
          .select("*")
          .eq("mother_id", mother.id)
          .order("baby_number", { ascending: true }) as { data: Baby[] | null }

        setBabies(babiesData || [])

        // Fetch location from coordinates (now in user table)
        if (user.latitude && user.longitude) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${user.latitude}&lon=${user.longitude}&zoom=10&addressdetails=1`
            )
            const data = await response.json()
            if (data.display_name) {
              // Simplify location display
              const addressParts = data.display_name.split(', ')
              const simplifiedLocation = addressParts.slice(-3).join(', ') // Take last 3 parts
              setLocation(simplifiedLocation)
            }
          } catch (error) {
            console.error("Error fetching location:", error)
            setLocation("Location not available")
          }
        }

        // Set initial form data only once
        setFormData({
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          language_preference: mother.language_preference,
          birth_type: mother.birth_type,
          latitude: user.latitude || 0,
          longitude: user.longitude || 0,
        })
      } catch (error) {
        console.error("Error fetching profile data:", error)
      }
    }

    fetchProfileData()
  }, [user, mother]) // Remove isEditing from dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id || !mother?.id) {
      toast({
        title: "Update failed",
        description: "User data not found",
        variant: "destructive",
      })
      return
    }
    
    try {
      const supabase = getSupabaseClient()

      // Update user table (including location)
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name || "",
          email: formData.email || "",
          phone_number: formData.phone_number || "",
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        .eq("id", user.id)

      if (userError) throw userError

      // Update mother table (location moved to user table)
      const { error: motherError } = await supabase
        .from("mothers")
        .update({
          language_preference: formData.language_preference || "english",
          birth_type: formData.birth_type || "vaginal",
        })
        .eq("id", mother.id)

      if (motherError) throw motherError

      // Update location display with simplified format
      if (formData.latitude && formData.longitude) {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formData.latitude}&lon=${formData.longitude}&zoom=10&addressdetails=1`
          )
          const data = await response.json()
          if (data.display_name) {
            // Simplify location display
            const addressParts = data.display_name.split(', ')
            const simplifiedLocation = addressParts.slice(-3).join(', ')
            setLocation(simplifiedLocation)
          }
        } catch (error) {
          console.error("Error fetching updated location:", error)
          setLocation("Location updated")
        }
      }

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      })
      
      setIsEditing(false)
      
      // Refresh user data in context to update dashboard and other components
      await refreshUser()
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please check if your database has the latitude and longitude columns in the users table.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <AppHeader title="Profile" showBack />
      
      <div className="p-6 space-y-6">
        {/* Edit Button */}
        <div className="flex justify-end">
          <Button
            variant={isEditing ? "destructive" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit3 size={16} />
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </Button>
        </div>

        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon size={20} />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language_preference">Language Preference</Label>
                {isEditing ? (
                  <Select
                    value={formData.language_preference}
                    onValueChange={(value) => handleSelectChange("language_preference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="swahili">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="capitalize">{formData.language_preference || "Not set"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_type">Birth Type</Label>
                {isEditing ? (
                  <Select
                    value={formData.birth_type}
                    onValueChange={(value) => handleSelectChange("birth_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select birth type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaginal">Vaginal</SelectItem>
                      <SelectItem value="c_section">C Section</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="capitalize">{formData.birth_type || "Not set"}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Baby Information Card */}
        {babies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BabyIcon size={20} />
                Baby Information
                {babies.length > 1 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({babies.length} {babies.length === 2 ? 'Twins' : babies.length === 3 ? 'Triplets' : `${babies.length} Babies`})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {babies.map((baby, index) => (
                  <div key={baby.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        {babies.length > 1 ? `Baby ${baby.baby_number}` : 'Baby'}
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Birth Date</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(baby.birth_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Age</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor((new Date().getTime() - new Date(baby.birth_date).getTime()) / (1000 * 60 * 60 * 24))} days old
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current Location</p>
                  <p className="text-sm text-muted-foreground">
                    {location || "Location not set"}
                  </p>
                </div>
              </div>
              {isEditing && (
                <div className="space-y-2">
                  <Label>Update Location</Label>
                  <LocationPicker
                    onLocationSelect={(selectedLocation) => {
                      setFormData(prev => ({
                        ...prev,
                        latitude: parseFloat(selectedLocation.lat),
                        longitude: parseFloat(selectedLocation.lon)
                      }))
                      // Simplify location display
                      const addressParts = selectedLocation.display_name.split(', ')
                      const simplifiedLocation = addressParts.slice(-3).join(', ')
                      setLocation(simplifiedLocation)
                    }}
                    placeholder={location || "Search for your location..."}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </main>
  )
} 