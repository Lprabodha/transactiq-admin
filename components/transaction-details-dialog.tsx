"use client"

import { useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Shield, AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react"
import { type Transaction } from "@/lib/api-service"
import { MarkTransactionDialog } from "@/components/mark-transaction-dialog"
import { toast } from "sonner"

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  transaction: Transaction | null
  onTransactionUpdate?: () => void
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transactionId,
  transaction,
  onTransactionUpdate,
}: TransactionDetailsDialogProps) {
  const [markDialog, setMarkDialog] = useState({ open: false, isSafe: false })

  if (!transaction) {
    return null
  }

  const handleExportTransaction = () => {
    try {
      // Create CSV content from transaction data
      const fields = [
        'transaction_id', 'email', 'amount', 'currency', 'status', 'gateway',
        'payment_method', 'card_brand', 'risk_score', 'chargeback_confidence',
        'created_at', 'ip_address', 'billing_address_country'
      ]
      
      const headers = fields.map(f => f.replace(/_/g, ' ').toUpperCase())
      const values = fields.map(f => {
        const value = (transaction as any)[f]
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        // Escape commas and quotes
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      
      const csvContent = [headers.join(','), values.join(',')].join('\n')
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `transaction-${transaction.transaction_id}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Export Successful', {
        description: 'Transaction details exported to CSV'
      })
    } catch (error) {
      console.error('[TransactionDetails] Export error:', error)
      toast.error('Export Failed', {
        description: 'Failed to export transaction details'
      })
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
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
    if (risk < 30) return "default"
    if (risk < 70) return "secondary"
    return "destructive"
  }

  const getStatusBadgeVariant = (status: string) => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      paid: "default",
      pending: "secondary",
      failed: "destructive",
    }
    return statusMap[status] || "outline"
  }

  const DetailRow = ({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) => (
    <div className={className}>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            <Badge variant={getStatusBadgeVariant(transaction.status)} className="ml-2">
              {transaction.status}
            </Badge>
            {transaction.chargeback_predicted && (
              <Badge variant="destructive" className="ml-2">
                Chargeback Risk
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>Detailed information about transaction {transaction.transaction_id}.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Basic Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Transaction ID" value={<span className="font-mono">{transaction.transaction_id}</span>} />
              <DetailRow label="Date" value={formatDate(transaction.created_at)} />
              <DetailRow 
                label="Amount" 
                value={<span className="text-lg font-bold text-primary">{formatCurrency(transaction.amount, transaction.currency)}</span>} 
              />
              <DetailRow 
                label="Gateway" 
                value={
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {transaction.gateway}
                  </Badge>
                } 
              />
              <DetailRow label="Customer Email" value={transaction.billing_email || transaction.email || 'N/A'} />
              <DetailRow label="IP Address" value={transaction.ip_address || 'N/A'} />
            </div>

            {/* Payment Details */}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Payment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Payment Method" value={<span className="capitalize">{transaction.payment_method}</span>} />
                <DetailRow label="Card Brand" value={<span className="capitalize">{transaction.card_brand}</span>} />
                <DetailRow label="Card Country" value={transaction.card_country || 'N/A'} />
                <DetailRow label="Funding Type" value={<span className="capitalize">{transaction.funding_type || 'N/A'}</span>} />
                <DetailRow 
                  label="CVC Check" 
                  value={
                    <Badge variant={transaction.cvc_check === "pass" ? "default" : "destructive"} className="capitalize">
                      {transaction.cvc_check || 'N/A'}
                    </Badge>
                  } 
                />
                <DetailRow label="3D Secure" value={transaction.three_d_secure || "Not used"} />
              </div>
            </div>

            {/* Risk Assessment */}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Risk Assessment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow 
                  label="Fraud Risk Score" 
                  value={
                    <Badge variant={getRiskBadgeVariant(transaction.risk_score)} className="text-base">
                      {transaction.risk_score}%
                    </Badge>
                  } 
                />
                <DetailRow 
                  label="Chargeback Confidence" 
                  value={
                    <Badge variant={getRiskBadgeVariant(transaction.chargeback_confidence * 100)} className="text-base">
                      {(transaction.chargeback_confidence * 100).toFixed(1)}%
                    </Badge>
                  } 
                />
                <DetailRow 
                  label="Risk Level" 
                  value={
                    <Badge variant={transaction.risk_level === "elevated" ? "destructive" : "default"} className="capitalize">
                      {transaction.risk_level}
                    </Badge>
                  } 
                />
                <DetailRow 
                  label="Chargeback Predicted" 
                  value={
                    <Badge variant={transaction.chargeback_predicted ? "destructive" : "default"}>
                      {transaction.chargeback_predicted ? "Yes" : "No"}
                    </Badge>
                  } 
                />
              </div>
            </div>

            {/* Recommendations */}
            {transaction.recommendations && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      Recommendations
                    </h3>
                    <Badge 
                      variant={
                        transaction.recommendations.priority === "high" ? "destructive" : 
                        transaction.recommendations.priority === "medium" ? "default" : 
                        "secondary"
                      }
                      className="capitalize"
                    >
                      {transaction.recommendations.priority} Priority
                    </Badge>
                  </div>
                  
                  {/* Summary */}
                  {transaction.recommendations.summary && (
                    <div className="mb-4 p-4 bg-muted/50 rounded-lg border">
                      <h4 className="font-semibold mb-3">Risk Summary</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fraud Detection:</span>
                          <Badge variant={transaction.recommendations.summary.fraud_detected ? "destructive" : "default"} className="h-6">
                            {transaction.recommendations.summary.fraud_detected ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fraud Confidence:</span>
                          <span className="font-medium">{((transaction.recommendations.summary.fraud_confidence || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fraud Level:</span>
                          <span className="font-medium capitalize">{transaction.recommendations.summary.fraud_level || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chargeback Risk:</span>
                          <span className="font-medium">{((transaction.recommendations.summary.chargeback_confidence || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {transaction.recommendations.reasons && transaction.recommendations.reasons.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Risk Factors Detected</h4>
                      <ul className="space-y-2">
                        {transaction.recommendations.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {transaction.recommendations.recommended_actions && transaction.recommendations.recommended_actions.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Actions</h4>
                      <ul className="space-y-2">
                        {transaction.recommendations.recommended_actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Billing Information */}
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Name" value={transaction.billing_name || "N/A"} />
                <DetailRow label="Phone" value={transaction.billing_phone || "N/A"} />
                <DetailRow 
                  label="Address" 
                  value={
                    [
                      transaction.billing_address_line1,
                      transaction.billing_address_line2,
                      transaction.billing_address_city,
                      transaction.billing_address_state,
                      transaction.billing_address_postal_code,
                      transaction.billing_address_country
                    ].filter(Boolean).join(", ") || "N/A"
                  } 
                  className="col-span-2"
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2 flex-1 sm:flex-none">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleExportTransaction}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => setMarkDialog({ open: true, isSafe: true })}
            >
              <Shield className="h-4 w-4" />
              Mark Safe
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setMarkDialog({ open: true, isSafe: false })}
            >
              <AlertTriangle className="h-4 w-4" />
              Mark Fraud
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <MarkTransactionDialog
        open={markDialog.open}
        onOpenChange={(open) => setMarkDialog({ ...markDialog, open })}
        transactionId={transaction.transaction_id}
        isSafe={markDialog.isSafe}
        onSuccess={() => {
          if (onTransactionUpdate) {
            onTransactionUpdate()
          }
        }}
      />
    </Dialog>
  )
}
