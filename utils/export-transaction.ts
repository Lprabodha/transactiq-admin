interface Transaction {
  id: string
  date: string
  amount: number
  currency: string
  status: string
  gateway: string
  fraudRisk: number
  chargebackProbability: number
  customer: string
}

export function exportTransactionAsJSON(transaction: Transaction) {
  const dataStr = JSON.stringify(transaction, null, 2)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

  const exportFileDefaultName = `transaction-${transaction.id}.json`

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", exportFileDefaultName)
  linkElement.click()
}

export function exportTransactionAsPDF(transaction: Transaction) {
  // In a real application, you would use a library like jsPDF or pdfmake
  // to generate a PDF file. For this example, we'll just show an alert.
  alert(`PDF export for transaction ${transaction.id} would be generated here.`)
}
