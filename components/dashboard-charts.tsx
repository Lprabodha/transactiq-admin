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
  Line,
  LineChart,
} from "recharts"
import { ApiService } from "@/lib/api-service"

interface FraudTrendData {
  date: string
  fraudRate: number
  fraudCount: number
  totalCount: number
}

interface RiskByGatewayData {
  gateway: string
  lowRisk: number
  mediumRisk: number
  highRisk: number
  total: number
}

interface ChargebackPredictionData {
  name: string
  value: number
  count: number
}

interface TransactionVolumeData {
  date: string
  volume: number
  count: number
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFraudTrendData() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch transactions for the last 14 days
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Get the date range from the actual data
          const dates = response.data
            .map(t => t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : null)
            .filter(Boolean)
            .sort()
          
          if (dates.length > 0) {
            const earliestDate = new Date(dates[0])
            const latestDate = new Date(dates[dates.length - 1])
            const daysDiff = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24))
            
            // Use actual data range or last 14 days, whichever is smaller
            const daysToShow = Math.min(daysDiff + 1, 14)
            
            const lastDays = Array.from({ length: daysToShow }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (daysToShow - 1 - i))
              return date.toISOString().split("T")[0]
            })

            const trendData = lastDays.map((date) => {
              const dayTransactions = response.data.filter((t) => 
                t.created_at && t.created_at.startsWith(date)
              )

              const fraudCount = dayTransactions.filter((t) => 
                t.risk_score && t.risk_score > 70
              ).length
              
              const totalCount = dayTransactions.length
              const fraudRate = totalCount > 0 ? (fraudCount / totalCount) * 100 : 0

              return {
                date,
                fraudRate: Number(fraudRate.toFixed(1)),
                fraudCount,
                totalCount
              }
            })

            setFraudTrendData(trendData)
          } else {
            setFraudTrendData([])
            setError('No valid transaction dates found')
          }
        } else {
          setFraudTrendData([])
          setError(response.error || 'No transaction data available')
        }
      } catch (error) {
        console.error("[FraudTrend] Error fetching data:", error)
        setError('Failed to fetch fraud trend data')
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading fraud trend data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading fraud trend data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (fraudTrendData.length === 0 || fraudTrendData.every(d => d.totalCount === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No fraud trend data available</p>
          <p className="text-xs text-muted-foreground">No transactions found in the last 14 days</p>
        </div>
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
          <YAxis 
            stroke="#6b7280" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `${value}%`} 
            dx={-10} 
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as FraudTrendData
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="font-medium">{new Date(data.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.primary }} />
                          Fraud Rate:
                        </span>
                        <span className="font-medium">{data.fraudRate}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Fraud Cases:</span>
                        <span className="font-medium">{data.fraudCount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Total Transactions:</span>
                        <span className="font-medium">{data.totalCount}</span>
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRiskByGatewayData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })

        if (response.success && response.data && response.data.length > 0) {
          const gatewayStats = response.data.reduce((acc: any, transaction) => {
            const gateway = transaction.gateway || 'Unknown'
            if (!acc[gateway]) {
              acc[gateway] = { lowRisk: 0, mediumRisk: 0, highRisk: 0, total: 0 }
            }

            acc[gateway].total++
            const riskScore = transaction.risk_score || 0
            
            if (riskScore < 30) {
              acc[gateway].lowRisk++
            } else if (riskScore < 70) {
              acc[gateway].mediumRisk++
            } else {
              acc[gateway].highRisk++
            }

            return acc
          }, {})

          const chartData = Object.entries(gatewayStats)
            .filter(([_, stats]: [string, any]) => stats.total > 0)
            .map(([gateway, stats]: [string, any]) => ({
              gateway,
              lowRisk: Math.round((stats.lowRisk / stats.total) * 100),
              mediumRisk: Math.round((stats.mediumRisk / stats.total) * 100),
              highRisk: Math.round((stats.highRisk / stats.total) * 100),
              total: stats.total
            }))

          setRiskByGatewayData(chartData)
        } else {
          setRiskByGatewayData([])
          setError(response.error || 'No transaction data available')
        }
      } catch (error) {
        console.error("[RiskByGateway] Error fetching data:", error)
        setError('Failed to fetch gateway risk data')
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading gateway risk data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading gateway risk data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (riskByGatewayData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No gateway risk data available</p>
          <p className="text-xs text-muted-foreground">No transactions found with risk data</p>
        </div>
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
                const data = payload[0].payload as RiskByGatewayData
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{data.gateway}</p>
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
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">Total Transactions:</span>
                          <span className="font-medium">{data.total}</span>
                        </div>
                      </div>
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChargebackPredictionData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })

        if (response.success && response.data && response.data.length > 0) {
          const paymentMethodStats = response.data.reduce((acc: any, transaction) => {
            const method = transaction.payment_method === "card"
              ? transaction.funding_type === "credit"
                ? "Credit Card"
                : "Debit Card"
              : transaction.payment_method === "digital_wallet" 
                ? "Digital Wallet"
                : transaction.payment_method || "Other"

            if (!acc[method]) {
              acc[method] = 0
            }
            acc[method]++
            return acc
          }, {})

          const total = Object.values(paymentMethodStats).reduce((sum: number, count: any) => sum + count, 0)
          const chartData = Object.entries(paymentMethodStats)
            .filter(([_, count]: [string, any]) => count > 0)
            .map(([name, count]: [string, any]) => ({
              name,
              value: Math.round((count / total) * 100),
              count: count as number
            }))

          setChargebackPredictionData(chartData)
        } else {
          setChargebackPredictionData([])
          setError(response.error || 'No transaction data available')
        }
      } catch (error) {
        console.error("[ChargebackPrediction] Error fetching data:", error)
        setError('Failed to fetch chargeback prediction data')
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chargeback prediction data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading chargeback prediction data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (chargebackPredictionData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No chargeback prediction data available</p>
          <p className="text-xs text-muted-foreground">No transactions found with payment method data</p>
        </div>
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
            label={({ name, percent, count }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                const data = payload[0].payload as ChargebackPredictionData
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[payload[0].payload.index % PIE_COLORS.length] }}
                      />
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground">Percentage: </span>
                      <span className="font-medium">{data.value}%</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground">Count: </span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TransactionVolume() {
  const [transactionVolumeData, setTransactionVolumeData] = useState<TransactionVolumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTransactionVolumeData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })

        if (response.success && response.data && response.data.length > 0) {
          // Get the date range from the actual data
          const dates = response.data
            .map(t => t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : null)
            .filter(Boolean)
            .sort()
          
          if (dates.length > 0) {
            const earliestDate = new Date(dates[0])
            const latestDate = new Date(dates[dates.length - 1])
            const daysDiff = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24))
            
            // Use actual data range or last 7 days, whichever is smaller
            const daysToShow = Math.min(daysDiff + 1, 7)
            
            const lastDays = Array.from({ length: daysToShow }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (daysToShow - 1 - i))
              return date.toISOString().split("T")[0]
            })

            const volumeData = lastDays.map((date) => {
              const dayTransactions = response.data.filter((t) => 
                t.created_at && t.created_at.startsWith(date)
              )

              const volume = dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
              const count = dayTransactions.length

              return {
                date,
                volume: Math.round(volume * 100) / 100,
                count
              }
            })

            setTransactionVolumeData(volumeData)
          } else {
            setTransactionVolumeData([])
            setError('No valid transaction dates found')
          }
        } else {
          setTransactionVolumeData([])
          setError(response.error || 'No transaction data available')
        }
      } catch (error) {
        console.error("[TransactionVolume] Error fetching data:", error)
        setError('Failed to fetch transaction volume data')
        setTransactionVolumeData([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionVolumeData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading transaction volume data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading transaction volume data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (transactionVolumeData.length === 0 || transactionVolumeData.every(d => d.count === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No transaction volume data available</p>
          <p className="text-xs text-muted-foreground">No transactions found in the last 7 days</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={transactionVolumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
          <YAxis 
            stroke="#6b7280" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `$${value}`} 
            dx={-10} 
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as TransactionVolumeData
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="font-medium">{new Date(data.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS.secondary }} />
                          Volume:
                        </span>
                        <span className="font-medium">${data.volume.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Transactions:</span>
                        <span className="font-medium">{data.count}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke={CHART_COLORS.secondary}
            strokeWidth={3}
            dot={{ r: 4, fill: CHART_COLORS.secondary, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: CHART_COLORS.secondary, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
