"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, FileText, Download, Eye } from "lucide-react"
import { format } from "date-fns"

// Mock medical certificates data
const mockCertificates = [
  {
    id: "MC-001",
    employeeId: "EMP003",
    employeeName: "Mike Johnson",
    filename: "medical_certificate_mar.pdf",
    uploadDate: "2025-03-09",
    issueDate: "2025-03-08",
    doctor: "Dr. Sarah Johnson",
    hospital: "City General Hospital",
    leaveId: "LEA-002",
    size: "1.2 MB",
  },
  {
    id: "MC-002",
    employeeId: "EMP002",
    employeeName: "Jane Smith",
    filename: "medical_report_feb.pdf",
    uploadDate: "2025-02-15",
    issueDate: "2025-02-14",
    doctor: "Dr. Michael Chen",
    hospital: "Westside Medical Center",
    leaveId: "LEA-004",
    size: "2.4 MB",
  },
  {
    id: "MC-003",
    employeeId: "EMP006",
    employeeName: "Emily Davis",
    filename: "doctor_note_feb.jpg",
    uploadDate: "2025-02-19",
    issueDate: "2025-02-19",
    doctor: "Dr. Emily Rodriguez",
    hospital: "Sunshine Health Clinic",
    leaveId: "LEA-005",
    size: "0.8 MB",
  },
]

export default function AdminMedicalCertificates() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)

  const filteredCertificates = mockCertificates.filter(
    (cert) =>
      cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.hospital.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Medical Certificates</h2>
        <Button variant="outline" size="sm" className="h-8 rounded-full">
          <Download className="h-3.5 w-3.5 mr-1" />
          Export
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search certificates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 rounded-full h-10 bg-gray-100 border-0"
        />
        <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-8 w-8 p-0 rounded-full">
          <Filter className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      {selectedCertificate ? (
        <CertificateDetail certificate={selectedCertificate} onBack={() => setSelectedCertificate(null)} />
      ) : (
        <div className="space-y-3">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{cert.filename}</p>
                      <span className="text-xs text-gray-500">{cert.size}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {cert.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-500">{cert.employeeName}</p>
                      </div>
                      <button className="text-blue-500 text-xs" onClick={() => setSelectedCertificate(cert)}>
                        View
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Issued: {format(new Date(cert.issueDate), "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-gray-500">
                    Uploaded: {format(new Date(cert.uploadDate), "MMM dd, yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CertificateDetail({ certificate, onBack }: { certificate: any; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="mb-2" onClick={onBack}>
        ← Back to certificates
      </Button>

      <Card className="rounded-xl overflow-hidden shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{certificate.filename}</h2>
              <p className="text-sm text-gray-500">{certificate.size}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Employee</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px]">
                    {certificate.employeeName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{certificate.employeeName}</span>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Employee ID</span>
              <span className="text-sm font-medium">{certificate.employeeId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Issue Date</span>
              <span className="text-sm font-medium">{format(new Date(certificate.issueDate), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Upload Date</span>
              <span className="text-sm font-medium">{format(new Date(certificate.uploadDate), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Doctor</span>
              <span className="text-sm font-medium">{certificate.doctor}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Hospital/Clinic</span>
              <span className="text-sm font-medium">{certificate.hospital}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Related Leave</span>
              <span className="text-sm font-medium text-blue-500">{certificate.leaveId}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1 rounded-full">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button className="flex-1 rounded-full">
              <Eye className="h-4 w-4 mr-2" />
              View Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

