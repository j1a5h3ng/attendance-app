import { Suspense } from "react"
import DashboardPage from "@/components/dashboard-page"
import PWAInstaller from "@/components/pwa-installer"

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="p-4">Loading dashboard...</div>}>
      <DashboardPage />
      <PWAInstaller />
    </Suspense>
  )
}

