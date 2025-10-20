//file: frontend/src/pages/aluno/curso/relatorios-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Progress } from "../../gestor/components/ui/progress"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../gestor/components/ui/chart"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

// Mock data
const performanceMetrics = {
    taxaAprovacao: 92,
    frequenciaMedia: 95,
    taxaConclusao: 65,
    mediaGeral: 8.9,
}

const evolutionData = [
    { periodo: "2023.1", media: 8.5, frequencia: 95 },
    { periodo: "2023.2", media: 9.0, frequencia: 98 },
    { periodo: "2024.1", media: 8.8, frequencia: 92 },
    { periodo: "2024.2", media: 9.2, frequencia: 96 },
]

const disciplinePerformance = [
    { disciplina: "Metodologia", nota: 9.5 },
    { disciplina: "Estatística", nota: 8.8 },
    { disciplina: "Seminários I", nota: 9.0 },
    { disciplina: "Tópicos Avançados", nota: 9.2 },
]

const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-academic" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-destructive" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
}

export function RelatoriosTab() {
    return (
        <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Taxa de Aprovação</CardDescription>
                        <CardTitle className="text-3xl">{performanceMetrics.taxaAprovacao}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={performanceMetrics.taxaAprovacao} className="h-2" />
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            {getTrendIcon(92, 88)}
                            <span>+4% em relação ao semestre anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Frequência Média</CardDescription>
                        <CardTitle className="text-3xl">{performanceMetrics.frequenciaMedia}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={performanceMetrics.frequenciaMedia} className="h-2" />
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            {getTrendIcon(95, 93)}
                            <span>+2% em relação ao semestre anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Taxa de Conclusão</CardDescription>
                        <CardTitle className="text-3xl">{performanceMetrics.taxaConclusao}%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={performanceMetrics.taxaConclusao} className="h-2" />
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            {getTrendIcon(65, 58)}
                            <span>+7% em relação ao período anterior</span>
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Média Geral</CardDescription>
                        <CardTitle className="text-3xl">{performanceMetrics.mediaGeral}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={(performanceMetrics.mediaGeral / 10) * 100} className="h-2" />
                        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            {getTrendIcon(8.9, 8.7)}
                            <span>+0.2 em relação ao semestre anterior</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Evolution Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolução Temporal</CardTitle>
                    <CardDescription>Média de notas e frequência ao longo dos semestres</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            media: {
                                label: "Média de Notas",
                                color: "hsl(var(--academic))",
                            },
                            frequencia: {
                                label: "Frequência (%)",
                                color: "hsl(var(--chart-2))",
                            },
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolutionData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="periodo" className="text-xs" />
                                <YAxis yAxisId="left" domain={[0, 10]} className="text-xs" />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="media"
                                    stroke="hsl(var(--academic))"
                                    strokeWidth={2}
                                    dot={{ fill: "hsl(var(--academic))" }}
                                    name="Média de Notas"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="frequencia"
                                    stroke="hsl(var(--chart-2))"
                                    strokeWidth={2}
                                    dot={{ fill: "hsl(var(--chart-2))" }}
                                    name="Frequência (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Discipline Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Desempenho por Disciplina</CardTitle>
                    <CardDescription>Notas obtidas nas disciplinas concluídas</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            nota: {
                                label: "Nota",
                                color: "hsl(var(--academic))",
                            },
                        }}
                        className="h-[300px]"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disciplinePerformance}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="disciplina" className="text-xs" />
                                <YAxis domain={[0, 10]} className="text-xs" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="nota" fill="hsl(var(--academic))" name="Nota" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
