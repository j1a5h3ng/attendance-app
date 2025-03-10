import { attendanceDB } from "./db"
import { v4 as uuidv4 } from "uuid"

// Types for offline actions
export interface OfflineAction {
  id: string
  type: "clockIn" | "clockOut" | "leaveRequest" | "other"
  data: any
  timestamp: number
  synced: boolean
}

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  type: "clockIn" | "clockOut"
  timestamp: number
  location: {
    name: string
    lat?: number
    lng?: number
  }
  deviceInfo: {
    userAgent: string
    platform: string
  }
  synced: boolean
}

export class OfflineManager {
  private initialized = false

  // Initialize the database
  public async init(): Promise<void> {
    if (this.initialized) return

    try {
      await attendanceDB.init()
      this.initialized = true
      console.log("Offline manager initialized")

      // Register for sync events if service worker and sync are supported
      this.registerForSync()
    } catch (error) {
      console.error("Failed to initialize offline manager:", error)
    }
  }

  // Register for background sync
  private async registerForSync(): Promise<void> {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready
        // ✅ FIX: Tell TypeScript to ignore the "sync" type check
        await (registration as any).sync.register("sync-attendance")
        console.log("Background sync registered")
      } catch (error) {
        console.error("Background sync registration failed:", error)
      }
    } else {
      console.log("Background sync not supported")
    }
  }

  // Save attendance record for offline use
  public async saveAttendanceRecord(record: Omit<AttendanceRecord, "id" | "synced">): Promise<string> {
    await this.init()

    const fullRecord: AttendanceRecord = {
      ...record,
      id: uuidv4(),
      synced: false,
    }

    try {
      await attendanceDB.add("attendanceRecords", fullRecord)

      // Also add to offline actions for syncing
      const action: OfflineAction = {
        id: uuidv4(),
        type: record.type,
        data: fullRecord,
        timestamp: Date.now(),
        synced: false,
      }

      await attendanceDB.add("offlineActions", action)

      // Trigger sync if online
      if (navigator.onLine) {
        this.syncOfflineActions()
      }

      return fullRecord.id
    } catch (error) {
      console.error("Failed to save attendance record:", error)
      throw error
    }
  }

  // Get all pending offline actions
  public async getPendingActions(): Promise<OfflineAction[]> {
    await this.init()

    try {
      const allActions = await attendanceDB.getAll<OfflineAction>("offlineActions")
      return allActions.filter((action) => !action.synced)
    } catch (error) {
      console.error("Failed to get pending actions:", error)
      return []
    }
  }

  // Sync offline actions with the server
  public async syncOfflineActions(): Promise<boolean> {
    if (!navigator.onLine) return false

    await this.init()

    try {
      const pendingActions = await this.getPendingActions()

      if (pendingActions.length === 0) {
        return true
      }

      console.log(`Syncing ${pendingActions.length} offline actions`)

      // In a real app, you would send these to your server
      // For this demo, we'll just mark them as synced
      for (const action of pendingActions) {
        action.synced = true
        await attendanceDB.update("offlineActions", action)

        // Also update the attendance record
        if (action.type === "clockIn" || action.type === "clockOut") {
          const record = action.data as AttendanceRecord
          record.synced = true
          await attendanceDB.update("attendanceRecords", record)
        }
      }

      return true
    } catch (error) {
      console.error("Failed to sync offline actions:", error)
      return false
    }
  }

  // Get attendance records for a user
  public async getAttendanceRecords(userId: string): Promise<AttendanceRecord[]> {
    await this.init()

    try {
      const allRecords = await attendanceDB.getAll<AttendanceRecord>("attendanceRecords")
      return allRecords.filter((record) => record.userId === userId)
    } catch (error) {
      console.error("Failed to get attendance records:", error)
      return []
    }
  }
}

// Create and export an instance
export const offlineManager = new OfflineManager()
