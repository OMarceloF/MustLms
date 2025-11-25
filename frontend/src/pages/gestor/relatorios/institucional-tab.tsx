import type { FiltrosRelatorio } from "../../lib/types"
import { MetricCard } from "./components/metric-card"
import { ChartCard } from "./components/chart-card"
import {
  metricasInstitucionais,
  dadosEvolucaoMatriculas,
  dadosDesempenhoAcademico,
  dadosEvasaoPorCurso,
  dadosModalidade,
  satisfacaoPorCurso,
  cursos,
} from "../../lib/mock-data"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Users, TrendingUp, TrendingDown, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"

interface InstitucionalTabProps {
  filtros: FiltrosRelatorio
}

export function InstitucionalTab({ filtros }: InstitucionalTabProps) {
  const m = metricasInstitucionais

  return (
    <div className="space-y-6 pb-10">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Alunos Ativos"
          value={m.alunosAtivos}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          backgroundColor="bg-blue-100"
          trend={{ value: 3, isPositive: true, label: "vs. semestre anterior" }}
        />
        <MetricCard
          title="Taxa de Retenção"
          value={m.taxaRetencaoGeral}
          unit="%"
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          backgroundColor="bg-green-100"
          trend={{ value: 2, isPositive: true, label: "vs. semestre anterior" }}
        />
        <MetricCard
          title="Taxa de Evasão"
          value={m.taxaEvasaoGeral}
          unit="%"
          icon={<TrendingDown className="w-4 h-4 text-red-600" />}
          backgroundColor="bg-red-100"
          trend={{ value: 1, isPositive: false, label: "vs. semestre anterior" }}
        />
        <MetricCard
          title="Taxa Média Aprovação"
          value={m.taxaMediaAprovacao}
          unit="%"
          icon={<BookOpen className="w-4 h-4 text-amber-600" />}
          backgroundColor="bg-amber-100"
          trend={{ value: 1, isPositive: true, label: "vs. semestre anterior" }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tempo Médio Conclusão"
          value={m.tempoMedioConclusao}
          unit="meses"
          valueClassName="text-2xl"
        />
        <MetricCard title="Professores Ativos" value={m.professorAtivos} valueClassName="text-2xl" />
        <MetricCard title="Cursos Ativos" value={m.cursosAtivos} valueClassName="text-2xl" />
        <MetricCard title="Turmas Abertas" value={m.turmasAbertas} valueClassName="text-2xl" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolução de Matrículas */}
        <ChartCard title="Evolução de Matrículas" subtitle="Semestre a semestre">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosEvolucaoMatriculas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semestre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ingressantes" stroke="#3b82f6" name="Ingressantes" />
              <Line type="monotone" dataKey="desligados" stroke="#ef4444" name="Desligados" />
              <Line type="monotone" dataKey="totalAtivos" stroke="#10b981" name="Total Ativos" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Distribuição por Modalidade */}
        <ChartCard title="Distribuição por Modalidade">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosModalidade}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosModalidade.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Acadêmica Geral */}
        <ChartCard title="Performance Acadêmica Geral" subtitle="Taxa de aprovação, reprovação e desistência">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosDesempenhoAcademico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semestre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aprovacao" fill="#10b981" name="Aprovação %" />
              <Bar dataKey="reprovacao" fill="#ef4444" name="Reprovação %" />
              <Bar dataKey="desistencia" fill="#f59e0b" name="Desistência %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Evasão por Curso */}
        <ChartCard title="Evasão por Curso" subtitle="Top 5 cursos com maior evasão">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosEvasaoPorCurso} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="curso" type="category" width={95} />
              <Tooltip />
              <Bar dataKey="evasaoPercentual" fill="#ef4444" name="Evasão %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Satisfação por Curso - Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Índice de Satisfação por Curso" subtitle="Escala 0-100">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={satisfacaoPorCurso}>
              <PolarGrid />
              <PolarAngleAxis dataKey="nome" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Satisfação" dataKey="satisfacao" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Resumo Institucional - Tabela */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Curso</TableHead>
                    <TableHead className="text-xs">Alunos</TableHead>
                    <TableHead className="text-xs">Aprovação</TableHead>
                    <TableHead className="text-xs">Evasão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cursos.map((curso) => (
                    <TableRow key={curso.id}>
                      <TableCell className="text-xs font-medium">{curso.nome}</TableCell>
                      <TableCell className="text-xs">{curso.alunosAtivos}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="default" className="bg-green-600">
                          {curso.taxaAprovacao}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="destructive">{curso.taxaEvasao}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
