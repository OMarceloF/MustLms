import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { cn } from "../../../lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  backgroundColor?: string
  valueClassName?: string
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  backgroundColor = "bg-slate-50",
  valueClassName = "text-3xl",
}: MetricCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className={cn("p-2 rounded-lg", backgroundColor)}>{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <div className={cn("font-bold", valueClassName)}>
            {value}
            {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
