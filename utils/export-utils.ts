import { ExportOptions, TransactionFilters } from '@/components/export-reports'

// CSV Export
export function exportToCSV(data: any[], options: ExportOptions): void {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Filter data based on selected fields
  const filteredData = data.map(item => {
    const filteredItem: any = {}
    options.includeFields.forEach(field => {
      if (item[field] !== undefined) {
        filteredItem[field] = item[field]
      }
    })
    return filteredItem
  })

  // Convert to CSV
  const headers = options.includeFields.map(field => 
    field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  )
  
  const csvContent = [
    headers.join(','),
    ...filteredData.map(row => 
      options.includeFields.map(field => {
        const value = row[field]
        if (value === null || value === undefined) return ''
        // Escape commas and quotes in CSV
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${options.reportType}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Excel Export (using SheetJS library)
export async function exportToExcel(data: any[], options: ExportOptions): Promise<void> {
  try {
    // Dynamic import to avoid bundling issues
    const XLSX = await import('xlsx')
    
    if (data.length === 0) {
      alert('No data to export')
      return
    }

    // Filter data based on selected fields
    const filteredData = data.map(item => {
      const filteredItem: any = {}
      options.includeFields.forEach(field => {
        if (item[field] !== undefined) {
          filteredItem[field] = item[field]
        }
      })
      return filteredItem
    })

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(filteredData)

    // Auto-size columns
    const columnWidths = options.includeFields.map(field => {
      const maxLength = Math.max(
        field.length,
        ...filteredData.map(row => String(row[field] || '').length)
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, options.reportType)

    // Generate filename
    const filename = `${options.reportType}-${new Date().toISOString().split('T')[0]}.xlsx`

    // Save file
    XLSX.writeFile(workbook, filename)
  } catch (error) {
    console.error('Excel export failed:', error)
    alert('Excel export failed. Please try CSV export instead.')
  }
}

// PDF Export (using jsPDF library)
export async function exportToPDF(data: any[], options: ExportOptions): Promise<void> {
  try {
    // Dynamic import to avoid bundling issues
    const { jsPDF } = await import('jspdf')
    await import('jspdf-autotable')
    
    if (data.length === 0) {
      alert('No data to export')
      return
    }

    // Create PDF document
    const doc = new jsPDF()
    
    // Add title
    const title = options.customTitle || `${options.reportType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report`
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    
    // Add date range if specified
    if (options.dateRange.from || options.dateRange.to) {
      doc.setFontSize(12)
      const dateText = `Date Range: ${options.dateRange.from ? options.dateRange.from.toLocaleDateString() : 'All'} - ${options.dateRange.to ? options.dateRange.to.toLocaleDateString() : 'All'}`
      doc.text(dateText, 14, 32)
    }

    // Filter data based on selected fields
    const filteredData = data.map(item => {
      const filteredItem: any = {}
      options.includeFields.forEach(field => {
        if (item[field] !== undefined) {
          filteredItem[field] = item[field]
        }
      })
      return filteredItem
    })

    // Prepare table data
    const headers = options.includeFields.map(field => 
      field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    )
    
    const tableData = filteredData.map(row => 
      options.includeFields.map(field => {
        const value = row[field]
        if (value === null || value === undefined) return ''
        return String(value)
      })
    )

    // Add table to PDF
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: options.dateRange.from || options.dateRange.to ? 40 : 30,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })

    // Generate filename and save
    const filename = `${options.reportType}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  } catch (error) {
    console.error('PDF export failed:', error)
    alert('PDF export failed. Please try CSV export instead.')
  }
}

// Main export function
export async function exportData(data: any[], options: ExportOptions): Promise<void> {
  try {
    switch (options.format) {
      case 'csv':
        exportToCSV(data, options)
        break
      case 'excel':
        await exportToExcel(data, options)
        break
      case 'pdf':
        await exportToPDF(data, options)
        break
      default:
        exportToCSV(data, options)
    }
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  }
}

// Filter data based on export options
export function filterDataForExport(data: any[], options: ExportOptions): any[] {
  let filteredData = [...data]

  // Apply date range filter
  if (options.dateRange.from || options.dateRange.to) {
    filteredData = filteredData.filter(item => {
      if (!item.created_at) return false
      const itemDate = new Date(item.created_at)
      
      if (options.dateRange.from && itemDate < options.dateRange.from) return false
      if (options.dateRange.to && itemDate > options.dateRange.to) return false
      
      return true
    })
  }

  // Apply other filters
  if (options.filters) {
    const filters = options.filters
    
    if (filters.status && filters.status.length > 0) {
      filteredData = filteredData.filter(item => filters.status!.includes(item.status))
    }
    
    if (filters.gateway && filters.gateway.length > 0) {
      filteredData = filteredData.filter(item => filters.gateway!.includes(item.gateway))
    }
    
    if (filters.paymentMethod && filters.paymentMethod.length > 0) {
      filteredData = filteredData.filter(item => filters.paymentMethod!.includes(item.payment_method))
    }
    
    if (filters.riskScoreRange) {
      filteredData = filteredData.filter(item => {
        const riskScore = item.risk_score || 0
        return riskScore >= filters.riskScoreRange![0] && riskScore <= filters.riskScoreRange![1]
      })
    }
    
    if (filters.amountRange) {
      filteredData = filteredData.filter(item => {
        const amount = item.amount || 0
        return amount >= filters.amountRange![0] && amount <= filters.amountRange![1]
      })
    }
    
    if (filters.fraudDetected !== null) {
      filteredData = filteredData.filter(item => item.fraud_detected === filters.fraudDetected)
    }
    
    if (filters.chargebackPredicted !== null) {
      filteredData = filteredData.filter(item => item.chargeback_predicted === filters.chargebackPredicted)
    }
    
    if (filters.country && filters.country.length > 0) {
      filteredData = filteredData.filter(item => filters.country!.includes(item.billing_address_country))
    }
    
    if (filters.currency && filters.currency.length > 0) {
      filteredData = filteredData.filter(item => filters.currency!.includes(item.currency))
    }
  }

  return filteredData
}

// Generate report summary
export function generateReportSummary(data: any[], options: ExportOptions): string {
  const totalRecords = data.length
  const totalAmount = data.reduce((sum, item) => sum + (item.amount || 0), 0)
  const fraudCount = data.filter(item => item.fraud_detected).length
  const chargebackCount = data.filter(item => item.chargeback_predicted).length
  const highRiskCount = data.filter(item => (item.risk_score || 0) > 70).length

  return `
Report Summary:
- Total Records: ${totalRecords}
- Total Amount: $${totalAmount.toFixed(2)}
- Fraud Detected: ${fraudCount}
- Chargeback Predicted: ${chargebackCount}
- High Risk (>70%): ${highRiskCount}
- Export Date: ${new Date().toLocaleString()}
- Report Type: ${options.reportType}
- Format: ${options.format.toUpperCase()}
  `.trim()
}
