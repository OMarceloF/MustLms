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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
// Ícones importados, incluindo o novo ícone 'Eye'
import { Plus, Pencil, Trash2, Loader2, BookCopy, Eye } from "lucide-react"


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
  turmas?: Turma[] // A interface já suportava turmas
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

// --- Dados Mock para as Turmas ---
const mockTurmas: Turma[] = [
  { id: 101, nome: "Turma A", ano_letivo: 2025 },
  { id: 102, nome: "Turma B", ano_letivo: 2025 },
  { id: 103, nome: "Turma C - Noturno", ano_letivo: 2024 },
];

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
      // Simula a busca de dados reais
      const response = await axios.get<Disciplina[]>(`/api/cursos/${cursoId}/disciplinas`)

      // **MODIFICAÇÃO**: Adiciona os dados mock de turmas a cada disciplina
      const disciplinasComTurmas = response.data.map(d => ({
        ...d,
        turmas: mockTurmas // Atribui a lista mock a cada disciplina
      }));
      setDisciplinas(disciplinasComTurmas);

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

  const handleSave = async () => {
    if (!editingDisciplina) return

    const payload = {
      nome: editingDisciplina.nome,
      codigo: editingDisciplina.codigo,
      creditos: editingDisciplina.creditos,
      carga_horaria: editingDisciplina.cargaHoraria,
      semestre: editingDisciplina.semestre,
      ementa: editingDisciplina.ementa,
    };

    try {
      if (editingDisciplina.id) {
        await axios.put(`/api/cursos/disciplinas/${editingDisciplina.id}`, payload)
        toast.success("Disciplina atualizada com sucesso!")
      } else {
        await axios.post(`/api/cursos/${cursoId}/disciplinas`, payload)
        toast.success("Disciplina adicionada com sucesso!")
      }
      setIsDialogOpen(false)
      fetchDisciplinas()
    } catch (error) {
      console.error("Erro ao salvar disciplina:", error)
      toast.error("Ocorreu um erro ao salvar a disciplina.")
    }
  }

  const handleFormChange = (field: keyof DisciplinaFormData, value: string | number) => {
    if (editingDisciplina) {
      setEditingDisciplina({ ...editingDisciplina, [field]: value });
    }
  };

  // **NOVA FUNÇÃO**: Placeholder para a ação de visualizar turma
  const handleViewTurma = (turmaId: number) => {
    // Evita que o Accordion feche ao clicar no botão
    event?.stopPropagation();
    toast.info(`Visualizando detalhes da turma ID: ${turmaId}`);
    // Aqui você pode implementar a lógica para abrir um modal ou navegar para outra página
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
            {/* O botão de adicionar disciplina pode ser colocado aqui se desejado */}
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

                        {/* --- SEÇÃO DE TURMAS MODIFICADA --- */}
                        {disciplina.turmas && disciplina.turmas.length > 0 && (
                          <div className="border-t border-border/50 pt-4">
                            <h4 className="mb-3 font-semibold flex items-center">
                              <BookCopy className="mr-2 h-4 w-4" />
                              Turmas Vinculadas
                            </h4>
                            <ul className="space-y-2">
                              {disciplina.turmas.map(turma => (
                                <li key={turma.id} className="flex items-center justify-between rounded-md bg-background p-2 px-3 border">
                                  <div className="text-sm">
                                    <span className="font-medium">{turma.nome}</span>
                                    {turma.ano_letivo && <span className="text-muted-foreground ml-2">({turma.ano_letivo})</span>}
                                  </div>
                                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleViewTurma(turma.id)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Visualizar Turma</span>
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {/* --- FIM DA SEÇÃO DE TURMAS --- */}

                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )
      })}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>{editingDisciplina?.id ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
            <DialogDescription>Preencha as informações da disciplina.</DialogDescription>
          </DialogHeader>
          {editingDisciplina && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Disciplina</Label>
                <Input id="nome" value={editingDisciplina.nome} onChange={(e) => handleFormChange('nome', e.target.value)} className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>                <Input id="codigo" value={editingDisciplina.codigo} onChange={(e) => handleFormChange('codigo', e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cargaHoraria">Carga Horária (h)</Label>
                  <Input id="cargaHoraria" type="number" value={editingDisciplina.cargaHoraria} onChange={(e) => handleFormChange('cargaHoraria', Number(e.target.value))} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditos">Créditos</Label>
                  <Input id="creditos" type="number" value={editingDisciplina.creditos} onChange={(e) => handleFormChange('creditos', Number(e.target.value))} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input id="semestre" type="number" value={editingDisciplina.semestre} onChange={(e) => handleFormChange('semestre', Number(e.target.value))} className="bg-background" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ementa">Ementa</Label>
                <Textarea id="ementa" value={editingDisciplina.ementa} onChange={(e) => handleFormChange('ementa', e.target.value)} rows={4} className="bg-background" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
