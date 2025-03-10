"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, Calendar, CheckCircle, XCircle, Home, FileText, LogOut, WifiOff, Plus } from "lucide-react"
import AttendanceHistory from "@/components/attendance-history"
import LeaveApplication from "@/components/leave-application"
import MedicalCertificates from "@/components/medical-certificates"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { locationColors } from "@/config/colors"
import { offlineManager } from "@/lib/offline-manager"
import { notificationManager } from "@/lib/notification-manager"
import { analytics } from "@/lib/analytics"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState("dashboard")
  const [clockedIn, setClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isWithinPremises, setIsWithinPremises] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [workLocation, setWorkLocation] = useState<{
    name: string
    lat: number
    lng: number
    radius: number
    colorIndex: number
  } | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [pendingOfflineChecks, setPendingOfflineChecks] = useState<any[]>([])
  const [knownLocations, setKnownLocations] = useState<any[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // Allowed radius in meters
  const allowedRadius = 100
  // Timeout for location checking (4 minutes = 240000 milliseconds)
  const locationTimeout = 240000

  useEffect(() => {
    // Initialize offline manager
    offlineManager.init().catch(console.error)

    // Initialize analytics
    analytics.init()

    // Initialize notifications
    notificationManager.init().then((initialized) => {
      if (initialized) {
        notificationManager.areNotificationsEnabled().then((enabled) => {
          setNotificationsEnabled(enabled)
        })
      }
    })

    // Check if user is logged in
    const userStr = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)

      // Set user ID for analytics
      analytics.setUserId(user.id)

      if (user.role === "admin") {
        router.push("/admin")
      }
    } else {
      router.push("/")
    }

    // Load known locations from localStorage
    const locationsStr = localStorage.getItem("knownLocations")
    if (locationsStr) {
      setKnownLocations(JSON.parse(locationsStr))
    }

    // Load pending offline check-ins
    const pendingChecksStr = localStorage.getItem("pendingOfflineChecks")
    if (pendingChecksStr) {
      setPendingOfflineChecks(JSON.parse(pendingChecksStr))
    }

    // Set up online/offline detection
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOffline(!navigator.onLine)

    // Track page view
    analytics.trackPageView()

    // Check for URL parameters
    const action = searchParams?.get("action")
    if (action === "clockin" && !clockedIn) {
      // Auto-trigger clock in if requested via URL
      setTimeout(() => {
        handleClockIn()
      }, 1000)
    }

    const tab = searchParams?.get("tab")
    if (tab) {
      setCurrentTab(tab)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)

      // Flush analytics on unmount
      analytics.flush()
    }
  }, [router, searchParams, clockedIn])

  // Rest of the component remains the same...

  // All the other functions and JSX remain unchanged

  const handleOnline = () => {
    setIsOffline(false)
    syncOfflineChecks()
  }

  const handleOffline = () => {
    setIsOffline(true)
    toast({
      title: "You're offline",
      description: "Check-ins will be saved locally and synced when you're back online.",
    })
  }

  // Sync offline check-ins when back online
  const syncOfflineChecks = async () => {
    if (pendingOfflineChecks.length > 0) {
      toast({
        title: "Syncing offline check-ins",
        description: `Syncing ${pendingOfflineChecks.length} offline check-ins...`,
      })

      // Use the offline manager to sync
      const success = await offlineManager.syncOfflineActions()

      if (success) {
        setPendingOfflineChecks([])
        localStorage.removeItem("pendingOfflineChecks")

        toast({
          title: "Sync complete",
          description: "Your offline check-ins have been synchronized.",
        })

        // Track successful sync
        analytics.trackEvent("attendance", "sync_complete", "offline_records", pendingOfflineChecks.length)
      } else {
        toast({
          title: "Sync failed",
          description: "Failed to sync some offline records. Will try again later.",
          variant: "destructive",
        })

        // Track failed sync
        analytics.trackEvent("attendance", "sync_failed", "offline_records", pendingOfflineChecks.length)
      }
    }
  }

  // Request notification permission
  const requestNotificationPermission = async () => {
    const granted = await notificationManager.requestPermission()
    setNotificationsEnabled(granted)

    if (granted) {
      toast({
        title: "Notifications enabled",
        description: "You will now receive notifications for important events.",
      })

      // Subscribe to push notifications
      const subscription = await notificationManager.subscribeToPush()

      // Track event
      analytics.trackEvent("notifications", "enabled")

      // Show a test notification
      setTimeout(() => {
        notificationManager.showNotification({
          title: "Attendance App",
          body: "Notifications are now enabled. You'll be notified about important events.",
        })
      }, 2000)
    } else {
      toast({
        title: "Notifications disabled",
        description: "You will not receive notifications. You can enable them in your browser settings.",
      })

      // Track event
      analytics.trackEvent("notifications", "disabled")
    }
  }

  // Check if user is within premises
  const checkLocation = () => {
    setIsLoading(true)

    // If offline, use the last known location or allow check-in
    if (isOffline) {
      setIsWithinPremises(true)
      setIsLoading(false)
      return
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude

          setLocation({ lat: userLat, lng: userLng })

          // Check if user is within any known location
          let withinKnownLocation = false
          let matchedLocation = null

          if (knownLocations.length > 0) {
            for (const loc of knownLocations) {
              const distance = calculateDistance(userLat, userLng, loc.lat, loc.lng)
              if (distance <= loc.radius) {
                withinKnownLocation = true
                matchedLocation = loc
                break
              }
            }
          }

          // If within a known location, use that
          if (withinKnownLocation && matchedLocation) {
            setWorkLocation(matchedLocation)
            setIsWithinPremises(true)
            toast({
              title: "Location verified",
              description: `You are at ${matchedLocation.name}.`,
            })

            // Track location verification
            analytics.trackEvent("location", "verified", matchedLocation.name)
          } else if (!workLocation) {
            // If not within any known location and no work location set,
            // ask if they want to set this as a new work location
            const confirmNewLocation = window.confirm(
              "You're not at a known office location. Would you like to set your current location as a new office?",
            )

            if (confirmNewLocation) {
              promptForNewLocation(userLat, userLng)
            } else {
              setIsWithinPremises(false)
              toast({
                title: "Location verification failed",
                description: "You must be within a known office location to clock in/out.",
                variant: "destructive",
              })

              // Track failed verification
              analytics.trackEvent("location", "verification_failed", "not_in_known_location")
            }
          } else {
            // Check against current work location
            const distance = calculateDistance(userLat, userLng, workLocation.lat, workLocation.lng)
            const within = distance <= workLocation.radius

            setIsWithinPremises(within)

            if (!within) {
              toast({
                title: "Location verification failed",
                description: `You must be within ${workLocation.name} to clock in/out.`,
                variant: "destructive",
              })

              // Track failed verification
              analytics.trackEvent("location", "verification_failed", "outside_radius")
            }
          }

          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          })
          setIsLoading(false)

          // Track location error
          analytics.trackEvent("location", "error", error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: locationTimeout,
          maximumAge: 0,
        },
      )
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      })
      setIsLoading(false)

      // Track unsupported browser
      analytics.trackEvent("location", "not_supported")
    }
  }

  const promptForNewLocation = (lat: number, lng: number) => {
    const locationName = prompt("What would you like to name this office location?", "Office")

    if (locationName) {
      // Create a new location with a random color
      const colorIndex = knownLocations.length % locationColors.length

      const newLocation = {
        name: locationName,
        lat: lat,
        lng: lng,
        radius: allowedRadius,
        colorIndex: colorIndex,
      }

      // Add to known locations
      const updatedLocations = [...knownLocations, newLocation]
      setKnownLocations(updatedLocations)
      localStorage.setItem("knownLocations", JSON.stringify(updatedLocations))

      // Set as current work location
      setWorkLocation(newLocation)
      setIsWithinPremises(true)

      toast({
        title: "New office location added",
        description: `${locationName} has been added as an office location.`,
      })

      // Track new location
      analytics.trackEvent("location", "new_location_added", locationName)
    }
  }

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Verify if user is within the selected location
  const verifySelectedLocation = (location: any) => {
    setIsLoading(true)

    // If offline, allow any location
    if (isOffline) {
      setWorkLocation(location)
      setIsWithinPremises(true)
      setIsLoading(false)
      return
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude
          const userLng = position.coords.longitude

          // Calculate distance between user and selected location
          const distance = calculateDistance(
            userLat,
            userLng,
            location.lat || location.latitude,
            location.lng || location.longitude,
          )

          // Check if user is within the location's radius
          const within = distance <= (location.radius || allowedRadius)

          if (within) {
            setWorkLocation(location)
            setIsWithinPremises(true)
            toast({
              title: "Location verified",
              description: `You are at ${location.name}.`,
            })

            // Track successful verification
            analytics.trackEvent("location", "verified", location.name)
          } else {
            setIsWithinPremises(false)
            toast({
              title: "Location verification failed",
              description: `You are not within ${location.name}. Please select your actual location.`,
              variant: "destructive",
            })

            // Track failed verification
            analytics.trackEvent("location", "verification_failed", location.name)
          }

          setIsLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          })
          setIsLoading(false)

          // Track location error
          analytics.trackEvent("location", "error", error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: locationTimeout,
          maximumAge: 0,
        },
      )
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      })
      setIsLoading(false)

      // Track unsupported browser
      analytics.trackEvent("location", "not_supported")
    }
  }

  const handleClockIn = async () => {
    if (isOffline) {
      // Handle offline clock-in
      const now = new Date()
      setClockInTime(now)
      setClockedIn(true)

      // Store offline check-in using the offline manager
      try {
        const recordId = await offlineManager.saveAttendanceRecord({
          userId: currentUser.id,
          userName: currentUser.name,
          type: "clockIn",
          timestamp: now.getTime(),
          location: {
            name: workLocation ? workLocation.name : "Unknown Location",
          },
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        })

        toast({
          title: "Offline clock-in",
          description: `You clocked in at ${now.toLocaleTimeString()}. This will sync when you're back online.`,
        })

        // Track offline clock-in
        analytics.trackEvent("attendance", "clock_in", "offline", now.getTime())
      } catch (error) {
        console.error("Error saving offline record:", error)
        toast({
          title: "Error saving offline record",
          description: "There was an error saving your clock-in. Please try again.",
          variant: "destructive",
        })
      }

      return
    }

    checkLocation()
    if (isWithinPremises) {
      const now = new Date()
      setClockInTime(now)
      setClockedIn(true)

      toast({
        title: "Clocked in successfully",
        description: `You clocked in at ${now.toLocaleTimeString()} at ${workLocation?.name || "your work location"}`,
      })

      // Track clock-in
      analytics.trackEvent("attendance", "clock_in", workLocation?.name, now.getTime())

      // Schedule a reminder notification for clock-out
      if (notificationsEnabled) {
        notificationManager.scheduleNotification(
          {
            title: "Time to clock out?",
            body: "You've been working for 8 hours. Don't forget to clock out!",
            actions: [
              {
                action: "clock-out",
                title: "Clock Out",
              },
            ],
          },
          480,
        ) // 8 hours in minutes
      }
    }
  }

  const handleClockOut = async () => {
    if (isOffline) {
      // Handle offline clock-out
      const now = new Date()
      setClockOutTime(now)
      setClockedIn(false)

      // Store offline check-out using the offline manager
      try {
        const recordId = await offlineManager.saveAttendanceRecord({
          userId: currentUser.id,
          userName: currentUser.name,
          type: "clockOut",
          timestamp: now.getTime(),
          location: {
            name: workLocation ? workLocation.name : "Unknown Location",
          },
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        })

        toast({
          title: "Offline clock-out",
          description: `You clocked out at ${now.toLocaleTimeString()}. This will sync when you're back online.`,
        })

        // Track offline clock-out
        analytics.trackEvent("attendance", "clock_out", "offline", now.getTime())
      } catch (error) {
        console.error("Error saving offline record:", error)
        toast({
          title: "Error saving offline record",
          description: "There was an error saving your clock-out. Please try again.",
          variant: "destructive",
        })
      }

      return
    }

    checkLocation()
    if (isWithinPremises) {
      const now = new Date()
      setClockOutTime(now)
      setClockedIn(false)

      toast({
        title: "Clocked out successfully",
        description: `You clocked out at ${now.toLocaleTimeString()} from ${workLocation?.name || "your work location"}`,
      })

      // Track clock-out
      analytics.trackEvent("attendance", "clock_out", workLocation?.name, now.getTime())

      // Show a thank you notification
      if (notificationsEnabled) {
        notificationManager.showNotification({
          title: "Have a great day!",
          body: "Thank you for your work today. Your clock-out has been recorded.",
        })
      }
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser")
    }
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })

    // Track logout
    analytics.trackEvent("user", "logout")
  }

  // Check location on component mount
  useEffect(() => {
    if (!isOffline) {
      checkLocation()
    }
  }, [])

  if (!currentUser) {
    return null // Loading state
  }

  return (
    <div className="flex flex-col h-[852px] w-[393px] mx-auto bg-gray-50 overflow-hidden relative">
      {/* iOS Status Bar */}
      <div className="h-11 bg-white flex items-center justify-between px-5 pt-2">
        <div className="text-sm font-medium flex flex-col">
          <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="text-xs text-gray-500">
            {new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-black"></div>
          <div className="h-3 w-3 rounded-full bg-black"></div>
          <div className="h-3 w-3 rounded-full bg-black"></div>
        </div>
      </div>

      {/* App Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <div className="flex items-center gap-2">
          {isOffline && (
            <div className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={currentUser.name} />
            <AvatarFallback>
              {currentUser.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Tabs defaultValue="dashboard" value={currentTab} onValueChange={setCurrentTab} className="h-full">
          <div className="px-4 py-4">
            <TabsContent value="dashboard" className="mt-0 space-y-4">
              {/* Employee Info Card */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" alt={currentUser.name} />
                      <AvatarFallback>
                        {currentUser.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-base font-medium">{currentUser.name}</h2>
                      <p className="text-xs text-gray-500">Employee ID: {currentUser.employeeId}</p>
                    </div>
                  </div>

                  {!notificationsEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs rounded-full"
                      onClick={requestNotificationPermission}
                    >
                      Enable Notifications
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Clock In/Out Card */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Clock In/Out</h2>
                    {workLocation ? (
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${locationColors[workLocation.colorIndex].bg} ${locationColors[workLocation.colorIndex].text}`}
                      >
                        {workLocation.name}
                      </div>
                    ) : (
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${isWithinPremises ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {isWithinPremises ? "In Premises" : "Outside Premises"}
                      </div>
                    )}
                  </div>

                  {/* Location Selection */}
                  {knownLocations.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="location-select" className="text-sm">
                        Select your location
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {knownLocations.map((loc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className={`h-auto py-2 px-3 justify-start text-left ${
                              workLocation?.name === loc.name
                                ? `${locationColors[loc.colorIndex].bg} border-2 border-primary`
                                : ""
                            }`}
                            onClick={() => {
                              // Verify if user is within this location
                              verifySelectedLocation(loc)

                              // Track location selection
                              analytics.trackEvent("location", "selected", loc.name)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${locationColors[loc.colorIndex].bg}`}></div>
                              <span className="text-sm truncate">{loc.name}</span>
                            </div>
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="h-auto py-2 px-3 justify-start text-left"
                          onClick={() => {
                            if (typeof navigator !== "undefined" && navigator.geolocation) {
                              setIsLoading(true)
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  promptForNewLocation(position.coords.latitude, position.coords.longitude)
                                  setIsLoading(false)
                                },
                                (error) => {
                                  toast({
                                    title: "Location error",
                                    description: "Unable to get your location. Please enable location services.",
                                    variant: "destructive",
                                  })
                                  setIsLoading(false)

                                  // Track location error
                                  analytics.trackEvent("location", "error", error.message)
                                },
                              )
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Add New</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {isOffline
                        ? "Offline mode - location verification skipped"
                        : workLocation
                          ? `You are at ${workLocation.name}`
                          : isWithinPremises
                            ? "You are within company premises"
                            : "Please select your location"}
                    </span>
                  </div>

                  {pendingOfflineChecks.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
                      You have {pendingOfflineChecks.length} offline check-in/out records that will sync when you're
                      back online.
                    </div>
                  )}

                  {clockedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Clocked in: {clockInTime?.toLocaleTimeString()}
                          {clockInTime && ` (${formatDistanceToNow(clockInTime)} ago)`}
                        </span>
                      </div>
                      <Button
                        onClick={handleClockOut}
                        className="w-full rounded-full h-12 text-base"
                        disabled={!isOffline && !isWithinPremises && isLoading}
                      >
                        Clock Out
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clockOutTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Last clock out: {clockOutTime.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      <Button
                        onClick={handleClockIn}
                        className="w-full rounded-full h-12 text-base"
                        disabled={!isOffline && !isWithinPremises && isLoading}
                      >
                        Clock In
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Known Locations Card */}
              {knownLocations.length > 0 && (
                <Card className="rounded-xl overflow-hidden shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    <h2 className="text-lg font-medium">Office Locations</h2>
                    <div className="space-y-2">
                      {knownLocations.map((loc, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg ${locationColors[loc.colorIndex].bg}`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-4 w-4 ${locationColors[loc.colorIndex].text}`} />
                            <span className={`text-sm font-medium ${locationColors[loc.colorIndex].text}`}>
                              {loc.name}
                            </span>
                          </div>
                          <div className={`text-xs font-medium ${locationColors[loc.colorIndex].text}`}>
                            {/* In a real app, you would show how many employees are checked in at this location */}
                            {index === 0 ? "10 checked in" : index === 1 ? "8 checked in" : "12 checked in"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Leave Balance Card */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <h2 className="text-lg font-medium">Leave Balance</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Annual Leave</span>
                      <span className="font-medium">15 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sick Leave</span>
                      <span className="font-medium">7 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Personal Leave</span>
                      <span className="font-medium">3 days</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 text-sm"
                      onClick={() => {
                        setCurrentTab("leave")
                        analytics.trackEvent("navigation", "tab_change", "leave")
                      }}
                    >
                      Apply for Leave
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Card */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <h2 className="text-lg font-medium">Recent Activity</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Clocked in</p>
                        <p className="text-xs text-gray-500">Yesterday, 9:02 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Clocked out</p>
                        <p className="text-xs text-gray-500">Yesterday, 5:15 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Leave approved</p>
                        <p className="text-xs text-gray-500">Mar 15 - Mar 18, 2025</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 text-sm"
                      onClick={() => {
                        setCurrentTab("attendance")
                        analytics.trackEvent("navigation", "tab_change", "attendance")
                      }}
                    >
                      View All Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="mt-0">
              <AttendanceHistory />
            </TabsContent>

            <TabsContent value="leave" className="mt-0">
              <LeaveApplication />
            </TabsContent>

            <TabsContent value="certificates" className="mt-0">
              <MedicalCertificates />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* iOS Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2">
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "dashboard" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => {
            setCurrentTab("dashboard")
            analytics.trackEvent("navigation", "tab_change", "dashboard")
          }}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "attendance" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => {
            setCurrentTab("attendance")
            analytics.trackEvent("navigation", "tab_change", "attendance")
          }}
        >
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">Records</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "leave" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => {
            setCurrentTab("leave")
            analytics.trackEvent("navigation", "tab_change", "leave")
          }}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Leave</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "certificates" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => {
            setCurrentTab("certificates")
            analytics.trackEvent("navigation", "tab_change", "certificates")
          }}
        >
          <FileText className="h-6 w-6" />
          <span className="text-xs mt-1">Medical</span>
        </button>
      </div>
    </div>
  )
}

