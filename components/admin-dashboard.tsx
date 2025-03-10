"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Users,
  Calendar,
  LogOut,
  Search,
  CheckCircle,
  Clock,
  ChevronRight,
  Filter,
  Download,
  MapPin,
  FileSpreadsheet,
} from "lucide-react"
import AdminEmployees from "@/components/admin-employees"
import AdminLeaveRequests from "@/components/admin-leave-requests"
import AdminMedicalCertificates from "@/components/admin-medical-certificates"
import AdminLocations from "@/components/admin-locations"
import AdminReports from "@/components/admin-reports"
import { locationColors } from "@/config/colors"

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState("dashboard")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [knownLocations, setKnownLocations] = useState<any[]>([])

  // Mock stats data
  const stats = {
    totalEmployees: 24,
    presentToday: 19,
    onLeave: 3,
    pendingRequests: 5,
  }

  // Mock location check-in data
  const locationCheckIns = [
    { locationId: 0, name: "Main Office", count: 10 },
    { locationId: 1, name: "Branch Office", count: 8 },
    { locationId: 2, name: "Remote Office", count: 12 },
  ]

  useEffect(() => {
    // Check if user is logged in and is admin
    const userStr = localStorage.getItem("currentUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUser(user)

      if (user.role !== "admin") {
        toast({
          title: "Access denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } else {
      router.push("/")
    }

    // Load known locations from localStorage
    const locationsStr = localStorage.getItem("knownLocations")
    if (locationsStr) {
      setKnownLocations(JSON.parse(locationsStr))
    }
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

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
        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
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
          {currentTab === "dashboard" && (
            <div className="px-4 py-3">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees, requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 rounded-full h-10 bg-gray-100 border-0"
                />
                <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full">
                  <Filter className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          )}

          <div className="px-4 pb-4">
            <TabsContent value="dashboard" className="mt-0 space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="rounded-xl overflow-hidden shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <Users className="h-6 w-6 text-blue-500 mb-1" />
                      <span className="text-2xl font-semibold">{stats.totalEmployees}</span>
                      <span className="text-xs text-gray-500">Total Employees</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl overflow-hidden shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mb-1" />
                      <span className="text-2xl font-semibold">{stats.presentToday}</span>
                      <span className="text-xs text-gray-500">Present Today</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl overflow-hidden shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <Calendar className="h-6 w-6 text-orange-500 mb-1" />
                      <span className="text-2xl font-semibold">{stats.onLeave}</span>
                      <span className="text-xs text-gray-500">On Leave</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-xl overflow-hidden shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <Clock className="h-6 w-6 text-purple-500 mb-1" />
                      <span className="text-2xl font-semibold">{stats.pendingRequests}</span>
                      <span className="text-xs text-gray-500">Pending Requests</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Card */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Monthly Reports</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full"
                      onClick={() => setCurrentTab("reports")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">March 2025 Attendance</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                        onClick={() => {
                          toast({
                            title: "Downloading report",
                            description: "March_2025_Attendance.xlsx",
                          })
                        }}
                      >
                        <Download className="h-4 w-4 text-blue-600" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">February 2025 Attendance</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                        onClick={() => {
                          toast({
                            title: "Downloading report",
                            description: "February_2025_Attendance.xlsx",
                          })
                        }}
                      >
                        <Download className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs rounded-full mt-2"
                    onClick={() => setCurrentTab("reports")}
                  >
                    View All Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Office Locations Card */}
              {knownLocations.length > 0 && (
                <Card className="rounded-xl overflow-hidden shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">Office Locations</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full"
                        onClick={() => setCurrentTab("locations")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {locationCheckIns.map((loc) => (
                        <div
                          key={loc.locationId}
                          className={`flex items-center justify-between p-2 rounded-lg ${locationColors[loc.locationId % locationColors.length].bg}`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin
                              className={`h-4 w-4 ${locationColors[loc.locationId % locationColors.length].text}`}
                            />
                            <span
                              className={`text-sm font-medium ${locationColors[loc.locationId % locationColors.length].text}`}
                            >
                              {loc.name}
                            </span>
                          </div>
                          <div
                            className={`text-xs font-medium ${locationColors[loc.locationId % locationColors.length].text}`}
                          >
                            {loc.count} checked in
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs rounded-full mt-2"
                      onClick={() => setCurrentTab("locations")}
                    >
                      Manage Locations
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-1">
                  <h2 className="text-lg font-medium mb-2">Recent Activity</h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Jane Smith</p>
                          <span className="text-xs text-gray-500">9:02 AM</span>
                        </div>
                        <p className="text-xs text-gray-600">Clocked in</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>TW</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Tom Wilson</p>
                          <span className="text-xs text-gray-500">8:45 AM</span>
                        </div>
                        <p className="text-xs text-gray-600">Clocked in</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Mike Johnson</p>
                          <span className="text-xs text-gray-500">Yesterday</span>
                        </div>
                        <p className="text-xs text-gray-600">Requested sick leave</p>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full text-xs text-blue-500 mt-2">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Approvals */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium">Pending Approvals</h2>
                    <Badge variant="outline" className="rounded-full text-xs font-normal px-2 py-0.5">
                      {stats.pendingRequests} requests
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Mike Johnson</p>
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 rounded-full text-xs font-normal px-2 py-0.5">
                            Sick Leave
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">Mar 10 - Mar 12, 2025</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SL</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Sarah Lee</p>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full text-xs font-normal px-2 py-0.5">
                            Annual Leave
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">Mar 15 - Mar 20, 2025</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs mt-2 rounded-full"
                    onClick={() => setCurrentTab("leave")}
                  >
                    View All Requests
                  </Button>
                </CardContent>
              </Card>

              {/* Today's Attendance */}
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-medium">Today's Attendance</h2>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Present: {stats.presentToday}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>Absent: {stats.totalEmployees - stats.presentToday - stats.onLeave}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                      <span>Leave: {stats.onLeave}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs rounded-full"
                    onClick={() => setCurrentTab("employees")}
                  >
                    View Detailed Report
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employees" className="mt-0">
              <AdminEmployees />
            </TabsContent>

            <TabsContent value="leave" className="mt-0">
              <AdminLeaveRequests />
            </TabsContent>

            <TabsContent value="certificates" className="mt-0">
              <AdminMedicalCertificates />
            </TabsContent>

            <TabsContent value="locations" className="mt-0">
              <AdminLocations />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <AdminReports />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* iOS Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2">
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "dashboard" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => setCurrentTab("dashboard")}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "employees" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => setCurrentTab("employees")}
        >
          <Users className="h-6 w-6" />
          <span className="text-xs mt-1">Employees</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "leave" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => setCurrentTab("leave")}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Leave</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "reports" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => setCurrentTab("reports")}
        >
          <FileSpreadsheet className="h-6 w-6" />
          <span className="text-xs mt-1">Reports</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center w-16 h-16 ${currentTab === "locations" ? "text-blue-500" : "text-gray-500"}`}
          onClick={() => setCurrentTab("locations")}
        >
          <MapPin className="h-6 w-6" />
          <span className="text-xs mt-1">Locations</span>
        </button>
      </div>
    </div>
  )
}

