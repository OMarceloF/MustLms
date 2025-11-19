"use client"

import { useState, useEffect, useMemo } from "react" // Adicionado useMemo
import axios from "axios"
import { toast } from "sonner"

// Componentes e Ícones
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, Edit, Trash2, FileText, Loader2, Frown } from "lucide-react"

// --- INTERFACES ---
interface PlanoEnsino {
  id: number
  objetivos: string
  competencias: string
  conteudos: string
  cronograma: string
  avaliacoes: string
  turma_id: number | null;
  turma_nome?: string;
}

interface PlanoEnsinoProps {
  disciplinaId: string | number;
}

interface Turma {
    id: number;
    nome: string;
}

export default function PlanoDeEnsino({ disciplinaId }: PlanoEnsinoProps) {
  // --- ESTADOS ---
  const [planos, setPlanos] = useState<PlanoEnsino[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlano, setEditingPlano] = useState<PlanoEnsino | null>(null)
  const [expandedPlanoId, setExpandedPlanoId] = useState<number | null>(null)
  const [selectedTurma, setSelectedTurma] = useState("todos"); // NOVO ESTADO PARA O FILTRO
  const [formData, setFormData] = useState({
    objetivos: "",
    competencias: "",
    conteudos: "",
    cronograma: "",
    avaliacoes: "",
    turma_id: "" as string | number,
  })

  // --- FUNÇÕES DE API ---
  const fetchPlanos = async () => {
    if (!disciplinaId) return;
    try {
      const response = await axios.get(`/api/disciplinas/${disciplinaId}/planos-ensino`);
      setPlanos(response.data);
    } catch (error) {
      console.error("Erro ao buscar planos de ensino:", error);
      toast.error("Falha ao carregar os planos de ensino.");
    }
  };

  const fetchTurmas = async () => {
    if (!disciplinaId) return;
    try {
        const response = await axios.get(`/api/disciplinas/${disciplinaId}/turmas-para-plano`);
        setTurmas(response.data);
    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        toast.error("Não foi possível carregar as turmas.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchPlanos(), fetchTurmas()]).finally(() => setIsLoading(false));
  }, [disciplinaId]);

  // --- LÓGICA DE FILTRAGEM (NOVA) ---
  const filteredPlanos = useMemo(() => {
    if (selectedTurma === "todos") {
        return planos;
    }
    if (selectedTurma === "geral") {
        return planos.filter(p => p.turma_id === null);
    }
    return planos.filter(p => String(p.turma_id) === selectedTurma);
  }, [planos, selectedTurma]);


  // --- FUNÇÕES CRUD (sem alterações) ---
  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
        ...formData,
        turma_id: formData.turma_id === "geral" || !formData.turma_id ? null : Number(formData.turma_id),
    };

    try {
      if (editingPlano) {
        await axios.put(`/api/planos-ensino/${editingPlano.id}`, payload);
        toast.success("Plano de Ensino atualizado com sucesso!");
      } else {
        await axios.post(`/api/disciplinas/${disciplinaId}/planos-ensino`, payload);
        toast.success("Plano de Ensino criado com sucesso!");
      }
      fetchPlanos();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      toast.error("Falha ao salvar o plano de ensino.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este plano de ensino?")) return;
    try {
      await axios.delete(`/api/planos-ensino/${id}`);
      toast.success("Plano de Ensino excluído com sucesso!");
      fetchPlanos();
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      toast.error("Falha ao excluir o plano.");
    }
  };

  // --- CONTROLE DO MODAL (sem alterações) ---
  const openEditDialog = (plano: PlanoEnsino) => {
    setEditingPlano(plano);
    setFormData({
      objetivos: plano.objetivos,
      competencias: plano.competencias,
      conteudos: plano.conteudos,
      cronograma: plano.cronograma,
      avaliacoes: plano.avaliacoes,
      turma_id: plano.turma_id || "geral",
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingPlano(null);
    setFormData({
        objetivos: "",
        competencias: "",
        conteudos: "",
        cronograma: "",
        avaliacoes: "",
        turma_id: "geral",
    });
    setIsDialogOpen(true);
  };

  const toggleExpand = (planoId: number) => {
    setExpandedPlanoId(prevId => (prevId === planoId ? null : planoId));
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Plano de Ensino</h2>
          <p className="text-muted-foreground mt-1">Gerencie os planos de ensino da disciplina</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlano ? "Editar Plano de Ensino" : "Novo Plano de Ensino"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="turma">Turma (Opcional)</Label>
                <Select value={String(formData.turma_id)} onValueChange={(value) => setFormData({ ...formData, turma_id: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma específica" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="geral">Plano Geral (sem turma)</SelectItem>
                        {turmas.map(turma => (
                            <SelectItem key={turma.id} value={String(turma.id)}>
                                {turma.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              {/* ... Restante do formulário ... */}
              <div>
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea id="objetivos" value={formData.objetivos} onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })} rows={3} />
              </div>
              <div>
                <Label htmlFor="competencias">Competências</Label>
                <Textarea id="competencias" value={formData.competencias} onChange={(e) => setFormData({ ...formData, competencias: e.target.value })} rows={3} />
              </div>
              <div>
                <Label htmlFor="conteudos">Conteúdos Programáticos</Label>
                <Textarea id="conteudos" value={formData.conteudos} onChange={(e) => setFormData({ ...formData, conteudos: e.target.value })} rows={5} />
              </div>
              <div>
                <Label htmlFor="cronograma">Cronograma</Label>
                <Textarea id="cronograma" value={formData.cronograma} onChange={(e) => setFormData({ ...formData, cronograma: e.target.value })} rows={4} />
              </div>
              <div>
                <Label htmlFor="avaliacoes">Metodologia de Avaliação</Label>
                <Textarea id="avaliacoes" value={formData.avaliacoes} onChange={(e) => setFormData({ ...formData, avaliacoes: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPlano ? "Salvar Alterações" : "Criar Plano"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Planos */}
      <Card className="shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Planos de Ensino Cadastrados</CardTitle>
            {/* NOVO FILTRO DE TURMAS */}
            <div className="w-full sm:w-64">
                <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por turma..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Mostrar Todos</SelectItem>
                        <SelectItem value="geral">Apenas Planos Gerais</SelectItem>
                        {turmas.map(turma => (
                            <SelectItem key={turma.id} value={String(turma.id)}>
                                {turma.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : filteredPlanos.length === 0 ? ( // Usa a lista filtrada
            <div className="p-12 text-center">
                <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum Plano Encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Tente alterar o filtro ou crie um novo plano de ensino.
                </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Vínculo</TableHead>
                    <TableHead className="px-6 hidden sm:table-cell">Objetivos</TableHead>
                    <TableHead className="px-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                {/* Usa a lista filtrada para renderizar as linhas */}
                {filteredPlanos.map((plano) => (
                    <TableBody key={plano.id}>
                      <TableRow>
                        <TableCell className="px-6 py-4 font-medium">
                          {plano.turma_id ? plano.turma_nome : "Plano Geral"}
                        </TableCell>
                        <TableCell className="px-6 py-4 hidden sm:table-cell">
                          <p className="line-clamp-2 text-sm text-muted-foreground max-w-md">{plano.objetivos}</p>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => toggleExpand(plano.id)}>
                              <FileText className="h-4 w-4" />
                              <span className="hidden lg:inline ml-2">{expandedPlanoId === plano.id ? "Ocultar" : "Ver"}</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(plano)}>
                              <Edit className="h-4 w-4" />
                              <span className="hidden lg:inline ml-2">Editar</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(plano.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedPlanoId === plano.id && (
                        <TableRow>
                          <TableCell colSpan={3} className="p-0">
                            <div className="bg-muted/50 p-6 space-y-6 animate-in fade-in-50">
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Objetivos</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.objetivos}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Competências</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.competencias}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Conteúdos Programáticos</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.conteudos}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Cronograma</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.cronograma}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Metodologia de Avaliação</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.avaliacoes}</p>
                                </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                ))}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
