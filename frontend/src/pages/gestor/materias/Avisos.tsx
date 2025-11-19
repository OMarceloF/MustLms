"use client"

import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useAuth } from "../../../hooks/useAuth"

// Componentes de UI
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"

// Ícones
import { Plus, Edit, Trash2, Calendar, User, Loader2, Frown, Users } from "lucide-react"

// --- INTERFACES ---
interface Aviso {
  id: number
  titulo: string
  descricao: string
  data: string
  autor: string
  turma_id: number | null;
}

interface AvisosProps {
  disciplinaId: string | number;
}

interface Turma {
    id: number;
    nome: string;
}

export default function Avisos({ disciplinaId }: AvisosProps) {
  // --- HOOKS ---
  const { user } = useAuth();

  // --- ESTADOS DO COMPONENTE ---
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAno, setSelectedAno] = useState("todos")
  const [selectedTurma, setSelectedTurma] = useState("todos"); // NOVO ESTADO PARA FILTRO DE TURMA
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: new Date().toISOString().split('T')[0],
    autor: user?.nome || "",
    turma_id: "" as string | number,
  })

  // --- FUNÇÕES DE BUSCA DE DADOS (API) ---
  const fetchAvisos = async () => {
    if (!disciplinaId) return;
    try {
      const response = await axios.get(`/api/disciplinas/${disciplinaId}/avisos`);
      setAvisos(response.data);
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
      toast.error("Falha ao carregar os avisos.");
    }
  };

  const fetchTurmas = async () => {
    if (!disciplinaId) return;
    try {
        const response = await axios.get(`/api/disciplinas/${disciplinaId}/turmas-para-avisos`);
        setTurmas(response.data);
    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        toast.error("Não foi possível carregar as turmas da disciplina.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchAvisos(), fetchTurmas()]).finally(() => {
        setIsLoading(false);
    });
  }, [disciplinaId]);

  // --- LÓGICA DE FILTRAGEM ---
  const anosUnicos = useMemo(() => {
    const years = new Set(avisos.map(aviso => new Date(aviso.data).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [avisos]);
  
  const filteredAvisos = useMemo(() => {
    return avisos.filter(aviso => {
      const avisoAno = new Date(aviso.data).getFullYear().toString();
      const filtroAno = selectedAno === "todos" || avisoAno === selectedAno;
      
      // LÓGICA DE FILTRO DE TURMA ATUALIZADA
      const filtroTurma = selectedTurma === "todos" || 
                          (selectedTurma === "geral" && aviso.turma_id === null) ||
                          String(aviso.turma_id) === selectedTurma;

      return filtroAno && filtroTurma;
    });
  }, [selectedAno, selectedTurma, avisos]);

  // --- FUNÇÕES CRUD (API) ---
  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
        ...formData,
        autor_id: user?.id,
        turma_id: formData.turma_id === "todas" || !formData.turma_id ? null : Number(formData.turma_id),
    };

    try {
      if (editingAviso) {
        await axios.put(`/api/avisos/${editingAviso.id}`, payload);
        toast.success("Aviso atualizado com sucesso!");
      } else {
        await axios.post(`/api/disciplinas/${disciplinaId}/avisos`, payload);
        toast.success("Aviso criado com sucesso!");
      }
      fetchAvisos();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar aviso:", error);
      toast.error("Falha ao salvar o aviso.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este aviso?")) return;
    try {
      await axios.delete(`/api/avisos/${id}`);
      toast.success("Aviso excluído com sucesso!");
      fetchAvisos();
    } catch (error) {
      console.error("Erro ao excluir aviso:", error);
      toast.error("Falha ao excluir o aviso.");
    }
  };

  // --- FUNÇÕES DE CONTROLE DO MODAL ---
  const openEditDialog = (aviso: Aviso) => {
    setEditingAviso(aviso);
    setFormData({
      titulo: aviso.titulo,
      descricao: aviso.descricao,
      data: aviso.data,
      autor: aviso.autor,
      turma_id: aviso.turma_id || "todas",
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingAviso(null);
    setFormData({
        titulo: "",
        descricao: "",
        data: new Date().toISOString().split('T')[0],
        autor: user?.nome || "Usuário do Sistema",
        turma_id: "todas",
    });
    setIsDialogOpen(true);
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="space-y-6">
      {/* Cabeçalho e Botão de Ação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Avisos</h2>
          <p className="text-muted-foreground mt-1">Comunicados para alunos e turmas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Aviso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAviso ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Início do Período Letivo" />
              </div>
              <div>
                <Label htmlFor="turma">Turma</Label>
                <Select value={formData.turma_id.toString()} onValueChange={(value) => setFormData({ ...formData, turma_id: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a turma de destino" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todas">Todas as Turmas</SelectItem>
                        {turmas.map(turma => (
                            <SelectItem key={turma.id} value={turma.id.toString()}>
                                {turma.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Escreva o conteúdo do aviso..." rows={6} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="autor">Autor</Label>
                  <Input id="autor" value={formData.autor} onChange={(e) => setFormData({ ...formData, autor: e.target.value })} placeholder="Nome do autor" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAviso ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Ano</Label>
              <Select value={selectedAno} onValueChange={setSelectedAno}>
                <SelectTrigger><SelectValue placeholder="Filtrar por ano" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Anos</SelectItem>
                  {anosUnicos.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* FILTRO DE AUTOR REMOVIDO E SUBSTITUÍDO PELO FILTRO DE TURMA */}
            <div>
              <Label className="mb-2 block">Turma</Label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger><SelectValue placeholder="Filtrar por turma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Turmas</SelectItem>
                  <SelectItem value="geral">Avisos Gerais (sem turma)</SelectItem>
                  {turmas.map(turma => (
                    <SelectItem key={turma.id} value={turma.id.toString()}>{turma.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Avisos */}
      {isLoading ? (
        <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filteredAvisos.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-2xl">
            <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum aviso encontrado</h3>
            <p className="mt-2 text-sm text-muted-foreground">Tente ajustar os filtros ou crie um novo aviso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAvisos.map((aviso) => (
            <Card key={aviso.id} className="shadow-md rounded-2xl hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(aviso.data).toLocaleDateString("pt-BR", { timeZone: 'UTC' })}</div>
                  <div className="flex items-center gap-1"><User className="h-4 w-4" />{aviso.autor}</div>
                  {aviso.turma_id && turmas.find(t => t.id === aviso.turma_id) && (
                    <div className="flex items-center gap-1 text-primary font-medium">
                        <Users className="h-4 w-4" />
                        {turmas.find(t => t.id === aviso.turma_id)?.nome}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow flex flex-col">
                <p className="text-sm text-muted-foreground flex-grow">{aviso.descricao}</p>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(aviso)} className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />Editar
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(aviso.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
