"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { TrendingUp, Users, Award, Calendar } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../gestor/components/ui/chart"

const performanceData = [
  { avaliacao: "P1", nota: 8.5, media: 7.2 },
  { avaliacao: "Trab 1", nota: 9.0, media: 7.8 },
  { avaliacao: "P2", nota: 8.8, media: 7.5 },
  { avaliacao: "Semin", nota: 9.2, media: 8.0 },
]

export function EvolucaoDisciplinaTab() {
  return (
    <div className="space-y-6">
      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.88</div>
            <p className="text-xs text-muted-foreground">+0.3 desde última avaliação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.63</div>
            <p className="text-xs text-muted-foreground">32 alunos matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posição no Ranking</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Top 15%</div>
            <p className="text-xs text-muted-foreground">5º lugar na turma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequência</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <Progress value={95} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Desempenho</CardTitle>
          <CardDescription>Comparação entre suas notas e a média da turma</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              nota: {
                label: "Sua Nota",
                color: "hsl(var(--chart-1))",
              },
              media: {
                label: "Média da Turma",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="avaliacao" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[0, 10]} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="nota" fill="var(--color-nota)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="media" fill="var(--color-media)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Feedback Card */}
      <Card className="border-accent/50 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Feedback do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">
            Excelente desempenho! Você está consistentemente acima da média da turma e demonstra evolução positiva ao
            longo do semestre. Continue mantendo a frequência alta e o engajamento nas atividades. Seu desempenho no
            seminário foi particularmente notável.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
