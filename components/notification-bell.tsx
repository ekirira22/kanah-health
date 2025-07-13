"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Reminder",
      message: "Don't forget to take your vitamins today",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "Appointment",
      message: "Your nurse consultation is scheduled for tomorrow",
      time: "1 hour ago",
      read: false,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0" align="center">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-primary">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b ${notification.read ? "" : "bg-secondary/50"}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
                <p className="text-sm">{notification.message}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">No notifications</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
