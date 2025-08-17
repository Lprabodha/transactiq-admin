"use client"

import { useState, useEffect } from "react"
import { TransactionsTable } from "@/components/transactions-table"
import { TransactionFilters, TransactionFilters as TransactionFiltersType } from "@/components/transaction-filters"
import { ExportReports, ExportOptions } from "@/components/export-reports"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, BarChart3, Shield, CreditCard } from "lucide-react"
import { ApiService } from "@/lib/api-service"
import { exportData, filterDataForExport } from "@/utils/export-utils"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)
  const [filters, setFilters] = useState<TransactionFiltersType>({
    search: '',
    status: [],
    gateway: [],
    paymentMethod: [],
    riskScoreRange: [0, 100],
    amountRange: [0, 10000],
    dateRange: {
      from: undefined,
      to: undefined
    },
    fraudDetected: null,
    chargebackPredicted: null,
    country: [],
    currency: []
  })

  // Fetch transactions
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true)
        const response = await ApiService.getTransactions({ limit: 1000 })
        if (response.success && response.data) {
          setTransactions(response.data)
          setFilteredTransactions(response.data)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        (t.transaction_id || '').toLowerCase().includes(searchLower) ||
        (t.email || '').toLowerCase().includes(searchLower) ||
        (t.billing_email || '').toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status.includes(t.status))
    }

    // Gateway filter
    if (filters.gateway.length > 0) {
      filtered = filtered.filter(t => filters.gateway.includes(t.gateway))
    }

    // Payment method filter
    if (filters.paymentMethod.length > 0) {
      filtered = filtered.filter(t => filters.paymentMethod.includes(t.payment_method))
    }

    // Risk score filter
    filtered = filtered.filter(t => {
      const riskScore = t.risk_score || 0
      return riskScore >= filters.riskScoreRange[0] && riskScore <= filters.riskScoreRange[1]
    })

    // Amount filter
    filtered = filtered.filter(t => {
      const amount = t.amount || 0
      return amount >= filters.amountRange[0] && amount <= filters.amountRange[1]
    })

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(t => {
        if (!t.created_at) return false
        const itemDate = new Date(t.created_at)
        
        if (filters.dateRange.from && itemDate < filters.dateRange.from) return false
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false
        
        return true
      })
    }

    // Fraud detection filter
    if (filters.fraudDetected !== null) {
      filtered = filtered.filter(t => t.fraud_detected === filters.fraudDetected)
    }

    // Chargeback prediction filter
    if (filters.chargebackPredicted !== null) {
      filtered = filtered.filter(t => t.chargeback_predicted === filters.chargebackPredicted)
    }

    // Country filter
    if (filters.country.length > 0) {
      filtered = filtered.filter(t => filters.country.includes(t.billing_address_country))
    }

    // Currency filter
    if (filters.currency.length > 0) {
      filtered = filtered.filter(t => filters.currency.includes(t.currency))
    }

    setFilteredTransactions(filtered)
  }, [transactions, filters])

  // Handle export
  const handleExport = async (options: ExportOptions) => {
    try {
      setExportLoading(true)
      
      // Apply export filters
      const exportData = filterDataForExport(filteredTransactions, options)
      
      // Use the export utility
      await exportData(exportData, options)
      
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }

  // Calculate statistics
  const stats = {
    total: transactions.length,
    filtered: filteredTransactions.length,
    highRisk: filteredTransactions.filter(t => (t.risk_score || 0) > 70).length,
    fraudDetected: filteredTransactions.filter(t => t.fraud_detected).length,
    chargebackRisk: filteredTransactions.filter(t => (t.chargeback_confidence || 0) > 60).length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage transaction data with fraud risk and chargeback predictions.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.filtered} filtered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
            <p className="text-xs text-muted-foreground">
              Risk score > 70%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Detected</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.fraudDetected}</div>
            <p className="text-xs text-muted-foreground">
              Confirmed fraud cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chargeback Risk</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.chargebackRisk}</div>
            <p className="text-xs text-muted-foreground">
              > 60% confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Reports Section */}
      <ExportReports onExport={handleExport} isLoading={exportLoading} />

      {/* Transaction Filters */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters({
          search: '',
          status: [],
          gateway: [],
          paymentMethod: [],
          riskScoreRange: [0, 100],
          amountRange: [0, 10000],
          dateRange: { from: undefined, to: undefined },
          fraudDetected: null,
          chargebackPredicted: null,
          country: [],
          currency: []
        })}
        totalTransactions={stats.total}
        filteredCount={stats.filtered}
      />

      {/* Transactions Table */}
      <TransactionsTable />
    </div>
  )
}
