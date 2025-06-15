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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface BlockUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  customerEmail: string
}

export function BlockUserDialog({ open, onOpenChange, transactionId, customerEmail }: BlockUserDialogProps) {
  const [blockType, setBlockType] = useState("user")
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your API
    console.log("Block submitted:", { blockType, reason, transactionId, customerEmail })
    // Reset form and close dialog
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Block Payment or User</DialogTitle>
            <DialogDescription>
              This will add the user or payment method to the blocklist. Future transactions will be automatically
              rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup value={blockType} onValueChange={setBlockType} className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user">Block User</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payment" id="payment" />
                <Label htmlFor="payment">Block Payment Method</Label>
              </div>
            </RadioGroup>

            <div className="grid gap-2">
              <Label>Affected Entity</Label>
              <Input value={blockType === "user" ? customerEmail : `Payment for ${transactionId}`} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Blocking</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a reason for blocking this user or payment method"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Confirm Block
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
