"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

// --- ALTERAÇÃO 1: Importar Checkbox ---
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
import { Checkbox } from "../components/ui/checkbox" // <-- Importação adicionada
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

// --- ALTERAÇÃO 2: Definir as interfaces para Turma e atualizar a Disciplina ---
interface Turma {
  id: number;
  nome: string;
  ano_letivo?: number; // snake_case para corresponder à API
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
  creditos: number
  carga_horaria: number
  semestre: number
  ementa: string
  turmas?: Turma[] // Adicionado para receber as turmas já vinculadas
}

interface DisciplinaFormData {
  id?: number
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  ementa: string
  turmas: Turma[] // Adicionado para gerenciar as turmas no formulário
}

export function MatrizCurricularTab() {
  const { id: cursoId } = useParams<{ id: string }>()

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<DisciplinaFormData | null>(null)

  // --- ALTERAÇÃO 3: Adicionar estados para gerenciar turmas no modal ---
  const [allTurmas, setAllTurmas] = useState<Turma[]>([]);
  const [turmaSearchQuery, setTurmaSearchQuery] = useState("");
  const [loadingTurmas, setLoadingTurmas] = useState(false);

  const semestres = [...new Set(disciplinas.map(d => d.semestre))].sort((a, b) => a - b);

  const fetchDisciplinas = async () => {
    if (!cursoId) return
    try {
      setIsLoading(true)
      // Ajuste a rota se necessário para incluir as turmas vinculadas
      const response = await axios.get<Disciplina[]>(`/api/cursos/${cursoId}/disciplinas?include=turmas`)
      setDisciplinas(response.data)
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

  // --- ALTERAÇÃO 4: Buscar turmas quando o modal for aberto ---
  useEffect(() => {
    if (isDialogOpen) {
      const fetchAllTurmas = async () => {
        setLoadingTurmas(true);
        try {
          // Ajuste a rota da API conforme necessário
          const response = await axios.get<Turma[]>('/api/turmas');
          setAllTurmas(response.data);
        } catch (error) {
          toast.error("Não foi possível carregar a lista de turmas.");
        } finally {
          setLoadingTurmas(false);
        }
      };
      fetchAllTurmas();
    }
  }, [isDialogOpen]);

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
        turmas: disciplina.turmas || [], // Carrega as turmas já vinculadas
      })
    } else {
      setEditingDisciplina({
        nome: "", codigo: "", creditos: 0, cargaHoraria: 0, semestre: 1, ementa: "", turmas: [] // Inicia com array vazio
      })
    }
    setTurmaSearchQuery(""); // Limpa a busca ao abrir o modal
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingDisciplina) return

    // --- ALTERAÇÃO 5: Preparar payload para o backend, incluindo os IDs das turmas ---
    const payload = {
      nome: editingDisciplina.nome,
      codigo: editingDisciplina.codigo,
      creditos: editingDisciplina.creditos,
      carga_horaria: editingDisciplina.cargaHoraria,
      semestre: editingDisciplina.semestre,
      ementa: editingDisciplina.ementa,
      turma_ids: editingDisciplina.turmas.map(t => t.id), // Envia apenas os IDs
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

  // --- ALTERAÇÃO 6: Adicionar funções para manipular a seleção de turmas ---
  const handleTurmaSelectionChange = (turma: Turma, isSelected: boolean) => {
    if (!editingDisciplina) return;

    const outrasTurmas = editingDisciplina.turmas.filter(t => t.id !== turma.id);

    if (isSelected) {
      setEditingDisciplina({ ...editingDisciplina, turmas: [...outrasTurmas, turma] });
    } else {
      setEditingDisciplina({ ...editingDisciplina, turmas: outrasTurmas });
    }
  };

  const filteredTurmas = allTurmas.filter(turma =>
    turma.nome.toLowerCase().includes(turmaSearchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* ... (código do Card Header e Accordion sem alterações) ... */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão da Matriz Curricular</CardTitle>
              <CardDescription>Adicione, edite ou remova as disciplinas do curso.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                          <p className="text-sm leading-relaxed text-muted-foreground">{disciplina.ementa}</p>
                        </div>
                        {/* Mostra as turmas vinculadas no Accordion */}
                        {disciplina.turmas && disciplina.turmas.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="mb-2 font-semibold">Turmas Vinculadas:</h4>
                            <div className="flex flex-wrap gap-2">
                              {disciplina.turmas.map(t => (
                                <span key={t.id} className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                                  {t.nome}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>{editingDisciplina?.id ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
            <DialogDescription>Preencha as informações da disciplina e vincule as turmas desejadas.</DialogDescription>
          </DialogHeader>
          {editingDisciplina && (
            // --- ALTERAÇÃO 7: Adicionar a nova seção de turmas ao modal ---
            <div className="grid gap-6 py-4">
              {/* Campos antigos */}
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Disciplina</Label>
                <Input id="nome" value={editingDisciplina.nome} onChange={(e) => handleFormChange('nome', e.target.value)} className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" value={editingDisciplina.codigo} onChange={(e) => handleFormChange('codigo', e.target.value)} className="bg-background" />
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

              {/* Nova seção para vincular turmas */}
              <div className="grid gap-4 p-4 border rounded-lg bg-background/50">
                <div className="grid gap-2">
                  <Label>Vincular Turmas</Label>
                  <Input
                    placeholder="Pesquisar turmas pelo nome..."
                    value={turmaSearchQuery}
                    onChange={(e) => setTurmaSearchQuery(e.target.value)}
                    className="bg-background"
                  />
                </div>

                {loadingTurmas ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border-t pt-4">
                    {filteredTurmas.length > 0 ? filteredTurmas.map(turma => (
                      <div
                        key={turma.id}
                        className="flex items-center justify-between rounded-md border p-3 hover:bg-muted transition-colors"
                      >
                        <Label htmlFor={`turma-${turma.id}`} className="font-normal flex-1 cursor-pointer">
                          {turma.nome} {turma.ano_letivo && `(${turma.ano_letivo})`}
                        </Label>
                        <Checkbox
                          id={`turma-${turma.id}`}
                          checked={editingDisciplina.turmas.some(t => t.id === turma.id)}
                          onCheckedChange={(checked) => handleTurmaSelectionChange(turma, !!checked)}
                        />
                      </div>
                    )) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma turma encontrada.</p>
                    )}
                  </div>
                )}
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
