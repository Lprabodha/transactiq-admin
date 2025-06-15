"use client"

import { useState } from "react"
import { Eye, Filter, Search, Download, Shield, AlertTriangle, MoreHorizontal } from "lucide-react"
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

// Sample transaction data - only Stripe and SolidGate
const transactions = [
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; transaction: any | null }>({
    open: false,
    transaction: null,
  })
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; id: string | null; email: string }>({
    open: false,
    id: null,
    email: "",
  })
  const [refundDialog, setRefundDialog] = useState<{
    open: boolean
    id: string | null
    amount: number
    currency: string
  }>({
    open: false,
    id: null,
    amount: 0,
    currency: "USD",
  })
  const [markDialog, setMarkDialog] = useState<{ open: boolean; id: string | null; isSafe: boolean }>({
    open: false,
    id: null,
    isSafe: true,
  })

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.gateway.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const getRiskBadgeVariant = (risk: number) => {
    if (risk < 30) return "success"
    if (risk < 70) return "warning"
    return "destructive"
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "failed":
        return "destructive"
      default:
        return "secondary"
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
      setSelectedTransactions(filteredTransactions.map((t) => t.id))
    }
  }

  const handleViewDetails = (transaction: any) => {
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

      {selectedTransactions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md">
          <span className="text-sm text-muted-foreground">
            {selectedTransactions.length} transaction{selectedTransactions.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => setSelectedTransactions([])}>
              Clear
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Mark Safe</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Mark Fraud</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
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
              <TableHead>Fraud Risk</TableHead>
              <TableHead>Chargeback</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedTransactions.includes(transaction.id)}
                    onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                    aria-label={`Select transaction ${transaction.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(transaction.status)}>{transaction.status}</Badge>
                </TableCell>
                <TableCell>{getGatewayBadge(transaction.gateway)}</TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(transaction.fraudRisk)}>{transaction.fraudRisk}%</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(transaction.chargebackProbability)}>
                    {transaction.chargebackProbability}%
                  </Badge>
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
                      <DropdownMenuItem onClick={() => handleMarkTransaction(transaction.id, true)}>
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        Mark as Safe
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMarkTransaction(transaction.id, false)}>
                        <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                        Mark as Fraudulent
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRefund(transaction.id, transaction.amount, transaction.currency)}
                      >
                        <Download className="mr-2 h-4 w-4 rotate-180" />
                        Refund Transaction
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBlockUser(transaction.id, transaction.customer)}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Block User/Payment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <TransactionFiltersDialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen} />

      {detailsDialog.transaction && (
        <TransactionDetailsDialog
          open={detailsDialog.open}
          onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
          transactionId={detailsDialog.transaction.id}
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
