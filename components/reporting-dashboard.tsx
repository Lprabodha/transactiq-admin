"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  FileSpreadsheet, 
  File, 
  Download, 
  BarChart3, 
  Shield, 
  CreditCard, 
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import { ExportReports, ExportOptions } from './export-reports'
import { exportData, filterDataForExport } from '@/utils/export-utils'
import { ApiService } from '@/lib/api-service'

interface ReportTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: 'fraud' | 'chargeback' | 'business' | 'compliance'
  defaultFormat: 'csv' | 'excel' | 'pdf'
  quickExport: boolean
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'fraud-summary',
    name: 'Fraud Summary Report',
    description: 'Comprehensive overview of fraud detection activities and risk assessment',
    icon: Shield,
    category: 'fraud',
    defaultFormat: 'pdf',
    quickExport: true
  },
  {
    id: 'high-risk-transactions',
    name: 'High Risk Transactions',
    description: 'List of transactions with risk scores above 70%',
    icon: AlertTriangle,
    category: 'fraud',
    defaultFormat: 'excel',
    quickExport: true
  },
  {
    id: 'chargeback-analysis',
    name: 'Chargeback Analysis',
    description: 'Detailed chargeback predictions and risk assessment',
    icon: CreditCard,
    category: 'chargeback',
    defaultFormat: 'excel',
    quickExport: true
  },
  {
    id: 'transaction-summary',
    name: 'Transaction Summary',
    description: 'Complete transaction overview with fraud and chargeback metrics',
    icon: BarChart3,
    category: 'business',
    defaultFormat: 'csv',
    quickExport: true
  },
  {
    id: 'gateway-performance',
    name: 'Gateway Performance',
    description: 'Payment gateway performance analysis and fraud rates',
    icon: TrendingUp,
    category: 'business',
    defaultFormat: 'pdf',
    quickExport: false
  },
  {
    id: 'customer-risk-profile',
    name: 'Customer Risk Profiles',
    description: 'Customer risk assessment and fraud history',
    icon: Users,
    category: 'fraud',
    defaultFormat: 'excel',
    quickExport: false
  },
  {
    id: 'revenue-impact',
    name: 'Revenue Impact Analysis',
    description: 'Financial impact of fraud and chargebacks on revenue',
    icon: DollarSign,
    category: 'business',
    defaultFormat: 'pdf',
    quickExport: false
  },
  {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'Regulatory compliance and audit trail documentation',
    icon: FileText,
    category: 'compliance',
    defaultFormat: 'pdf',
    quickExport: false
  }
]

export function ReportingDashboard() {
  const [exportLoading, setExportLoading] = useState(false)
  const [showAdvancedExport, setShowAdvancedExport] = useState(false)

  const handleQuickExport = async (template: ReportTemplate) => {
    try {
      setExportLoading(true)
      
      const response = await ApiService.getTransactions({ limit: 1000 })
      
      if (response.success && response.data) {
        let dataToExport = response.data
        
        // Apply template-specific filtering
        switch (template.id) {
          case 'fraud-summary':
            dataToExport = response.data.filter((t: any) => 
              t.fraud_detected || (t.risk_score || 0) > 50
            )
            break
          case 'high-risk-transactions':
            dataToExport = response.data.filter((t: any) => 
              (t.risk_score || 0) > 70
            )
            break
          case 'chargeback-analysis':
            dataToExport = response.data.filter((t: any) => 
              t.chargeback_predicted || (t.chargeback_confidence || 0) > 40
            )
            break
          case 'gateway-performance':
            dataToExport = response.data.filter((t: any) => 
              t.gateway && t.status
            )
            break
          case 'customer-risk-profile':
            dataToExport = response.data.filter((t: any) => 
              t.email && (t.risk_score || 0) > 0
            )
            break
          case 'revenue-impact':
            dataToExport = response.data.filter((t: any) => 
              t.amount && (t.fraud_detected || t.chargeback_predicted)
            )
            break
        }
        
        if (dataToExport.length > 0) {
          const exportOptions: ExportOptions = {
            format: template.defaultFormat,
            dateRange: { from: undefined, to: undefined },
            includeFields: [
              'transaction_id', 'email', 'amount', 'currency', 'status', 
              'gateway', 'risk_score', 'fraud_detected', 'chargeback_predicted',
              'chargeback_confidence', 'created_at'
            ],
            filters: {},
            reportType: template.id as any
          }
          
          await exportData(dataToExport, exportOptions)
        } else {
          alert(`No data available for ${template.name}`)
        }
      } else {
        alert('No data available for export')
      }
      
    } catch (error) {
      console.error('Quick export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const handleAdvancedExport = async (options: ExportOptions) => {
    try {
      setExportLoading(true)
      
      const response = await ApiService.getTransactions({ limit: 1000 })
      
      if (response.success && response.data) {
        let dataToExport = response.data
        
        if (options.reportType === 'fraud-analysis') {
          dataToExport = response.data.filter((t: any) => 
            t.fraud_detected || (t.risk_score || 0) > 70
          )
        } else if (options.reportType === 'chargeback-predictions') {
          dataToExport = response.data.filter((t: any) => 
            t.chargeback_predicted || (t.chargeback_confidence || 0) > 60
          )
        }
        
        if (dataToExport.length > 0) {
          const filteredData = filterDataForExport(dataToExport, options)
          await exportData(filteredData, options)
        } else {
          alert('No data available for export')
        }
      } else {
        alert('No data available for export')
      }
      
    } catch (error) {
      console.error('Advanced export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fraud':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'chargeback':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'business':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'compliance':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reporting & Analytics</h2>
          <p className="text-muted-foreground">
            Generate comprehensive reports for fraud detection, chargeback analysis, and business insights.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvancedExport(!showAdvancedExport)}
        >
          {showAdvancedExport ? 'Hide' : 'Show'} Advanced Export
        </Button>
      </div>

      {/* Quick Export Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((template) => {
          const Icon = template.icon
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getCategoryColor(template.category)}`}
                  >
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {getFormatIcon(template.defaultFormat)}
                    {template.defaultFormat.toUpperCase()}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleQuickExport(template)}
                    disabled={exportLoading}
                    className="gap-2"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Advanced Export Options */}
      {showAdvancedExport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Export Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExportReports onExport={handleAdvancedExport} isLoading={exportLoading} />
          </CardContent>
        </Card>
      )}

      {/* Export Status */}
      {exportLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800">Generating report...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
