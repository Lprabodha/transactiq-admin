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

interface ChargebackPrediction {
  _id: string
  transaction_id: string
  email: string
  amount: number
  currency: string
  gateway: string
  chargeback_confidence: number
  created_at: string
  payment_method: string
  card_brand?: string
  billing_address_country?: string
  ip_address?: string
  chargeback_predicted?: boolean
  fraud_detected?: boolean
}

export function ChargebackPredictionTable() {
  const [predictions, setPredictions] = useState<ChargebackPrediction[]>([])
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
    async function fetchChargebackPredictions() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching chargeback predictions...')
        
        const response = await ApiService.getTransactions({ limit: 1000 })
        
        if (response.success && response.data && response.data.length > 0) {
          // Filter transactions with high chargeback probability (above 60%)
          const highRisk = response.data
            .filter((t: any) => (t.chargeback_confidence || 0) > 60)
            .map((t: any) => ({
              _id: t._id,
              transaction_id: t.transaction_id || t._id,
              email: t.email || t.billing_email || 'Unknown',
              amount: t.amount || 0,
              currency: t.currency || 'USD',
              gateway: t.gateway || 'Unknown',
              chargeback_confidence: t.chargeback_confidence || 0,
              created_at: t.created_at,
              payment_method: t.payment_method || 'Unknown',
              card_brand: t.card_brand,
              billing_address_country: t.billing_address_country,
              ip_address: t.ip_address,
              chargeback_predicted: t.chargeback_predicted,
              fraud_detected: t.fraud_detected
            }))
            .sort((a, b) => b.chargeback_confidence - a.chargeback_confidence) // Sort by confidence descending
          
          console.log(`Found ${highRisk.length} high chargeback risk transactions`)
          setPredictions(highRisk)
        } else {
          setPredictions([])
          setError('No transaction data available')
        }
      } catch (error) {
        console.error('[ChargebackPredictionTable] Error fetching data:', error)
        setError('Failed to fetch chargeback predictions')
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }

    fetchChargebackPredictions()
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

  const getChargebackReasons = (prediction: ChargebackPrediction): string[] => {
    const reasons: string[] = []
    
    if (prediction.chargeback_confidence > 80) {
      reasons.push("Very High Risk")
    } else if (prediction.chargeback_confidence > 70) {
      reasons.push("High Risk")
    }
    
    if (prediction.chargeback_predicted) {
      reasons.push("Chargeback Predicted")
    }
    
    if (prediction.fraud_detected) {
      reasons.push("Fraud Detected")
    }
    
    if (prediction.payment_method === "card" && !prediction.card_brand) {
      reasons.push("Missing Card Info")
    }
    
    if (!prediction.billing_address_country && !prediction.ip_address) {
      reasons.push("Location Unknown")
    }
    
    if (prediction.amount > 100) {
      reasons.push("High Value Transaction")
    }
    
    if (reasons.length === 0) {
      reasons.push("High Chargeback Risk")
    }
    
    return reasons
  }

  const handleViewDetails = (prediction: ChargebackPrediction) => {
    // Add status and chargebackProbability for compatibility with TransactionDetailsDialog
    const enhancedTransaction = {
      ...prediction,
      status: "completed",
      chargebackProbability: prediction.chargeback_confidence,
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
          <p className="text-muted-foreground">Loading chargeback predictions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-red-600">
          <p className="text-sm">Error loading chargeback predictions</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">No chargeback predictions found</p>
          <p className="text-xs text-muted-foreground">Transactions with high chargeback risk will appear here</p>
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
            <TableHead>Chargeback Risk</TableHead>
            <TableHead>Risk Factors</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.map((prediction) => (
            <TableRow key={prediction._id}>
              <TableCell className="font-medium">{prediction.transaction_id}</TableCell>
              <TableCell>{formatDate(prediction.created_at)}</TableCell>
              <TableCell>{formatCurrency(prediction.amount, prediction.currency)}</TableCell>
              <TableCell>{prediction.email}</TableCell>
              <TableCell>{getGatewayBadge(prediction.gateway)}</TableCell>
              <TableCell>
                <Badge variant="destructive">{prediction.chargeback_confidence}%</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getChargebackReasons(prediction).map((reason, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-destructive/10 text-destructive border-destructive/20"
                    >
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
                    <DropdownMenuItem onClick={() => handleViewDetails(prediction)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleMarkTransaction(prediction._id, true)}>
                      <Shield className="mr-2 h-4 w-4 text-primary" />
                      Mark as Safe
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkTransaction(prediction._id, false)}>
                      <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                      Confirm as Chargeback
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
