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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Shield } from "lucide-react"

interface MarkTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  isSafe: boolean
}

export function MarkTransactionDialog({ open, onOpenChange, transactionId, isSafe }: MarkTransactionDialogProps) {
  const [notes, setNotes] = useState("")
  const [retrainModel, setRetrainModel] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log("Transaction marked:", { transactionId, isSafe, notes, retrainModel })
    // Reset form and close dialog
    setNotes("")
    setRetrainModel(true)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSafe ? (
                <>
                  <Shield className="h-5 w-5 text-primary" />
                  Mark as Safe
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Mark as Fraudulent
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isSafe
                ? "This will mark the transaction as safe and update the fraud detection system."
                : "This will mark the transaction as fraudulent and update the fraud detection system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about this decision"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="retrain" checked={retrainModel} onCheckedChange={(checked) => setRetrainModel(!!checked)} />
              <Label htmlFor="retrain" className="text-sm">
                Use this data to retrain the fraud detection model
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={isSafe ? "default" : "destructive"} className="gap-1">
              {isSafe ? (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Confirm Safe</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>Confirm Fraud</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
