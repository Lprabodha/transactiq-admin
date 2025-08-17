"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, X, Calendar, DollarSign, Shield, CreditCard, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from '@/components/ui/calendar'
import { format } from 'date-fns'

export interface TransactionFilters {
  search: string
  status: string[]
  gateway: string[]
  paymentMethod: string[]
  riskScoreRange: [number, number]
  amountRange: [number, number]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  fraudDetected: boolean | null
  chargebackPredicted: boolean | null
  country: string[]
  currency: string[]
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  onReset: () => void
  totalTransactions: number
  filteredCount: number
}

const defaultFilters: TransactionFilters = {
  search: '',
  status: [],
  gateway: [],
  paymentMethod: [],
  riskScoreRange: [0, 100],
  amountRange: [0, 10000],
  dateRange: {
    from: undefined,
    to: undefined
  },
  fraudDetected: null,
  chargebackPredicted: null,
  country: [],
  currency: []
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  onReset,
  totalTransactions,
  filteredCount
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleReset = () => {
    setLocalFilters(defaultFilters)
    onReset()
  }

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== undefined && v !== null)
    }
    return value !== '' && value !== null && value !== undefined
  }).length

  const getStatusOptions = () => [
    { value: 'succeeded', label: 'Succeeded', color: 'bg-green-100 text-green-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
    { value: 'canceled', label: 'Canceled', color: 'bg-gray-100 text-gray-800' }
  ]

  const getGatewayOptions = () => [
    { value: 'Stripe', label: 'Stripe' },
    { value: 'SolidGate', label: 'SolidGate' },
    { value: 'PayPal', label: 'PayPal' }
  ]

  const getPaymentMethodOptions = () => [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'digital_wallet', label: 'Digital Wallet' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ]

  const getCountryOptions = () => [
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'AU', label: 'Australia' }
  ]

  const getCurrencyOptions = () => [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' }
  ]

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Transaction Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredCount} of {totalTransactions} transactions
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions, customer emails, transaction IDs..."
              value={localFilters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filters.fraudDetected === true ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('fraudDetected', filters.fraudDetected === true ? null : true)}
            >
              <Shield className="h-4 w-4 mr-2" />
              Fraud
            </Button>
            <Button
              variant={filters.chargebackPredicted === true ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('chargebackPredicted', filters.chargebackPredicted === true ? null : false)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Chargeback Risk
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.status.map(status => (
              <Badge key={status} variant="secondary" className="gap-1">
                Status: {status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', filters.status.filter(s => s !== status))}
                />
              </Badge>
            ))}
            {filters.gateway.map(gateway => (
              <Badge key={gateway} variant="secondary" className="gap-1">
                Gateway: {gateway}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('gateway', filters.gateway.filter(g => g !== gateway))}
                />
              </Badge>
            ))}
            {filters.riskScoreRange[0] > 0 || filters.riskScoreRange[1] < 100 ? (
              <Badge variant="secondary" className="gap-1">
                Risk: {filters.riskScoreRange[0]}-{filters.riskScoreRange[1]}%
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('riskScoreRange', [0, 100])}
                />
              </Badge>
            ) : null}
            {filters.amountRange[0] > 0 || filters.amountRange[1] < 10000 ? (
              <Badge variant="secondary" className="gap-1">
                Amount: ${filters.amountRange[0]}-${filters.amountRange[1]}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('amountRange', [0, 10000])}
                />
              </Badge>
            ) : null}
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Clear All
            </Button>
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="space-y-2">
                {getStatusOptions().map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('status', [...filters.status, option.value])
                        } else {
                          updateFilter('status', filters.status.filter(s => s !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Gateway Filter */}
            <div className="space-y-2">
              <Label>Payment Gateway</Label>
              <div className="space-y-2">
                {getGatewayOptions().map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gateway-${option.value}`}
                      checked={filters.gateway.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('gateway', [...filters.gateway, option.value])
                        } else {
                          updateFilter('gateway', filters.gateway.filter(g => g !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`gateway-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="space-y-2">
                {getPaymentMethodOptions().map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`method-${option.value}`}
                      checked={filters.paymentMethod.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFilter('paymentMethod', [...filters.paymentMethod, option.value])
                        } else {
                          updateFilter('paymentMethod', filters.paymentMethod.filter(m => m !== option.value))
                        }
                      }}
                    />
                    <Label htmlFor={`method-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Score Range */}
            <div className="space-y-2">
              <Label>Risk Score Range: {filters.riskScoreRange[0]}% - {filters.riskScoreRange[1]}%</Label>
              <Slider
                value={filters.riskScoreRange}
                onValueChange={(value) => updateFilter('riskScoreRange', value as [number, number])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Amount Range: ${filters.amountRange[0]} - ${filters.amountRange[1]}</Label>
              <Slider
                value={filters.amountRange}
                onValueChange={(value) => updateFilter('amountRange', value as [number, number])}
                max={10000}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Country Filter */}
            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !filters.country.includes(value)) {
                    updateFilter('country', [...filters.country, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add country filter" />
                </SelectTrigger>
                <SelectContent>
                  {getCountryOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.country.map(country => (
                  <Badge key={country} variant="outline" className="gap-1">
                    {country}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('country', filters.country.filter(c => c !== country))}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Currency Filter */}
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !filters.currency.includes(value)) {
                    updateFilter('currency', [...filters.currency, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add currency filter" />
                </SelectTrigger>
                <SelectContent>
                  {getCurrencyOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.currency.map(currency => (
                  <Badge key={currency} variant="outline" className="gap-1">
                    {currency}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('currency', filters.currency.filter(c => c !== currency))}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
