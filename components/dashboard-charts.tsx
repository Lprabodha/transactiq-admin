"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"
import { ApiService } from "@/lib/api-service"

interface FraudTrendData {
  date: string
  fraudRate: number
}

interface RiskByGatewayData {
  gateway: string
  lowRisk: number
  mediumRisk: number
  highRisk: number
}

interface ChargebackPredictionData {
  name: string
  value: number
}

const CHART_COLORS = {
  primary: "#10b981",
  secondary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  light: "#6ee7b7",
  muted: "#6b7280",
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#06b6d4"]

export function FraudTrend() {
  const [fraudTrendData, setFraudTrendData] = useState<FraudTrendData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFraudTrendData() {
      try {
        const response = await ApiService.getTransactions({ limit: 100, stats: true })

        if (response.success && response.data) {
          const last30Days = Array.from({ length: 14 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (13 - i))
            return date.toISOString().split("T")[0]
          })

          const trendData = last30Days.map((date) => {
            const dayTransactions = response.data?.filter((t) => t.created_at.startsWith(date)) || []

            const fraudCount = dayTransactions.filter((t) => t.risk_score > 70).length
            const fraudRate = dayTransactions.length > 0 ? (fraudCount / dayTransactions.length) * 100 : 0

            return {
              date,
              fraudRate: Number(fraudRate.toFixed(1)),
            }
          })

          setFraudTrendData(trendData)
        } else {
          setFraudTrendData([])
        }
      } catch (error) {
        console.error("[v0] Error fetching fraud trend data:", error)
        setFraudTrendData([])
      } finally {
        setLoading(false)
      }
    }

    fetchFraudTrendData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading fraud trend data...</p>
      </div>
    )
  }

  if (fraudTrendData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No fraud trend data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={fraudTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFraudRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
            stroke="#6b7280"
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} dx={-10} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                          Fraud Rate:
                        </span>
                        <span className="font-medium">{payload[0].value}%</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="fraudRate"
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorFraudRate)"
            dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: CHART_COLORS.primary, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RiskByGateway() {
  const [riskByGatewayData, setRiskByGatewayData] = useState<RiskByGatewayData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRiskByGatewayData() {
      try {
        const response = await ApiService.getTransactions({ limit: 1000 })

        if (response.success && response.data) {
          const gatewayStats = response.data.reduce((acc: any, transaction) => {
            const gateway = transaction.gateway
            if (!acc[gateway]) {
              acc[gateway] = { lowRisk: 0, mediumRisk: 0, highRisk: 0, total: 0 }
            }

            acc[gateway].total++
            if (transaction.risk_score < 30) {
              acc[gateway].lowRisk++
            } else if (transaction.risk_score < 70) {
              acc[gateway].mediumRisk++
            } else {
              acc[gateway].highRisk++
            }

            return acc
          }, {})

          const chartData = Object.entries(gatewayStats).map(([gateway, stats]: [string, any]) => ({
            gateway,
            lowRisk: Math.round((stats.lowRisk / stats.total) * 100),
            mediumRisk: Math.round((stats.mediumRisk / stats.total) * 100),
            highRisk: Math.round((stats.highRisk / stats.total) * 100),
          }))

          setRiskByGatewayData(chartData)
        } else {
          setRiskByGatewayData([])
        }
      } catch (error) {
        console.error("[v0] Error fetching risk by gateway data:", error)
        setRiskByGatewayData([])
      } finally {
        setLoading(false)
      }
    }

    fetchRiskByGatewayData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading gateway risk data...</p>
      </div>
    )
  }

  if (riskByGatewayData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No gateway risk data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={riskByGatewayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
          <XAxis dataKey="gateway" stroke="#6b7280" axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{payload[0].payload.gateway}</p>
                    <div className="mt-2 grid gap-1">
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  entry.name === "lowRisk"
                                    ? CHART_COLORS.success
                                    : entry.name === "mediumRisk"
                                      ? CHART_COLORS.warning
                                      : CHART_COLORS.danger,
                              }}
                            />
                            {entry.name === "lowRisk"
                              ? "Low Risk"
                              : entry.name === "mediumRisk"
                                ? "Medium Risk"
                                : "High Risk"}
                            :
                          </span>
                          <span className="font-medium">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            formatter={(value) => {
              return value === "lowRisk" ? "Low Risk" : value === "mediumRisk" ? "Medium Risk" : "High Risk"
            }}
          />
          <Bar
            dataKey="lowRisk"
            stackId="a"
            fill={CHART_COLORS.success}
            radius={[4, 4, 0, 0]}
            barSize={40}
            name="lowRisk"
          />
          <Bar dataKey="mediumRisk" stackId="a" fill={CHART_COLORS.warning} name="mediumRisk" />
          <Bar dataKey="highRisk" stackId="a" fill={CHART_COLORS.danger} name="highRisk" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChargebackPrediction() {
  const [chargebackPredictionData, setChargebackPredictionData] = useState<ChargebackPredictionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChargebackPredictionData() {
      try {
        const response = await ApiService.getTransactions({ limit: 1000 })

        if (response.success && response.data) {
          const paymentMethodStats = response.data.reduce((acc: any, transaction) => {
            const method =
              transaction.payment_method === "card"
                ? transaction.funding_type === "credit"
                  ? "Credit Card"
                  : "Debit Card"
                : "Digital Wallet"

            if (!acc[method]) {
              acc[method] = 0
            }
            acc[method]++
            return acc
          }, {})

          const total = Object.values(paymentMethodStats).reduce((sum: number, count: any) => sum + count, 0)
          const chartData = Object.entries(paymentMethodStats).map(([name, count]: [string, any]) => ({
            name,
            value: Math.round((count / total) * 100),
          }))

          setChargebackPredictionData(chartData)
        } else {
          setChargebackPredictionData([])
        }
      } catch (error) {
        console.error("[v0] Error fetching chargeback prediction data:", error)
        setChargebackPredictionData([])
      } finally {
        setLoading(false)
      }
    }

    fetchChargebackPredictionData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading chargeback prediction data...</p>
      </div>
    )
  }

  if (chargebackPredictionData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No chargeback prediction data available</p>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chargebackPredictionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            paddingAngle={5}
          >
            {chargebackPredictionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[payload[0].payload.index % PIE_COLORS.length] }}
                      />
                      <span className="font-medium">{payload[0].name}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground">Percentage: </span>
                      <span className="font-medium">{payload[0].value}%</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend formatter={(value, entry) => <span className="text-sm">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
