import type { FiltrosRelatorio } from "../../lib/types"
import { MetricCard } from "./components/metric-card"
import { ChartCard } from "./components/chart-card"
import { professores, turmas, disciplinas } from "../../lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, TrendingUp, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"

interface ProfessoresTabProps {
  filtros: FiltrosRelatorio
}

export function ProfessoresTab({ filtros }: ProfessoresTabProps) {
  const professorSelecionado =
    filtros.professorId && filtros.professorId !== "todos"
      ? professores.find((p) => p.id === filtros.professorId)
      : professores[0]

  if (!professorSelecionado) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecione um professor para visualizar os dados</p>
      </div>
    )
  }

  const turmasDoProf = turmas.filter((t) => t.professorId === professorSelecionado.id)
  const totalAlunos = turmasDoProf.reduce((sum, t) => sum + t.totalAlunos, 0)
  const totalAprovados = turmasDoProf.reduce((sum, t) => sum + t.aprovados, 0)
  const totalReprovados = turmasDoProf.reduce((sum, t) => sum + t.reprovados, 0)
  const taxaMediaAprovacao =
    turmasDoProf.length > 0
      ? Math.round(turmasDoProf.reduce((sum, t) => sum + (t.aprovados / t.totalAlunos) * 100, 0) / turmasDoProf.length)
      : 0
  const presenciaMedia =
    turmasDoProf.length > 0
      ? Math.round(turmasDoProf.reduce((sum, t) => sum + t.presenciaMedia, 0) / turmasDoProf.length)
      : 0

  const disciplinasUnicas = [...new Set(turmasDoProf.map((t) => t.disciplinaId))]

  return (
    <div className="space-y-6 pb-10">
      {/* Título do Professor */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">{professorSelecionado.nome}</h2>
        <p className="text-sm text-muted-foreground">
          Departamento: {professorSelecionado.departamento || "Não informado"}
        </p>
      </div>

      {/* Métricas do Professor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Turmas Ativas"
          value={turmasDoProf.length}
          icon={<BookOpen className="w-4 h-4 text-blue-600" />}
          backgroundColor="bg-blue-100"
        />
        <MetricCard
          title="Total de Alunos"
          value={totalAlunos}
          icon={<Users className="w-4 h-4 text-amber-600" />}
          backgroundColor="bg-amber-100"
        />
        <MetricCard
          title="Taxa Média Aprovação"
          value={taxaMediaAprovacao}
          unit="%"
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          backgroundColor="bg-green-100"
        />
        <MetricCard title="Presença Média" value={presenciaMedia} unit="%" valueClassName="text-2xl" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Desempenho por Disciplina */}
        <ChartCard title="Desempenho por Disciplina" subtitle="Taxa de aprovação e reprovação">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={turmasDoProf.map((turma) => ({
                disciplina: disciplinas.find((d) => d.id === turma.disciplinaId)?.nome || "Desconhecida",
                aprovacao: Math.round((turma.aprovados / turma.totalAlunos) * 100),
                reprovacao: Math.round((turma.reprovados / turma.totalAlunos) * 100),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="disciplina" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aprovacao" fill="#10b981" name="Aprovação %" />
              <Bar dataKey="reprovacao" fill="#ef4444" name="Reprovação %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Evolução de Presença */}
        <ChartCard title="Performance Geral" subtitle="Aprovados e reprovados por turma">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={turmasDoProf.map((t) => ({
                turma: t.nome.split(" - ")[1] || t.nome,
                aprovados: t.aprovados,
                reprovados: t.reprovados,
                presenca: t.presenciaMedia,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aprovados" fill="#10b981" name="Aprovados" />
              <Bar dataKey="reprovados" fill="#ef4444" name="Reprovados" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tabela de Turmas */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Turmas do Professor ({turmasDoProf.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Turma</TableHead>
                  <TableHead className="text-xs">Disciplina</TableHead>
                  <TableHead className="text-xs text-center">Total</TableHead>
                  <TableHead className="text-xs text-center">Aprovados</TableHead>
                  <TableHead className="text-xs text-center">Reprovados</TableHead>
                  <TableHead className="text-xs text-center">Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmasDoProf.map((turma) => (
                  <TableRow key={turma.id}>
                    <TableCell className="text-xs font-medium">{turma.nome}</TableCell>
                    <TableCell className="text-xs">
                      {disciplinas.find((d) => d.id === turma.disciplinaId)?.nome || "Desconhecida"}
                    </TableCell>
                    <TableCell className="text-xs text-center">{turma.totalAlunos}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge className="bg-green-600">{turma.aprovados}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant="destructive">{turma.reprovados}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">{turma.presenciaMedia}%</TableCell>
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
