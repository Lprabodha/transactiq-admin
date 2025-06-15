"use client"

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts"

// Sample data for the fraud trend chart
const fraudTrendData = [
  { date: "2023-06-01", fraudRate: 2.3 },
  { date: "2023-06-02", fraudRate: 2.1 },
  { date: "2023-06-03", fraudRate: 2.5 },
  { date: "2023-06-04", fraudRate: 2.8 },
  { date: "2023-06-05", fraudRate: 2.6 },
  { date: "2023-06-06", fraudRate: 3.1 },
  { date: "2023-06-07", fraudRate: 3.5 },
  { date: "2023-06-08", fraudRate: 3.2 },
  { date: "2023-06-09", fraudRate: 2.9 },
  { date: "2023-06-10", fraudRate: 2.7 },
  { date: "2023-06-11", fraudRate: 2.5 },
  { date: "2023-06-12", fraudRate: 2.8 },
  { date: "2023-06-13", fraudRate: 3.0 },
  { date: "2023-06-14", fraudRate: 3.2 },
]

// Sample data for the risk by gateway chart - only Stripe and SolidGate
const riskByGatewayData = [
  { gateway: "Stripe", lowRisk: 65, mediumRisk: 25, highRisk: 10 },
  { gateway: "SolidGate", lowRisk: 55, mediumRisk: 30, highRisk: 15 },
]

// Sample data for the chargeback prediction chart - only relevant payment methods
const chargebackPredictionData = [
  { name: "Credit Card", value: 65 },
  { name: "Debit Card", value: 25 },
  { name: "Digital Wallet", value: 10 },
]

const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]

export const DashboardCharts = {
  FraudTrend: () => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={fraudTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFraudRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getMonth() + 1}/${date.getDate()}`
            }}
            stroke="#6b7280"
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} dx={-10} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="h-3 w-3 rounded-full bg-[#10b981]" />
                          Fraud Rate:
                        </span>
                        <span className="font-medium">{payload[0].value}%</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="fraudRate"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorFraudRate)"
            dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  ),

  RiskByGateway: () => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={riskByGatewayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
          <XAxis dataKey="gateway" stroke="#6b7280" axisLine={false} tickLine={false} />
          <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="font-medium">{payload[0].payload.gateway}</p>
                    <div className="mt-2 grid gap-1">
                      {payload.map((entry, index) => (
                        <div key={`item-${index}`} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  entry.name === "lowRisk"
                                    ? "#10b981"
                                    : entry.name === "mediumRisk"
                                      ? "#f59e0b"
                                      : "#ef4444",
                              }}
                            />
                            {entry.name === "lowRisk"
                              ? "Low Risk"
                              : entry.name === "mediumRisk"
                                ? "Medium Risk"
                                : "High Risk"}
                            :
                          </span>
                          <span className="font-medium">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            formatter={(value) => {
              return value === "lowRisk" ? "Low Risk" : value === "mediumRisk" ? "Medium Risk" : "High Risk"
            }}
          />
          <Bar dataKey="lowRisk" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="lowRisk" />
          <Bar dataKey="mediumRisk" stackId="a" fill="#f59e0b" name="mediumRisk" />
          <Bar dataKey="highRisk" stackId="a" fill="#ef4444" name="highRisk" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ),

  ChargebackPrediction: () => (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chargebackPredictionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            paddingAngle={5}
          >
            {chargebackPredictionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value}%`}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[payload[0].payload.index % COLORS.length] }}
                      />
                      <span className="font-medium">{payload[0].name}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm text-muted-foreground">Percentage: </span>
                      <span className="font-medium">{payload[0].value}%</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend formatter={(value, entry) => <span className="text-sm">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  ),
}
