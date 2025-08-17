"use client"

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FraudTrend,
  RiskByGateway,
  ChargebackPrediction,
} from "@/components/dashboard-charts";
import { RecentActivity } from "@/components/recent-activity";
import { ApiService, DashboardStats } from "@/lib/api-service";

export default function DashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data...');
        
        const response = await ApiService.getDashboardStats(true);
        console.log('Dashboard API response:', response);
        
        if (response.success && response.data) {
          setDashboardStats(response.data);
          console.log('Dashboard stats set successfully:', response.data);
        } else {
          const errorMessage = response.error || 'Failed to fetch dashboard data';
          console.error('Dashboard API error:', errorMessage, response);
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage = 'An error occurred while fetching dashboard data';
        console.error('Dashboard fetch error:', err);
        setError(`${errorMessage}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`loading-card-${i}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-red-600">
            Error: {error}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your fraud detection and chargeback prediction
          metrics.
        </p>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transactions
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.transactions.totalTransactions.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.transactions.successRate.toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Fraud Risk Alerts
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.fraud.fraudDetected.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats?.fraud.fraudRate.toFixed(1)}% fraud rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chargebacks Predicted
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.chargebacks.totalPredictions.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Chargeback predictions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Projected MRR
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ApiService.formatCurrency(dashboardStats?.transactions.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total revenue
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Fraud Trend</CardTitle>
                <CardDescription>
                  Daily fraud detection rate over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <FraudTrend />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Risk Level by Gateway</CardTitle>
                <CardDescription>
                  Comparison of risk levels across payment gateways
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskByGateway />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest webhook events and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Chargeback Prediction</CardTitle>
                <CardDescription>
                  Predicted chargebacks by transaction type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChargebackPrediction />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Detailed analysis of fraud patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">
                    Advanced analytics content
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Distribution of risk scores across transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">
                    Risk distribution chart
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>
                  Access and download system-generated reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Reports list</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Schedule Report</CardTitle>
                <CardDescription>
                  Configure automated report generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">
                    Report scheduling form
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
