import type { FiltrosRelatorio } from "../../lib/types"
import { MetricCard } from "./components/metric-card"
import { ChartCard } from "./components/chart-card"
import { cursos, disciplinas, turmas, dadosDesempenhoAcademico } from "../../lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { BookOpen, Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"

interface CursosTabProps {
    filtros: FiltrosRelatorio
}

export function CursosTab({ filtros }: CursosTabProps) {
    const cursoSelecionado =
        filtros.cursoId && filtros.cursoId !== "todos" ? cursos.find((c) => c.id === filtros.cursoId) : cursos[0]

    if (!cursoSelecionado) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Selecione um curso para visualizar os dados</p>
            </div>
        )
    }

    const disciplinasDoFiltro = disciplinas.filter((d) => d.cursoId === cursoSelecionado.id)
    const turmasDoFiltro = turmas.filter((t) => t.cursoId === cursoSelecionado.id)

    return (
        <div className="space-y-6 pb-10">
            {/* Título do Curso */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">{cursoSelecionado.nome}</h2>
                <p className="text-sm text-muted-foreground">
                    Coordenador: {cursoSelecionado.coordenador} | Modalidade:{" "}
                    <Badge variant="outline" className="ml-1">
                        {cursoSelecionado.modalidade}
                    </Badge>
                </p>
            </div>

            {/* Métricas do Curso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Alunos Matriculados"
                    value={cursoSelecionado.alunosAtivos}
                    icon={<Users className="w-4 h-4 text-blue-600" />}
                    backgroundColor="bg-blue-100"
                />
                <MetricCard
                    title="Taxa de Aprovação"
                    value={cursoSelecionado.taxaAprovacao}
                    unit="%"
                    icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                    backgroundColor="bg-green-100"
                />
                <MetricCard
                    title="Taxa de Evasão"
                    value={cursoSelecionado.taxaEvasao}
                    unit="%"
                    icon={<BookOpen className="w-4 h-4 text-red-600" />}
                    backgroundColor="bg-red-100"
                />
                <MetricCard title="Média de Notas" value={cursoSelecionado.mediaNota} valueClassName="text-2xl" />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Desempenho por Semestre */}
                <ChartCard title="Desempenho por Semestre" subtitle="Aprovação, reprovação e desistência">
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

                {/* Situação Atual dos Alunos */}
                <ChartCard title="Situação Atual dos Alunos" subtitle="Distribuição de alunos">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                {
                                    situacao: "Ativos",
                                    qtd: cursoSelecionado.alunosAtivos,
                                    fill: "#3b82f6",
                                },
                                {
                                    situacao: "Trancados",
                                    qtd: Math.floor(cursoSelecionado.alunosAtivos * 0.05),
                                    fill: "#f59e0b",
                                },
                                {
                                    situacao: "Concluídos",
                                    qtd: Math.floor(cursoSelecionado.alunosAtivos * 0.15),
                                    fill: "#10b981",
                                },
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="situacao" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="qtd" fill="#3b82f6" name="Quantidade" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Tabela de Disciplinas */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Disciplinas do Curso ({disciplinasDoFiltro.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Disciplina</TableHead>
                                    <TableHead className="text-xs">Código</TableHead>
                                    <TableHead className="text-xs text-center">Turmas</TableHead>
                                    <TableHead className="text-xs text-right">Alunos</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disciplinasDoFiltro.map((disciplina) => {
                                    const turmasDaDisciplina = turmasDoFiltro.filter((t) => t.disciplinaId === disciplina.id)
                                    const totalAlunosDisciplina = turmasDaDisciplina.reduce((sum, t) => sum + t.totalAlunos, 0)

                                    return (
                                        <TableRow key={disciplina.id}>
                                            <TableCell className="text-xs font-medium">{disciplina.nome}</TableCell>
                                            <TableCell className="text-xs">{disciplina.codigo}</TableCell>
                                            <TableCell className="text-xs text-center">{turmasDaDisciplina.length}</TableCell>
                                            <TableCell className="text-xs text-right">{totalAlunosDisciplina}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de Turmas */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Turmas Ativas ({turmasDoFiltro.length})</CardTitle>
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
                                    <TableHead className="text-xs text-center">Desistências</TableHead>
                                    <TableHead className="text-xs text-center">Presença</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {turmasDoFiltro.map((turma) => (
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
