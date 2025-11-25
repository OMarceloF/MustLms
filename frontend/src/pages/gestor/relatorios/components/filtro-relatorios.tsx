"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { RotateCcw } from "lucide-react"
import type { FiltrosRelatorio } from "../../../lib/types"
import { periodosLetivos, cursos, disciplinas } from "../../../lib/mock-data"

interface FiltroRelatoriosProps {
  filtros: FiltrosRelatorio
  onFiltrosChange: (filtros: FiltrosRelatorio) => void
}

export function FiltroRelatorios({ filtros, onFiltrosChange }: FiltroRelatoriosProps) {
  // Disciplinas filtradas por curso
  const disciplinasDoFiltro =
    filtros.cursoId && filtros.cursoId !== "todos"
      ? disciplinas.filter((d) => d.cursoId === filtros.cursoId)
      : disciplinas

  const handleLimparFiltros = () => {
    onFiltrosChange({
      periodoId: "todos",
      cursoId: "todos",
      disciplinaId: "todos",
      turmaId: "todos",
      professorId: "todos",
      modalidade: "todos",
      ano: "todos",
    })
  }

  return (
    <Card className="border-border mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Período Letivo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Período Letivo</label>
            <Select
              value={filtros.periodoId}
              onValueChange={(value) => onFiltrosChange({ ...filtros, periodoId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {periodosLetivos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Curso */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Curso</label>
            <Select
              value={filtros.cursoId}
              onValueChange={(value) =>
                onFiltrosChange({
                  ...filtros,
                  cursoId: value,
                  disciplinaId: "todos",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {cursos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Disciplina */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Disciplina</label>
            <Select
              value={filtros.disciplinaId}
              onValueChange={(value) => onFiltrosChange({ ...filtros, disciplinaId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {disciplinasDoFiltro.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Modalidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Modalidade</label>
            <Select
              value={filtros.modalidade}
              onValueChange={(value: any) => onFiltrosChange({ ...filtros, modalidade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="ead">EAD</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão Limpar */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleLimparFiltros} className="gap-2 bg-transparent">
            <RotateCcw className="w-4 h-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
