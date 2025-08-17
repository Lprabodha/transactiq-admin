"use client"

import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, File, Calendar as CalendarIcon, Filter, BarChart3, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { TransactionFilters } from './transaction-filters'

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  includeFields: string[]
  filters: Partial<TransactionFilters>
  reportType: 'transactions' | 'fraud-analysis' | 'chargeback-predictions' | 'custom'
  customTitle?: string
}

interface ExportReportsProps {
  readonly onExport: (options: ExportOptions) => Promise<void>
  readonly isLoading?: boolean
}

const defaultExportOptions: ExportOptions = {
  format: 'csv',
  dateRange: {
    from: undefined,
    to: undefined
  },
  includeFields: ['transaction_id', 'email', 'amount', 'currency', 'status', 'gateway', 'risk_score', 'created_at'],
  filters: {},
  reportType: 'transactions'
}

const fieldOptions = [
  { value: 'transaction_id', label: 'Transaction ID' },
  { value: 'email', label: 'Customer Email' },
  { value: 'amount', label: 'Amount' },
  { value: 'currency', label: 'Currency' },
  { value: 'status', label: 'Status' },
  { value: 'gateway', label: 'Payment Gateway' },
  { value: 'payment_method', label: 'Payment Method' },
  { value: 'risk_score', label: 'Risk Score' },
  { value: 'fraud_detected', label: 'Fraud Detected' },
  { value: 'chargeback_predicted', label: 'Chargeback Predicted' },
  { value: 'chargeback_confidence', label: 'Chargeback Confidence' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'billing_address_country', label: 'Billing Country' },
  { value: 'ip_address', label: 'IP Address' },
  { value: 'card_brand', label: 'Card Brand' },
  { value: 'funding_type', label: 'Funding Type' }
]

const reportTypeOptions = [
  { value: 'transactions', label: 'Transaction Report', icon: FileText },
  { value: 'fraud-analysis', label: 'Fraud Analysis Report', icon: Shield },
  { value: 'chargeback-predictions', label: 'Chargeback Predictions', icon: BarChart3 },
  { value: 'custom', label: 'Custom Report', icon: Filter }
]

export function ExportReports({ onExport, isLoading = false }: ExportReportsProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>(defaultExportOptions)
  const [isExpanded, setIsExpanded] = useState(false)

  const updateExportOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleExport = async () => {
    try {
      await onExport(exportOptions)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileText className="h-4 w-4" />
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'pdf':
        return <File className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'csv':
        return 'CSV'
      case 'excel':
        return 'Excel'
      case 'pdf':
        return 'PDF'
      default:
        return 'CSV'
    }
  }

  const toggleField = (field: string) => {
    const newFields = exportOptions.includeFields.includes(field)
      ? exportOptions.includeFields.filter(f => f !== field)
      : [...exportOptions.includeFields, field]
    updateExportOption('includeFields', newFields)
  }

  const selectAllFields = () => {
    updateExportOption('includeFields', fieldOptions.map(f => f.value))
  }

  const deselectAllFields = () => {
    updateExportOption('includeFields', [])
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Reports
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'} Options
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Export Options */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateExportOption('reportType', 'transactions')
              updateExportOption('format', 'csv')
              handleExport()
            }}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Quick CSV Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateExportOption('reportType', 'fraud-analysis')
              updateExportOption('format', 'pdf')
              handleExport()
            }}
            disabled={isLoading}
          >
            <File className="h-4 w-4 mr-2" />
            Fraud Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateExportOption('reportType', 'chargeback-predictions')
              updateExportOption('format', 'excel')
              handleExport()
            }}
            disabled={isLoading}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Chargeback Report
          </Button>
        </div>

        {/* Expanded Options */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Report Type and Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={exportOptions.reportType}
                  onValueChange={(value) => updateExportOption('reportType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypeOptions.map(option => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value) => updateExportOption('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['csv', 'excel', 'pdf'].map(format => (
                      <SelectItem key={format} value={format}>
                        <div className="flex items-center gap-2">
                          {getFormatIcon(format)}
                          {getFormatLabel(format)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportOptions.dateRange.from ? format(exportOptions.dateRange.from, "PPP") : "From date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exportOptions.dateRange.from}
                      onSelect={(date) => updateExportOption('dateRange', { ...exportOptions.dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportOptions.dateRange.to ? format(exportOptions.dateRange.to, "PPP") : "To date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exportOptions.dateRange.to}
                      onSelect={(date) => updateExportOption('dateRange', { ...exportOptions.dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Custom Title for Custom Reports */}
            {exportOptions.reportType === 'custom' && (
              <div className="space-y-2">
                <Label>Report Title</Label>
                <Input
                  placeholder="Enter custom report title..."
                  value={exportOptions.customTitle || ''}
                  onChange={(e) => updateExportOption('customTitle', e.target.value)}
                />
              </div>
            )}

            {/* Fields to Include */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fields to Include</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllFields}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllFields}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border rounded-md p-3">
                {fieldOptions.map(field => (
                  <div key={field.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field.value}`}
                      checked={exportOptions.includeFields.includes(field.value)}
                      onCheckedChange={() => toggleField(field.value)}
                    />
                    <Label htmlFor={`field-${field.value}`} className="text-sm">
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={isLoading || exportOptions.includeFields.length === 0}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
