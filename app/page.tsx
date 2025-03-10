"use client"

import { useEffect } from "react"
import LoginPage from "@/components/login-page"
import PWAInstaller from "@/components/pwa-installer"
import { registerServiceWorker } from "./register-sw"

export default function Home() {
  useEffect(() => {
    // Register service worker when the app loads
    registerServiceWorker()
  }, [])

  return (
    <>
      <LoginPage />
      <PWAInstaller />
    </>
  )
}

