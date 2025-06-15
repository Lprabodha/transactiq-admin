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

// Sample high risk transactions data - only Stripe and SolidGate
const highRiskTransactions = [
  {
    id: "TX123457",
    date: "2023-06-12T09:45:00Z",
    amount: 79.99,
    currency: "USD",
    gateway: "SolidGate",
    fraudRisk: 75,
    customer: "suspicious@example.com",
    riskFactors: ["Unusual location", "Multiple failed attempts", "IP associated with fraud"],
  },
  {
    id: "TX123460",
    date: "2023-06-11T20:30:00Z",
    amount: 149.99,
    currency: "USD",
    gateway: "Stripe",
    fraudRisk: 88,
    customer: "suspicious2@example.com",
    riskFactors: ["New account", "High value purchase", "Mismatched billing/shipping"],
  },
  {
    id: "TX123465",
    date: "2023-06-10T14:22:00Z",
    amount: 299.99,
    currency: "USD",
    gateway: "SolidGate",
    fraudRisk: 92,
    customer: "suspicious3@example.com",
    riskFactors: ["Multiple cards used", "Proxy detected", "Unusual purchase pattern"],
  },
  {
    id: "TX123470",
    date: "2023-06-09T08:15:00Z",
    amount: 199.99,
    currency: "EUR",
    gateway: "Stripe",
    fraudRisk: 82,
    customer: "suspicious4@example.com",
    riskFactors: ["Card BIN mismatch", "Browser fingerprint issues", "Unusual time of day"],
  },
  {
    id: "TX123475",
    date: "2023-06-08T22:40:00Z",
    amount: 499.99,
    currency: "USD",
    gateway: "SolidGate",
    fraudRisk: 78,
    customer: "suspicious5@example.com",
    riskFactors: ["High velocity purchases", "Device switching", "Known fraud patterns"],
  },
]

export function FraudRiskTable() {
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; transaction: any | null }>({
    open: false,
    transaction: null,
  })
  const [markDialog, setMarkDialog] = useState<{ open: boolean; id: string | null; isSafe: boolean }>({
    open: false,
    id: null,
    isSafe: true,
  })

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
    // Add status and chargebackProbability for compatibility with TransactionDetailsDialog
    const enhancedTransaction = {
      ...transaction,
      status: "completed",
      chargebackProbability: transaction.fraudRisk - 10 > 0 ? transaction.fraudRisk - 10 : transaction.fraudRisk,
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
            <TableHead>Risk Score</TableHead>
            <TableHead>Risk Factors</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {highRiskTransactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.id}</TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
              <TableCell>{transaction.customer}</TableCell>
              <TableCell>{getGatewayBadge(transaction.gateway)}</TableCell>
              <TableCell>
                <Badge variant="destructive">{transaction.fraudRisk}%</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {transaction.riskFactors.map((factor, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/20"
                    >
                      {factor}
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
                      Confirm as Fraud
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
