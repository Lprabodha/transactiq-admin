import { TransactionsTable } from "@/components/transactions-table"

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage transaction data with fraud risk and chargeback predictions.
        </p>
      </div>
      <TransactionsTable />
    </div>
  )
}
