"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TransactionDetailsDialog } from "@/components/transaction-details-dialog"
import { MarkTransactionDialog } from "@/components/mark-transaction-dialog"

// Sample chargeback prediction data - only Stripe and SolidGate
const chargebackPredictions = [
  {
    id: "TX123457",
    date: "2023-06-12T09:45:00Z",
    amount: 79.99,
    currency: "USD",
    gateway: "SolidGate",
    chargebackProbability: 68,
    customer: "suspicious@example.com",
    reasons: ["Unusual purchase pattern", "High risk category", "Customer history"],
  },
  {
    id: "TX123460",
    date: "2023-06-11T20:30:00Z",
    amount: 149.99,
    currency: "USD",
    gateway: "Stripe",
    chargebackProbability: 75,
    customer: "suspicious2@example.com",
    reasons: ["Digital goods", "New customer", "High value"],
  },
  {
    id: "TX123480",
    date: "2023-06-07T16:45:00Z",
    amount: 129.99,
    currency: "USD",
    gateway: "SolidGate",
    chargebackProbability: 82,
    customer: "suspicious6@example.com",
    reasons: ["Previous chargeback", "Mismatched information", "High risk IP"],
  },
  {
    id: "TX123485",
    date: "2023-06-06T11:30:00Z",
    amount: 89.99,
    currency: "EUR",
    gateway: "Stripe",
    chargebackProbability: 71,
    customer: "suspicious7@example.com",
    reasons: ["Subscription product", "Card verification failed", "Multiple attempts"],
  },
  {
    id: "TX123490",
    date: "2023-06-05T19:20:00Z",
    amount: 199.99,
    currency: "USD",
    gateway: "SolidGate",
    chargebackProbability: 65,
    customer: "suspicious8@example.com",
    reasons: ["High risk country", "Unusual time", "Device fingerprint"],
  },
]

export function ChargebackPredictionTable() {
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; transaction: any | null }>({
    open: false,
    transaction: null,
  })
  const [markDialog, setMarkDialog] = useState<{ open: boolean; id: string | null; isSafe: boolean }>({
    open: false,
    id: null,
    isSafe: true,
  })

  const formatDate = (dateString: string | null | undefined) => {
    // Handle null, undefined, or empty string
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value:', dateString);
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
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

  const handleViewDetails = (transaction: any) => {
    // Add status and fraudRisk for compatibility with TransactionDetailsDialog
    const enhancedTransaction = {
      ...transaction,
      status: "completed",
      fraudRisk:
        transaction.chargebackProbability - 10 > 0
          ? transaction.chargebackProbability - 10
          : transaction.chargebackProbability,
    }
    setDetailsDialog({ open: true, transaction: enhancedTransaction })
  }

  const handleMarkTransaction = (id: string, isSafe: boolean) => {
    setMarkDialog({ open: true, id, isSafe })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Gateway</TableHead>
            <TableHead>Chargeback Probability</TableHead>
            <TableHead>Risk Factors</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chargebackPredictions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
              <TableCell>{transaction.customer}</TableCell>
              <TableCell>{getGatewayBadge(transaction.gateway)}</TableCell>
              <TableCell>
                <Badge variant="destructive">{transaction.chargebackProbability}%</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {transaction.reasons.map((reason, index) => (
                    <Badge key={index} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {reason}
                    </Badge>
                  ))}
                </div>
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
                      Confirm Chargeback Risk
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialogs */}
      {detailsDialog.transaction && (
        <TransactionDetailsDialog
          open={detailsDialog.open}
          onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
          transactionId={detailsDialog.transaction.id}
          transaction={detailsDialog.transaction}
        />
      )}

      <MarkTransactionDialog
        open={markDialog.open}
        onOpenChange={(open) => setMarkDialog({ ...markDialog, open })}
        transactionId={markDialog.id}
        isSafe={markDialog.isSafe}
      />
    </div>
  )
}
