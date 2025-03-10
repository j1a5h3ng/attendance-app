"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Lock, User, Mail, Building, ArrowLeft, Camera } from "lucide-react"

export default function RegistrationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [companyCode, setCompanyCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selfieStep, setSelfieStep] = useState(false)
  const [selfieCapture, setSelfieCapture] = useState<string | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const handleRegister = () => {
    // Check for required fields
    if (!fullName || !email || !password || !confirmPassword || !employeeId || !companyCode) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      })
      return
    }

    // Move to selfie capture step
    setSelfieStep(true)
  }

  const startCamera = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        setCameraStream(stream)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera access failed",
        description: "Unable to access your camera. Please allow camera permissions and try again.",
        variant: "destructive",
      })
    }
  }

  const takeSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL("image/png")
        setSelfieCapture(dataUrl)

        // Stop camera stream
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }

  const submitRegistration = () => {
    if (!selfieCapture) {
      toast({
        title: "Selfie required",
        description: "Please take a selfie to complete registration.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Registration pending",
        description: "Your registration has been submitted and is pending admin approval.",
      })

      router.push("/")
    }, 1500)
  }

  const resetSelfie = () => {
    setSelfieCapture(null)
    startCamera()
  }

  // Start camera when entering selfie step
  if (selfieStep && !cameraStream && !selfieCapture && typeof window !== "undefined") {
    startCamera()
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

      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-semibold">{selfieStep ? "Take a Selfie" : "Create Account"}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {!selfieStep ? (
          <Card className="rounded-xl overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Please fill in your information to create an account. Your admin will need to approve your registration.
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 rounded-lg h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Work Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-lg h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-sm">
                    Employee ID
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="EMP12345"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="pl-10 rounded-lg h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyCode" className="text-sm">
                    Company Code
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyCode"
                      type="text"
                      placeholder="COMPANY123"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value)}
                      className="pl-10 rounded-lg h-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Ask your administrator for the company code</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg h-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-lg h-10"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleRegister} className="w-full rounded-full h-11 mt-2">
                Continue
              </Button>

              <p className="text-center text-xs text-gray-500">
                Already have an account?{" "}
                <Link href="/" className="text-blue-500">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="rounded-xl overflow-hidden shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Please take a clear selfie for identity verification. This will be used to prevent unauthorized
                    clock-ins.
                  </p>

                  <div className="relative mx-auto w-56 h-56 rounded-xl overflow-hidden border-2 border-blue-500 mb-4">
                    {!selfieCapture ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={selfieCapture || "/placeholder.svg"}
                        alt="Selfie"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {!selfieCapture ? (
                    <Button
                      onClick={takeSelfie}
                      className="rounded-full h-12 w-12 flex items-center justify-center p-0 mx-auto"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  ) : (
                    <div className="flex justify-center gap-3">
                      <Button variant="outline" onClick={resetSelfie} className="rounded-full px-4">
                        Retake
                      </Button>
                      <Button onClick={submitRegistration} disabled={isLoading} className="rounded-full px-6">
                        {isLoading ? "Submitting..." : "Submit Registration"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-500">
              <p>Your selfie will only be visible to your administrator for verification purposes.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

