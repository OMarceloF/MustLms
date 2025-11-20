"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

import { Users, TrendingDown, TrendingUp, Award } from "lucide-react"

/* =============================
   🔢 Dados (simulados)
============================= */

const desempenhoSemestre = [
  { semestre: "2023.1", aprovacao: 82, reprovacao: 12, desistencia: 6 },
  { semestre: "2023.2", aprovacao: 85, reprovacao: 10, desistencia: 5 },
  { semestre: "2024.1", aprovacao: 90, reprovacao: 7, desistencia: 3 },
]

const evolucaoMatriculas = [
  { semestre: "2023.1", ingressantes: 40, desligados: 6, total: 34 },
  { semestre: "2023.2", ingressantes: 38, desligados: 5, total: 33 },
  { semestre: "2024.1", ingressantes: 45, desligados: 3, total: 42 },
]

const situacaoAtual = [
  { situacao: "Ativos", total: 120 },
  { situacao: "Trancados", total: 8 },
  { situacao: "Concluídos", total: 30 },
  { situacao: "Cancelados", total: 5 },
]

const metrics = [
  {
    title: "Total de Matriculados",
    value: "120",
    change: "+8",
    icon: Users,
    color: "text-info",
  },
  {
    title: "Taxa de Desistência",
    value: "3%",
    change: "-1%",
    icon: TrendingDown,
    color: "text-destructive",
  },
  {
    title: "Taxa de Retenção",
    value: "92%",
    change: "+3%",
    icon: TrendingUp,
    color: "text-success",
  },
  {
    title: "Tempo Médio de Conclusão",
    value: "18 meses",
    change: "—",
    icon: Award,
    color: "text-warning",
  },
]

/* =============================
   📊 Componente principal
============================= */

export function RelatoriosTab() {
  return (
    <div className="space-y-6 pb-10">

      {/* ==== MÉTRICAS ==== */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <Card key={idx} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium whitespace-normal break-words">
                  {metric.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground whitespace-normal">
                  {metric.change} desde o último semestre
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ==== GRÁFICOS PRINCIPAIS ==== */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">

        {/* 1) Desempenho Acadêmico */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Desempenho por Semestre</CardTitle>
            <CardDescription>
              Aprovação, reprovação e desistência ao longo dos semestres
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={desempenhoSemestre}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="semestre" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Legend />
                <Bar dataKey="aprovacao" fill="#10b981" name="Aprovação %" />
                <Bar dataKey="reprovacao" fill="#ef4444" name="Reprovação %" />
                <Bar dataKey="desistencia" fill="#f59e0b" name="Desistência %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2) Evolução de Matrículas */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Evolução de Matrículas</CardTitle>
            <CardDescription>
              Ingressantes, desligados e total por semestre
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucaoMatriculas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="semestre" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ingressantes" stroke="#3b82f6" name="Ingressantes" />
                <Line type="monotone" dataKey="desligados" stroke="#ef4444" name="Desligados" />
                <Line type="monotone" dataKey="total" stroke="#10b981" name="Total Matriculados" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* ==== SITUAÇÃO ACADÊMICA ==== */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Situação Acadêmica Atual</CardTitle>
          <CardDescription>
            Distribuição dos alunos no semestre vigente
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[320px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={situacaoAtual}
              layout="vertical"
              margin={{ left: -70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis
                dataKey="situacao"
                type="category"
                stroke="#aaa"
                width={140}     // ← evita cortar labels
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Alunos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  )
}
