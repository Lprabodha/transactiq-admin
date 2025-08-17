"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RiskDistribution, RiskByCountry, ChargebackTrend, ChargebackByPaymentMethod, FeatureImportance, ConfusionMatrix, ROCCurve, ModelPerformanceRadar, ModelHistory } from "@/components/fraud-insights-charts"
import { FraudRiskTable } from "@/components/fraud-risk-table"
import { ChargebackPredictionTable } from "@/components/chargeback-prediction-table"
import { ModelPerformanceMetrics } from "@/components/model-performance-metrics"
import { ArrowUp, ArrowDown } from "lucide-react"
import { ApiService } from "@/lib/api-service"

interface FraudStats {
  totalChecks: number
  fraudDetected: number
  averageConfidence: number
  fraudRate: number
}

interface ChargebackStats {
  totalPredictions: number
  averageConfidence: number
  chargebackRate: number
}

export default function InsightsPage() {
  const [fraudStats, setFraudStats] = useState<FraudStats | null>(null)
  const [chargebackStats, setChargebackStats] = useState<ChargebackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function fetchInsightsData() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching insights data...')
        
        const [fraudResponse, chargebackResponse] = await Promise.all([
          ApiService.getFraudResults({ stats: true }),
          ApiService.getChargebackPredictions({ stats: true })
        ])
        
        console.log('Fraud response:', fraudResponse)
        console.log('Chargeback response:', chargebackResponse)
        
        if (fraudResponse.success && fraudResponse.data) {
          // Calculate fraud statistics from the data
          const totalChecks = fraudResponse.data.length
          const fraudDetected = fraudResponse.data.filter((f: any) => f.fraud_detected).length
          const averageConfidence = fraudResponse.data.length > 0 
            ? fraudResponse.data.reduce((sum: number, f: any) => sum + (f.confidence || 0), 0) / fraudResponse.data.length
            : 0
          const fraudRate = totalChecks > 0 ? fraudDetected / totalChecks : 0
          
          setFraudStats({
            totalChecks,
            fraudDetected,
            averageConfidence,
            fraudRate
          })
        }
        
        if (chargebackResponse.success && chargebackResponse.data) {
          // Calculate chargeback statistics from the data
          const totalPredictions = chargebackResponse.data.length
          const averageConfidence = chargebackResponse.data.length > 0 
            ? chargebackResponse.data.reduce((sum: number, c: any) => sum + (c.confidence_score || 0), 0) / chargebackResponse.data.length
            : 0
          const chargebackRate = 0.024 // Placeholder - would need actual chargeback data
          
          setChargebackStats({
            totalPredictions,
            averageConfidence,
            chargebackRate
          })
        }
        
        if (!fraudResponse.success && !chargebackResponse.success) {
          setError('Failed to fetch insights data')
        }
      } catch (err) {
        const errorMessage = 'An error occurred while fetching insights data'
        console.error('Insights fetch error:', err)
        setError(`${errorMessage}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchInsightsData()
  }, [mounted])

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud & Chargeback Insights</h1>
          <p className="text-muted-foreground">Loading insights data...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={`loading-card-${i}`} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fraud & Chargeback Insights</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud & Chargeback Insights</h1>
        <p className="text-muted-foreground">Detailed analysis of fraud predictions and chargeback probabilities.</p>
      </div>
      <Tabs defaultValue="fraud" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fraud">Fraud Analysis</TabsTrigger>
          <TabsTrigger value="chargeback">Chargeback Predictions</TabsTrigger>
          <TabsTrigger value="model">Model Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="fraud" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fraudStats?.fraudDetected.toLocaleString() || '0'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>High risk transactions</span>
                </div>
                <p className="text-xs text-muted-foreground">Transactions flagged with a high probability of fraud.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fraudStats ? `${(fraudStats.averageConfidence * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span>Average confidence</span>
                </div>
                <p className="text-xs text-muted-foreground">Average fraud risk score across all transactions.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fraudStats?.totalChecks.toLocaleString() || '0'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>Total checks</span>
                </div>
                <p className="text-xs text-muted-foreground">Number of transactions checked for fraud.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraud Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {fraudStats ? `${(fraudStats.fraudRate * 100).toFixed(1)}%` : '0%'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span>Fraud rate</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of transactions flagged as fraud.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Fraud Risk Distribution</CardTitle>
                <CardDescription>Distribution of risk scores across transactions</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <RiskDistribution />
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Risk by Country</CardTitle>
                <CardDescription>Average fraud risk score by country</CardDescription>
              </CardHeader>
              <CardContent>
                <RiskByCountry />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>High Risk Transactions</CardTitle>
              <CardDescription>Transactions with fraud risk score above 70%</CardDescription>
            </CardHeader>
            <CardContent>
              <FraudRiskTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chargeback" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predicted Chargebacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chargebackStats?.totalPredictions.toLocaleString() || '0'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>Predicted chargebacks</span>
                </div>
                <p className="text-xs text-muted-foreground">Number of chargebacks predicted by the model.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chargeback Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chargebackStats ? `${(chargebackStats.chargebackRate * 100).toFixed(1)}%` : '2.4%'}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span>-0.3% from last month</span>
                </div>
                <p className="text-xs text-muted-foreground">Percentage of transactions resulting in a chargeback.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prevented Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,450</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>+$1,890 from last month</span>
                </div>
                <p className="text-xs text-muted-foreground">Estimated amount saved by preventing chargebacks.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.8%</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>+1.2% from last month</span>
                </div>
                <p className="text-xs text-muted-foreground">Accuracy of the chargeback prediction model.</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Chargeback Trend</CardTitle>
                <CardDescription>Monthly chargeback rate by gateway</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChargebackTrend />
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Chargeback by Payment Method</CardTitle>
                <CardDescription>Distribution across payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <ChargebackByPaymentMethod />
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Chargeback Predictions</CardTitle>
              <CardDescription>Transactions with high chargeback probability</CardDescription>
            </CardHeader>
            <CardContent>
              <ChargebackPredictionTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Key performance metrics for the fraud detection model</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelPerformanceMetrics />
              </CardContent>
            </Card>
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>Top factors influencing fraud detection</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <FeatureImportance />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Confusion Matrix</CardTitle>
                <CardDescription>Visualization of model prediction accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <ConfusionMatrix />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Gateway Performance Comparison</CardTitle>
                <CardDescription>Model metrics by payment gateway</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelPerformanceRadar />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>ROC Curve</CardTitle>
                <CardDescription>Model discrimination ability</CardDescription>
              </CardHeader>
              <CardContent>
                <ROCCurve />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Model Version History</CardTitle>
                <CardDescription>Performance metrics across model versions</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
