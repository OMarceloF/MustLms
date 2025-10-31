// frontend/src/pages/gestor/cursos/matriz-curricular-tab.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../components/ui/card"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion"
import { Button } from "../components/ui/button"
import { Pencil, Trash2, Loader2, BookCopy } from "lucide-react"

// --- Interfaces ---
interface Turma {
  id: number;
  nome: string;
  ano_letivo?: number;
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
  creditos: number
  carga_horaria: number
  semestre: number
  ementa: string
  turmas?: Turma[]
}

interface DisciplinaFormData {
  id?: number
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  ementa: string
}

export function MatrizCurricularTab() {
  const { id: cursoId } = useParams<{ id: string }>()

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<DisciplinaFormData | null>(null)

  const semestres = [...new Set(disciplinas.map(d => d.semestre))].sort((a, b) => a - b);

  const fetchDisciplinas = async () => {
    if (!cursoId) return
    try {
      setIsLoading(true)
      const response = await axios.get<Disciplina[]>(`/api/cursos/${cursoId}/disciplinas`)

      const disciplinasFormatadas = response.data.map(d => ({
        ...d,
        turmas: d.turmas || []
      }));
      setDisciplinas(disciplinasFormatadas);

    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error)
      toast.error("Não foi possível carregar a matriz curricular.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDisciplinas()
  }, [cursoId])

  const handleOpenDialog = (disciplina: Disciplina | null) => {
    if (disciplina) {
      setEditingDisciplina({
        id: disciplina.id,
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        creditos: disciplina.creditos,
        cargaHoraria: disciplina.carga_horaria,
        semestre: disciplina.semestre,
        ementa: disciplina.ementa,
      })
    } else {
      setEditingDisciplina({
        nome: "", codigo: "", creditos: 0, cargaHoraria: 0, semestre: 1, ementa: ""
      })
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (disciplinaId: number) => {
    if (window.confirm("Tem certeza que deseja apagar esta disciplina?")) {
      try {
        await axios.delete(`/api/cursos/disciplinas/${disciplinaId}`)
        toast.success("Disciplina removida com sucesso!")
        fetchDisciplinas()
      } catch (error) {
        console.error("Erro ao deletar disciplina:", error)
        toast.error("Não foi possível remover a disciplina.")
      }
    }
  }

  const handleFormChange = (field: keyof DisciplinaFormData, value: string | number) => {
    if (editingDisciplina) {
      setEditingDisciplina({ ...editingDisciplina, [field]: value });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão da Matriz Curricular</CardTitle>
              <CardDescription>Adicione, edite ou remova as disciplinas do curso.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {semestres.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhuma disciplina cadastrada para este curso ainda.
          </CardContent>
        </Card>
      ) : semestres.map((semestre) => {
        const disciplinasSemestre = disciplinas.filter((d) => d.semestre === semestre).sort((a, b) => a.nome.localeCompare(b.nome));
        if (disciplinasSemestre.length === 0) return null

        return (
          <Card key={semestre}>
            <CardHeader><CardTitle>{semestre}º Semestre</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {disciplinasSemestre.map((disciplina) => (
                  <AccordionItem key={disciplina.id} value={String(disciplina.id)}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="text-left">
                          <p className="font-semibold">{disciplina.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {disciplina.codigo} • {disciplina.creditos} créditos • {disciplina.carga_horaria}h
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDialog(disciplina); }} className="h-8 w-8 hover:bg-muted">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(disciplina.id); }} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                        <div>
                          <h4 className="mb-2 font-semibold">Ementa:</h4>
                          <p className="text-sm leading-relaxed text-muted-foreground">{disciplina.ementa || "Nenhuma ementa cadastrada."}</p>
                        </div>

                        {disciplina.turmas && disciplina.turmas.length > 0 && (
                          <div className="border-t border-border/50 pt-4">
                            <h4 className="mb-3 font-semibold flex items-center">
                              <BookCopy className="mr-2 h-4 w-4" />
                              Turmas Vinculadas:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {disciplina.turmas.map(t => (
                                <span key={t.id} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                                  {t.nome} {t.ano_letivo && `(${t.ano_letivo})`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )
      })}


    </div>
  )
}
