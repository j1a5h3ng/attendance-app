"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Lock, User } from "lucide-react"

// Mock user data
const mockUsers = [
  { id: 1, email: "john@example.com", password: "password", name: "John Doe", role: "employee", employeeId: "EMP001" },
  {
    id: 2,
    email: "jane@example.com",
    password: "password",
    name: "Jane Smith",
    role: "employee",
    employeeId: "EMP002",
  },
  { id: 3, email: "admin@example.com", password: "admin123", name: "Admin User", role: "admin", employeeId: "ADM001" },
]

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find((u) => u.email === email && u.password === password)

      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        })

        // Store user info in localStorage (in a real app, use a more secure method)
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              employeeId: user.employeeId,
            }),
          )
        }

        // Redirect based on role
        if (user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }, 1000)
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

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/High%20Res%20LongPun%20Logo-ThhT8I9djmND2kifl4PiFS80tYZD7V.png"
                alt="LongPun Logo"
                className="w-24 h-24 mb-2"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Attendance App</h1>
              <p className="text-sm text-gray-500">Sign in to track your attendance and manage leave requests</p>
            </div>
          </div>

          <Card className="rounded-xl overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
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
              </div>

              <Button onClick={handleLogin} disabled={isLoading} className="w-full rounded-full h-11">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-xs text-gray-500">
                <p>Demo accounts:</p>
                <p>Employee: john@example.com / password</p>
                <p>Admin: admin@example.com / admin123</p>
                <p className="mt-2">
                  Don't have an account?{" "}
                  <Link href="/register" className="text-blue-500">
                    Register here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

