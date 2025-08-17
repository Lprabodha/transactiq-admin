"use client"

import { useState, useEffect } from "react"
import {
  Eye,
  Filter,
  Search,
  Download,
  Shield,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionFiltersDialog } from "@/components/transaction-filters-dialog"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { BlockUserDialog } from "@/components/block-user-dialog"
import { RefundTransactionDialog } from "@/components/refund-transaction-dialog"
import { MarkTransactionDialog } from "@/components/mark-transaction-dialog"
import { ApiService, type Transaction } from "@/lib/api-service"

// Sample transaction data - only Stripe and SolidGate (fallback)
const sampleTransactions = [
  {
    id: "TX123456",
    date: "2023-06-12T10:30:00Z",
    amount: 129.99,
    currency: "USD",
    status: "completed",
    gateway: "Stripe",
    fraudRisk: 12,
    chargebackProbability: 5,
    customer: "john.doe@example.com",
  },
  {
    id: "TX123457",
    date: "2023-06-12T09:45:00Z",
    amount: 79.99,
    currency: "USD",
    status: "completed",
    gateway: "SolidGate",
    fraudRisk: 75,
    chargebackProbability: 68,
    customer: "suspicious@example.com",
  },
  {
    id: "TX123458",
    date: "2023-06-12T08:15:00Z",
    amount: 49.99,
    currency: "EUR",
    status: "completed",
    gateway: "Stripe",
    fraudRisk: 28,
    chargebackProbability: 15,
    customer: "jane.smith@example.com",
  },
  {
    id: "TX123459",
    date: "2023-06-11T22:10:00Z",
    amount: 199.99,
    currency: "USD",
    status: "completed",
    gateway: "SolidGate",
    fraudRisk: 45,
    chargebackProbability: 32,
    customer: "robert.johnson@example.com",
  },
  {
    id: "TX123460",
    date: "2023-06-11T20:30:00Z",
    amount: 149.99,
    currency: "USD",
    status: "failed",
    gateway: "Stripe",
    fraudRisk: 88,
    chargebackProbability: 75,
    customer: "suspicious2@example.com",
  },
  {
    id: "TX123461",
    date: "2023-06-11T18:45:00Z",
    amount: 59.99,
    currency: "GBP",
    status: "completed",
    gateway: "SolidGate",
    fraudRisk: 18,
    chargebackProbability: 8,
    customer: "emily.davis@example.com",
  },
  {
    id: "TX123462",
    date: "2023-06-11T16:20:00Z",
    amount: 89.99,
    currency: "USD",
    status: "completed",
    gateway: "Stripe",
    fraudRisk: 35,
    chargebackProbability: 22,
    customer: "michael.wilson@example.com",
  },
]

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  const [detailsDialog, setDetailsDialog] = useState({ open: false, transaction: null as Transaction | null })
  const [blockDialog, setBlockDialog] = useState({ open: false, id: "", email: "" })
  const [refundDialog, setRefundDialog] = useState({ open: false, id: "", amount: 0, currency: "" })
  const [markDialog, setMarkDialog] = useState({ open: false, id: "", isSafe: false })

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch transactions from API
  useEffect(() => {
    if (!mounted) return

    async function fetchTransactions() {
      try {
        setLoading(true)
        const response = await ApiService.getTransactions({
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
          search: searchQuery || undefined,
        })

        if (response.success && response.data) {
          // Enhance transaction data with customer location if transaction location is missing
          const enhancedTransactions = await Promise.all(
            response.data.map(async (transaction) => {
              const enhanced = await ApiService.getEnhancedTransactionData(transaction)
              return enhanced
            })
          )
          setTransactions(enhancedTransactions)
          setTotalCount(response.totalCount || response.data.length)
        } else {
          setError(response.error || "Failed to fetch transactions")
          setTransactions([])
          setTotalCount(0)
        }
      } catch (err) {
        setError("An error occurred while fetching transactions")
        console.error("Transactions fetch error:", err)
        setTransactions([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [mounted, currentPage, searchQuery])

  const filteredTransactions = transactions

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const formatDate = (dateString: string) => {
    return ApiService.formatDate(dateString)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return ApiService.formatCurrency(amount, currency)
  }

  const getRiskBadgeVariant = (risk: number) => {
    if (risk < 30) return "default"
    if (risk < 70) return "secondary"
    return "destructive"
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "succeeded":
      case "completed":
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getGatewayBadge = (gateway: string) => {
    return (
      <Badge
        variant="outline"
        className={`${
          gateway === "Stripe"
            ? "bg-primary/10 text-primary border-primary/20"
            : "bg-secondary/10 text-secondary border-secondary/20"
        }`}
      >
        {gateway}
      </Badge>
    )
  }

  const toggleTransactionSelection = (id: string) => {
    setSelectedTransactions((prev) => (prev.includes(id) ? prev.filter((transId) => transId !== id) : [...prev, id]))
  }

  const toggleAllTransactions = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.map((t) => t._id))
    }
  }

  const handleViewDetails = (transaction: Transaction) => {
    setDetailsDialog({ open: true, transaction })
  }

  const handleBlockUser = (id: string, email: string) => {
    setBlockDialog({ open: true, id, email })
  }

  const handleRefund = (id: string, amount: number, currency: string) => {
    setRefundDialog({ open: true, id, amount, currency })
  }

  const handleMarkTransaction = (id: string, isSafe: boolean) => {
    setMarkDialog({ open: true, id, isSafe })
  }

  // Show loading state only after mounted to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show empty state when no transactions
  if (transactions.length === 0 && !loading && !error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex flex-col items-center justify-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">No transactions found</p>
            <p className="text-sm text-muted-foreground">No transaction data is available from the API</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading transactions</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={() => setIsFiltersOpen(true)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {selectedTransactions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setSelectedTransactions([])}>
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-transparent"
              onClick={() => setMarkDialog({ open: true, id: "", isSafe: true })}
            >
              <Shield className="h-4 w-4" />
              <span>Mark Safe</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-transparent"
              onClick={() => setMarkDialog({ open: true, id: "", isSafe: false })}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Mark Fraud</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredTransactions.length > 0 && selectedTransactions.length === filteredTransactions.length
                  }
                  onCheckedChange={toggleAllTransactions}
                  aria-label="Select all transactions"
                />
              </TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Fraud Risk</TableHead>
              <TableHead>Chargeback</TableHead>
              <TableHead>Recommendations</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => {
              const isHighRisk = transaction.chargeback_predicted || transaction.risk_score > 70
              const isHighPriority = transaction.recommendations?.priority === "high"
              let rowClass = ""
              if (isHighRisk) {
                rowClass = "bg-destructive/5 border-l-4 border-l-destructive"
              } else if (isHighPriority) {
                rowClass = "bg-orange-50 border-l-4 border-l-orange-400"
              }
              
              return (
              <TableRow 
                key={transaction._id}
                className={rowClass}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction._id)}
                    onCheckedChange={() => toggleTransactionSelection(transaction._id)}
                    aria-label={`Select transaction ${transaction.transaction_id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                <TableCell>{formatDate(transaction.created_at)}</TableCell>
                <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>{transaction.status}</Badge>
                </TableCell>
                <TableCell>{getGatewayBadge(transaction.gateway)}</TableCell>
                <TableCell>
                  {(() => {
                    const enhancedTransaction = transaction as Transaction & { enhancedCustomerInfo?: Partial<any> }
                    const location = ApiService.getBestLocation(enhancedTransaction)
                    return location ? (
                      <div className="text-sm">
                        {location.city && location.country ? 
                          `${location.city}, ${location.country}` :
                          location.country || location.city || 'Unknown'
                        }
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unknown</span>
                    )
                  })()}
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(transaction.risk_score)}>{transaction.risk_score}%</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(transaction.chargeback_confidence * 100)}>
                    {(transaction.chargeback_confidence * 100).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  {transaction.recommendations ? (
                    <div className="flex flex-col gap-1">
                      {(() => {
                        let badgeVariant: "destructive" | "default" | "secondary" = "secondary"
                        if (transaction.recommendations.priority === "high") {
                          badgeVariant = "destructive"
                        } else if (transaction.recommendations.priority === "medium") {
                          badgeVariant = "default"
                        }
                        return (
                          <Badge 
                            variant={badgeVariant}
                            className="text-xs"
                          >
                            {transaction.recommendations.priority} Priority
                          </Badge>
                        )
                      })()}
                      <span className="text-xs text-muted-foreground">
                        {transaction.recommendations.recommended_actions.length} actions
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No recommendations</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setMarkDialog({ open: true, id: transaction._id, isSafe: true })}
                      >
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        Mark as Safe
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setMarkDialog({ open: true, id: transaction._id, isSafe: false })}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                        Mark as Fraudulent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          setRefundDialog({
                            open: true,
                            id: transaction._id,
                            amount: transaction.amount,
                            currency: transaction.currency,
                          })
                        }
                      >
                        <Download className="mr-2 h-4 w-4 rotate-180" />
                        Refund Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setBlockDialog({ open: true, id: transaction._id, email: transaction.email })}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Block User/Payment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startItem} to {endItem} of {totalCount} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <TransactionFiltersDialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen} />

      {detailsDialog.transaction && (
        <TransactionDetailsDialog
          open={detailsDialog.open}
          onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
          transactionId={detailsDialog.transaction.transaction_id}
          transaction={detailsDialog.transaction}
        />
      )}

      <BlockUserDialog
        open={blockDialog.open}
        onOpenChange={(open) => setBlockDialog({ ...blockDialog, open })}
        transactionId={blockDialog.id}
        customerEmail={blockDialog.email}
      />

      <RefundTransactionDialog
        open={refundDialog.open}
        onOpenChange={(open) => setRefundDialog({ ...refundDialog, open })}
        transactionId={refundDialog.id}
        amount={refundDialog.amount}
        currency={refundDialog.currency}
      />

      <MarkTransactionDialog
        open={markDialog.open}
        onOpenChange={(open) => setMarkDialog({ ...markDialog, open })}
        transactionId={markDialog.id}
        isSafe={markDialog.isSafe}
      />
    </div>
  )
}
