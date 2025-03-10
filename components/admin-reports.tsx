"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon, Download, FileSpreadsheet, Filter, Printer, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { locationColors } from "@/config/colors"

// Mock attendance data
const mockAttendanceData = [
  {
    id: 1,
    employeeId: "EMP001",
    name: "John Doe",
    department: "Engineering",
    date: "2025-03-01",
    clockIn: "09:05",
    clockOut: "17:12",
    totalHours: "8:07",
    location: "Main Office",
    locationColorIndex: 0,
    status: "Present",
  },
  {
    id: 2,
    employeeId: "EMP001",
    name: "John Doe",
    department: "Engineering",
    date: "2025-03-02",
    clockIn: "-",
    clockOut: "-",
    totalHours: "-",
    location: "-",
    locationColorIndex: 0,
    status: "Weekend",
  },
  {
    id: 3,
    employeeId: "EMP001",
    name: "John Doe",
    department: "Engineering",
    date: "2025-03-03",
    clockIn: "08:58",
    clockOut: "17:30",
    totalHours: "8:32",
    location: "Main Office",
    locationColorIndex: 0,
    status: "Present",
  },
  {
    id: 4,
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    date: "2025-03-01",
    clockIn: "09:02",
    clockOut: "17:15",
    totalHours: "8:13",
    location: "Branch Office",
    locationColorIndex: 1,
    status: "Present",
  },
  {
    id: 5,
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    date: "2025-03-02",
    clockIn: "-",
    clockOut: "-",
    totalHours: "-",
    location: "-",
    locationColorIndex: 1,
    status: "Weekend",
  },
  {
    id: 6,
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    date: "2025-03-03",
    clockIn: "-",
    clockOut: "-",
    totalHours: "-",
    location: "-",
    locationColorIndex: 1,
    status: "Leave",
  },
  {
    id: 7,
    employeeId: "EMP003",
    name: "Mike Johnson",
    department: "HR",
    date: "2025-03-01",
    clockIn: "08:45",
    clockOut: "16:50",
    totalHours: "8:05",
    location: "Remote Office",
    locationColorIndex: 2,
    status: "Present",
  },
  {
    id: 8,
    employeeId: "EMP003",
    name: "Mike Johnson",
    department: "HR",
    date: "2025-03-02",
    clockIn: "-",
    clockOut: "-",
    totalHours: "-",
    location: "-",
    locationColorIndex: 2,
    status: "Weekend",
  },
  {
    id: 9,
    employeeId: "EMP003",
    name: "Mike Johnson",
    department: "HR",
    date: "2025-03-03",
    clockIn: "09:10",
    clockOut: "17:05",
    totalHours: "7:55",
    location: "Remote Office",
    locationColorIndex: 2,
    status: "Present",
  },
]

// Mock summary data
const mockSummaryData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Engineering",
    totalDays: 31,
    presentDays: 22,
    absentDays: 0,
    leaveDays: 1,
    weekendDays: 8,
    totalHours: "176:24",
    avgHoursPerDay: "8:01",
  },
  {
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    totalDays: 31,
    presentDays: 20,
    absentDays: 1,
    leaveDays: 2,
    weekendDays: 8,
    totalHours: "160:45",
    avgHoursPerDay: "8:02",
  },
  {
    employeeId: "EMP003",
    name: "Mike Johnson",
    department: "HR",
    totalDays: 31,
    presentDays: 21,
    absentDays: 0,
    leaveDays: 2,
    weekendDays: 8,
    totalHours: "168:30",
    avgHoursPerDay: "8:01",
  },
]

export default function AdminReports() {
  const { toast } = useToast()
  const [reportType, setReportType] = useState("monthly")
  const [month, setMonth] = useState<Date | undefined>(new Date())
  const [employee, setEmployee] = useState("all")
  const [department, setDepartment] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewType, setViewType] = useState("summary") // summary or detailed

  // Filter data based on selections
  const filteredData = mockAttendanceData.filter((record) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !record.name.toLowerCase().includes(query) &&
        !record.employeeId.toLowerCase().includes(query) &&
        !record.department.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    if (employee !== "all" && record.employeeId !== employee) {
      return false
    }

    if (department !== "all" && record.department !== department) {
      return false
    }

    return true
  })

  const exportToExcel = () => {
    // In a real app, this would generate an Excel file
    // For this demo, we'll just show a toast
    toast({
      title: "Report exported",
      description: `${reportType === "monthly" ? "Monthly" : "Custom"} attendance report has been exported to Excel.`,
    })
  }

  const printReport = () => {
    toast({
      title: "Printing report",
      description: "Sending report to printer...",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Attendance Reports</h2>
      </div>

      <Card className="rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="report-type" className="text-sm">
                Report Type
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type" className="rounded-lg h-9">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month-select" className="text-sm">
                Month
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="month-select"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-lg h-9",
                      !month && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {month ? format(month, "MMMM yyyy") : "Select month"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={month}
                    onSelect={setMonth}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-select" className="text-sm">
                Employee
              </Label>
              <Select value={employee} onValueChange={setEmployee}>
                <SelectTrigger id="employee-select" className="rounded-lg h-9">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  <SelectItem value="EMP001">John Doe (EMP001)</SelectItem>
                  <SelectItem value="EMP002">Jane Smith (EMP002)</SelectItem>
                  <SelectItem value="EMP003">Mike Johnson (EMP003)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-select" className="text-sm">
                Department
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department-select" className="rounded-lg h-9">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 rounded-full h-9 bg-gray-100 border-0"
              />
              <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-7 w-7 p-0 rounded-full">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`h-9 rounded-lg ${viewType === "summary" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewType("summary")}
            >
              Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-9 rounded-lg ${viewType === "detailed" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => setViewType("detailed")}
            >
              Detailed
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewType === "summary" ? (
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                Monthly Summary - {month ? format(month, "MMMM yyyy") : "Current Month"}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={printReport}>
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={exportToExcel}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                  Export Excel
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Employee ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs text-center">Total Days</TableHead>
                    <TableHead className="text-xs text-center">Present</TableHead>
                    <TableHead className="text-xs text-center">Absent</TableHead>
                    <TableHead className="text-xs text-center">Leave</TableHead>
                    <TableHead className="text-xs text-center">Weekend</TableHead>
                    <TableHead className="text-xs text-right">Total Hours</TableHead>
                    <TableHead className="text-xs text-right">Avg Hours/Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSummaryData.map((record) => (
                    <TableRow key={record.employeeId}>
                      <TableCell className="text-xs font-medium">{record.employeeId}</TableCell>
                      <TableCell className="text-xs">{record.name}</TableCell>
                      <TableCell className="text-xs">{record.department}</TableCell>
                      <TableCell className="text-xs text-center">{record.totalDays}</TableCell>
                      <TableCell className="text-xs text-center">{record.presentDays}</TableCell>
                      <TableCell className="text-xs text-center">{record.absentDays}</TableCell>
                      <TableCell className="text-xs text-center">{record.leaveDays}</TableCell>
                      <TableCell className="text-xs text-center">{record.weekendDays}</TableCell>
                      <TableCell className="text-xs text-right">{record.totalHours}</TableCell>
                      <TableCell className="text-xs text-right">{record.avgHoursPerDay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                Detailed Attendance - {month ? format(month, "MMMM yyyy") : "Current Month"}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={printReport}>
                  <Printer className="h-3.5 w-3.5 mr-1" />
                  Print
                </Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={exportToExcel}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => {
                    // In a real app, this would trigger a download
                    toast({
                      title: "Downloading Excel file",
                      description: "Monthly_Attendance_Report_March_2025.xlsx",
                    })
                  }}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Employee ID</TableHead>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Clock In</TableHead>
                    <TableHead className="text-xs">Clock Out</TableHead>
                    <TableHead className="text-xs">Hours</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs">{format(new Date(record.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="text-xs font-medium">{record.employeeId}</TableCell>
                      <TableCell className="text-xs">{record.name}</TableCell>
                      <TableCell className="text-xs">{record.department}</TableCell>
                      <TableCell className="text-xs">{record.clockIn}</TableCell>
                      <TableCell className="text-xs">{record.clockOut}</TableCell>
                      <TableCell className="text-xs">{record.totalHours}</TableCell>
                      <TableCell className="text-xs">
                        {record.location !== "-" ? (
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${locationColors[record.locationColorIndex].bg}`}
                            ></div>
                            <span>{record.location}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-xs",
                            record.status === "Present"
                              ? "bg-green-100 text-green-800"
                              : record.status === "Absent"
                                ? "bg-red-100 text-red-800"
                                : record.status === "Leave"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800",
                          )}
                        >
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

