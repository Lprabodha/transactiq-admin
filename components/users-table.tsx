"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Search } from "lucide-react"
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
import { ApiService, Customer } from "@/lib/api-service"

// Sample user data (fallback)
const sampleUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    lastLogin: "2023-06-12T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Analyst",
    lastLogin: "2023-06-11T14:45:00Z",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "Viewer",
    lastLogin: "2023-06-10T09:15:00Z",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "Admin",
    lastLogin: "2023-06-09T16:20:00Z",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "Analyst",
    lastLogin: "2023-06-08T11:05:00Z",
  },
]

export function UsersTable() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch customers from API
  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        const response = await ApiService.getCustomers({ limit: 100 });
        
        if (response.success && response.data) {
          setCustomers(response.data);
        } else {
          setError(response.error || 'Failed to fetch customers');
          // Fallback to sample data
          setCustomers(sampleUsers.map(u => ({
            _id: u.id,
            email: u.email,
            name: u.name,
            phone: null,
            currency: 'usd',
            country: null,
            address_line1: null,
            address_line2: null,
            city: null,
            state: null,
            postal_code: null,
            created_at: u.lastLogin,
            delinquent: false,
            default_payment_method: '',
            balance: 0,
            tax_info: { tax_id: null, type: null },
            metadata: { onboarding_funnel: '1', type: '0', user_email: u.email, user_id: u.id },
            invoice_prefix: 'USER',
            gateway_customer_ids: { stripe: '' },
          })));
        }
      } catch (err) {
        setError('An error occurred while fetching customers');
        console.error('Customers fetch error:', err);
        // Fallback to sample data
        setCustomers(sampleUsers.map(u => ({
          _id: u.id,
          email: u.email,
          name: u.name,
          phone: null,
          currency: 'usd',
          country: null,
          address_line1: null,
          address_line2: null,
          city: null,
          state: null,
          postal_code: null,
          created_at: u.lastLogin,
          delinquent: false,
          default_payment_method: '',
          balance: 0,
          tax_info: { tax_id: null, type: null },
          metadata: { onboarding_funnel: '1', type: '0', user_email: u.email, user_id: u.id },
          invoice_prefix: 'USER',
          gateway_customer_ids: { stripe: '' },
        })));
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const filteredUsers = customers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return ApiService.formatDate(dateString);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-md border">
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </div>
    );
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
          <Button onClick={() => setIsAddUserOpen(true)}>
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
    );
  }

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
        <Button onClick={() => setIsAddUserOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.delinquent ? "destructive" : "default"}
                  >
                    {user.delinquent ? "Delinquent" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
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
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit customer</DropdownMenuItem>
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
      <AddUserDialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen} />
    </div>
  )
}
