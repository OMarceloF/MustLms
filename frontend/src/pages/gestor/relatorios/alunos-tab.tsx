"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import type { FiltrosRelatorio } from "../../lib/types"
import { MetricCard } from "./components/metric-card"
import { ChartCard } from "./components/chart-card"
import { alunos, cursos } from "../../lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Users, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface AlunosTabProps {
  filtros: FiltrosRelatorio
}

export function AlunosTab({ filtros }: AlunosTabProps) {
  const [situacaoFiltro, setSituacaoFiltro] = useState<string>("todos")

  const alunosFiltrados = alunos.filter((a) => {
    if (filtros.cursoId && filtros.cursoId !== "todos" && a.cursoId !== filtros.cursoId) return false
    if (situacaoFiltro !== "todos" && a.situacao !== situacaoFiltro) return false
    return true
  })

  // Estatísticas gerais
  const totalAlunos = alunosFiltrados.length
  const mediaSemestralGeral =
    totalAlunos > 0
      ? Math.round((alunosFiltrados.reduce((sum, a) => sum + a.mediaSemestral, 0) / totalAlunos) * 10) / 10
      : 0
  const presencaMediaGeral =
    totalAlunos > 0 ? Math.round(alunosFiltrados.reduce((sum, a) => sum + a.presencaGlobal, 0) / totalAlunos) : 0
  const alunosAtivos = alunosFiltrados.filter((a) => a.situacao === "ativo").length

  const dadosGrafico = [
    { categoria: "Ativos", qtd: alunosFiltrados.filter((a) => a.situacao === "ativo").length },
    { categoria: "Trancados", qtd: alunosFiltrados.filter((a) => a.situacao === "trancado").length },
    { categoria: "Concluídos", qtd: alunosFiltrados.filter((a) => a.situacao === "concluido").length },
  ]

  return (
    <div className="space-y-6 pb-10">
      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Alunos"
          value={totalAlunos}
          icon={<Users className="w-4 h-4 text-blue-600" />}
          backgroundColor="bg-blue-100"
        />
        <MetricCard
          title="Alunos Ativos"
          value={alunosAtivos}
          icon={<TrendingUp className="w-4 h-4 text-green-600" />}
          backgroundColor="bg-green-100"
        />
        <MetricCard title="Média Semestral" value={mediaSemestralGeral} valueClassName="text-2xl" />
        <MetricCard title="Presença Média" value={presencaMediaGeral} unit="%" valueClassName="text-2xl" />
      </div>

      {/* Gráfico de Distribuição */}
      <ChartCard title="Distribuição de Alunos por Situação" subtitle="Status acadêmico">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="qtd" fill="#3b82f6" name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Tabela de Alunos */}
      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Lista de Alunos ({alunosFiltrados.length})</CardTitle>
          <Select value={situacaoFiltro} onValueChange={setSituacaoFiltro}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="trancado">Trancado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Matrícula</TableHead>
                  <TableHead className="text-xs">Curso</TableHead>
                  <TableHead className="text-xs text-center">Período</TableHead>
                  <TableHead className="text-xs text-center">Média</TableHead>
                  <TableHead className="text-xs text-center">Presença</TableHead>
                  <TableHead className="text-xs text-center">Situação</TableHead>
                  <TableHead className="text-xs text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunosFiltrados.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell className="text-xs font-medium">{aluno.nome}</TableCell>
                    <TableCell className="text-xs">{aluno.matricula}</TableCell>
                    <TableCell className="text-xs">{cursos.find((c) => c.id === aluno.cursoId)?.nome}</TableCell>
                    <TableCell className="text-xs text-center">{aluno.periodoAtual}º</TableCell>
                    <TableCell className="text-xs text-center font-medium">{aluno.mediaSemestral}</TableCell>
                    <TableCell className="text-xs text-center">{aluno.presencaGlobal}%</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge
                        variant={
                          aluno.situacao === "ativo"
                            ? "default"
                            : aluno.situacao === "trancado"
                              ? "outline"
                              : "secondary"
                        }
                        className={
                          aluno.situacao === "ativo" ? "bg-green-600" : aluno.situacao === "trancado" ? "" : ""
                        }
                      >
                        {aluno.situacao.charAt(0).toUpperCase() + aluno.situacao.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <Link to={`/relatorios/aluno/${aluno.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </TableCell>
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
