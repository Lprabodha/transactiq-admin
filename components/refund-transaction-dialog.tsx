"use client"

import type React from "react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface RefundTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  amount: number
  currency: string
}

export function RefundTransactionDialog({
  open,
  onOpenChange,
  transactionId,
  amount,
  currency,
}: RefundTransactionDialogProps) {
  const [refundAmount, setRefundAmount] = useState(amount)
  const [reason, setReason] = useState("")
  const [fullRefund, setFullRefund] = useState(true)

  const formatCurrency = (amount: number, currency: string) => {
    // Validate currency code and provide fallback
    const validCurrency = currency && currency.length === 3 ? currency.toUpperCase() : "USD"
    
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: validCurrency,
      }).format(amount)
    } catch (error) {
      // Log the error and fallback to USD if currency is still invalid
      console.warn("Invalid currency code:", validCurrency, error)
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
    }
  }

  const handleFullRefundChange = (checked: boolean) => {
    setFullRefund(checked)
    if (checked) {
      setRefundAmount(amount)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log("Refund submitted:", { refundAmount, reason, transactionId })
    // Reset form and close dialog
    setReason("")
    setFullRefund(true)
    setRefundAmount(amount)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Refund Transaction</DialogTitle>
            <DialogDescription>
              Process a refund for transaction {transactionId}. This will send a refund request to the payment gateway.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="full-refund" checked={fullRefund} onCheckedChange={handleFullRefundChange} />
              <Label htmlFor="full-refund">Full refund ({formatCurrency(amount, currency)})</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number.parseFloat(e.target.value))}
                disabled={fullRefund}
                max={amount}
                min={0}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Refund</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for this refund"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Process Refund</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
