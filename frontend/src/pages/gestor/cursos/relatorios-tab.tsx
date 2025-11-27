// src/pages/gestor/cursos/relatorios-tab.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios" // Importa axios direto

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

import { Users, TrendingDown } from "lucide-react"

// Vamos usar uma instância limpa para garantir que a URL seja exatamente a que está no routes.ts
// O erro mostrava '/api/v1/api/...', o que está errado. O routes.ts define apenas '/api/...'
const apiLocal = axios.create({
  baseURL: 'http://localhost:3001', // Aponta para a raiz do backend
})

/* =============================
   🔢 Interfaces
============================= */

interface RelatoriosData {
  metricas: {
    totalMatriculados: number
    taxaDesistencia: string
  }
  graficos: {
    situacaoAtual: { situacao: string; total: number }[]
    evolucaoMatriculas: { semestre: string; ingressantes: number; desligados: number; total_ativos: number }[]
    desempenhoSemestre: { semestre: string; aprovacao: number; reprovacao: number; desistencia: number }[]
  }
}

/* =============================
   📊 Componente principal
============================= */

export function RelatoriosTab() {
  const { id } = useParams() 
  const [data, setData] = useState<RelatoriosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      carregarDados()
    }
  }, [id])

  const carregarDados = async () => {
    try {
      setError(null)
      setLoading(true)
      
      // Ajuste CRÍTICO: Usamos o caminho completo conforme definido no routes.ts
      // routes.ts define: router.get('/api/cursos/:cursoId/relatorios-gerais', ...)
      const response = await apiLocal.get(`/api/cursos/${id}/relatorios-gerais`)
      
      setData(response.data)
    } catch (error: any) {
      console.error("Erro ao carregar relatórios:", error)
      const msg = error.response?.data?.message || "Erro de conexão com o servidor."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-muted-foreground">Carregando dados estatísticos...</div>
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
          <strong>Erro:</strong> {error} <br/>
          <small>Verifique se o backend está rodando na porta 3000.</small>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="p-6">Não foi possível carregar os dados.</div>
  }

  const metrics = [
    {
      title: "Total de Matriculados",
      value: data.metricas.totalMatriculados,
      icon: Users,
      color: "text-blue-500", // Ajuste de cor para garantir visibilidade
      description: "Alunos vinculados ao curso",
    },
    {
      title: "Taxa de Desistência",
      value: `${data.metricas.taxaDesistencia}%`,
      icon: TrendingDown,
      color: "text-red-500", // Ajuste de cor
      description: "% de alunos com matrícula trancada",
    },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* ==== MÉTRICAS ==== */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon
          return (
            <Card key={idx} className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium whitespace-normal break-words">
                  {metric.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
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
              Aprovação vs Reprovação (baseado nas notas lançadas)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.graficos.desempenhoSemestre}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="semestre" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#000' }}
                  itemStyle={{ color: '#000' }}
                />
                <Legend />
                <Bar dataKey="aprovacao" fill="#10b981" name="Aprovação %" />
                <Bar dataKey="reprovacao" fill="#ef4444" name="Reprovação %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2) Evolução de Matrículas */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Evolução de Matrículas</CardTitle>
            <CardDescription>
              Histórico de ingressantes e ativos por período
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.graficos.evolucaoMatriculas}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="semestre" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#000' }}
                  itemStyle={{ color: '#000' }}
                />
                <Legend />
                <Line type="monotone" dataKey="ingressantes" stroke="#3b82f6" name="Ingressantes" strokeWidth={2} />
                <Line type="monotone" dataKey="desligados" stroke="#ef4444" name="Trancados" strokeWidth={2} />
                <Line type="monotone" dataKey="total_ativos" stroke="#10b981" name="Ativos Totais" strokeWidth={2} />
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
            Distribuição dos alunos (Ativos, Trancados, etc.)
          </CardDescription>
        </CardHeader>

        <CardContent className="h-[320px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.graficos.situacaoAtual}
              layout="vertical"
              margin={{ left: 0, right: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" stroke="#888888" fontSize={12} />
              <YAxis
                dataKey="situacao"
                type="category"
                stroke="#888888"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#000' }}
                 itemStyle={{ color: '#000' }}
              />
              <Bar dataKey="total" fill="#3b82f6" name="Alunos" barSize={30} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}