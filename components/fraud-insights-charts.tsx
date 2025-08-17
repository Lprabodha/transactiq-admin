"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
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
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { ApiService } from "@/lib/api-service"

// Sample data for risk distribution
const riskDistributionData = [
  { range: "0-10%", count: 245 },
  { range: "11-20%", count: 132 },
  { range: "21-30%", count: 87 },
  { range: "31-40%", count: 65 },
  { range: "41-50%", count: 43 },
  { range: "51-60%", count: 32 },
  { range: "61-70%", count: 21 },
  { range: "71-80%", count: 15 },
  { range: "81-90%", count: 8 },
  { range: "91-100%", count: 4 },
]

// Sample data for risk by country
const riskByCountryData = [
  { country: "United States", avgRisk: 18, code: "US", flag: "🇺🇸" },
  { country: "United Kingdom", avgRisk: 15, code: "GB", flag: "🇬🇧" },
  { country: "Canada", avgRisk: 12, code: "CA", flag: "🇨🇦" },
  { country: "Germany", avgRisk: 14, code: "DE", flag: "🇩🇪" },
  { country: "France", avgRisk: 17, code: "FR", flag: "🇫🇷" },
  { country: "Australia", avgRisk: 13, code: "AU", flag: "🇦🇺" },
  { country: "Brazil", avgRisk: 28, code: "BR", flag: "🇧🇷" },
  { country: "Russia", avgRisk: 32, code: "RU", flag: "🇷🇺" },
  { country: "India", avgRisk: 25, code: "IN", flag: "🇮🇳" },
  { country: "Nigeria", avgRisk: 42, code: "NG", flag: "🇳🇬" },
]

// Sample data for chargeback trend
const chargebackTrendData = [
  { month: "Jan", stripeRate: 2.5, solidgateRate: 3.1 },
  { month: "Feb", stripeRate: 2.3, solidgateRate: 2.9 },
  { month: "Mar", stripeRate: 2.6, solidgateRate: 3.2 },
  { month: "Apr", stripeRate: 2.2, solidgateRate: 2.6 },
  { month: "May", stripeRate: 2.0, solidgateRate: 2.4 },
  { month: "Jun", stripeRate: 2.3, solidgateRate: 2.7 },
  { month: "Jul", stripeRate: 2.1, solidgateRate: 2.5 },
  { month: "Aug", stripeRate: 1.9, solidgateRate: 2.3 },
  { month: "Sep", stripeRate: 2.2, solidgateRate: 2.6 },
  { month: "Oct", stripeRate: 2.4, solidgateRate: 2.8 },
  { month: "Nov", stripeRate: 2.3, solidgateRate: 2.7 },
  { month: "Dec", stripeRate: 2.5, solidgateRate: 2.9 },
]

// Sample data for chargeback by payment method - only for Stripe and SolidGate
const chargebackByPaymentMethodData = [
  { name: "Stripe - Credit Card", value: 40 },
  { name: "Stripe - Debit Card", value: 10 },
  { name: "SolidGate - Credit Card", value: 25 },
  { name: "SolidGate - Debit Card", value: 5 },
  { name: "Digital Wallet", value: 20 },
]

// Sample data for feature importance
const featureImportanceData = [
  { feature: "IP Location", importance: 0.28 },
  { feature: "Transaction Amount", importance: 0.22 },
  { feature: "Device Fingerprint", importance: 0.18 },
  { feature: "Purchase History", importance: 0.12 },
  { feature: "Time of Day", importance: 0.08 },
  { feature: "Email Domain", importance: 0.07 },
  { feature: "Card BIN", importance: 0.05 },
]

// Sample data for confusion matrix
const confusionMatrixData = [
  { name: "True Negative", value: 9650 },
  { name: "False Positive", value: 120 },
  { name: "False Negative", value: 80 },
  { name: "True Positive", value: 150 },
]

// Sample data for ROC curve
const rocCurveData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.02, tpr: 0.4 },
  { fpr: 0.05, tpr: 0.7 },
  { fpr: 0.1, tpr: 0.85 },
  { fpr: 0.2, tpr: 0.9 },
  { fpr: 0.5, tpr: 0.95 },
  { fpr: 1, tpr: 1 },
]

// Sample data for model history - only Stripe and SolidGate
const modelHistoryData = [
  {
    version: "v1.0",
    accuracy: 0.91,
    precision: 0.88,
    recall: 0.85,
    f1: 0.86,
    date: "2023-01-15",
    gateway: "Combined",
  },
  {
    version: "v1.1",
    accuracy: 0.92,
    precision: 0.89,
    recall: 0.86,
    f1: 0.87,
    date: "2023-03-22",
    gateway: "Stripe",
  },
  {
    version: "v1.2",
    accuracy: 0.9,
    precision: 0.87,
    recall: 0.85,
    f1: 0.86,
    date: "2023-03-22",
    gateway: "SolidGate",
  },
  {
    version: "v2.0",
    accuracy: 0.94,
    precision: 0.92,
    recall: 0.9,
    f1: 0.91,
    date: "2023-08-05",
    gateway: "Combined",
  },
  {
    version: "v2.1",
    accuracy: 0.95,
    precision: 0.93,
    recall: 0.91,
    f1: 0.92,
    date: "2023-11-18",
    gateway: "Stripe",
  },
  {
    version: "v2.1",
    accuracy: 0.93,
    precision: 0.91,
    recall: 0.89,
    f1: 0.9,
    date: "2023-11-18",
    gateway: "SolidGate",
  },
]

// Sample data for radar chart
const radarData = [
  {
    subject: "Accuracy",
    Stripe: 0.95,
    SolidGate: 0.93,
    fullMark: 1,
  },
  {
    subject: "Precision",
    Stripe: 0.93,
    SolidGate: 0.91,
    fullMark: 1,
  },
  {
    subject: "Recall",
    Stripe: 0.91,
    SolidGate: 0.89,
    fullMark: 1,
  },
  {
    subject: "F1 Score",
    Stripe: 0.92,
    SolidGate: 0.9,
    fullMark: 1,
  },
  {
    subject: "AUC",
    Stripe: 0.96,
    SolidGate: 0.94,
    fullMark: 1,
  },
]

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"]
const GATEWAY_COLORS = {
  Stripe: "#10b981",
  SolidGate: "#3b82f6",
  Combined: "#6b7280",
}

// Chart colors
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

// Risk Distribution Chart - Now fetches real data
export function RiskDistribution() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRiskData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Group transactions by risk score ranges
          const riskRanges = [
            { min: 0, max: 10, label: "0-10%" },
            { min: 11, max: 20, label: "11-20%" },
            { min: 21, max: 30, label: "21-30%" },
            { min: 31, max: 40, label: "31-40%" },
            { min: 41, max: 50, label: "41-50%" },
            { min: 51, max: 60, label: "51-60%" },
            { min: 61, max: 70, label: "61-70%" },
            { min: 71, max: 80, label: "71-80%" },
            { min: 81, max: 90, label: "81-90%" },
            { min: 91, max: 100, label: "91-100%" }
          ]
          
          const riskData = riskRanges.map(range => {
            const count = response.data.filter(t => {
              const riskScore = t.risk_score || 0
              return riskScore >= range.min && riskScore <= range.max
            }).length
            
            return {
              range: range.label,
              count
            }
          }).filter(item => item.count > 0)
          
          setData(riskData)
        } else {
          setData([])
          setError('No transaction data available')
        }
      } catch (error) {
        console.error("[RiskDistribution] Error fetching data:", error)
        setError('Failed to fetch risk distribution data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading risk distribution...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading risk distribution</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No risk distribution data available</p>
          <p className="text-xs text-muted-foreground">No transactions found with risk scores</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="range" stroke="#6b7280" axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{payload[0].payload.range}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Count:</span>
                        <span className="font-medium">{payload[0].value}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Risk by Country Chart - Now fetches real data
export function RiskByCountry() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCountryRiskData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Group transactions by country and calculate average risk
          const countryStats = response.data.reduce((acc: any, transaction) => {
            const country = transaction.billing_address_country || transaction.ip_address || 'Unknown'
            if (!acc[country]) {
              acc[country] = { total: 0, sum: 0, transactions: [] }
            }
            
            if (transaction.risk_score !== undefined && transaction.risk_score !== null) {
              acc[country].total++
              acc[country].sum += transaction.risk_score
              acc[country].transactions.push(transaction)
            }
            
            return acc
          }, {})
          
          const countryData = Object.entries(countryStats)
            .filter(([_, stats]: [string, any]) => stats.total > 0)
            .map(([country, stats]: [string, any]) => {
              const avgRisk = Math.round(stats.sum / stats.total)
              const flag = getCountryFlag(country)
              
              return {
                country: getCountryName(country),
                avgRisk,
                code: country,
                flag,
                transactionCount: stats.total
              }
            })
            .sort((a, b) => b.avgRisk - a.avgRisk)
            .slice(0, 10) // Top 10 countries
          
          setData(countryData)
        } else {
          setData([])
          setError('No transaction data available')
        }
      } catch (error) {
        console.error("[RiskByCountry] Error fetching data:", error)
        setError('Failed to fetch country risk data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchCountryRiskData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading country risk data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading country risk data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No country risk data available</p>
          <p className="text-xs text-muted-foreground">No transactions found with country and risk data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="code" stroke="#6b7280" axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{data.flag}</span>
                      <p className="font-medium">{data.country}</p>
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Average Risk:</span>
                        <span className="font-medium">{data.avgRisk}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Transactions:</span>
                        <span className="font-medium">{data.transactionCount}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="avgRisk" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Helper functions for country data
function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'DE': '🇩🇪', 'FR': '🇫🇷',
    'AU': '🇦🇺', 'BR': '🇧🇷', 'RU': '🇷🇺', 'IN': '🇮🇳', 'NG': '🇳🇬',
    'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'IT': '🇮🇹', 'ES': '🇪🇸'
  }
  return flags[countryCode] || '🌍'
}

function getCountryName(countryCode: string): string {
  const names: { [key: string]: string } = {
    'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada',
    'DE': 'Germany', 'FR': 'France', 'AU': 'Australia', 'BR': 'Brazil',
    'RU': 'Russia', 'IN': 'India', 'NG': 'Nigeria', 'JP': 'Japan',
    'CN': 'China', 'KR': 'South Korea', 'IT': 'Italy', 'ES': 'Spain'
  }
  return names[countryCode] || countryCode
}

// Chargeback Trend Chart - Now fetches real data
export function ChargebackTrend() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChargebackTrendData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Group transactions by month and gateway
          const monthlyStats = response.data.reduce((acc: any, transaction) => {
            if (!transaction.created_at) return acc
            
            const date = new Date(transaction.created_at)
            const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
            const gateway = transaction.gateway || 'Unknown'
            
            if (!acc[monthKey]) {
              acc[monthKey] = { month: monthKey, total: 0, chargebacks: 0 }
            }
            
            acc[monthKey].total++
            if (transaction.chargeback_predicted) {
              acc[monthKey].chargebacks++
            }
            
            return acc
          }, {})
          
          // Calculate chargeback rates and format data
          const trendData = Object.values(monthlyStats).map((monthData: any) => {
            const chargebackRate = monthData.total > 0 
              ? (monthData.chargebacks / monthData.total) * 100 
              : 0
            
            return {
              month: monthData.month,
              chargebackRate: Math.round(chargebackRate * 100) / 100,
              totalTransactions: monthData.total,
              chargebackCount: monthData.chargebacks
            }
          }).sort((a, b) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            return months.indexOf(a.month) - months.indexOf(b.month)
          })
          
          setData(trendData)
        } else {
          setData([])
          setError('No transaction data available')
        }
      } catch (error) {
        console.error("[ChargebackTrend] Error fetching data:", error)
        setError('Failed to fetch chargeback trend data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchChargebackTrendData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading chargeback trend...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading chargeback trend</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No chargeback trend data available</p>
          <p className="text-xs text-muted-foreground">No transactions found with chargeback data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="month" stroke="#6b7280" axisLine={false} tickLine={false} />
          <YAxis 
            stroke="#6b7280" 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `${value}%`} 
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{data.month}</p>
                    <div className="mt-2 grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Chargeback Rate:</span>
                        <span className="font-medium">{data.chargebackRate}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Total Transactions:</span>
                        <span className="font-medium">{data.totalTransactions}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Chargebacks:</span>
                        <span className="font-medium">{data.chargebackCount}</span>
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
            dataKey="chargebackRate"
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            dot={{ r: 4, fill: CHART_COLORS.primary, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: CHART_COLORS.primary, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Chargeback by Payment Method Chart - Now fetches real data
export function ChargebackByPaymentMethod() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPaymentMethodData() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Group transactions by payment method and calculate chargeback rates
          const methodStats = response.data.reduce((acc: any, transaction) => {
            const method = transaction.payment_method === "card"
              ? transaction.funding_type === "credit"
                ? "Credit Card"
                : "Debit Card"
              : transaction.payment_method === "digital_wallet" 
                ? "Digital Wallet"
                : transaction.payment_method || "Other"
            
            if (!acc[method]) {
              acc[method] = { total: 0, chargebacks: 0 }
            }
            
            acc[method].total++
            if (transaction.chargeback_predicted) {
              acc[method].chargebacks++
            }
            
            return acc
          }, {})
          
          // Calculate percentages and format data
          const totalTransactions = response.data.length
          const methodData = Object.entries(methodStats)
            .filter(([_, stats]: [string, any]) => stats.total > 0)
            .map(([method, stats]: [string, any]) => {
              const percentage = Math.round((stats.total / totalTransactions) * 100)
              
              return {
                name: method,
                value: percentage,
                count: stats.total,
                chargebackCount: stats.chargebacks,
                chargebackRate: stats.total > 0 
                  ? Math.round((stats.chargebacks / stats.total) * 100 * 100) / 100
                  : 0
              }
            })
            .sort((a, b) => b.value - a.value)
          
          setData(methodData)
        } else {
          setData([])
          setError('No transaction data available')
        }
      } catch (error) {
        console.error("[ChargebackByPaymentMethod] Error fetching data:", error)
        setError('Failed to fetch payment method data')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethodData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading payment method data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading payment method data</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No payment method data available</p>
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
            data={data}
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[payload[0].payload.index % PIE_COLORS.length] }}
                      />
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Percentage:</span>
                        <span className="font-medium">{data.value}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Transactions:</span>
                        <span className="font-medium">{data.count}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Chargeback Rate:</span>
                        <span className="font-medium">{data.chargebackRate}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Chargebacks:</span>
                        <span className="font-medium">{data.chargebackCount}</span>
                      </div>
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

export function FeatureImportance() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="80%"
          barSize={20}
          data={featureImportanceData
            .sort((a, b) => b.importance - a.importance)
            .map((item, index) => ({
              ...item,
              fill: `hsl(${160 - index * 5}, 80%, ${70 - index * 5}%)`,
            }))}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            label={{ fill: "#666", position: "insideStart" }}
            background
            clockWise={true}
            dataKey="importance"
            nameKey="feature"
          />
          <Legend
            iconSize={10}
            width={120}
            height={140}
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: "12px" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Feature:</span>
                        <span className="font-medium">{payload[0].payload.feature}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                          Importance:
                        </span>
                        <span className="font-medium">{(payload[0].value * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ConfusionMatrix() {
  const total = confusionMatrixData.reduce((sum, item) => sum + item.value, 0)
  const data = confusionMatrixData.map((item, index) => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1),
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} (${((value / total) * 100).toFixed(1)}%)`}
            labelFormatter={(index) => data[index].name}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                      <span className="font-medium">{payload[0].payload.name}</span>
                    </div>
                    <div className="mt-1 grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Count:</span>
                        <span className="font-medium">{payload[0].payload.value}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Percentage:</span>
                        <span className="font-medium">{payload[0].payload.percentage}%</span>
                      </div>
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

export function ROCCurve() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorROC" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="fpr"
            type="number"
            domain={[0, 1]}
            tickFormatter={(value) => value.toFixed(1)}
            label={{ value: "False Positive Rate", position: "insideBottom", offset: -5 }}
            stroke="#6b7280"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(value) => value.toFixed(1)}
            label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
            stroke="#6b7280"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">FPR:</span>
                        <span className="font-medium">{payload[0].payload.fpr.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">TPR:</span>
                        <span className="font-medium">{payload[0].payload.tpr.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            data={rocCurveData}
            type="monotone"
            dataKey="tpr"
            stroke="url(#colorROC)"
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
          />
          <Line
            data={[
              { fpr: 0, tpr: 0 },
              { fpr: 1, tpr: 1 },
            ]}
            type="monotone"
            dataKey="tpr"
            stroke="#6b7280"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ModelPerformanceRadar() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280" }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tickFormatter={(value) => value.toFixed(1)} />
          <Radar
            name="Stripe"
            dataKey="Stripe"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.6}
            animationDuration={1500}
          />
          <Radar
            name="SolidGate"
            dataKey="SolidGate"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            animationDuration={1500}
          />
          <Legend />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{payload[0].payload.subject}</p>
                    <div className="mt-2 grid gap-1">
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: entry.name === "Stripe" ? "#10b981" : "#3b82f6",
                              }}
                            />
                            {entry.name}:
                          </span>
                          <span className="font-medium">{entry.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ModelHistory() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Version</th>
            <th className="px-4 py-2 text-left">Gateway</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Accuracy</th>
            <th className="px-4 py-2 text-left">Precision</th>
            <th className="px-4 py-2 text-left">Recall</th>
            <th className="px-4 py-2 text-left">F1 Score</th>
          </tr>
        </thead>
        <tbody>
          {modelHistoryData.map((model, index) => (
            <tr key={`${model.version}-${model.gateway}-${index}`} className="border-b">
              <td className="px-4 py-2">{model.version}</td>
              <td className="px-4 py-2">
                <span
                  className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: model.gateway === "Stripe" ? "#10b98120" : "#3b82f620",
                    color: model.gateway === "Stripe" ? "#10b981" : "#3b82f6",
                  }}
                >
                  {model.gateway}
                </span>
              </td>
              <td className="px-4 py-2">{model.date}</td>
              <td className="px-4 py-2">{model.accuracy.toFixed(2)}</td>
              <td className="px-4 py-2">{model.precision.toFixed(2)}</td>
              <td className="px-4 py-2">{model.recall.toFixed(2)}</td>
              <td className="px-4 py-2">{model.f1.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}