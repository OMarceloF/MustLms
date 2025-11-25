import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

export function ChartCard({ title, subtitle, children, isLoading = false, className = "h-[320px]" }: ChartCardProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={className}>
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className={className}>{children}</div>
        )}
      </CardContent>
    </Card>
  )
}
