/**
 * Loading Skeleton Components
 * 
 * Provides reusable skeleton loaders for various UI components
 * to improve perceived performance and user experience.
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard Card Skeleton
 * Used for metric cards on the dashboard
 */
export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

/**
 * Table Row Skeleton
 * Used for loading table rows
 */
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

/**
 * Table Skeleton
 * Complete table loading state
 */
export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="border-b">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Chart Skeleton
 * Used for loading chart components
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

/**
 * Form Skeleton
 * Used for loading form components
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

/**
 * List Item Skeleton
 * Used for loading list items
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-start space-x-4 p-4 border-b">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

/**
 * Activity List Skeleton
 * Used for recent activity sections
 */
export function ActivityListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: items }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Stats Grid Skeleton
 * Used for dashboard statistics grids
 */
export function StatsGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Dialog Content Skeleton
 * Used for loading dialog/modal content
 */
export function DialogContentSkeleton() {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Page Header Skeleton
 * Used for loading page headers
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  )
}

/**
 * Full Page Loading Skeleton
 * Comprehensive loading state for entire pages
 */
export function FullPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatsGridSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <ChartSkeleton />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <ChartSkeleton height={200} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

