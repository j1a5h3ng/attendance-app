"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Mock attendance data
const mockAttendanceData = [
  {
    date: "2025-03-06",
    clockIn: "09:05 AM",
    clockOut: "05:12 PM",
    totalHours: "8h 7m",
    status: "Present",
  },
  {
    date: "2025-03-05",
    clockIn: "08:58 AM",
    clockOut: "05:30 PM",
    totalHours: "8h 32m",
    status: "Present",
  },
  {
    date: "2025-03-04",
    clockIn: "09:10 AM",
    clockOut: "05:15 PM",
    totalHours: "8h 5m",
    status: "Present",
  },
  {
    date: "2025-03-03",
    clockIn: "09:02 AM",
    clockOut: "04:45 PM",
    totalHours: "7h 43m",
    status: "Present",
  },
  {
    date: "2025-03-02",
    clockIn: "-",
    clockOut: "-",
    totalHours: "-",
    status: "Weekend",
  },
  {
    date: "2025-03-01",
    clockIn: "-",
    clockOut: "-",
    totalHours: "-",
    status: "Weekend",
  },
]

export default function AttendanceHistory() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Attendance History</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 rounded-full flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                {date ? format(date, "MMM yyyy") : "Select"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {mockAttendanceData.map((record, index) => (
          <Card key={index} className="rounded-xl overflow-hidden shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{format(new Date(record.date), "EEEE")}</span>
                  <span className="text-xs text-gray-500">{format(new Date(record.date), "MMM dd, yyyy")}</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    record.status === "Present"
                      ? "bg-green-100 text-green-800"
                      : record.status === "Weekend"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800",
                  )}
                >
                  {record.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-xs text-gray-500">Clock In</span>
                  <div className="text-sm font-medium">{record.clockIn}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-xs text-gray-500">Clock Out</span>
                  <div className="text-sm font-medium">{record.clockOut}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-xs text-gray-500">Hours</span>
                  <div className="text-sm font-medium">{record.totalHours}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4">
        <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">Page 1 of 4</span>
        <Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

