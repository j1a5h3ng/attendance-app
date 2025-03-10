"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin } from "lucide-react"

// Mock employees data
const mockEmployees = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    employeeId: "EMP001",
    department: "Engineering",
    position: "Software Developer",
    status: "present",
    clockInTime: "09:05 AM",
    location: "Main Office",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    employeeId: "EMP002",
    department: "Marketing",
    position: "Marketing Specialist",
    status: "present",
    clockInTime: "09:02 AM",
    location: "Main Office",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    employeeId: "EMP003",
    department: "HR",
    position: "HR Manager",
    status: "leave",
    clockInTime: "-",
    location: "-",
  },
  {
    id: 4,
    name: "Sarah Lee",
    email: "sarah@example.com",
    employeeId: "EMP004",
    department: "Finance",
    position: "Accountant",
    status: "present",
    clockInTime: "08:55 AM",
    location: "Branch Office",
  },
  {
    id: 5,
    name: "Tom Wilson",
    email: "tom@example.com",
    employeeId: "EMP005",
    department: "Engineering",
    position: "QA Engineer",
    status: "present",
    clockInTime: "08:45 AM",
    location: "Main Office",
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily@example.com",
    employeeId: "EMP006",
    department: "Sales",
    position: "Sales Representative",
    status: "absent",
    clockInTime: "-",
    location: "-",
  },
]

export default function AdminEmployees() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)

  const filteredEmployees = mockEmployees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Employees</h2>
        <Button variant="outline" size="sm" className="h-8 rounded-full">
          + Add New
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 rounded-full h-10 bg-gray-100 border-0"
        />
        <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full">
          <Filter className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {selectedEmployee ? (
        <EmployeeDetail employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${employee.name.charAt(0)}`}
                      alt={employee.name}
                    />
                    <AvatarFallback>
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{employee.name}</p>
                      <Badge
                        className={`
                          rounded-full text-xs font-normal px-2 py-0.5
                          ${
                            employee.status === "present"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : employee.status === "leave"
                                ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        `}
                      >
                        {employee.status === "present"
                          ? "Present"
                          : employee.status === "leave"
                            ? "On Leave"
                            : "Absent"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {employee.employeeId} • {employee.department}
                      </p>
                      <button className="text-blue-500 text-xs" onClick={() => setSelectedEmployee(employee)}>
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {employee.status === "present" && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {employee.location}
                    </div>
                    <div className="text-xs text-gray-500">Clocked in: {employee.clockInTime}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function EmployeeDetail({ employee, onBack }: { employee: any; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="mb-2" onClick={onBack}>
        ← Back to employees
      </Button>

      <Card className="rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center mb-4">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage
                src={`/placeholder.svg?height=80&width=80&text=${employee.name.charAt(0)}`}
                alt={employee.name}
              />
              <AvatarFallback>
                {employee.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{employee.name}</h2>
            <p className="text-sm text-gray-500">{employee.position}</p>
            <Badge
              className={`
                mt-2 rounded-full text-xs font-normal px-2 py-0.5
                ${
                  employee.status === "present"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : employee.status === "leave"
                      ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              `}
            >
              {employee.status === "present" ? "Present" : employee.status === "leave" ? "On Leave" : "Absent"}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Employee ID</span>
              <span className="text-sm font-medium">{employee.employeeId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Department</span>
              <span className="text-sm font-medium">{employee.department}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium">{employee.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Today's Status</span>
              <span className="text-sm font-medium">
                {employee.status === "present"
                  ? `Clocked in at ${employee.clockInTime}`
                  : employee.status === "leave"
                    ? "On Leave"
                    : "Absent"}
              </span>
            </div>
            {employee.status === "present" && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-medium">{employee.location}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 rounded-full">
              Attendance History
            </Button>
            <Button variant="outline" className="flex-1 rounded-full">
              Leave Records
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

