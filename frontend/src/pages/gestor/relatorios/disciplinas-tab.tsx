import type { FiltrosRelatorio } from "../../lib/types"
import { MetricCard } from "./components/metric-card"
import { ChartCard } from "./components/chart-card"
import { disciplinas, turmas, cursos } from "../../lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { BookOpen, Users, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"

interface DisciplinasTabProps {
    filtros: FiltrosRelatorio
}

export function DisciplinasTab({ filtros }: DisciplinasTabProps) {
    const disciplinasSelecionadas =
        filtros.disciplinaId && filtros.disciplinaId !== "todos"
            ? disciplinas.filter((d) => d.id === filtros.disciplinaId)
            : filtros.cursoId && filtros.cursoId !== "todos"
                ? disciplinas.filter((d) => d.cursoId === filtros.cursoId)
                : disciplinas

    if (disciplinasSelecionadas.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma disciplina encontrada para os filtros selecionados</p>
            </div>
        )
    }

    const disciplinaAtual = disciplinasSelecionadas[0]
    const turmasDaDisciplina = turmas.filter((t) => t.disciplinaId === disciplinaAtual.id)

    const totalAlunos = turmasDaDisciplina.reduce((sum, t) => sum + t.totalAlunos, 0)
    const totalAprovados = turmasDaDisciplina.reduce((sum, t) => sum + t.aprovados, 0)
    const totalReprovados = turmasDaDisciplina.reduce((sum, t) => sum + t.reprovados, 0)
    const totalDesistentes = turmasDaDisciplina.reduce((sum, t) => sum + t.desistentes, 0)

    const taxaAprovacao = totalAlunos > 0 ? Math.round((totalAprovados / totalAlunos) * 100) : 0
    const taxaReprovacao = totalAlunos > 0 ? Math.round((totalReprovados / totalAlunos) * 100) : 0
    const taxaDesistencia = totalAlunos > 0 ? Math.round((totalDesistentes / totalAlunos) * 100) : 0

    const nomeCurso = cursos.find((c) => c.id === disciplinaAtual.cursoId)?.nome

    return (
        <div className="space-y-6 pb-10">
            {/* Título da Disciplina */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">{disciplinaAtual.nome}</h2>
                <p className="text-sm text-muted-foreground">
                    Código: {disciplinaAtual.codigo} | Curso: {nomeCurso} | Turmas: {turmasDaDisciplina.length}
                </p>
            </div>

            {/* Métricas da Disciplina */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total de Alunos"
                    value={totalAlunos}
                    icon={<Users className="w-4 h-4 text-blue-600" />}
                    backgroundColor="bg-blue-100"
                />
                <MetricCard
                    title="Taxa de Aprovação"
                    value={taxaAprovacao}
                    unit="%"
                    icon={<BarChart3 className="w-4 h-4 text-green-600" />}
                    backgroundColor="bg-green-100"
                />
                <MetricCard
                    title="Taxa de Reprovação"
                    value={taxaReprovacao}
                    unit="%"
                    icon={<BarChart3 className="w-4 h-4 text-red-600" />}
                    backgroundColor="bg-red-100"
                />
                <MetricCard
                    title="Taxa de Desistência"
                    value={taxaDesistencia}
                    unit="%"
                    icon={<BookOpen className="w-4 h-4 text-amber-600" />}
                    backgroundColor="bg-amber-100"
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Desempenho por Turma */}
                <ChartCard title="Desempenho Comparativo por Turma" subtitle="Aprovados, reprovados e desistentes">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={turmasDaDisciplina.map((t) => ({
                                turma: t.nome.split(" - ")[1] || t.nome,
                                aprovados: t.aprovados,
                                reprovados: t.reprovados,
                                desistentes: t.desistentes,
                            }))}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="turma" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="aprovados" fill="#10b981" name="Aprovados" />
                            <Bar dataKey="reprovados" fill="#ef4444" name="Reprovados" />
                            <Bar dataKey="desistentes" fill="#f59e0b" name="Desistentes" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Performance Geral */}
                <ChartCard title="Resumo de Desempenho" subtitle="Distribuição geral da disciplina">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                {
                                    categoria: "Resultado",
                                    aprovados: totalAprovados,
                                    reprovados: totalReprovados,
                                    desistentes: totalDesistentes,
                                },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="categoria" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="aprovados" fill="#10b981" name="Aprovados" />
                            <Bar dataKey="reprovados" fill="#ef4444" name="Reprovados" />
                            <Bar dataKey="desistentes" fill="#f59e0b" name="Desistentes" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Tabela de Turmas */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Resumo por Turma ({turmasDaDisciplina.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Turma</TableHead>
                                    <TableHead className="text-xs text-center">Total</TableHead>
                                    <TableHead className="text-xs text-center">Aprovados</TableHead>
                                    <TableHead className="text-xs text-center">Reprovados</TableHead>
                                    <TableHead className="text-xs text-center">Desistentes</TableHead>
                                    <TableHead className="text-xs text-center">Presença</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {turmasDaDisciplina.map((turma) => (
                                    <TableRow key={turma.id}>
                                        <TableCell className="text-xs font-medium">{turma.nome}</TableCell>
                                        <TableCell className="text-xs text-center">{turma.totalAlunos}</TableCell>
                                        <TableCell className="text-xs text-center">
                                            <Badge className="bg-green-600">{turma.aprovados}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-center">
                                            <Badge variant="destructive">{turma.reprovados}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-center">
                                            <Badge variant="outline">{turma.desistentes}</Badge>
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
