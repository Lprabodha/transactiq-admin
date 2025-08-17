"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClientOnly } from "@/components/client-only"
import { NotificationProvider } from "@/components/notification-provider"
import { usePathname } from "next/navigation"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  const hideLayout = pathname === "/register" || pathname === "/login"

  if (hideLayout) {
    return <>{children}</>
  }

  const loadingFallback = (
    <div className="flex h-screen overflow-hidden" suppressHydrationWarning>
      <div className="flex flex-1 flex-col overflow-hidden" suppressHydrationWarning>
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6" suppressHydrationWarning>
          <div className="animate-pulse" suppressHydrationWarning>
            <div className="h-8 bg-muted rounded w-1/4 mb-4" suppressHydrationWarning></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2" suppressHydrationWarning></div>
            <div className="h-4 bg-muted rounded w-3/4" suppressHydrationWarning></div>
          </div>
        </main>
      </div>
    </div>
  )

  return (
    <ClientOnly fallback={loadingFallback}>
      <NotificationProvider>
        <div className="flex h-screen overflow-hidden" suppressHydrationWarning>
          <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div className="flex flex-1 flex-col overflow-hidden" suppressHydrationWarning>
            <DashboardHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6" suppressHydrationWarning>{children}</main>
          </div>
        </div>
      </NotificationProvider>
    </ClientOnly>
  )
}
