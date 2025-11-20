"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" // Adicionar useNavigate
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
import { Plus, Pencil, Trash2, Loader2, BookCopy, Eye } from "lucide-react"
import { MultiSelect } from "../components/ui/MultiSelect"

// --- Interfaces ---
interface Turma {
  id: number;
  nome: string; // Corresponde a 'nome_turma' no backend
  semestre_nome?: string;
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
  creditos: number
  carga_horaria: number
  semestre: number
  ementa: string
  requisitos?: number[]            // <— ADICIONE ESTA LINHA
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
  requisitos: number[]
}


// --- O mockTurmas não é mais necessário e pode ser removido ---
// const mockTurmas: Turma[] = [ ... ];

export function MatrizCurricularTab() {
  const { id: cursoId } = useParams<{ id: string }>()
  const navigate = useNavigate(); // Hook para navegação

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<DisciplinaFormData | null>(null)
  const [todasDisciplinas, setTodasDisciplinas] = useState<Disciplina[]>([]);

  const semestres = [...new Set(disciplinas.map(d => d.semestre))].sort((a, b) => a - b);

  const fetchDisciplinas = async () => {
    if (!cursoId) return;
    try {
      setIsLoading(true);
      const response = await axios.get<Disciplina[]>(`/api/cursos/${cursoId}/disciplinas`);

      // Para cada disciplina, buscar suas turmas vinculadas
      const disciplinasComTurmas = await Promise.all(
        response.data.map(async (disciplina) => {
          try {
            const turmasResponse = await axios.get<Turma[]>(`/api/disciplinas/${disciplina.id}/turmas`);
            return { ...disciplina, turmas: turmasResponse.data };
          } catch (error) {
            console.error(`Erro ao buscar turmas para a disciplina ${disciplina.id}:`, error);
            return { ...disciplina, turmas: [] }; // Retorna array vazio em caso de erro
          }
        })
      );

      setDisciplinas(disciplinasComTurmas);

    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Não foi possível carregar a matriz curricular.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisciplinas();
  }, [cursoId]);

  useEffect(() => {
    if (!cursoId) return;
    axios.get(`/api/cursos/${cursoId}/disciplinas`)
      .then(res => setTodasDisciplinas(res.data))
      .catch(() => setTodasDisciplinas([]));
  }, [cursoId]);


  // ... (funções handleOpenDialog, handleDelete, handleSave, handleFormChange permanecem as mesmas) ...
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
        requisitos: disciplina.requisitos || []
      })
    } else {
      setEditingDisciplina({
        nome: "",
        codigo: "",
        creditos: 0,
        cargaHoraria: 0,
        semestre: 1,
        ementa: "",
        requisitos: []
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
      requisitos: editingDisciplina.requisitos || [],
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

  const handleFormChange = (field: keyof DisciplinaFormData, value: string | number | number[]) => {
    if (editingDisciplina) {
      setEditingDisciplina({ ...editingDisciplina, [field]: value });
    }
  };

  // Ação de visualizar turma agora navega para a página de detalhes da turma
  const handleViewTurma = (turmaId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/gestor/gestao-turma/${turmaId}`);
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
            <Button onClick={() => handleOpenDialog(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Disciplina
            </Button>
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

                        {/* --- SEÇÃO DE TURMAS COM DADOS REAIS --- */}
                        <div className="border-t border-border/50 pt-4">
                          <h4 className="mb-3 font-semibold flex items-center">
                            <BookCopy className="mr-2 h-4 w-4" />
                            Turmas Vinculadas
                          </h4>
                          {disciplina.turmas && disciplina.turmas.length > 0 ? (
                            <ul className="space-y-2">
                              {disciplina.turmas
                                .sort((a, b) => {
                                  // Primeiro, ordena pelo nome do semestre (ex: "2025.1" vem antes de "2025.2")
                                  const semestreCompare = (a.semestre_nome || '').localeCompare(b.semestre_nome || '');
                                  if (semestreCompare !== 0) {
                                    return semestreCompare;
                                  }
                                  // Se os semestres forem iguais, ordena pelo nome da turma (ex: "Turma 1" vem antes de "Turma 2")
                                  return a.nome.localeCompare(b.nome);
                                })
                                .map(turma => (
                                  <li key={turma.id} className="flex items-center justify-between rounded-md bg-background p-2 px-3 border">
                                    <div className="text-sm">
                                      <span className="font-medium">{turma.nome}</span>
                                      {turma.semestre_nome && <span className="text-muted-foreground ml-2">({turma.semestre_nome})</span>}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => handleViewTurma(turma.id, e)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">Visualizar Turma</span>
                                    </Button>
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma turma vinculada a esta disciplina.</p>
                          )}
                        </div>
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

      {/* O Dialog de edição permanece o mesmo */}
      {isDialogOpen && editingDisciplina && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="
      w-[95vw]
      max-w-2xl
      max-h-[90vh]
      overflow-y-auto
      rounded-2xl
      border border-border/40
      bg-card shadow-2xl
      p-0
    "
          >
            <div className="p-6 border-b">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingDisciplina?.id ? "Editar Disciplina" : "Nova Disciplina"}
                </DialogTitle>
                <DialogDescription>
                  Configure os detalhes acadêmicos e operacionais da disciplina.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 space-y-6">

              {/* CARD - Informações */}
              <div className="bg-muted/40 border rounded-xl p-5 space-y-4 shadow-sm">
                <h3 className="font-semibold text-lg">Informações Gerais</h3>

                <div className="space-y-3">

                  <div>
                    <Label>Nome da Disciplina</Label>
                    <Input
                      className="rounded-lg bg-background mt-1"
                      value={editingDisciplina!.nome}
                      onChange={(e) => handleFormChange("nome", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Código</Label>
                    <Input
                      className="rounded-lg bg-background mt-1"
                      value={editingDisciplina!.codigo}
                      onChange={(e) => handleFormChange("codigo", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">

                    <div>
                      <Label>Carga Horária</Label>
                      <Input
                        type="number"
                        className="rounded-lg bg-background mt-1"
                        value={editingDisciplina!.cargaHoraria}
                        onChange={(e) => handleFormChange("cargaHoraria", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Créditos</Label>
                      <Input
                        type="number"
                        className="rounded-lg bg-background mt-1"
                        value={editingDisciplina!.creditos}
                        onChange={(e) => handleFormChange("creditos", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Semestre</Label>
                      <Input
                        type="number"
                        className="rounded-lg bg-background mt-1"
                        value={editingDisciplina!.semestre}
                        onChange={(e) => handleFormChange("semestre", Number(e.target.value))}
                      />
                    </div>

                  </div>

                </div>
              </div>

              {/* CARD - Ementa */}
              <div className="bg-muted/40 border rounded-xl p-5 space-y-3 shadow-sm">
                <h3 className="font-semibold text-lg">Ementa</h3>
                <Textarea
                  rows={5}
                  className="rounded-lg bg-background"
                  value={editingDisciplina!.ementa}
                  onChange={(e) => handleFormChange("ementa", e.target.value)}
                />
              </div>

              {/* CARD - Requisitos */}
              <div className="bg-muted/40 border rounded-xl p-5 space-y-3 shadow-sm">
                <h3 className="font-semibold text-lg">Pré-requisitos</h3>
                <p className="text-sm text-muted-foreground">
                  Marque as disciplinas que devem ser concluídas anteriormente.
                </p>

                <MultiSelect
                  placeholder="Selecione os pré-requisitos..."
                  value={editingDisciplina!.requisitos || []}
                  onChange={(v) => handleFormChange("requisitos", v)}
                  options={todasDisciplinas
                    .filter(d => d.id !== editingDisciplina!.id)
                    .map(d => ({ id: d.id, label: d.nome }))}
                />
              </div>

            </div>

            <DialogFooter className="p-6 border-t flex justify-end gap-2 bg-card">
              <Button variant="outline" className="rounded-lg" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="rounded-lg bg-primary text-primary-foreground" onClick={handleSave}>
                Salvar Disciplina
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>)}



    </div>
  )
}
