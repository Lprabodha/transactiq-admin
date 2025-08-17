"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Shield, AlertTriangle } from "lucide-react"

interface Transaction {
  id: string
  date: string
  amount: number
  currency: string
  status: string
  gateway: string
  fraudRisk: number
  chargebackProbability: number
  customer: string
}

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  transaction: Transaction
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transactionId,
  transaction,
}: TransactionDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            <Badge variant={getStatusBadgeVariant(transaction.status)} className="ml-2">
              {transaction.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Detailed information about transaction {transactionId}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
              <p className="text-sm font-bold">{transaction.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-sm">{formatDate(transaction.date)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="text-sm font-bold">{formatCurrency(transaction.amount, transaction.currency)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gateway</p>
              {getGatewayBadge(transaction.gateway)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer</p>
              <p className="text-sm">{transaction.customer}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">IP Address</p>
              <p className="text-sm">192.168.1.1</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fraud Risk Score</p>
              <Badge variant={getRiskBadgeVariant(transaction.fraudRisk)} className="mt-1">
                {transaction.fraudRisk}%
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Chargeback Probability</p>
              <Badge variant={getRiskBadgeVariant(transaction.chargebackProbability)} className="mt-1">
                {transaction.chargebackProbability}%
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Risk Factors</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {transaction.fraudRisk > 50 && (
                <>
                  <li>Unusual location for customer</li>
                  <li>Multiple failed attempts before success</li>
                  <li>IP address associated with previous fraud</li>
                </>
              )}
              {transaction.fraudRisk <= 50 && (
                <>
                  <li>No significant risk factors detected</li>
                  <li>Customer has successful purchase history</li>
                </>
              )}
            </ul>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex items-center gap-1 flex-1 sm:flex-auto">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1 flex-1 sm:flex-auto">
              <Shield className="h-4 w-4 text-primary" />
              <span>Mark Safe</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1 flex-1 sm:flex-auto">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span>Mark Fraud</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
