"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Search, DollarSign, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from "lucide-react"
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

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [enhancedCustomers, setEnhancedCustomers] = useState<(Customer & { enhancedLocation?: string })[]>([])
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
        setError(null)
        
        console.log("Fetching customers with params:", {
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
          search: searchQuery || undefined,
        })
        
        const response = await ApiService.getCustomers({
          limit: itemsPerPage,
          skip: (currentPage - 1) * itemsPerPage,
          search: searchQuery || undefined,
        })

        console.log("Customers API response:", response)

        if (response.success && response.data) {
          setCustomers(response.data)
          setTotalCount(response.totalCount || response.data.length)
          console.log("Loaded customers:", response.data.length)
          
          // Enhance customers with location data from transactions
          console.log("Enhancing customer location data...")
          const enhanced = await Promise.all(
            response.data.map(async (customer) => {
              try {
                return await ApiService.getEnhancedCustomerData(customer)
              } catch (error) {
                console.warn(`Failed to enhance customer ${customer.email}:`, error)
                return {
                  ...customer,
                  enhancedLocation: [customer.city, customer.state, customer.country].filter(Boolean).join(', ') || 'Unknown'
                }
              }
            })
          )
          setEnhancedCustomers(enhanced)
        } else {
          const errorMsg = response.error || "Failed to fetch customers"
          setError(errorMsg)
          setCustomers([])
          setEnhancedCustomers([])
          setTotalCount(0)
          console.error("Failed to fetch customers:", errorMsg)
        }
      } catch (err) {
        setError("An error occurred while fetching customers")
        console.error("Customers fetch error:", err)
        setCustomers([])
        setEnhancedCustomers([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [mounted, currentPage, searchQuery])

  const filteredCustomers = enhancedCustomers.length > 0 ? enhancedCustomers : customers

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

  // Show empty state when no customers
  if (customers.length === 0 && !loading && !error) {
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
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddCustomerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex flex-col items-center justify-center">
            <p className="text-lg font-medium text-muted-foreground mb-2">No customers found</p>
            <p className="text-sm text-muted-foreground">No customer data is available from the API</p>
          </div>
        </div>
      </div>
    )
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
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mr-2"
              >
                Retry
              </Button>
              <Button onClick={() => setIsAddCustomerOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
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
                      {customer.gateway_customer_ids?.stripe && (
                        <div className="text-xs text-muted-foreground">
                          Stripe: {customer.gateway_customer_ids.stripe}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <div className="text-sm">
                        {(() => {
                          const enhancedCustomer = customer as Customer & { enhancedLocation?: string }
                          return enhancedCustomer.enhancedLocation || 
                            [customer.city, customer.state, customer.country]
                              .filter(Boolean)
                              .join(", ") || "Unknown"
                        })()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {(() => {
                        let colorClass = "text-muted-foreground"
                        if (customer.balance > 0) {
                          colorClass = "text-green-600"
                        } else if (customer.balance < 0) {
                          colorClass = "text-red-600"
                        }
                        return (
                          <span className={`font-medium ${colorClass}`}>
                            {formatCurrency(customer.balance, customer.currency)}
                          </span>
                        )
                      })()}
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
