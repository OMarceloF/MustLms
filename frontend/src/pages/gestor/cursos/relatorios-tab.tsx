"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { TrendingDown, Users, Award } from "lucide-react"

const aprovacaoData = [
  { semestre: "2023.1", aprovacao: 85, reprovacao: 10, desistencia: 5 },
  { semestre: "2023.2", aprovacao: 88, reprovacao: 8, desistencia: 4 },
  { semestre: "2024.1", aprovacao: 90, reprovacao: 7, desistencia: 3 },
]

const statusData = [
  { name: "Aprovados", value: 90, color: "#10b981" },
  { name: "Reprovados", value: 7, color: "#ef4444" },
  { name: "Desistentes", value: 3, color: "#f59e0b" },
]

const metricsData = [
  {
    title: "Taxa de Aprovação",
    value: "90%",
    change: "+2%",
    trend: "up",
    icon: Award,
    color: "text-success",
  },
  {
    title: "Taxa de Reprovação",
    value: "7%",
    change: "-1%",
    trend: "down",
    icon: TrendingDown,
    color: "text-destructive",
  },
  {
    title: "Taxa de Desistência",
    value: "3%",
    change: "-1%",
    trend: "down",
    icon: TrendingDown,
    color: "text-warning",
  },
  {
    title: "Total de Alunos",
    value: "45",
    change: "+5",
    trend: "up",
    icon: Users,
    color: "text-info",
  },
]

export function RelatoriosTab() {
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.trend === "up" ? "text-success" : "text-destructive"}>{metric.change}</span>{" "}
                  em relação ao semestre anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Desempenho por Semestre</CardTitle>
            <CardDescription>Evolução das taxas de aprovação, reprovação e desistência</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aprovacaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="semestre" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141414",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="aprovacao" fill="#10b981" name="Aprovação %" />
                <Bar dataKey="reprovacao" fill="#ef4444" name="Reprovação %" />
                <Bar dataKey="desistencia" fill="#f59e0b" name="Desistência %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Distribuição Atual</CardTitle>
            <CardDescription>Status dos alunos no semestre 2024.1</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#141414",
                    border: "1px solid #262626",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
