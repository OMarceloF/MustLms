// frontend/src/pages/gestor/materias/InformacoesComplementares.tsx

"use client"

// Hooks e libs
import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

// Definição da interface para os dados de uma informação
interface Informacao {
  id: number;
  titulo: string;
  conteudo: string;
  categoria: string;
}

// Definição da interface para as props que o componente espera receber
interface InformacoesComplementaresProps {
  disciplinaId: string | number;
}

// Componente principal que agora recebe 'disciplinaId' como prop
export default function InformacoesComplementares({ disciplinaId }: InformacoesComplementaresProps) {
  
  // Estados do componente
  const [informacoes, setInformacoes] = useState<Informacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Informacao | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "",
  });

  // Função para buscar os dados da API
  const fetchInformacoes = async () => {
    // A verificação garante que não faremos chamadas com ID inválido
    if (!disciplinaId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/disciplinas/${disciplinaId}/informacoes`);
      setInformacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar informações:", error);
      toast.error("Falha ao carregar as informações.");
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito que executa a busca de dados quando o componente é montado ou o disciplinaId muda
  useEffect(() => {
    fetchInformacoes();
  }, [disciplinaId]);

  // Função para lidar com o envio do formulário (criação ou edição)
  const handleFormSubmit = async () => {
    if (isSubmitting || !disciplinaId) return;
    setIsSubmitting(true);

    try {
      if (editingInfo) {
        // Lógica de Edição (PUT)
        await axios.put(`/api/informacoes/${editingInfo.id}`, formData);
        toast.success("Informação atualizada com sucesso!");
      } else {
        // Lógica de Criação (POST)
        await axios.post(`/api/disciplinas/${disciplinaId}/informacoes`, formData);
        toast.success("Informação criada com sucesso!");
      }
      fetchInformacoes(); // Recarrega a lista após a operação
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar informação:", error);
      toast.error("Falha ao salvar. Verifique os campos e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para deletar uma informação
  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta informação?")) return;

    try {
      await axios.delete(`/api/informacoes/${id}`);
      toast.success("Informação excluída com sucesso!");
      fetchInformacoes(); // Recarrega a lista
    } catch (error) {
      console.error("Erro ao excluir informação:", error);
      toast.error("Falha ao excluir a informação.");
    }
  };

  // Abre o diálogo para edição, preenchendo o formulário com os dados existentes
  const openEditDialog = (info: Informacao) => {
    setEditingInfo(info);
    setFormData({
      titulo: info.titulo,
      conteudo: info.conteudo,
      categoria: info.categoria,
    });
    setIsDialogOpen(true);
  };
  
  // Abre o diálogo para criação, garantindo que o formulário esteja limpo
  const openNewDialog = () => {
    setEditingInfo(null);
    setFormData({ titulo: "", conteudo: "", categoria: "" });
    setIsDialogOpen(true);
  };

  // Reseta o estado do formulário e fecha o diálogo
  const resetForm = () => {
    setEditingInfo(null);
    setFormData({ titulo: "", conteudo: "", categoria: "" });
    setIsDialogOpen(false);
  };

  // Retorna a classe de cor para a badge com base na categoria
  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Administrativo": return "bg-blue-100 text-blue-800";
      case "Acadêmico": return "bg-green-100 text-green-800";
      case "Evento": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho e Botão de Nova Informação */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Informações Complementares</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Comunicados e informações gerais da disciplina</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nova Informação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInfo ? "Editar Informação" : "Nova Informação"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Calendário de Provas" />
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
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
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
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Informações Cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 md:px-6">Título</TableHead>
                  <TableHead className="px-4 md:px-6">Categoria</TableHead>
                  <TableHead className="px-4 md:px-6 hidden sm:table-cell">Conteúdo</TableHead>
                  <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Carregando...</TableCell></TableRow>
                ) : informacoes.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Nenhuma informação cadastrada.</TableCell></TableRow>
                ) : (
                  informacoes.map((info) => (
                    <TableRow key={info.id}>
                      <TableCell className="px-4 md:px-6 py-3 font-medium">{info.titulo}</TableCell>
                      <TableCell className="px-4 md:px-6 py-3">
                        <Badge className={`${getCategoriaColor(info.categoria)} border-transparent`}>{info.categoria}</Badge>
                      </TableCell>
                      <TableCell className="px-4 md:px-6 py-3 hidden sm:table-cell">
                        <p className="line-clamp-2 text-sm text-muted-foreground max-w-md">{info.conteudo}</p>
                      </TableCell>
                      <TableCell className="px-4 md:px-6 py-3 text-right">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(info)}>
                            <Edit className="h-4 w-4" />
                            <span className="hidden lg:inline ml-2">Editar</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(info.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
