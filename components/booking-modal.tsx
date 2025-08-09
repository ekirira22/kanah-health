"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Clock, MapPin, Star, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import type { HealthWorker, User } from "@/lib/types"

interface HealthWorkerWithUser {
  id: string
  user_id: string
  worker_type: 'doctor' | 'nurse' | 'community_health_worker' | 'midwife'
  available_for_visits: boolean
  available_for_calls: boolean
  max_daily_visits: number
  avg_rating: number
  reviews: number
  created_at: string
  updated_at: string
  user: User
}

// Form validation schema
const bookingFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  duration: z.string({
    required_error: "Please select duration",
  }),
  notes: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  healthWorker: HealthWorkerWithUser
  userLocation: { latitude: number; longitude: number } | null
  selectedType: "visitation" | "video_call"
  motherId: string
  onBookingSuccess: () => void
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
]

const durationOptions = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" }
]

export function BookingModal({
  isOpen,
  onClose,
  healthWorker,
  userLocation,
  selectedType,
  motherId,
  onBookingSuccess
}: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationName, setLocationName] = useState<string>("")
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      notes: "",
    },
  })

  // Fetch location name when modal opens
  useEffect(() => {
    if (isOpen && healthWorker.user.latitude && healthWorker.user.longitude) {
      setLoadingLocation(true)
      getLocationName(healthWorker.user.latitude, healthWorker.user.longitude)
        .then((name) => {
          setLocationName(name)
        })
        .catch((error) => {
          console.error('Error fetching location name:', error)
          setLocationName("Location unavailable")
        })
        .finally(() => {
          setLoadingLocation(false)
        })
    }
  }, [isOpen, healthWorker.user.latitude, healthWorker.user.longitude])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getStars = (n: number) => {
    const stars = []
    for (let i = 0; i < n; i++) {
      stars.push('⭐')
    }
    return stars
  }

  // Get location name from coordinates using OpenStreetMap Nominatim API
  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KanahHealth/1.0' // Required by Nominatim usage policy
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data')
      }
      
      const data = await response.json()
      
      // Extract city/town and county from the response
      const address = data.address
      const city = address.city || address.town || address.village || address.suburb || ''
      const county = address.county || address.state || ''
      
      if (city && county) {
        return `${city}, ${county}`
      } else if (county) {
        return county
      } else if (city) {
        return city
      } else {
        return "Unknown location"
      }
    } catch (error) {
      console.error('Error fetching location name:', error)
      return "Location unavailable"
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Location is required to book an appointment",
        variant: "destructive",
      })
      return
    }

    if (!motherId) {
      toast({
        title: "Profile Not Found",
        description: "User profile not found. Please ensure you're logged in as a mother.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseClient()

      // Combine date and time
      const [hours, minutes] = data.time.split(':')
      const scheduledDateTime = new Date(data.date)
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Validate that the appointment is in the future
      if (scheduledDateTime <= new Date()) {
        toast({
          title: "Invalid Date",
          description: "Please select a future date and time for your appointment.",
          variant: "destructive",
        })
        return
      }

      // Create appointment record
      const { error } = await supabase
        .from('appointments')
        .insert({
          mother_id: motherId,
          health_worker_id: healthWorker.id,
          appointment_type: selectedType, // Use the correct appointment type
          status: "in_progress",
          location: `${userLocation.latitude},${userLocation.longitude}`,
          scheduled_time: scheduledDateTime.toISOString(),
          scheduled_duration_minutes: parseInt(data.duration),
          notes: data.notes || null,
        })

      if (error) {
        console.error('Error creating appointment:', error)
        toast({
          title: "Booking Failed",
          description: "Failed to book appointment. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Store booking details for success modal
      setBookingDetails({
        healthWorkerName: healthWorker.user.full_name,
        appointmentType: selectedType === "visitation" ? "Home Visit" : "Video Call",
        scheduledTime: scheduledDateTime,
        duration: data.duration === "30" ? "30 minutes" : "1 hour",
        location: locationName
      })
      
      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully booked!",
      })
      
      onBookingSuccess()
      setShowSuccessModal(true)
      form.reset()
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast({
        title: "Booking Failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const distance = userLocation && healthWorker.user.latitude && healthWorker.user.longitude
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        healthWorker.user.latitude,
        healthWorker.user.longitude
      )
    : null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Book with Kanah-Verified Health Workers
            </DialogTitle>
            <DialogDescription>
              Schedule your appointment with the selected health worker
            </DialogDescription>
          </DialogHeader>

          {/* Health Worker Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-lg">👩‍⚕️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{healthWorker.user.full_name}</h3>
                <div className="text-sm text-muted-foreground space-y-1 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {loadingLocation 
                        ? "Loading location..." 
                        : locationName && distance 
                          ? `${locationName} - ${Math.round(distance)}km away`
                          : locationName || "Location unavailable"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>
                      {getStars(Math.round(healthWorker.avg_rating)).join('')} 
                      ({healthWorker.avg_rating.toFixed(1)}) - {healthWorker.reviews} reviews
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Max {healthWorker.max_daily_visits} visits per day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Appointment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Selection */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration Selection */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific concerns or information you'd like to share..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Appointment Booked Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your appointment has been confirmed. Here are the details:
            </DialogDescription>
          </DialogHeader>

          {bookingDetails && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Health Worker:</span>
                  <span className="text-sm font-medium">{bookingDetails.healthWorkerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Service Type:</span>
                  <span className="text-sm font-medium">{bookingDetails.appointmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date & Time:</span>
                  <span className="text-sm font-medium">
                    {format(bookingDetails.scheduledTime, "PPP 'at' p")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="text-sm font-medium">{bookingDetails.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium">{bookingDetails.location}</span>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">What's Next?</p>
                <p>You'll receive a confirmation message and the health worker will contact you before the appointment.</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowSuccessModal(false)
                onClose()
              }}
            >
              Book Another Appointment
            </Button>
            <Button 
              onClick={() => {
                setShowSuccessModal(false)
                onClose()
                router.push('/appointments')
              }}
            >
              View My Appointments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 