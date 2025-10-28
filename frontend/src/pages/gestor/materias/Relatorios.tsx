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
  }, [ selectedTurma, selectedPeriodo])

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
    <Card className="shadow-md rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div
            className={`p-3 rounded-full ${trend === "up" ? "bg-green-100" : trend === "down" ? "bg-red-100" : "bg-blue-100"}`}
          >
            <Icon
              className={`h-6 w-6 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-blue-600"}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando relatórios...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Relatórios e Indicadores</h2>
        <p className="text-muted-foreground mt-1">Visão geral do desempenho acadêmico</p>
      </div>

      {/* Filters */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
            <div>
              <label className="text-sm font-medium mb-2 block">Turma</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
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
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total de Alunos" value={metrics.totalAlunos} icon={Users} trend="neutral" />
        <MetricCard title="Taxa de Aprovação" value={`${metrics.taxaAprovacao}%`} icon={TrendingUp} trend="up" />
        <MetricCard title="Taxa de Reprovação" value={`${metrics.taxaReprovacao}%`} icon={TrendingDown} trend="down" />
        <MetricCard title="Total de Professores" value={metrics.totalProfessores} icon={UserCheck} trend="neutral" />
      </div>

      {/* Chart */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Desempenho Comparativo por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aprovados" fill="#22c55e" name="Aprovados" />
              <Bar dataKey="reprovados" fill="#ef4444" name="Reprovados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Resumo por Turma</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead className="text-center">Aprovados</TableHead>
                <TableHead className="text-center">Reprovados</TableHead>
                <TableHead className="text-center">Média Geral</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turmas.map((turma, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{turma.turma}</TableCell>
                  <TableCell>{turma.professor}</TableCell>
                  <TableCell className="text-center text-green-600 font-semibold">{turma.aprovados}</TableCell>
                  <TableCell className="text-center text-red-600 font-semibold">{turma.reprovados}</TableCell>
                  <TableCell className="text-center font-semibold">{turma.mediaGeral.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
