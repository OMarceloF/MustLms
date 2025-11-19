"use client"

// Hooks e libs
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";

// Componentes de UI
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";

// Ícones
import { Plus, Edit, Trash2, Loader2, Frown, Users } from "lucide-react";

// --- INTERFACES ---
interface Informacao {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: string;
  turma_id: number | null; // Adicionado
  turma_nome?: string; // Adicionado para exibição
}

interface InformacoesComplementaresProps {
  disciplinaId: string | number;
}

interface Turma {
    id: number;
    nome: string;
}

export default function InformacoesComplementares({ disciplinaId }: InformacoesComplementaresProps) {
  
  // --- ESTADOS ---
  const [informacoes, setInformacoes] = useState<Informacao[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Informacao | null>(null);
  const [selectedTurma, setSelectedTurma] = useState("todos"); // Estado para o filtro
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "",
    turma_id: "" as string | number, // Adicionado
  });

  // --- FUNÇÕES DE API ---
  const fetchInformacoes = async () => {
    if (!disciplinaId) return;
    try {
      const response = await axios.get(`/api/disciplinas/${disciplinaId}/informacoes`);
      setInformacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar informações:", error);
      toast.error("Falha ao carregar as informações.");
    }
  };

  const fetchTurmas = async () => {
    if (!disciplinaId) return;
    try {
        const response = await axios.get(`/api/disciplinas/${disciplinaId}/turmas-para-info`);
        setTurmas(response.data);
    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        toast.error("Não foi possível carregar as turmas.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchInformacoes(), fetchTurmas()]).finally(() => setIsLoading(false));
  }, [disciplinaId]);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredInformacoes = useMemo(() => {
    if (selectedTurma === "todos") {
        return informacoes;
    }
    if (selectedTurma === "geral") {
        return informacoes.filter(info => info.turma_id === null);
    }
    return informacoes.filter(info => String(info.turma_id) === selectedTurma);
  }, [informacoes, selectedTurma]);

  // --- FUNÇÕES CRUD ---
  const handleFormSubmit = async () => {
    if (isSubmitting || !disciplinaId) return;
    setIsSubmitting(true);

    const payload = {
        ...formData,
        turma_id: formData.turma_id === "geral" || !formData.turma_id ? null : Number(formData.turma_id),
    };

    try {
      if (editingInfo) {
        await axios.put(`/api/informacoes/${editingInfo.id}`, payload);
        toast.success("Informação atualizada com sucesso!");
      } else {
        await axios.post(`/api/disciplinas/${disciplinaId}/informacoes`, payload);
        toast.success("Informação criada com sucesso!");
      }
      fetchInformacoes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar informação:", error);
      toast.error("Falha ao salvar. Verifique os campos e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta informação?")) return;
    try {
      await axios.delete(`/api/informacoes/${id}`);
      toast.success("Informação excluída com sucesso!");
      fetchInformacoes();
    } catch (error) {
      console.error("Erro ao excluir informação:", error);
      toast.error("Falha ao excluir a informação.");
    }
  };

  // --- CONTROLE DO MODAL ---
  const openEditDialog = (info: Informacao) => {
    setEditingInfo(info);
    setFormData({
      titulo: info.titulo,
      conteudo: info.conteudo,
      categoria: info.categoria,
      turma_id: info.turma_id || "geral",
    });
    setIsDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingInfo(null);
    setFormData({ titulo: "", conteudo: "", categoria: "", turma_id: "geral" });
    setIsDialogOpen(true);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Administrativo": return "bg-blue-100 text-blue-800";
      case "Acadêmico": return "bg-green-100 text-green-800";
      case "Evento": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Botão de Nova Informação */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Informações Complementares</h2>
          <p className="text-muted-foreground mt-1">Comunicados e informações gerais da disciplina</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Informação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInfo ? "Editar Informação" : "Nova Informação"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Calendário de Provas" />
              </div>
              {/* SELETOR DE TURMA ADICIONADO */}
              <div>
                <Label htmlFor="turma">Turma (Opcional)</Label>
                <Select value={String(formData.turma_id)} onValueChange={(value) => setFormData({ ...formData, turma_id: value })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma específica" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="geral">Informação Geral (para todas as turmas)</SelectItem>
                        {turmas.map(turma => (
                            <SelectItem key={turma.id} value={String(turma.id)}>
                                {turma.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Acadêmico">Acadêmico</SelectItem>
                    <SelectItem value="Evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="conteudo">Conteúdo</Label>
                <Textarea id="conteudo" value={formData.conteudo} onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })} placeholder="Escreva o conteúdo da informação..." rows={6} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleFormSubmit} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingInfo ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Informações Cadastradas */}
      <Card className="shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">Informações Cadastradas</CardTitle>
                {/* FILTRO DE TURMAS ADICIONADO */}
                <div className="w-full sm:w-64">
                    <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por turma..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Mostrar Todas</SelectItem>
                            <SelectItem value="geral">Apenas Informações Gerais</SelectItem>
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
          ) : filteredInformacoes.length === 0 ? (
            <div className="p-12 text-center">
                <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhuma Informação Encontrada</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Tente alterar o filtro ou crie uma nova informação.
                </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Título</TableHead>
                    <TableHead className="px-6 hidden md:table-cell">Categoria</TableHead>
                    <TableHead className="px-6 hidden lg:table-cell">Vínculo</TableHead>
                    <TableHead className="px-6 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInformacoes.map((info) => (
                    <TableRow key={info.id}>
                      <TableCell className="px-6 py-4 font-medium">{info.titulo}</TableCell>
                      <TableCell className="px-6 py-4 hidden md:table-cell">
                        <Badge className={`${getCategoriaColor(info.categoria)} border-transparent`}>{info.categoria}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 hidden lg:table-cell">
                        {info.turma_id ? (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{turmas.find(t => t.id === info.turma_id)?.nome || 'Turma Específica'}</span>
                            </div>
                        ) : (
                            <span>Geral</span>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(info)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(info.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
