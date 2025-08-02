"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, ClipboardPlus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { getSupabaseClient } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { HealthWorker, User } from "@/lib/types"

interface HealthWorkerWithUser extends HealthWorker {
  user: User
}

type AppointmentType = "visitation" | "video_call"

interface PricingInfo {
  title: string
  amount: number
  description: string
}

const pricingMap: Record<AppointmentType, PricingInfo> = {
  visitation: {
    title: "Visitation Fee",
    amount: 1500,
    description: "Home visit by a qualified health worker"
  },
  video_call: {
    title: "Online Consultation Fee",
    amount: 1000,
    description: "Video consultation with a health worker"
  }
}

export default function BookAppointment() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<AppointmentType>("visitation")
  const [healthWorkers, setHealthWorkers] = useState<HealthWorkerWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isPrompting, setIsPrompting] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [paymentRef, setPaymentRef] = useState("")
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [locationNames, setLocationNames] = useState<Map<string, string>>(new Map())
  const [loadingLocations, setLoadingLocations] = useState<Set<string>>(new Set())
  const [isSorting, setIsSorting] = useState(false)

  useEffect(() => {
    fetchHealthWorkers()
    getUserLocation()
  }, [selectedType])

  // Pre-fetch location names for all health workers
  useEffect(() => {
    if (healthWorkers.length > 0) {
      healthWorkers.forEach((worker) => {
        if (worker.user.latitude && worker.user.longitude) {
          const locationKey = `${worker.user.latitude},${worker.user.longitude}`
          if (!locationNames.has(locationKey) && !loadingLocations.has(locationKey)) {
            setLoadingLocations(prev => new Set(prev).add(locationKey))
            getLocationName(worker.user.latitude, worker.user.longitude).then((locationName) => {
              setLocationNames(prev => new Map(prev).set(locationKey, locationName))
              setLoadingLocations(prev => {
                const newSet = new Set(prev)
                newSet.delete(locationKey)
                return newSet
              })
            })
          }
        }
      })
    }
  }, [healthWorkers, locationNames, loadingLocations])

  // Re-sort health workers when user location becomes available
  useEffect(() => {
    if (userLocation && healthWorkers.length > 0) {
      setIsSorting(true)
      
      // Use setTimeout to allow UI to update before sorting
      setTimeout(() => {
        const sortedWorkers = [...healthWorkers].sort((a, b) => {
          // Calculate distance for worker A
          const distanceA = a.user.latitude && a.user.longitude 
            ? calculateDistance(userLocation.latitude, userLocation.longitude, a.user.latitude, a.user.longitude)
            : Infinity
          
          // Calculate distance for worker B
          const distanceB = b.user.latitude && b.user.longitude 
            ? calculateDistance(userLocation.latitude, userLocation.longitude, b.user.latitude, b.user.longitude)
            : Infinity
          
          // Sort by distance (closest first)
          return distanceA - distanceB
        })
        
        setHealthWorkers(sortedWorkers)
        setIsSorting(false)
      }, 100)
    }
  }, [userLocation, healthWorkers.length])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const fetchHealthWorkers = async () => {
    try {
      const supabase = getSupabaseClient()
      
      let healthWorkersData, healthWorkersError;

      // First, fetch health workers according to selectedType
      switch (selectedType) {
        case 'visitation':
          const { data: chwData, error: chwError } = await supabase
            .from('health_workers')
            .select('*')
            .eq('worker_type', 'community_health_worker')
            .eq('available_for_visits', true)
          
            healthWorkersData = chwData
            healthWorkersError = chwError
            break
        case 'video_call':
          const { data: doctorData, error: doctorError } = await supabase
            .from('health_workers')
            .select('*')
            .eq('worker_type', 'doctor')
            .eq('available_for_calls', true)
          
            healthWorkersData = doctorData
            healthWorkersError = doctorError
            break
        default:
          const { data: userData, error: userError } = await supabase
          .from('health_workers')
          .select('*')
        
          healthWorkersData = userData
          healthWorkersError = userError
          break
      }

      if (healthWorkersError) {
        console.error('Error fetching health workers:', healthWorkersError)
        return
      }

      if (!healthWorkersData || healthWorkersData.length === 0) {
        setHealthWorkers([])
        return
      }

      // Get user IDs
      const userIds = healthWorkersData.map(worker => worker.user_id)
      
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds)

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return
      }

      // Create a map of users by ID
      const usersMap = new Map(usersData?.map(user => [user.id, user]) || [])
      
      // Combine the data
      const combinedData: HealthWorkerWithUser[] = healthWorkersData
        .map(worker => {
          const user = usersMap.get(worker.user_id)
          if (!user) return null
          return {
            ...worker,
            user: user as unknown as User
          }
        })
        .filter((worker): worker is HealthWorkerWithUser => worker !== null)

             // Sort health workers by distance if user location is available
       let sortedData = combinedData
       if (userLocation) {
         sortedData = combinedData.sort((a, b) => {
           // Calculate distance for worker A
           const distanceA = a.user.latitude && a.user.longitude 
             ? calculateDistance(userLocation.latitude, userLocation.longitude, a.user.latitude, a.user.longitude)
             : Infinity
           
           // Calculate distance for worker B
           const distanceB = b.user.latitude && b.user.longitude 
             ? calculateDistance(userLocation.latitude, userLocation.longitude, b.user.latitude, b.user.longitude)
             : Infinity
           
           // Sort by distance (closest first)
           return distanceA - distanceB
         })
       }
       
       setHealthWorkers(sortedData)
       // Next Step: We will not recommend anyone who is more than 10km away for CHW

    } catch (error) {
      console.error('Error fetching health workers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    setIsProcessingPayment(true)
    setShowPhoneInput(true)
    setIsProcessingPayment(false)
  }

  const handlePrompt = async () => {
    if (!phoneNumber || phoneNumber.length <= 10) {
      alert("Please enter a valid phone number")
      return
    }

    setIsPrompting(true)
    
    // Simulate M-Pesa API call
    setTimeout(() => {
      setIsPrompting(false)
      setPaymentConfirmed(true)
      setPaymentRef("THGUJBHGY6") // Generate a random reference
    }, 5000)
  }

  const getWorkerTypeDisplay = (workerType: string) => {
    switch (workerType) {
      case 'doctor':
        return 'Doctor'
      case 'nurse':
        return 'Nurse'
      case 'community_health_worker':
        return 'Community Health Worker'
      case 'midwife':
        return 'Midwife'
      default:
        return workerType
    }
  }

  const currentPricing = pricingMap[selectedType]

  // Get no. of stars
  const getStars = (n: number) => {
    const stars = []
    for (let i = 0; i < n; i++) {
      stars.push('⭐')
    }
    return stars
  }

  // Get the Location and Calculate Distance of Doctor
  const getLocationCalculateDistance = (latitude: number, longitude: number): string => {
    // If we don't have user location yet, return a placeholder
    if (!userLocation) {
      return "Location unavailable"
    }

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude
    )

    // Create a key for caching location names
    const locationKey = `${latitude},${longitude}`
    const cachedLocationName = locationNames.get(locationKey)
    
    if (cachedLocationName) {
      return `${cachedLocationName} - ${Math.round(distance)}km away`
    } else {
      // Check if we're already loading this location
      if (!loadingLocations.has(locationKey)) {
        setLoadingLocations(prev => new Set(prev).add(locationKey))
        // Fetch location name asynchronously and cache it
        getLocationName(latitude, longitude).then((locationName) => {
          setLocationNames(prev => new Map(prev).set(locationKey, locationName))
          setLoadingLocations(prev => {
            const newSet = new Set(prev)
            newSet.delete(locationKey)
            return newSet
          })
        })
      }
      
      return `Loading location... - ${Math.round(distance)}km away`
    }
  }

  // Calculate distance between two points using Haversine formula
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

  return (
    <main className="flex min-h-screen flex-col">
      <AppHeader title="Book Appointment" showBack />

      {/* Content */}
      <div className="flex-1 p-6 pb-20">
        <p className="text-sm mb-8 text-muted-foreground">
          Connect with qualified health workers for personalized advice about your postnatal health concerns.
        </p>

        {/* Service Type Selection */}
        <div className="mb-8">
          <h2 className="font-medium mb-4">Select Service Type</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {/* Nurse Call */}
              {/* <div  */}
                  {/* className={`flex-shrink-0 w-64 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${  */}
                    {/* selectedType === "nurse_call"  */}
                      {/* ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"  */}
                      {/* : "border-gray-200 bg-white hover:border-primary/50 hover:shadow-md"  */}
                  {/* }`}  */}
                  {/* onClick={() => setSelectedType("nurse_call")}  */}
                {/* >  */}
                  {/* <div className="text-left">  */}
                    {/* <div className="font-semibold text-lg mb-2">Call a Nurse</div>  */}
                    {/* <div className={`text-sm ${selectedType === "nurse_call" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>  */}
                      {/* Quick phone consultation */}
                    {/* </div> */}
                  {/* </div> */}
              {/* </div> */}

              {/* Visitation from Health Worker*/}
              <div
                className={`flex-shrink-0 w-64 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedType === "visitation"
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-primary/50 hover:shadow-md"
                }`}
                onClick={() => setSelectedType("visitation")}
              >
                <div className="text-left">
                  <div className="font-semibold text-lg mb-2">Book Visitation</div>
                  <div className={`text-sm ${selectedType === "visitation" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    Home visit by health worker
                  </div>
                </div>
              </div>

              {/* Video Call with Doctor*/}
              <div
                className={`flex-shrink-0 w-64 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedType === "video_call"
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                    : "border-gray-200 bg-white hover:border-primary/50 hover:shadow-md"
                }`}
                onClick={() => setSelectedType("video_call")}
              >
                <div className="text-left">
                  <div className="font-semibold text-lg mb-2">Book Video Call</div>
                  <div className={`text-sm ${selectedType === "video_call" ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    Online consultation with Doctor
                  </div>
                </div>
              </div>
        
            </div>
            
            {/* Gradient fade indicators */}
            {/* <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div> */}
          </div>
        </div>

        {/* Payment details */}
        <div className="border rounded-lg p-6 mb-8">
          <h2 className="font-medium mb-4">{currentPricing.title}</h2>

          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Consultation charge</span>
            <span>Ksh {currentPricing.amount}</span>
          </div>

          <div className="border-t pt-2 mt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>Ksh {currentPricing.amount}</span>
          </div>

          <div className="bg-green-50 text-green-700 p-3 rounded-lg mt-4 text-sm flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <p>Payment is secure through M-Pesa. You'll receive a prompt on your phone.</p>
          </div>

          {!showPhoneInput ? (
            <Button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="w-full mt-4 bg-primary hover:bg-primary/90"
            >
              {isProcessingPayment ? "Processing..." : "Pay with M-Pesa"}
            </Button>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="0XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-2"
                />
                <Button
                  onClick={handlePrompt}
                  disabled={isPrompting || !phoneNumber}
                  className="flex-1"
                >
                  {isPrompting ? "Processing..." : "Prompt"}
                </Button>
              </div>
            </div>
          )}

          {/* Payment Success */}
          {paymentConfirmed && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-1">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-medium text-green-800">Payment Confirmed</div>
                  <div className="text-sm text-green-700">Ref: {paymentRef}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Available Health Workers */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-medium text-lg">Available Health Workers</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">{healthWorkers.length} available</span>
        </div>

                {isLoading ? (
          <LoadingSpinner message="Loading health workers..." />
        ) : isSorting ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">🔄</div>
            <p className="text-muted-foreground">Sorting by distance...</p>
          </div>
        ) : healthWorkers.length > 0 ? (
           healthWorkers.map((worker, index) => (
             <div key={worker.id} className="border rounded-lg p-5 mb-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                       <span className="text-primary">👩‍⚕️</span> { /* Fetch user profile photo here */}
                     </div>
                     {userLocation && worker.user.latitude && worker.user.longitude && (
                       <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                         {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                       </div>
                     )}
                   </div>
                  <div>
                    <h3 className="font-medium">{worker.user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {worker.user.latitude && worker.user.longitude 
                        ? getLocationCalculateDistance(worker.user.latitude, worker.user.longitude)
                        : "Location unavailable"
                      }, <br></br>{ getStars(parseFloat(worker.avg_rating.toFixed(1))) } ({worker.reviews} reviews)
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paymentConfirmed}
                  className="flex items-center gap-2"
                  onClick={() => {
                    // TODO: Implement booking form popup
                    alert(`Booking appointment with ${worker.user.full_name}`)
                  }}
                >
                  <ClipboardPlus size={16} />
                  Book
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">👩‍⚕️</div>
            <p className="text-muted-foreground">No health workers available at the moment</p>
            <p className="text-sm text-muted-foreground mt-1">Please check back later</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </main>
  )
}