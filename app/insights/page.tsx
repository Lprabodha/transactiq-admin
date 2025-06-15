import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FraudInsightsCharts } from "@/components/fraud-insights-charts"
import { FraudRiskTable } from "@/components/fraud-risk-table"
import { ChargebackPredictionTable } from "@/components/chargeback-prediction-table"
import { ModelPerformanceMetrics } from "@/components/model-performance-metrics"
import { ArrowUp, ArrowDown } from "lucide-react"

export default function InsightsPage() {
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
                <div className="text-2xl font-bold">42</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>+12% from last week</span>
                </div>
                <p className="text-xs text-muted-foreground">Transactions flagged with a high probability of fraud.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28.4%</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span>-3.2% from last week</span>
                </div>
                <p className="text-xs text-muted-foreground">Average fraud risk score across all transactions.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>+5 from last week</span>
                </div>
                <p className="text-xs text-muted-foreground">Number of transactions blocked due to high risk.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">False Positives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3.2%</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowDown className="h-4 w-4 text-red-500" />
                  <span>-0.5% from last week</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of legitimate transactions incorrectly flagged as fraud.
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
                <FraudInsightsCharts.RiskDistribution />
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Risk by Country</CardTitle>
                <CardDescription>Average fraud risk score by country</CardDescription>
              </CardHeader>
              <CardContent>
                <FraudInsightsCharts.RiskByCountry />
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
                <div className="text-2xl font-bold">89</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <ArrowUp className="h-4 w-4 text-green-500" />
                  <span>+7 from last month</span>
                </div>
                <p className="text-xs text-muted-foreground">Number of chargebacks predicted by the model.</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chargeback Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4%</div>
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
                <FraudInsightsCharts.ChargebackTrend />
              </CardContent>
            </Card>
            <Card className="col-span-3 shadow-sm">
              <CardHeader>
                <CardTitle>Chargeback by Payment Method</CardTitle>
                <CardDescription>Distribution across payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <FraudInsightsCharts.ChargebackByPaymentMethod />
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
                <FraudInsightsCharts.FeatureImportance />
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
                <FraudInsightsCharts.ConfusionMatrix />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Gateway Performance Comparison</CardTitle>
                <CardDescription>Model metrics by payment gateway</CardDescription>
              </CardHeader>
              <CardContent>
                <FraudInsightsCharts.ModelPerformanceRadar />
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
                <FraudInsightsCharts.ROCCurve />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Model Version History</CardTitle>
                <CardDescription>Performance metrics across model versions</CardDescription>
              </CardHeader>
              <CardContent>
                <FraudInsightsCharts.ModelHistory />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
