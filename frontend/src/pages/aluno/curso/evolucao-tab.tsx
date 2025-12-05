// frontend/src/pages/aluno/curso/evolucao-tab.tsx

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Progress } from "../../gestor/components/ui/progress"
import { Badge } from "../../gestor/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../gestor/components/ui/chart"
import { useAuth } from "../../../hooks/useAuth"
import { AlertCircle, Loader2 } from "lucide-react"

interface OverviewData {
  studentProgress: number
  status: string
  completedCredits: number
  totalCredits: number
  completedDisciplines: number
  totalDisciplines: number
}

interface PerformanceData {
  semester: string
  student: number
  class: number
}

export function EvolucaoCursoTab() {
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [performance, setPerformance] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { user } = useAuth()
  const usuarioId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuarioId) return

      try {
        const apiUrl = 'http://localhost:3001'
        const response = await axios.get(`${apiUrl}/api/alunos/${usuarioId}/evolucao`)
        
        setOverview(response.data.overview)
        setPerformance(response.data.performance)
        setError("")
      } catch (err) {
        console.error("Erro ao buscar dados de evolução:", err)
        setError("Não foi possível carregar os dados de evolução.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [usuarioId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Carregando dados de evolução...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-2 text-red-500">
        <AlertCircle className="h-8 w-8" />
        <p>{error}</p>
      </div>
    )
  }

  if (!overview) return null

  // Garante conversão para número
  const chartPerformance = performance.map(p => ({
    ...p,
    student: Number(p.student),
    class: Number(p.class)
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Status */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Status do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-slate-900 capitalize">{overview.status}</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none px-3 py-1">
                {overview.status === 'Ativa' ? 'Em andamento' : overview.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progresso */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Progresso Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900">{overview.studentProgress}%</span>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {overview.completedDisciplines} de {overview.totalDisciplines} disciplinas
                </span>
              </div>
              <Progress value={overview.studentProgress} className="h-2.5 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Créditos */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Créditos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900">{overview.completedCredits}</span>
                <span className="text-sm font-medium text-slate-500">
                  de {overview.totalCredits} créditos
                </span>
              </div>
              <Progress 
                value={overview.totalCredits > 0 ? (overview.completedCredits / overview.totalCredits) * 100 : 0} 
                className="h-2.5 bg-slate-100" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Desempenho (Sua Média vs Média da Turma) */}
      <div className="grid gap-6 md:grid-cols-1">
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Comparativo de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
            {chartPerformance.length > 0 ? (
                <ChartContainer
                    config={{
                    student: { label: "Sua Média", color: "#2563eb" }, 
                    class: { label: "Média da Turma", color: "#94a3b8" }, 
                    }}
                    className="h-[350px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200" />
                        <XAxis 
                            dataKey="semester" 
                            className="text-xs font-medium" 
                            tickLine={false} 
                            axisLine={false}
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis 
                            className="text-xs font-medium" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b' }}
                            domain={[0, 100]} 
                        />
                        <ChartTooltip 
                            content={<ChartTooltipContent />} 
                            cursor={{ fill: '#f1f5f9' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="student" fill="#2563eb" name="Sua Média" radius={[4, 4, 0, 0]} barSize={50} />
                        {/* Agora a barra da turma será renderizada com dados reais */}
                        <Bar dataKey="class" fill="#94a3b8" name="Média da Turma" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 border border-dashed rounded-lg bg-slate-50">
                    Sem dados de notas suficientes para gerar o gráfico.
                </div>
            )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}