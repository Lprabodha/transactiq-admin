"use client"
import { useState, useEffect } from "react"
import { Eye, MoreHorizontal, Shield, AlertTriangle, Loader2 } from "lucide-react"
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
import { ApiService } from "@/lib/api-service"

interface HighRiskTransaction {
  _id: string
  transaction_id: string
  email: string
  amount: number
  currency: string
  gateway: string
  risk_score: number
  created_at: string
  payment_method: string
  card_brand?: string
  billing_address_country?: string
  ip_address?: string
  fraud_detected?: boolean
  chargeback_predicted?: boolean
}

export function FraudRiskTable() {
  const [transactions, setTransactions] = useState<HighRiskTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; transaction: any | null }>({
    open: false,
    transaction: null,
  })
  const [markDialog, setMarkDialog] = useState<{ open: boolean; id: string | null; isSafe: boolean }>({
    open: false,
    id: null,
    isSafe: true,
  })

  useEffect(() => {
    async function fetchHighRiskTransactions() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching high risk transactions...')
        
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Filter transactions with risk score above 70%
          const highRisk = response.data
            .filter((t: any) => (t.risk_score || 0) > 70)
            .map((t: any) => ({
              _id: t._id,
              transaction_id: t.transaction_id || t._id,
              email: t.email || t.billing_email || 'Unknown',
              amount: t.amount || 0,
              currency: t.currency || 'USD',
              gateway: t.gateway || 'Unknown',
              risk_score: t.risk_score || 0,
              created_at: t.created_at,
              payment_method: t.payment_method || 'Unknown',
              card_brand: t.card_brand,
              billing_address_country: t.billing_address_country,
              ip_address: t.ip_address,
              fraud_detected: t.fraud_detected,
              chargeback_predicted: t.chargeback_predicted
            }))
            .sort((a, b) => b.risk_score - a.risk_score) // Sort by risk score descending
          
          console.log(`Found ${highRisk.length} high risk transactions`)
          setTransactions(highRisk)
        } else {
          setTransactions([])
          setError('No transaction data available')
        }
      } catch (error) {
        console.error('[FraudRiskTable] Error fetching data:', error)
        setError('Failed to fetch high risk transactions')
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchHighRiskTransactions()
  }, [])

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
      currency: currency.toUpperCase(),
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

  const getRiskFactors = (transaction: HighRiskTransaction): string[] => {
    const factors: string[] = []
    
    if (transaction.risk_score > 90) {
      factors.push("Extremely High Risk")
    } else if (transaction.risk_score > 80) {
      factors.push("Very High Risk")
    }
    
    if (transaction.fraud_detected) {
      factors.push("Fraud Detected")
    }
    
    if (transaction.chargeback_predicted) {
      factors.push("Chargeback Predicted")
    }
    
    if (transaction.payment_method === "card" && !transaction.card_brand) {
      factors.push("Missing Card Info")
    }
    
    if (!transaction.billing_address_country && !transaction.ip_address) {
      factors.push("Location Unknown")
    }
    
    if (factors.length === 0) {
      factors.push("High Risk Score")
    }
    
    return factors
  }

  const handleViewDetails = (transaction: HighRiskTransaction) => {
    // Add status and chargebackProbability for compatibility with TransactionDetailsDialog
    const enhancedTransaction = {
      ...transaction,
      status: "completed",
      chargebackProbability: transaction.chargeback_predicted ? 85 : transaction.risk_score - 10 > 0 ? transaction.risk_score - 10 : transaction.risk_score,
    }
    setDetailsDialog({ open: true, transaction: enhancedTransaction })
  }

  const handleMarkTransaction = (id: string, isSafe: boolean) => {
    setMarkDialog({ open: true, id, isSafe })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading high risk transactions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading high risk transactions</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No high risk transactions found</p>
          <p className="text-xs text-muted-foreground">Transactions with risk scores above 70% will appear here</p>
        </div>
      </div>
    )
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
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
              <TableCell>{formatDate(transaction.created_at)}</TableCell>
              <TableCell>{formatCurrency(transaction.amount, transaction.currency)}</TableCell>
              <TableCell>{transaction.email}</TableCell>
              <TableCell>{getGatewayBadge(transaction.gateway)}</TableCell>
              <TableCell>
                <Badge variant="destructive">{transaction.risk_score}%</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getRiskFactors(transaction).map((factor, index) => (
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
                    <DropdownMenuItem onClick={() => handleMarkTransaction(transaction._id, true)}>
                      <Shield className="mr-2 h-4 w-4 text-primary" />
                      Mark as Safe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkTransaction(transaction._id, false)}>
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
          transactionId={detailsDialog.transaction.transaction_id}
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
