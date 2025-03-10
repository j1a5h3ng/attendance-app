"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Download, Eye, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

// Mock medical certificates data
const mockCertificates = [
  {
    id: "MC-001",
    filename: "medical_certificate_feb.pdf",
    uploadDate: "2025-02-11",
    issueDate: "2025-02-10",
    doctor: "Dr. Sarah Johnson",
    hospital: "City General Hospital",
    leaveId: "LEA-002",
    size: "1.2 MB",
  },
  {
    id: "MC-002",
    filename: "medical_report_jan.pdf",
    uploadDate: "2025-01-15",
    issueDate: "2025-01-14",
    doctor: "Dr. Michael Chen",
    hospital: "Westside Medical Center",
    leaveId: "LEA-004",
    size: "2.4 MB",
  },
  {
    id: "MC-003",
    filename: "doctor_note_dec.jpg",
    uploadDate: "2024-12-05",
    issueDate: "2024-12-04",
    doctor: "Dr. Emily Rodriguez",
    hospital: "Sunshine Health Clinic",
    leaveId: "LEA-005",
    size: "0.8 MB",
  },
]

export default function MedicalCertificates() {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [certificate, setCertificate] = useState<File | null>(null)
  const [issueDate, setIssueDate] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificate(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!certificate || !issueDate) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Certificate uploaded",
        description: "Your medical certificate has been uploaded successfully.",
      })

      // Reset form
      setCertificate(null)
      setIssueDate("")
      setIsUploading(false)
    }, 1500)
  }

  return (
    <Tabs defaultValue="certificates" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 rounded-full h-10 p-1">
        <TabsTrigger value="certificates" className="rounded-full text-xs">
          My Certificates
        </TabsTrigger>
        <TabsTrigger value="upload" className="rounded-full text-xs">
          Upload New
        </TabsTrigger>
      </TabsList>

      <TabsContent value="certificates" className="space-y-4">
        <h2 className="text-lg font-medium">Medical Certificates</h2>

        <div className="space-y-3">
          {mockCertificates.map((cert) => (
            <Card key={cert.id} className="rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">{cert.filename}</h3>
                      <span className="text-xs text-gray-500">{cert.size}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Issued: {format(new Date(cert.issueDate), "MMM dd, yyyy")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cert.doctor} • {cert.hospital}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Uploaded on {format(new Date(cert.uploadDate), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="upload" className="space-y-4">
        <Card className="rounded-xl overflow-hidden shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-medium">Upload Medical Certificate</h2>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="certificate-file" className="text-sm">
                  Certificate File
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="certificate-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("certificate-file")?.click()}
                    className="w-full justify-start rounded-lg h-10 text-gray-500"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {certificate ? certificate.name : "Select file to upload"}
                  </Button>
                </div>
                {certificate && <p className="text-xs text-green-600">File selected: {certificate.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-date" className="text-sm">
                  Issue Date
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="issue-date"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="rounded-lg h-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-full h-10">
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading} className="flex-1 rounded-full h-10">
                {isUploading ? "Uploading..." : "Upload Certificate"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

