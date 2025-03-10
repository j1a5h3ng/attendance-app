// Push notification manager
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
}

// ✅ CustomNotificationOptions extension for TS support
interface CustomNotificationOptions extends globalThis.NotificationOptions {
  actions?: {
    action: string
    title: string
    icon?: string
  }[]
}

export class NotificationManager {
  private initialized = false
  private permission: NotificationPermission = "default"

  // Initialize notifications
  public async init(): Promise<boolean> {
    if (this.initialized) return true

    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return false
    }

    this.permission = Notification.permission
    this.initialized = true

    // Set up service worker for push notifications
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        console.log("Service worker ready for push notifications")
      } catch (error) {
        console.error("Error setting up push notifications:", error)
      }
    }

    return true
  }

  // Request permission for notifications
  public async requestPermission(): Promise<boolean> {
    await this.init()

    if (this.permission === "granted") {
      return true
    }

    try {
      const result = await Notification.requestPermission()
      this.permission = result
      return result === "granted"
    } catch (error) {
      console.error("Error requesting notification permission:", error)
      return false
    }
  }

  // Check if notifications are supported and permitted
  public async areNotificationsEnabled(): Promise<boolean> {
    await this.init()
    return this.permission === "granted"
  }

  // Show a notification
  public async showNotification(options: NotificationOptions): Promise<boolean> {
    const isEnabled = await this.areNotificationsEnabled()
    if (!isEnabled) {
      console.log("Notifications are not enabled")
      return false
    }

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready
        const notificationOptions: CustomNotificationOptions = {
          body: options.body,
          icon: options.icon || "/icons/icon-192x192.png",
          badge: options.badge || "/icons/notification-badge.png",
          tag: options.tag,
          data: options.data,
          actions: options.actions,
          requireInteraction: true,
        }

        await registration.showNotification(options.title, notificationOptions)
      } else {
        // Fallback to regular notifications
        const notificationOptions: CustomNotificationOptions = {
          body: options.body,
          icon: options.icon || "/icons/icon-192x192.png",
          actions: options.actions,
          requireInteraction: true,
        }

        new Notification(options.title, notificationOptions)
      }

      return true
    } catch (error) {
      console.error("Error showing notification:", error)
      return false
    }
  }

  // Subscribe to push notifications
  public async subscribeToPush(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push notifications not supported")
      return null
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // In a real app, this would be your VAPID public key
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U",
        ),
      })

      // In a real app, you would send this subscription to your server
      console.log("Push subscription:", subscription)

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh") as ArrayBuffer),
          auth: this.arrayBufferToBase64(subscription.getKey("auth") as ArrayBuffer),
        },
      }
    } catch (error) {
      console.error("Error subscribing to push:", error)
      return null
    }
  }

  // Helper function to convert URL-safe base64 to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  // Helper function to convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer) as unknown as number[])
    return window.btoa(binary)
  }

  // Schedule a notification for later
  public async scheduleNotification(options: NotificationOptions, delayInMinutes: number): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
      console.log("Service workers not supported")
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready

      // In a real app, you would use a more robust scheduling mechanism
      setTimeout(() => {
        this.showNotification(options)
      }, delayInMinutes * 60 * 1000)

      return true
    } catch (error) {
      console.error("Error scheduling notification:", error)
      return false
    }
  }
}

// Create and export an instance
export const notificationManager = new NotificationManager()
