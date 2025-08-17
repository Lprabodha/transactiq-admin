"use client"

import { useState, useEffect } from "react"

export function ModelPerformanceMetrics() {
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  const metrics = [
    { name: "Accuracy", value: 0.948, description: "Overall correctness of predictions", change: +0.012 },
    {
      name: "Precision",
      value: 0.925,
      description: "Ratio of true positives to all positive predictions",
      change: +0.008,
    },
    { name: "Recall", value: 0.912, description: "Ratio of true positives to all actual positives", change: -0.003 },
    { name: "F1 Score", value: 0.918, description: "Harmonic mean of precision and recall", change: +0.005 },
    { name: "AUC-ROC", value: 0.962, description: "Area under the ROC curve", change: +0.015 },
  ]

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return "↗"
    if (change < 0) return "↘"
    return "→"
  }

  return (
    <div className="space-y-6">
      {metrics.map((metric) => (
        <div key={metric.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{metric.name}</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold">{metric.value.toFixed(3)}</span>
              <span className={`text-xs ${getChangeColor(metric.change)}`}>
                {getChangeIcon(metric.change)} {Math.abs(metric.change).toFixed(3)}
              </span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
              style={{ width: `${metric.value * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </div>
      ))}

      <div className="mt-6 pt-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">
            Model Status: <span className="text-green-600">Active</span>
          </p>
          <p>Last Updated: {currentDate}</p>
          <p>Training Data: 1.2M transactions</p>
        </div>
      </div>
    </div>
  )
}
