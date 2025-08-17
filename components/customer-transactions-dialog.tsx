"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, AlertCircle, Eye } from "lucide-react"
import { ApiService, type Transaction, type Customer } from "@/lib/api-service"

interface CustomerTransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onViewTransactionDetails?: (transaction: Transaction) => void
}

export function CustomerTransactionsDialog({
  open,
  onOpenChange,
  customer,
  onViewTransactionDetails
}: CustomerTransactionsDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer transactions
  useEffect(() => {
    if (!open || !customer?.email) return

    async function fetchCustomerTransactions() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await ApiService.getTransactions({
          search: customer.email,
          limit: 50 // Show more transactions for customer view
        })

        if (response.success && response.data) {
          // Filter transactions to only show ones that match this customer's email
          const customerTransactions = response.data.filter(
            (transaction) => transaction.email?.toLowerCase() === customer.email?.toLowerCase()
          )
          setTransactions(customerTransactions)
        } else {
          setError(response.error || "Failed to fetch customer transactions")
          setTransactions([])
        }
      } catch (err) {
        setError("An error occurred while fetching transactions")
        console.error("Customer transactions fetch error:", err)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerTransactions()
  }, [open, customer?.email])

  const formatDate = (dateString: string) => {
    return ApiService.formatDate(dateString)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return ApiService.formatCurrency(amount, currency)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "succeeded":
        return "default" as const
      case "pending":
        return "secondary" as const
      case "failed":
      case "canceled":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore >= 70) return "destructive" as const
    if (riskScore >= 40) return "secondary" as const
    return "default" as const
  }

  const getGatewayBadge = (gateway: string) => {
    return (
      <Badge variant="outline" className="font-mono text-xs">
        {gateway}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Customer Transactions</DialogTitle>
          <DialogDescription>
            All transactions for {customer?.name || customer?.email}
            {transactions.length > 0 && ` (${transactions.length} transactions found)`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading transactions...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <span>No transactions found for this customer</span>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Chargeback</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium font-mono text-sm">
                        {transaction.transaction_id}
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getGatewayBadge(transaction.gateway)}</TableCell>
                      <TableCell>
                        <Badge variant={getRiskBadgeVariant(transaction.risk_score)}>
                          {transaction.risk_score}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskBadgeVariant(transaction.chargeback_confidence * 100)}>
                          {(transaction.chargeback_confidence * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewTransactionDetails?.(transaction)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View transaction details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
