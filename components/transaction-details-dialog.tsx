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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Shield, AlertTriangle, Info } from "lucide-react"
import { type Transaction, ApiService } from "@/lib/api-service"

interface TransactionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  transaction: Transaction | null
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transactionId,
  transaction,
}: TransactionDetailsDialogProps) {
  if (!transaction) {
    return null
  }

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
    if (risk < 30) return "default"
    if (risk < 70) return "secondary"
    return "destructive"
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
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

  const getPriorityBadge = (priority: string) => {
    const variant = priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary"
    return (
      <Badge variant={variant}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </Badge>
    )
  }

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
          <div className="grid gap-6 py-4">
            {/* Basic Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <p className="text-sm font-bold">{transaction.transaction_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">{formatDate(transaction.created_at)}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Customer Email</p>
                <p className="text-sm">{transaction.billing_email || transaction.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                <p className="text-sm">{transaction.ip_address}</p>
              </div>
            </div>

            {/* Payment Details */}
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-3">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <p className="text-sm capitalize">{transaction.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Card Brand</p>
                  <p className="text-sm capitalize">{transaction.card_brand}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Card Country</p>
                  <p className="text-sm">{transaction.card_country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Funding Type</p>
                  <p className="text-sm capitalize">{transaction.funding_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CVC Check</p>
                  <Badge variant={transaction.cvc_check === "pass" ? "default" : "destructive"}>
                    {transaction.cvc_check}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">3D Secure</p>
                  <p className="text-sm">{transaction.three_d_secure || "Not used"}</p>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-3">Risk Assessment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fraud Risk Score</p>
                  <Badge variant={getRiskBadgeVariant(transaction.risk_score)} className="mt-1">
                    {transaction.risk_score}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chargeback Confidence</p>
                  <Badge variant={getRiskBadgeVariant(transaction.chargeback_confidence * 100)} className="mt-1">
                    {(transaction.chargeback_confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risk Level</p>
                  <Badge variant={transaction.risk_level === "elevated" ? "destructive" : "default"}>
                    {transaction.risk_level}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chargeback Predicted</p>
                  <Badge variant={transaction.chargeback_predicted ? "destructive" : "default"}>
                    {transaction.chargeback_predicted ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {transaction.recommendations && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5" />
                    <h3 className="text-lg font-medium">AI Recommendations</h3>
                    {getPriorityBadge(transaction.recommendations.priority)}
                  </div>
                  
                  {/* Summary */}
                  <div className="mb-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Risk Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Fraud Detection: {transaction.recommendations.summary.fraud_detected ? "Yes" : "No"}</div>
                      <div>Fraud Confidence: {(transaction.recommendations.summary.fraud_confidence * 100).toFixed(1)}%</div>
                      <div>Fraud Level: <span className="capitalize">{transaction.recommendations.summary.fraud_level}</span></div>
                      <div>Chargeback Risk: {(transaction.recommendations.summary.chargeback_confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  {transaction.recommendations.reasons.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Risk Factors Detected</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {transaction.recommendations.reasons.map((reason, index) => (
                          <li key={index} className="text-muted-foreground">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Actions */}
                  {transaction.recommendations.recommended_actions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {transaction.recommendations.recommended_actions.map((action, index) => (
                          <li key={index} className="text-muted-foreground">{action}</li>
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
              <h3 className="text-lg font-medium mb-3">Billing Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{transaction.billing_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{transaction.billing_phone || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">
                    {(() => {
                      const billingAddress = [
                        transaction.billing_address_line1,
                        transaction.billing_address_line2,
                        transaction.billing_address_city,
                        transaction.billing_address_state,
                        transaction.billing_address_postal_code,
                        transaction.billing_address_country
                      ].filter(Boolean).join(", ");

                      if (billingAddress) {
                        return billingAddress;
                      }

                      // If no billing address, try to show enhanced customer location
                      const enhancedTransaction = transaction as Transaction & { enhancedCustomerInfo?: Partial<any> }
                      const location = ApiService.getBestLocation(enhancedTransaction);
                      
                      if (location) {
                        const locationStr = [location.city, location.state, location.country].filter(Boolean).join(", ");
                        return locationStr ? `${locationStr} (from customer data)` : "N/A";
                      }

                      return "N/A";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

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
