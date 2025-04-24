"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Calendar, Clock, Video, PhoneIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/language-toggle"
import { NotificationBell } from "@/components/notification-bell"
import { BottomNav } from "@/components/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Consultation {
  id: string
  nurseName: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  type: "video" | "voice"
}

export default function Consultations() {
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: "1",
      nurseName: "Nurse Wanjiku",
      date: "Today",
      time: "2:00 PM",
      status: "upcoming",
      type: "video",
    },
    {
      id: "2",
      nurseName: "Nurse Otieno",
      date: "Yesterday",
      time: "10:30 AM",
      status: "completed",
      type: "voice",
    },
  ])

  const handleBack = () => {
    router.back()
  }

  const handleBookConsultation = () => {
    router.push("/call-nurse")
  }

  const upcomingConsultations = consultations.filter((c) => c.status === "upcoming")
  const pastConsultations = consultations.filter((c) => c.status !== "upcoming")

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-white mr-2">
            <ChevronLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Consultations</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <LanguageToggle initialLanguage="english" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingConsultations.length > 0 ? (
              <div className="space-y-4">
                {upcomingConsultations.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{consultation.nurseName}</h3>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Upcoming</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar size={14} />
                      <span>{consultation.date}</span>
                      <Clock size={14} className="ml-2" />
                      <span>{consultation.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      {consultation.type === "video" ? (
                        <>
                          <Video size={14} />
                          <span>Video consultation</span>
                        </>
                      ) : (
                        <>
                          <PhoneIcon size={14} />
                          <span>Voice consultation</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-primary hover:bg-primary/90">Join</Button>
                      <Button variant="outline" className="flex-1">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming consultations</p>
                <Button onClick={handleBookConsultation} className="bg-primary hover:bg-primary/90">
                  Book a Consultation
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastConsultations.length > 0 ? (
              <div className="space-y-4">
                {pastConsultations.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{consultation.nurseName}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">Completed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar size={14} />
                      <span>{consultation.date}</span>
                      <Clock size={14} className="ml-2" />
                      <span>{consultation.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      {consultation.type === "video" ? (
                        <>
                          <Video size={14} />
                          <span>Video consultation</span>
                        </>
                      ) : (
                        <>
                          <PhoneIcon size={14} />
                          <span>Voice consultation</span>
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
                <p className="text-muted-foreground">No past consultations</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </main>
  )
}
