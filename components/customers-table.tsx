"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Search, DollarSign, MapPin, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AddUserDialog } from "@/components/add-user-dialog"
import { CustomerDetailsDialog } from "@/components/customer-details-dialog"
import { ClientOnly } from "@/components/client-only"
import { ApiService, type Customer } from "@/lib/api-service"

// Sample customer data (fallback)
const sampleCustomers = [
  {
    _id: "1",
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+1234567890",
    currency: "usd",
    country: "US",
    created_at: "2023-06-12T10:30:00Z",
    delinquent: false,
    balance: 0,
  },
  {
    _id: "2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    phone: "+1234567891",
    currency: "usd",
    country: "CA",
    created_at: "2023-06-11T14:45:00Z",
    delinquent: false,
    balance: 25.5,
  },
  {
    _id: "3",
    email: "robert.johnson@example.com",
    name: "Robert Johnson",
    phone: "+1234567892",
    currency: "eur",
    country: "UK",
    created_at: "2023-06-10T09:15:00Z",
    delinquent: true,
    balance: -150.0,
  },
  {
    _id: "4",
    email: "emily.davis@example.com",
    name: "Emily Davis",
    phone: "+1234567893",
    currency: "usd",
    country: "AU",
    created_at: "2023-06-09T16:20:00Z",
    delinquent: false,
    balance: 75.25,
  },
  {
    _id: "5",
    email: "michael.wilson@example.com",
    name: "Michael Wilson",
    phone: "+1234567894",
    currency: "usd",
    country: "US",
    created_at: "2023-06-08T11:05:00Z",
    delinquent: false,
    balance: 0,
  },
]

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch customers from API
  useEffect(() => {
    if (!mounted) return

    async function fetchCustomers() {
      try {
        setLoading(true)
        const response = await ApiService.getCustomers({
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
          search: searchQuery || undefined,
        })

        if (response.success && response.data) {
          setCustomers(response.data)
          setTotalCount(response.totalCount || response.data.length)
        } else {
          setError(response.error || "Failed to fetch customers")
          // Fallback to sample data
          setCustomers(sampleCustomers as Customer[])
          setTotalCount(sampleCustomers.length)
        }
      } catch (err) {
        setError("An error occurred while fetching customers")
        console.error("Customers fetch error:", err)
        // Fallback to sample data
        setCustomers(sampleCustomers as Customer[])
        setTotalCount(sampleCustomers.length)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [mounted, currentPage, searchQuery])

  const filteredCustomers = customers

  const formatDate = (dateString: string) => {
    return ApiService.formatDate(dateString)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return ApiService.formatCurrency(amount, currency)
  }

  const getStatusBadge = (customer: Customer) => {
    if (customer.delinquent) {
      return <Badge variant="destructive">Delinquent</Badge>
    }
    if (customer.balance > 0) {
      return <Badge variant="secondary">Credit</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsOpen(true)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  const loadingFallback = (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <div className="h-10 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="rounded-md border">
        <div className="h-96 flex items-center justify-center">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    </div>
  )

  // Show loading state only after mounted to prevent hydration mismatch
  if (!mounted || loading) {
    return loadingFallback
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading customers</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalCount)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <ClientOnly fallback={loadingFallback}>
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{customer.country || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{formatCurrency(customer.balance, customer.currency)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(customer)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{formatDate(customer.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(customer)}>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit customer</DropdownMenuItem>
                        <DropdownMenuItem>View transactions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Delete customer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startItem} to {endItem} of {totalCount} customers
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <AddUserDialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen} />

        <CustomerDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} customer={selectedCustomer} />
      </div>
    </ClientOnly>
  )
}
