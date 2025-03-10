// Simple analytics tracking
export interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  timestamp: number
}

export interface PageView {
  path: string
  title: string
  referrer: string
  timestamp: number
}

export class Analytics {
  private events: AnalyticsEvent[] = []
  private pageViews: PageView[] = []
  private userId: string | null = null
  private sessionId: string
  private initialized = false
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.sessionId = this.generateId()
  }

  // Initialize analytics
  public init(userId?: string): void {
    if (this.initialized) return

    if (userId) {
      this.userId = userId
    }

    // Set up event listeners
    if (typeof window !== "undefined") {
      // Track page views
      this.trackPageView()

      // Set up flush interval (send data every 5 minutes)
      this.flushInterval = setInterval(
        () => {
          this.flush()
        },
        5 * 60 * 1000,
      )
    }

    this.initialized = true
  }

  // Track an event
  public trackEvent(category: string, action: string, label?: string, value?: number): void {
    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
    }

    this.events.push(event)

    // If we have more than 20 events, flush them
    if (this.events.length >= 20) {
      this.flush()
    }

    // Log the event in development
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics event:", event)
    }
  }

  // Track a page view
  public trackPageView(path?: string, title?: string): void {
    if (typeof window === "undefined") return

    const pageView: PageView = {
      path: path || window.location.pathname,
      title: title || document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    }

    this.pageViews.push(pageView)

    // Log the page view in development
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics page view:", pageView)
    }
  }

  // Flush events and page views to the server
  public async flush(): Promise<void> {
    if (this.events.length === 0 && this.pageViews.length === 0) {
      return
    }

    // In a real app, you would send this data to your analytics server
    const data = {
      userId: this.userId,
      sessionId: this.sessionId,
      events: [...this.events],
      pageViews: [...this.pageViews],
    }

    // Clear the arrays
    this.events = []
    this.pageViews = []

    // In a real app, you would send this data to your server
    // For this demo, we'll just log it
    if (process.env.NODE_ENV === "development") {
      console.log("Analytics data flushed:", data)
    }

    // In a real implementation, you would do something like:
    /*
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      // If the request fails, add the events back to the queue
      this.events.push(...data.events);
      this.pageViews.push(...data.pageViews);
    }
    */
  }

  // Clean up
  public dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }

    // Flush any remaining events
    this.flush()
  }

  // Set user ID
  public setUserId(userId: string): void {
    this.userId = userId
  }

  // Generate a random ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}

// Create and export an instance
export const analytics = new Analytics()

