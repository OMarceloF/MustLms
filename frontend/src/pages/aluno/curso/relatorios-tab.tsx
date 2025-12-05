// frontend/src/pages/aluno/curso/relatorios-tab.tsx

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Progress } from "../../gestor/components/ui/progress"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../gestor/components/ui/chart"
import { TrendingUp, Award, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "../../../hooks/useAuth"

interface Metrics {
  taxaAprovacao: number
  posicaoNaTurma: string
  taxaConclusao: number
  mediaGeral: number
}

// Interface atualizada para conter as duas médias
interface EvolutionData {
  periodo: string
  mediaAluno: number | null
  mediaTurma: number
}

interface DisciplineData {
  disciplina: string
  nota: number
}

export function RelatoriosTab() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([])
  const [disciplineData, setDisciplineData] = useState<DisciplineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { user } = useAuth()
  const usuarioId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuarioId) return

      try {
        const apiUrl = 'http://localhost:3001'
        const response = await axios.get(`${apiUrl}/api/alunos/${usuarioId}/relatorios-academicos`)
        
        setMetrics(response.data.metrics)
        
        // Garante conversão para números
        const evData = response.data.evolution.map((e: any) => ({
            periodo: e.periodo,
            mediaAluno: e.mediaAluno ? Number(e.mediaAluno) : null,
            mediaTurma: Number(e.mediaTurma)
        }));
        
        setEvolutionData(evData)
        setDisciplineData(response.data.disciplinePerformance)
        setError("")
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err)
        setError("Não foi possível carregar os dados do relatório.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [usuarioId])

  if (loading) {
    return <div className="flex justify-center p-12 text-slate-500"><Loader2 className="animate-spin h-8 w-8" /></div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2"><AlertCircle /><p>{error}</p></div>
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Performance Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Taxa de Aprovação */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Aprovação</CardDescription>
            <CardTitle className="text-3xl text-slate-800">{metrics.taxaAprovacao}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.taxaAprovacao} className="h-2 bg-slate-100" />
            <p className="mt-2 text-xs text-muted-foreground">Disciplinas aprovadas / tentadas</p>
          </CardContent>
        </Card>

        {/* Posição na Turma */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Posição na Turma</CardDescription>
            <CardTitle className="text-3xl text-slate-800 flex items-center gap-2">
                {metrics.posicaoNaTurma}
                {metrics.posicaoNaTurma !== 'N/A' && <Award className="h-6 w-6 text-yellow-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-1"></div>
            <p className="mt-2 text-xs text-muted-foreground">Ranking baseado na média geral</p>
          </CardContent>
        </Card>

        {/* Taxa de Conclusão */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Conclusão</CardDescription>
            <CardTitle className="text-3xl text-slate-800">{metrics.taxaConclusao}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.taxaConclusao} className="h-2 bg-slate-100" />
            <p className="mt-2 text-xs text-muted-foreground">Créditos concluídos / totais</p>
          </CardContent>
        </Card>

        {/* Média Geral */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Média Geral</CardDescription>
            <CardTitle className="text-3xl text-slate-800">{metrics.mediaGeral}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.mediaGeral} className="h-2 bg-slate-100" />
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Desempenho acumulado</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart (Comparativo: Aluno vs Turma) */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
          <CardDescription>Sua média vs. Média da Turma ao longo dos semestres</CardDescription>
        </CardHeader>
        <CardContent>
            {evolutionData.length > 0 ? (
                <ChartContainer
                    config={{
                        mediaAluno: { label: "Sua Média", color: "#2563eb" }, // Blue-600
                        mediaTurma: { label: "Média da Turma", color: "#94a3b8" }, // Slate-400
                    }}
                    className="h-[300px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200" />
                        <XAxis 
                            dataKey="periodo" 
                            className="text-xs font-medium" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis 
                            domain={[0, 100]} 
                            className="text-xs font-medium" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        
                        {/* Linha do Aluno */}
                        <Line
                            type="monotone"
                            dataKey="mediaAluno"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ fill: "#2563eb", r: 4, strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6 }}
                            name="Sua Média"
                            connectNulls // Conecta pontos se houver um semestre sem nota no meio
                        />

                        {/* Linha da Turma */}
                        <Line
                            type="monotone"
                            dataKey="mediaTurma"
                            stroke="#94a3b8"
                            strokeWidth={3}
                            strokeDasharray="5 5" // Linha tracejada para diferenciar
                            dot={{ fill: "#94a3b8", r: 4, strokeWidth: 2, stroke: "#fff" }}
                            name="Média da Turma"
                        />
                    </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 border border-dashed rounded-lg bg-slate-50">
                    Sem dados históricos suficientes.
                </div>
            )}
        </CardContent>
      </Card>

      {/* Discipline Performance Chart */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Desempenho por Disciplina</CardTitle>
          <CardDescription>Notas obtidas nas disciplinas cursadas</CardDescription>
        </CardHeader>
        <CardContent>
            {disciplineData.length > 0 ? (
                <ChartContainer
                    config={{
                    nota: { label: "Nota Final", color: "#0f172a" }, 
                    }}
                    className="h-[300px] w-full"
                >
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={disciplineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200" />
                        <XAxis 
                            dataKey="disciplina" 
                            className="text-xs font-medium" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b' }}
                            interval={0} 
                        />
                        <YAxis 
                            domain={[0, 100]} 
                            className="text-xs font-medium" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#64748b' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar 
                            dataKey="nota" 
                            fill="#0f172a" 
                            name="Nota Final" 
                            radius={[4, 4, 0, 0]} 
                            barSize={40}
                        />
                    </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 border border-dashed rounded-lg bg-slate-50">
                    Nenhuma nota lançada ainda.
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}