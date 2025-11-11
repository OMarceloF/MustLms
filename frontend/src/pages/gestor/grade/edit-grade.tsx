"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Checkbox } from "../components/ui/checkbox"
import { useToast } from "../hooks/use-toast"
import type { GradeCurricular } from "./grade" // Importando o tipo do componente principal

// --- CONSTANTES E TIPAGEM ---
const API_BASE_URL = 'http://localhost:3001/api';

type TipoCurso = "Graduação" | "Pós" | "Mestrado" | "Doutorado" | "especializacao";

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

// --- FUNÇÕES DE API REAIS ---

async function getCursos( ): Promise<Curso[]> {
    const response = await fetch(`${API_BASE_URL}/cursos-posgraduacao`);
    if (!response.ok) throw new Error("Falha ao buscar cursos");
    return response.json();
}

async function getMaterias(): Promise<Materia[]> {
    const response = await fetch(`${API_BASE_URL}/grades/form-data/materias`);
    if (!response.ok) throw new Error("Falha ao buscar matérias");
    return response.json();
}

async function updateGrade(id: number, gradeData: any): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/grades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradeData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar a grade");
    }
}

// --- COMPONENTE REACT ---

interface EditGradeModalProps {
  grade: GradeCurricular
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditGradeModal({ grade, open, onClose, onSuccess }: EditGradeModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cursos, setCursos] = useState<Curso[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])

  // Estados locais para edição
  const [cursoId, setCursoId] = useState(grade.curso.id.toString())
  const [periodoAcademico, setPeriodoAcademico] = useState(grade.periodoAcademico)
  const [periodos, setPeriodos] = useState<Periodo[]>(JSON.parse(JSON.stringify(grade.periodos))) // Deep copy

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const [cursosData, materiasData] = await Promise.all([getCursos(), getMaterias()]);
      setCursos(cursosData);
      setMaterias(materiasData);
    } catch (error: any) {
      toast({ title: "Erro", description: `Erro ao carregar dados do formulário: ${error.message}`, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMateria = (periodoId: number, materia: Materia) => {
    setPeriodos((prev) =>
      prev.map((periodo) => {
        if (periodo.id !== periodoId) return periodo;
        const hasMateria = periodo.materias.some((m) => m.id === materia.id);
        return {
          ...periodo,
          materias: hasMateria ? periodo.materias.filter((m) => m.id !== materia.id) : [...periodo.materias, materia],
        };
      })
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const cursoSelecionado = cursos.find((c) => c.id.toString() === cursoId);
      if (!cursoSelecionado) throw new Error("Curso selecionado é inválido.");

      const gradeData = {
        curso: cursoSelecionado,
        periodoAcademico,
        periodos,
      };

      await updateGrade(grade.id, gradeData);

      toast({ title: "Sucesso", description: "Grade curricular atualizada com sucesso!" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getTotalCargaHoraria = () => {
    return periodos.reduce((total, periodo) => 
        total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Grade Curricular</DialogTitle>
          <DialogDescription>
            Modifique o curso, período acadêmico e as matérias de cada período da grade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto pr-6 flex-1">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              <Select value={cursoId} onValueChange={setCursoId} disabled={loading || saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.id.toString()}>{curso.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Período Acadêmico</label>
              <Select value={periodoAcademico} onValueChange={setPeriodoAcademico} disabled={loading || saving}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024.1">2024.1</SelectItem>
                  <SelectItem value="2024.2">2024.2</SelectItem>
                  <SelectItem value="2025.1">2025.1</SelectItem>
                  <SelectItem value="2025.2">2025.2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Carga Horária */}
          <div className="bg-slate-50 rounded-lg p-4 border">
            <p className="text-sm font-medium">
              Carga Horária Total: <span className="text-lg font-bold text-primary">{getTotalCargaHoraria()}h</span>
            </p>
          </div>

          {/* Períodos e Matérias */}
          <div>
            <h4 className="font-semibold mb-3 text-lg">Matérias por Período</h4>
            {loading ? (
                <p className="text-muted-foreground text-center py-4">Carregando matérias...</p>
            ) : (
                <Accordion type="multiple" className="w-full space-y-3">
                {periodos.map((periodo) => (
                    <AccordionItem key={periodo.id} value={`periodo-${periodo.id}`} className="border rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                        <span className="font-medium text-base">{periodo.nome}</span>
                        <span className="text-sm text-muted-foreground">{periodo.materias.length} matérias selecionadas</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="space-y-2 pt-2 border-t">
                        {materias.map((materia) => {
                            const isSelected = periodo.materias.some((m) => m.id === materia.id);
                            return (
                            <div key={materia.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-50">
                                <Checkbox
                                id={`edit-chk-${periodo.id}-${materia.id}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleMateria(periodo.id, materia)}
                                disabled={saving}
                                />
                                <label htmlFor={`edit-chk-${periodo.id}-${materia.id}`} className="flex-1 cursor-pointer">
                                <p className="font-medium">{materia.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                    {materia.codigo} • {materia.cargaHoraria}h
                                </p>
                                </label>
                            </div>
                            );
                        })}
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
          </div>
        </div>

        <DialogFooter className="pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
