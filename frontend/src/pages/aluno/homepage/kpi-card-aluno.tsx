"use client"

import type React from "react"

import { Card } from "../../gestor/components/ui/card"
import { ArrowUp, ArrowDown, BookOpen, Clock, Award, CheckCircle, Calendar, TrendingUp } from "lucide-react"

export interface KpiAlunoData {
  id: number
  title: string
  value: string | number
  icon: string
  trend?: number
  subtitle?: string
  color?: string
}

interface KpiCardAlunoProps {
  data: KpiAlunoData
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  clock: Clock,
  award: Award,
  "check-circle": CheckCircle,
  calendar: Calendar,
  "trending-up": TrendingUp,
}

export function KpiCardAluno({ data }: KpiCardAlunoProps) {
  const Icon = iconMap[data.icon] || BookOpen
  const isPositive = (data.trend ?? 0) >= 0

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#363776] to-[#1e1f45] border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="inline-flex p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 mb-3">
              <Icon className="h-6 w-6 text-white" />
            </div>

            <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide mb-2">{data.title}</h3>

            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-white leading-none">{data.value}</p>

              {data.trend !== undefined && data.trend !== 0 && (
                <div className={`flex items-center gap-1 pb-1 ${isPositive ? "text-[#9dba32]" : "text-red-400"}`}>
                  {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  <span className="text-sm font-bold">{Math.abs(data.trend)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10">
          <span className="text-xs text-white/50 font-medium">{data.subtitle || "Semestre atual"}</span>
        </div>
      </div>
    </Card>
  )
}
