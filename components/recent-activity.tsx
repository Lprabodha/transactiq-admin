"use client"

import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "webhook",
    title: "Webhook event received",
    description: "Transaction ID: 8a7b6c5d",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "alert",
    title: "High risk transaction detected",
    description: "Risk score: 85/100",
    timestamp: "15 minutes ago",
    status: "warning",
  },
  {
    id: 3,
    type: "prediction",
    title: "Chargeback predicted",
    description: "Transaction ID: 4e5f6g7h",
    timestamp: "1 hour ago",
    status: "error",
  },
  {
    id: 4,
    type: "webhook",
    title: "Webhook event received",
    description: "Transaction ID: 1a2b3c4d",
    timestamp: "2 hours ago",
    status: "success",
  },
  {
    id: 5,
    type: "alert",
    title: "Medium risk transaction",
    description: "Risk score: 65/100",
    timestamp: "3 hours ago",
    status: "warning",
  },
]

export function RecentActivity() {
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
