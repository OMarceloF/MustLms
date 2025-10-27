"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Checkbox } from "../components/ui/checkbox"
import { useToast } from "../hooks/use-toast"

type TipoCurso = "Graduação" | "Pós" | "Mestrado" | "Doutorado"

type Curso = {
  id: number
  nome: string
  tipo: TipoCurso
}

type Materia = {
  id: number
  nome: string
  codigo: string
  cargaHoraria: number
}

type Periodo = {
  id: number
  nome: string
  materias: Materia[]
}

type GradeCurricular = {
  id: number
  curso: Curso
  periodoAcademico: string
  periodos: Periodo[]
}

const API_BASE = "/api"

async function getCursos(): Promise<Curso[]> {
  const response = await fetch(`${API_BASE}/cursos`)
  if (!response.ok) throw new Error("Erro ao buscar cursos")
  return response.json()
}

async function getMaterias(): Promise<Materia[]> {
  const response = await fetch(`${API_BASE}/materias`)
  if (!response.ok) throw new Error("Erro ao buscar matérias")
  return response.json()
}

async function updateGrade(id: number, grade: Partial<GradeCurricular>): Promise<GradeCurricular> {
  const response = await fetch(`${API_BASE}/grades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(grade),
  })
  if (!response.ok) throw new Error("Erro ao atualizar grade")
  return response.json()
}

interface EditGradeModalProps {
  grade: GradeCurricular
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditGradeModal({ grade, open, onClose, onSuccess }: EditGradeModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])

  const [cursoId, setCursoId] = useState(grade.curso.id.toString())
  const [periodoAcademico, setPeriodoAcademico] = useState(grade.periodoAcademico)
  const [periodos, setPeriodos] = useState<Periodo[]>(grade.periodos)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [cursosData, materiasData] = await Promise.all([getCursos(), getMaterias()])
      setCursos(cursosData)
      setMaterias(materiasData)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      })
    }
  }

  const toggleMateria = (periodoId: number, materia: Materia) => {
    setPeriodos((prev) =>
      prev.map((periodo) => {
        if (periodo.id !== periodoId) return periodo

        const hasMateria = periodo.materias.some((m) => m.id === materia.id)
        return {
          ...periodo,
          materias: hasMateria ? periodo.materias.filter((m) => m.id !== materia.id) : [...periodo.materias, materia],
        }
      }),
    )
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const curso = cursos.find((c) => c.id.toString() === cursoId)
      if (!curso) throw new Error("Curso não encontrado")

      await updateGrade(grade.id, {
        curso,
        periodoAcademico,
        periodos,
      })

      toast({
        title: "Sucesso",
        description: "Grade atualizada com sucesso",
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar grade",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getTotalCargaHoraria = () => {
    return periodos.reduce((total, periodo) => {
      return total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0)
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Grade Curricular</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={cursoId} onValueChange={setCursoId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id.toString()}>
                      {curso.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período Acadêmico</label>
              <Select value={periodoAcademico} onValueChange={setPeriodoAcademico}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024.1">2024.1</SelectItem>
                  <SelectItem value="2024.2">2024.2</SelectItem>
                  <SelectItem value="2025.1">2025.1</SelectItem>
                  <SelectItem value="2025.2">2025.2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Total Workload */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium">
              Carga Horária Total: <span className="text-lg font-bold">{getTotalCargaHoraria()}h</span>
            </p>
          </div>

          {/* Periods */}
          <div>
            <h4 className="font-semibold mb-3">Matérias por Período</h4>
            <Accordion type="single" collapsible className="w-full">
              {periodos.map((periodo) => (
                <AccordionItem key={periodo.id} value={`periodo-${periodo.id}`}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                      <span>{periodo.nome}</span>
                      <span className="text-sm text-muted-foreground">{periodo.materias.length} matérias</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {materias.map((materia) => {
                        const isSelected = periodo.materias.some((m) => m.id === materia.id)
                        return (
                          <div key={materia.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleMateria(periodo.id, materia)} />
                            <div className="flex-1">
                              <p className="font-medium">{materia.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {materia.codigo} • {materia.cargaHoraria}h
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
