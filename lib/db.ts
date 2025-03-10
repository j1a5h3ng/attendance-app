// IndexedDB wrapper for better offline support
export interface DBConfig {
  name: string
  version: number
  stores: {
    [key: string]: string | null
  }
}

export class IndexedDB {
  private database: IDBDatabase | null = null
  private dbConfig: DBConfig

  constructor(config: DBConfig) {
    this.dbConfig = config
  }

  // Initialize the database
  public async init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbConfig.name, this.dbConfig.version)

      request.onerror = () => {
        console.error("Error opening IndexedDB")
        reject(false)
      }

      request.onsuccess = (event) => {
        this.database = (event.target as IDBOpenDBRequest).result
        resolve(true)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores based on config
        for (const storeName in this.dbConfig.stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            const keyPath = this.dbConfig.stores[storeName]
            db.createObjectStore(storeName, keyPath ? { keyPath } : { autoIncrement: true })
          }
        }
      }
    })
  }

  // Add an item to a store
  public async add<T>(storeName: string, item: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.database.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add(item)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Get all items from a store
  public async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.database.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result as T[])
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Get an item by key
  public async getByKey<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.database.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result as T)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Update an item
  public async update<T>(storeName: string, item: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.database.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Delete an item
  public async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.database.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // Clear all items from a store
  public async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.database) {
        reject(new Error("Database not initialized"))
        return
      }

      const transaction = this.database.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })
  }
}

// Create and export a database instance
export const attendanceDB = new IndexedDB({
  name: "attendance-app-db",
  version: 1,
  stores: {
    attendanceRecords: "id",
    offlineActions: "id",
    userSettings: "userId",
    notifications: "id",
  },
})

