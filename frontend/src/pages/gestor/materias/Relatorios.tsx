// frontend/src/pages/gestor/materias/Relatorios.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, TrendingUp, TrendingDown, UserCheck } from "lucide-react"

interface Metrics {
  totalAlunos: number
  taxaAprovacao: number
  taxaReprovacao: number
  totalProfessores: number
}

interface TurmaData {
  turma: string
  professor: string
  aprovados: number
  reprovados: number
  mediaGeral: number
}

export default function Relatorios() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<Metrics>({
    totalAlunos: 0,
    taxaAprovacao: 0,
    taxaReprovacao: 0,
    totalProfessores: 0,
  })
  const [turmas, setTurmas] = useState<TurmaData[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [selectedTurma, setSelectedTurma] = useState("todas")
  const [selectedPeriodo, setSelectedPeriodo] = useState("2024.1")

  useEffect(() => {
    fetchMockData()
  }, [selectedTurma, selectedPeriodo])

  const fetchMockData = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    setMetrics({
      totalAlunos: 1250,
      taxaAprovacao: 78.5,
      taxaReprovacao: 12.3,
      totalProfessores: 45,
    })

    const mockTurmas: TurmaData[] = [
      { turma: "Turma A - Engenharia", professor: "Prof. João Silva", aprovados: 28, reprovados: 4, mediaGeral: 7.8 },
      {
        turma: "Turma B - Administração",
        professor: "Profa. Maria Santos",
        aprovados: 32,
        reprovados: 3,
        mediaGeral: 8.2,
      },
      { turma: "Turma C - Direito", professor: "Prof. Carlos Oliveira", aprovados: 25, reprovados: 7, mediaGeral: 7.1 },
      { turma: "Turma D - Medicina", professor: "Profa. Ana Costa", aprovados: 30, reprovados: 2, mediaGeral: 8.5 },
    ]
    setTurmas(mockTurmas)

    const mockChartData = [
      { turma: "Turma A", aprovados: 28, reprovados: 4, media: 7.8 },
      { turma: "Turma B", aprovados: 32, reprovados: 3, media: 8.2 },
      { turma: "Turma C", aprovados: 25, reprovados: 7, media: 7.1 },
      { turma: "Turma D", aprovados: 30, reprovados: 2, media: 8.5 },
    ]
    setChartData(mockChartData)

    setLoading(false)
  }

  const MetricCard = ({ title, value, icon: Icon, trend }: any) => (
    // overflow-hidden é uma garantia de que o conteúdo interno não vai vazar
    <Card className="shadow-sm rounded-lg overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg flex-shrink-0 ${trend === "up" ? "bg-green-100" : trend === "down" ? "bg-red-100" : "bg-blue-100"}`}>
            <Icon className={`h-5 w-5 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-blue-600"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Relatórios e Indicadores</h2>
        <p className="text-muted-foreground text-sm">Visão geral do desempenho.</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Turma</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Turmas</SelectItem>
                  <SelectItem value="a">Turma A</SelectItem>
                  <SelectItem value="b">Turma B</SelectItem>
                  <SelectItem value="c">Turma C</SelectItem>
                  <SelectItem value="d">Turma D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Período</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024.1">2024.1</SelectItem>
                  <SelectItem value="2023.2">2023.2</SelectItem>
                  <SelectItem value="2023.1">2023.1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Alunos" value={metrics.totalAlunos} icon={Users} trend="neutral" />
        <MetricCard title="Aprovação" value={`${metrics.taxaAprovacao}%`} icon={TrendingUp} trend="up" />
        <MetricCard title="Reprovação" value={`${metrics.taxaReprovacao}%`} icon={TrendingDown} trend="down" />
        <MetricCard title="Professores" value={metrics.totalProfessores} icon={UserCheck} trend="neutral" />
      </div>

      {/* Chart */}
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold">Desempenho Comparativo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} labelStyle={{ fontWeight: 'bold' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="aprovados" fill="#22c55e" name="Aprovados" />
              <Bar dataKey="reprovados" fill="#ef4444" name="Reprovados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold">Resumo por Turma</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 text-xs">Turma</TableHead>
                  <TableHead className="px-3 text-xs">Professor</TableHead>
                  <TableHead className="px-3 text-xs text-center">Aprovados</TableHead>
                  <TableHead className="px-3 text-xs text-center">Reprovados</TableHead>
                  <TableHead className="px-3 text-xs text-center">Média</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.map((turma, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-3 py-2 text-xs font-medium">{turma.turma}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{turma.professor}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold text-green-600">{turma.aprovados}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold text-red-600">{turma.reprovados}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold">{turma.mediaGeral.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}