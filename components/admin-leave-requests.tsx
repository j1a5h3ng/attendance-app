"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, FileText, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

// Mock leave requests data
const mockLeaveRequests = [
  {
    id: "LEA-001",
    employeeId: "EMP001",
    employeeName: "John Doe",
    type: "Annual Leave",
    startDate: "2025-03-15",
    endDate: "2025-03-18",
    days: 2,
    reason: "Family vacation",
    status: "approved",
    appliedOn: "2025-02-28",
    hasMedicalCert: false,
  },
  {
    id: "LEA-002",
    employeeId: "EMP003",
    employeeName: "Mike Johnson",
    type: "Sick Leave",
    startDate: "2025-03-10",
    endDate: "2025-03-12",
    days: 3,
    reason: "Fever and cold",
    status: "pending",
    appliedOn: "2025-03-09",
    hasMedicalCert: true,
  },
  {
    id: "LEA-003",
    employeeId: "EMP004",
    employeeName: "Sarah Lee",
    type: "Annual Leave",
    startDate: "2025-03-15",
    endDate: "2025-03-20",
    days: 4,
    reason: "Family event",
    status: "pending",
    appliedOn: "2025-03-01",
    hasMedicalCert: false,
  },
  {
    id: "LEA-004",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    type: "Personal Leave",
    startDate: "2025-03-05",
    endDate: "2025-03-05",
    days: 1,
    reason: "Personal appointment",
    status: "approved",
    appliedOn: "2025-03-01",
    hasMedicalCert: false,
  },
  {
    id: "LEA-005",
    employeeId: "EMP006",
    employeeName: "Emily Davis",
    type: "Sick Leave",
    startDate: "2025-02-20",
    endDate: "2025-02-21",
    days: 2,
    reason: "Migraine",
    status: "rejected",
    appliedOn: "2025-02-19",
    hasMedicalCert: false,
  },
]

export default function AdminLeaveRequests() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTab, setCurrentTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const filteredRequests = mockLeaveRequests.filter((request) => {
    const matchesSearch =
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase())

    if (currentTab === "all") return matchesSearch
    return matchesSearch && request.status === currentTab
  })

  const handleApprove = (requestId: string) => {
    toast({
      title: "Leave request approved",
      description: `Leave request ${requestId} has been approved.`,
    })
    setSelectedRequest(null)
  }

  const handleReject = (requestId: string) => {
    toast({
      title: "Leave request rejected",
      description: `Leave request ${requestId} has been rejected.`,
    })
    setSelectedRequest(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Leave Requests</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 rounded-full h-10 bg-gray-100 border-0"
        />
        <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full">
          <Filter className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {selectedRequest ? (
        <LeaveRequestDetail
          request={selectedRequest}
          onBack={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : (
        <>
          <Tabs defaultValue="pending" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-3 rounded-full h-9 p-1">
              <TabsTrigger value="pending" className="rounded-full text-xs">
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="rounded-full text-xs">
                Approved
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-full text-xs">
                All
              </TabsTrigger>
            </TabsList>

            <TabsContent value={currentTab} className="mt-3">
              <div className="space-y-3">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <Card key={request.id} className="rounded-xl overflow-hidden shadow-sm">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&text=${request.employeeName.charAt(0)}`}
                              alt={request.employeeName}
                            />
                            <AvatarFallback>
                              {request.employeeName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">{request.employeeName}</p>
                              <Badge
                                className={`
                                  rounded-full text-xs font-normal px-2 py-0.5
                                  ${
                                    request.status === "approved"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : request.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                        : "bg-red-100 text-red-800 hover:bg-red-100"
                                  }
                                `}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500">
                                {request.employeeId} • {request.type}
                              </p>
                              <button className="text-blue-500 text-xs" onClick={() => setSelectedRequest(request)}>
                                Details
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {format(new Date(request.startDate), "MMM dd")} -{" "}
                            {format(new Date(request.endDate), "MMM dd, yyyy")}
                            <span className="mx-1">•</span>
                            {request.days} day{request.days !== 1 && "s"}
                          </div>
                          {request.hasMedicalCert && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <FileText className="h-3 w-3" />
                              Medical certificate
                            </div>
                          )}
                        </div>

                        {request.status === "pending" && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 rounded-full"
                              onClick={() => handleReject(request.id)}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 h-8 rounded-full"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No leave requests found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

function LeaveRequestDetail({
  request,
  onBack,
  onApprove,
  onReject,
}: {
  request: any
  onBack: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="mb-2" onClick={onBack}>
        ← Back to requests
      </Button>

      <Card className="rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={`/placeholder.svg?height=48&width=48&text=${request.employeeName.charAt(0)}`}
                alt={request.employeeName}
              />
              <AvatarFallback>
                {request.employeeName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{request.employeeName}</h2>
              <p className="text-sm text-gray-500">{request.employeeId}</p>
            </div>
            <Badge
              className={`
                ml-auto rounded-full text-xs font-normal px-2 py-0.5
                ${
                  request.status === "approved"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : request.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              `}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Leave Type</span>
              <span className="text-sm font-medium">{request.type}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Date Range</span>
              <span className="text-sm font-medium">
                {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Duration</span>
              <span className="text-sm font-medium">
                {request.days} day{request.days !== 1 && "s"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Applied On</span>
              <span className="text-sm font-medium">{format(new Date(request.appliedOn), "MMM dd, yyyy")}</span>
            </div>
            <div className="py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Reason</span>
              <p className="text-sm mt-1">{request.reason}</p>
            </div>
            {request.hasMedicalCert && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Medical Certificate</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-500 p-0">
                  <FileText className="h-3 w-3 mr-1" />
                  View Certificate
                </Button>
              </div>
            )}
          </div>

          {request.status === "pending" && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => onReject(request.id)}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => onApprove(request.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

