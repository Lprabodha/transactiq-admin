"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Customer, ApiService } from "@/lib/api-service"
import { MapPin, Phone, Mail, DollarSign, Calendar, CreditCard, Shield } from "lucide-react"

interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

export function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
  if (!customer) return null

  const formatDate = (dateString: string) => {
    return ApiService.formatDate(dateString)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return ApiService.formatCurrency(amount, currency)
  }

  const getStatusBadge = () => {
    if (customer.delinquent) {
      return <Badge variant="destructive">Delinquent</Badge>
    }
    if (customer.balance > 0) {
      return <Badge variant="secondary">Credit</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Customer Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about {customer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {customer.email}
                  </div>
                </div>
                {customer.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {customer.phone}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Balance</label>
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(customer.balance, customer.currency)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <p className="text-sm uppercase">{customer.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Default Payment Method</label>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    {customer.default_payment_method || 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Invoice Prefix</label>
                  <p className="text-sm font-mono">{customer.invoice_prefix}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          {(customer.country || customer.city || customer.state) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {customer.country && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {customer.country}
                      </div>
                    </div>
                  )}
                  {customer.city && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">City</label>
                      <p className="text-sm">{customer.city}</p>
                    </div>
                  )}
                  {customer.state && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">State</label>
                      <p className="text-sm">{customer.state}</p>
                    </div>
                  )}
                  {customer.postal_code && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                      <p className="text-sm">{customer.postal_code}</p>
                    </div>
                  )}
                </div>
                {(customer.address_line1 || customer.address_line2) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="text-sm space-y-1">
                      {customer.address_line1 && <p>{customer.address_line1}</p>}
                      {customer.address_line2 && <p>{customer.address_line2}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(customer.created_at)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                  <p className="text-sm font-mono">{customer._id}</p>
                </div>
              </div>

              {/* Tax Information */}
              {customer.tax_info && (customer.tax_info.tax_id || customer.tax_info.type) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tax Information</label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {customer.tax_info.tax_id && (
                      <div>
                        <span className="text-xs text-muted-foreground">Tax ID</span>
                        <p className="text-sm">{customer.tax_info.tax_id}</p>
                      </div>
                    )}
                    {customer.tax_info.type && (
                      <div>
                        <span className="text-xs text-muted-foreground">Type</span>
                        <p className="text-sm">{customer.tax_info.type}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Gateway Customer IDs */}
              {customer.gateway_customer_ids && Object.keys(customer.gateway_customer_ids).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gateway Customer IDs</label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(customer.gateway_customer_ids).map(([gateway, id]) => (
                      <div key={gateway} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{gateway}</span>
                        <span className="text-sm font-mono">{id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {customer.metadata && Object.keys(customer.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(customer.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Edit Customer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
