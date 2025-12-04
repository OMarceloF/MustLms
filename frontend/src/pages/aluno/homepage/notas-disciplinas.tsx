"use client"

import { Card } from "../../gestor/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import { GraduationCap } from "lucide-react"

interface NotaDisciplina {
  disciplina: string
  nota: number
  media: number
}

interface NotasDisciplinasProps {
  data: NotaDisciplina[]
}

export function NotasDisciplinas({ data }: NotasDisciplinasProps) {
  const safeData = Array.isArray(data) ? data : []

  const getBarColor = (nota: number) => {
    if (nota >= 70) return "#9dba32"
    if (nota >= 50) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <Card className="p-5 shadow-lg border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#363776] flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Minhas Notas por Disciplina
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Média mínima para aprovação: 60 pontos</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#9dba32]"></div>
              <span className="text-muted-foreground">≥70</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-muted-foreground">50-69</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-muted-foreground">{"<"}50</span>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={safeData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />

          <XAxis type="number" domain={[0, 100]} stroke="#6b7280" style={{ fontSize: "11px" }} />

          <YAxis
            type="category"
            dataKey="disciplina"
            stroke="#6b7280"
            style={{ fontSize: "11px", fontWeight: 500 }}
            width={120}
          />

          <ReferenceLine
            x={60}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{ value: "Mínimo", position: "top", fill: "#ef4444", fontSize: 10 }}
          />

          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "11px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number) => [`${value} pontos`, "Sua Nota"]}
          />

          <Bar
            dataKey="nota"
            radius={[0, 4, 4, 0]}
            barSize={24}
            label={{ position: "right", fill: "#6b7280", fontSize: 11, fontWeight: "bold" }}
          >
            {safeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.nota)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
