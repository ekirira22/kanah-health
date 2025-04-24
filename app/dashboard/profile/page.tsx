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
import type { User, Mother } from "@/lib/types"

export default function Profile() {
  const { user, mother, isLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
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
    if (user && mother) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        language_preference: mother.language_preference,
        birth_type: mother.birth_type,
        latitude: mother.latitude || 0,
        longitude: mother.longitude || 0,
      })
    }
  }, [user, mother])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
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

      // Update user table
      const { error: userError } = await supabase
        .from("users")
        .update({
          full_name: formData.full_name || "",
          email: formData.email || "",
          phone_number: formData.phone_number || "",
        })
        .eq("id", user.id)

      if (userError) throw userError

      // Update mother table
      const { error: motherError } = await supabase
        .from("mothers")
        .update({
          language_preference: formData.language_preference || "english",
          birth_type: formData.birth_type || "vaginal",
          latitude: formData.latitude,
          longitude: formData.longitude,
        })
        .eq("id", mother.id)

      if (motherError) throw motherError

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      })
      
      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
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
                <Input
                  id="language_preference"
                  name="language_preference"
                  value={formData.language_preference}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_type">Birth Type</Label>
                <Input
                  id="birth_type"
                  name="birth_type"
                  value={formData.birth_type}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </main>
  )
} 