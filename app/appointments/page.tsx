"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Video, PhoneIcon, ClipboardPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { AppHeader } from "@/components/app-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Appointment, HealthWorker, User } from "@/lib/types"
import { format, isToday, isYesterday, isAfter, isBefore, differenceInCalendarDays, parseISO } from "date-fns"

interface AppointmentUI {
  id: string
  hwName: string
  worker_type: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  type: "video" | "visit"
}

export default function Appointments() {
  const router = useRouter()
  const { mother } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentUI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!mother?.id) return
      setLoading(true)
      const supabase = getSupabaseClient()
      // Fetch appointments for this mother, join health_workers and users for nurse name
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, health_workers(*, users(full_name))`)
        .eq('mother_id', mother.id)
        .order('scheduled_time', { ascending: false })
      if (error) {
        setLoading(false)
        return
      }
      const now = new Date()
      const mapped: AppointmentUI[] = (data as any[]).map((appt) => {
        const scheduled = parseISO(appt.scheduled_time)
        let dateLabel = format(scheduled, 'PPP')
        if (isToday(scheduled)) dateLabel = 'Today'
        else if (isYesterday(scheduled)) dateLabel = 'Yesterday'
        else if (isAfter(scheduled, now)) {
          const days = differenceInCalendarDays(scheduled, now)
          dateLabel = days === 1 ? 'Tomorrow' : `In ${days} days`
        } else if (isBefore(scheduled, now)) {
          const days = differenceInCalendarDays(now, scheduled)
          dateLabel = days === 1 ? 'Yesterday' : `${days} days ago`
        }
        const timeLabel = format(scheduled, 'p')
        // Health worker name and Type
        let hwName = 'Health Worker'
        let worker_type = "HW"
        if (appt.health_workers?.users?.full_name) hwName = appt.health_workers.users.full_name
        if (appt.health_workers?.worker_type) worker_type = appt.health_workers?.worker_type

        switch (worker_type){
          case 'nurse':
            worker_type = 'Nurse'
            break
          case 'doctor':
            worker_type = 'Doctor'
            break
          case 'community_health_worker':
            worker_type = 'CHW'
            break
          case 'midwife':
            worker_type = 'Midwife'
            break
          default:
            worker_type = 'HW' 
        }

        return {
          id: appt.id,
          hwName,
          worker_type: worker_type,
          date: dateLabel,
          time: timeLabel,
          status: appt.status === 'completed' || isBefore(scheduled, now) ? 'completed' : 'upcoming',
          type: appt.appointment_type,
        }
      })
      console.log("All apps", mapped)
      setAppointments(mapped)
      setLoading(false)
    }
    fetchAppointments()
  }, [mother?.id])

  const handleBookAppointment = () => {
    router.push("/book-appointment")
  }

  const upcomingAppointments = appointments.filter((a) => a.status === "upcoming")
  const pastAppointments = appointments.filter((a) => a.status === "completed")

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <AppHeader title="Appointments" showBack />

      {/* Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <LoadingSpinner message="Loading appointments..." />
        ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{appointment.hwName} ({appointment.worker_type})</h3>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar size={14} />
                      <span>{appointment.date}</span>
                      <Clock size={14} className="ml-2" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      {appointment.type === "video" ? (
                        <>
                          <Video size={14} />
                          <span>Video appointment</span>
                        </>
                      ) : (
                        <>
                          <PhoneIcon size={14} />
                          <span>Visit appointment</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90">Call</Button>
                      <Button variant="outline" className="flex-1">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button onClick={handleBookAppointment} className="bg-primary hover:bg-primary/90">
                  Book an Appointment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length > 0 ? (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{appointment.hwName} ({appointment.worker_type})</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Completed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar size={14} />
                      <span>{appointment.date}</span>
                      <Clock size={14} className="ml-2" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      {appointment.type === "video" ? (
                        <>
                          <Video size={14} />
                          <span>Video appointment</span>
                        </>
                      ) : (
                        <>
                          <PhoneIcon size={14} />
                          <span>Visit appointment</span>
                        </>
                      )}
                    </div>
                    <Button variant="outline" className="w-full">
                      View Summary
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No past appointments</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>

      <BottomNav />

      {/* Floating Book Appointment Button */}
      <button
        onClick={handleBookAppointment}
        aria-label="Book Appointment"
        className="fixed bottom-10 left-4 z-50 flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-4xl transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30 border-4 pulsate-wave"
      >
        <ClipboardPlus size={30} />
      </button>
    </main>
  )
}
