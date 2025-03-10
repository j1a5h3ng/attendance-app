import { Suspense } from "react"
import AdminDashboard from "@/components/admin-dashboard"
import PWAInstaller from "@/components/pwa-installer"

export default function Admin() {
  return (
    <Suspense fallback={<div className="p-4">Loading admin dashboard...</div>}>
      <AdminDashboard />
      <PWAInstaller />
    </Suspense>
  )
}

