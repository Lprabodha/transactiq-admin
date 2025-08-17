"use client"

import { forwardRef, useId, useMemo } from "react"
import { Recharts } from "recharts"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "" } as const

type ChartProps = React.ComponentProps<typeof Recharts> & {
  color?: string
  theme?: never
}

const Chart = forwardRef<HTMLDivElement, ChartProps>(
  ({ color, theme, ...props }, ref) => {
    const id = useId()

    const chartConfig = useMemo(() => {
      return {
        color: color || "hsl(var(--chart-1))",
        theme: THEMES,
      }
    }, [color])

    return (
      <div ref={ref} className="w-full overflow-hidden">
        <Recharts
          {...props}
          id={id}
          config={chartConfig}
        />
      </div>
    )
  }
)
Chart.displayName = "Chart"

export { Chart }
