//file: frontend/src/pages/aluno/curso/evolucao-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Progress } from "../../gestor/components/ui/progress"
import { Badge } from "../../gestor/components/ui/badge"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../gestor/components/ui/chart"

// Mock data
const progressData = {
  studentProgress: 65,
  classAverage: 58,
  status: "Ativo",
  completedCredits: 39,
  totalCredits: 60,
  completedDisciplines: 13,
  totalDisciplines: 20,
}

const performanceComparison = [
  { semester: "2023.1", student: 8.5, class: 7.8 },
  { semester: "2023.2", student: 9.0, class: 8.1 },
  { semester: "2024.1", student: 8.8, class: 7.9 },
  { semester: "2024.2", student: 9.2, class: 8.3 },
]

const attendanceData = [
  { semester: "2023.1", attendance: 95 },
  { semester: "2023.2", attendance: 98 },
  { semester: "2024.1", attendance: 92 },
  { semester: "2024.2", attendance: 96 },
]

export function EvolucaoCursoTab() {
  return (
    <div className="space-y-6">
      {/* Status and Progress Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{progressData.status}</span>
              <Badge variant="default" className="bg-academic text-academic-foreground">
                Em andamento
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progresso Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{progressData.studentProgress}%</span>
                <span className="text-sm text-muted-foreground">
                  {progressData.completedDisciplines}/{progressData.totalDisciplines} disciplinas
                </span>
              </div>
              <Progress value={progressData.studentProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Créditos Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{progressData.completedCredits}</span>
                <span className="text-sm text-muted-foreground">de {progressData.totalCredits} créditos</span>
              </div>
              <Progress value={(progressData.completedCredits / progressData.totalCredits) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo de Desempenho</CardTitle>
          <CardDescription>Suas notas médias comparadas com a média da turma</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              student: {
                label: "Você",
                color: "hsl(var(--academic))",
              },
              class: {
                label: "Média da Turma",
                color: "hsl(var(--muted-foreground))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceComparison}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="semester" className="text-xs" />
                <YAxis domain={[0, 10]} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="student" fill="hsl(var(--academic))" name="Você" radius={[4, 4, 0, 0]} />
                <Bar dataKey="class" fill="hsl(var(--muted-foreground))" name="Média da Turma" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Frequência</CardTitle>
          <CardDescription>Sua frequência ao longo dos semestres</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              attendance: {
                label: "Frequência (%)",
                color: "hsl(var(--academic))",
              },
            }}
            className="h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="semester" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--academic))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--academic))" }}
                  name="Frequência (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
