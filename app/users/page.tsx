import { CustomersTable } from "@/components/customers-table"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage customer data and payment information.</p>
      </div>
      <CustomersTable />
    </div>
  )
}
