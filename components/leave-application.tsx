"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, Paperclip, ChevronRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, differenceInBusinessDays } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

// Mock leave applications data
const mockLeaveApplications = [
  {
    id: "LEA-001",
    type: "Annual Leave",
    startDate: "2025-03-15",
    endDate: "2025-03-18",
    days: 2,
    reason: "Family vacation",
    status: "Approved",
    appliedOn: "2025-02-28",
    hasMedicalCert: false,
  },
  {
    id: "LEA-002",
    type: "Sick Leave",
    startDate: "2025-02-10",
    endDate: "2025-02-11",
    days: 2,
    reason: "Fever and cold",
    status: "Approved",
    appliedOn: "2025-02-10",
    hasMedicalCert: true,
  },
  {
    id: "LEA-003",
    type: "Personal Leave",
    startDate: "2025-01-05",
    endDate: "2025-01-05",
    days: 1,
    reason: "Personal appointment",
    status: "Rejected",
    appliedOn: "2025-01-02",
    hasMedicalCert: false,
  },
]

export default function LeaveApplication() {
  const { toast } = useToast()
  const [leaveType, setLeaveType] = useState("")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medicalCertificate, setMedicalCertificate] = useState<File | null>(null)

  const handleSubmit = () => {
    if (!leaveType || !dateRange.from || !dateRange.to) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Leave application submitted",
        description: "Your leave request has been submitted for approval.",
      })

      // Reset form
      setLeaveType("")
      setDateRange({ from: undefined, to: undefined })
      setReason("")
      setMedicalCertificate(null)
      setIsSubmitting(false)
    }, 1500)
  }

  const calculateBusinessDays = () => {
    if (dateRange.from && dateRange.to) {
      return differenceInBusinessDays(dateRange.to, dateRange.from) + 1
    }
    return 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMedicalCertificate(e.target.files[0])
    }
  }

  return (
    <Tabs defaultValue="apply" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 rounded-full h-10 p-1">
        <TabsTrigger value="apply" className="rounded-full text-xs">
          Apply for Leave
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-full text-xs">
          Leave History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="apply" className="space-y-4">
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-medium">Leave Application</h2>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="leave-type" className="text-sm">
                  Leave Type
                </Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger id="leave-type" className="rounded-lg h-10">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="hospitalization">Hospitalization Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-lg h-10",
                        !dateRange.from && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
  initialFocus
  mode="range"
  defaultMonth={dateRange.from}
  selected={dateRange}
  onSelect={(range) =>
    setDateRange({
      from: range?.from ?? undefined,
      to: range?.to ?? undefined,
    })
  }
  numberOfMonths={1}
  disabled={(date) => date < new Date()}
/>
                  </PopoverContent>
                </Popover>

                {dateRange.from && dateRange.to && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {calculateBusinessDays()} business day{calculateBusinessDays() !== 1 && "s"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm">
                  Reason for Leave (Optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Optional details about your leave request"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="rounded-lg resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical-certificate" className="text-sm">
                  Medical Certificate
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="medical-certificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("medical-certificate")?.click()}
                    className="w-full justify-start rounded-lg h-10 text-gray-500"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    {medicalCertificate ? medicalCertificate.name : "Upload certificate (optional)"}
                  </Button>
                </div>
                {medicalCertificate && (
                  <p className="text-xs text-green-600">Certificate uploaded: {medicalCertificate.name}</p>
                )}
                <p className="text-xs text-gray-500">For sick leave, please upload your medical certificate</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-full h-10">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-full h-10">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <h2 className="text-lg font-medium">Leave History</h2>

        <div className="space-y-3">
          {mockLeaveApplications.map((leave) => (
            <Card key={leave.id} className="rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{leave.type}</span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800",
                        )}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      <span className="mx-1">•</span>
                      {leave.days} day{leave.days !== 1 && "s"}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <div className="mt-2 text-sm text-gray-600 line-clamp-1">{leave.reason}</div>

                {leave.hasMedicalCert && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                    <FileText className="h-3 w-3" />
                    Medical certificate attached
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Applied on {format(new Date(leave.appliedOn), "MMM dd, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

