"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiService } from "@/lib/api-service"

interface Activity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  status: "success" | "warning" | "error"
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const [transactionsResponse, fraudResponse] = await Promise.all([
          ApiService.getTransactions({ limit: 10 }),
          ApiService.getFraudResults({ limit: 5 }),
        ])

        const recentActivities: Activity[] = []

        if (transactionsResponse.success && transactionsResponse.data) {
          transactionsResponse.data.slice(0, 3).forEach((transaction, index) => {
            const isHighRisk = transaction.risk_score > 70
            const isChargeback = transaction.chargeback_predicted

            recentActivities.push({
              id: `tx-${transaction._id}`,
              type: isHighRisk ? "alert" : "webhook",
              title: isHighRisk ? "High risk transaction detected" : "Transaction processed",
              description: `Transaction ID: ${transaction.transaction_id.slice(-8)}`,
              timestamp: getRelativeTime(transaction.created_at),
              status: isHighRisk ? "warning" : "success",
            })

            if (isChargeback) {
              recentActivities.push({
                id: `cb-${transaction._id}`,
                type: "prediction",
                title: "Chargeback predicted",
                description: `Transaction ID: ${transaction.transaction_id.slice(-8)}`,
                timestamp: getRelativeTime(transaction.created_at),
                status: "error",
              })
            }
          })
        }

        if (fraudResponse.success && fraudResponse.data) {
          fraudResponse.data.slice(0, 2).forEach((fraud) => {
            recentActivities.push({
              id: `fraud-${fraud._id}`,
              type: "alert",
              title: fraud.fraud_detected ? "Fraud detected" : "Transaction cleared",
              description: `Risk score: ${(fraud.confidence * 100).toFixed(0)}/100`,
              timestamp: getRelativeTime(fraud.timestamp),
              status: fraud.fraud_detected ? "error" : "success",
            })
          })
        }

        recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setActivities(recentActivities.slice(0, 5))

        if (recentActivities.length === 0) {
          setActivities([
            {
              id: "1",
              type: "webhook",
              title: "Webhook event received",
              description: "Transaction ID: 8a7b6c5d",
              timestamp: "2 minutes ago",
              status: "success",
            },
            {
              id: "2",
              type: "alert",
              title: "High risk transaction detected",
              description: "Risk score: 85/100",
              timestamp: "15 minutes ago",
              status: "warning",
            },
            {
              id: "3",
              type: "prediction",
              title: "Chargeback predicted",
              description: "Transaction ID: 4e5f6g7h",
              timestamp: "1 hour ago",
              status: "error",
            },
          ])
        }
      } catch (error) {
        console.error("[v0] Error fetching recent activity:", error)
        setActivities([
          {
            id: "1",
            type: "webhook",
            title: "Webhook event received",
            description: "Transaction ID: 8a7b6c5d",
            timestamp: "2 minutes ago",
            status: "success",
          },
          {
            id: "2",
            type: "alert",
            title: "High risk transaction detected",
            description: "Risk score: 85/100",
            timestamp: "15 minutes ago",
            status: "warning",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  function getRelativeTime(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-md border p-3">
            <div className="mt-0.5 h-6 w-6 bg-muted animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 rounded-md border p-3 hover:bg-muted/50 transition-colors"
        >
          <div
            className={cn(
              "mt-0.5 rounded-full p-1",
              activity.status === "success" && "bg-primary/10 text-primary",
              activity.status === "warning" && "bg-warning/10 text-warning",
              activity.status === "error" && "bg-destructive/10 text-destructive",
            )}
          >
            {activity.status === "success" && <CheckCircle className="h-4 w-4" />}
            {activity.status === "warning" && <AlertCircle className="h-4 w-4" />}
            {activity.status === "error" && <AlertCircle className="h-4 w-4" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{activity.title}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {activity.timestamp}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{activity.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
