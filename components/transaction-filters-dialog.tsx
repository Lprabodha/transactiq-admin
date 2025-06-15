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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface TransactionFiltersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionFiltersDialog({ open, onOpenChange }: TransactionFiltersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
          <DialogDescription>Set filters to narrow down transaction results.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="gateway">Payment Gateway</Label>
              <Select>
                <SelectTrigger id="gateway">
                  <SelectValue placeholder="All Gateways" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Gateways</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="solidgate">SolidGate</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="adyen">Adyen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Fraud Risk Range</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm">0%</span>
              <Slider defaultValue={[0, 100]} max={100} step={1} />
              <span className="text-sm">100%</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Chargeback Probability Range</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm">0%</span>
              <Slider defaultValue={[0, 100]} max={100} step={1} />
              <span className="text-sm">100%</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount-min">Amount Range</Label>
            <div className="flex items-center gap-4">
              <Input id="amount-min" type="number" placeholder="Min" />
              <span>to</span>
              <Input id="amount-max" type="number" placeholder="Max" />
              <Select defaultValue="USD">
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
