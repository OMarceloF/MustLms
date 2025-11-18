"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Plus, Edit, Trash2, Download, Search, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// --- Interfaces ---
interface Material {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  link: string;
  professor_id?: number;
  turma_id?: number;
  disciplina_id?: number;
  professor_nome?: string;
  turma_nome?: string;
  disciplina_nome?: string;
  arquivo?: string;
}

interface Professor {
  id: number;
  nome: string;
}

interface Turma {
  id: number;
  nome_turma: string;
  professor_id: number; 
}

interface Disciplina {
  id: number;
  nome: string;
}

export default function MateriaisDidaticos( ) {
  const { id: materiaId } = useParams<{ id: string }>();

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [filteredMateriais, setFilteredMateriais] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("todas");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Referenciais para os formulários
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinaAtual, setDisciplinaAtual] = useState<Disciplina | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    link: "",
    professor_id: "",
    turma_id: "",
    disciplina_id: materiaId || "",
    arquivo: null as File | null,
  });

  // --- Funções de Busca de Dados ---

  const fetchMateriais = async () => {
    if (!materiaId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/materiais`);
      if (!res.ok) throw new Error(`Falha ao buscar materiais (${res.status})`);
      const data: Material[] = await res.json();
      const filtered = data.filter((m) => String(m.disciplina_id) === String(materiaId));
      setMateriais(filtered);
    } catch (error: any) {
      setErrorMsg(error?.message || "Erro ao buscar materiais.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    if (!materiaId) return;
    setLoadingRefs(true);
    try {
      const [profRes, turmasRes, discRes] = await Promise.all([
        fetch(`${API_URL}/api/professores`),
        fetch(`${API_URL}/api/disciplinas/${materiaId}/turmas-ativas-para-aulas`),
        fetch(`${API_URL}/api/disciplinas/${materiaId}`),
      ]);

      if (!profRes.ok || !turmasRes.ok || !discRes.ok) {
        throw new Error("Falha ao carregar dados de referência para o formulário.");
      }

      const [profData, turmasData, discData] = await Promise.all([
        profRes.json(),
        turmasRes.json(),
        discRes.json(),
      ]);

      setProfessores(Array.isArray(profData) ? profData : []);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);
      setDisciplinaAtual(discData);

    } catch (error: any) {
      setErrorMsg(error.message || "Erro ao carregar dados do formulário.");
    } finally {
      setLoadingRefs(false);
    }
  };

  useEffect(() => {
    fetchMateriais();
    fetchRefs();
  }, [materiaId]);

  // --- Lógica de Filtros da Tabela ---
  useEffect(() => {
    let filtered = materiais;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.titulo?.toLowerCase().includes(q) ||
          (m.descricao || "").toLowerCase().includes(q)
      );
    }
    if (selectedTurma !== "todas") {
      filtered = filtered.filter((m) => m.turma_nome === selectedTurma);
    }
    setFilteredMateriais(filtered);
  }, [searchTerm, selectedTurma, materiais]);

  const turmasOptions = useMemo(
    () => [...new Set(materiais.map((m) => m.turma_nome).filter(Boolean as any))] as string[],
    [materiais]
  );

  // --- Funções de CRUD ---

  const handleSave = async () => {
    if (!formData.titulo || (!formData.link && !formData.arquivo)) {
      alert("Preencha o título e um link ou arquivo.");
      return;
    }
    setLoading(true);
    const form = new FormData();
    form.append("titulo", formData.titulo);
    form.append("descricao", formData.descricao);
    form.append("data", formData.data);
    form.append("link", formData.link || "");
    form.append("professor_id", formData.professor_id || "");
    form.append("turma_id", formData.turma_id || "");
    form.append("disciplina_id", materiaId || "");
    if (formData.arquivo) form.append("arquivo", formData.arquivo);

    try {
      const method = editingMaterial ? "PUT" : "POST";
      const url = editingMaterial
        ? `${API_URL}/api/materiais/${editingMaterial.id}`
        : `${API_URL}/api/materiais`;

      const res = await fetch(url, { method, body: form });
      if (!res.ok) throw new Error(`Erro ao salvar material (${res.status})`);
      
      await fetchMateriais();
      resetForm();
    } catch (error: any) {
      setErrorMsg(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este material?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/materiais/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir material.");
      await fetchMateriais();
    } catch (error: any) {
      setErrorMsg(error?.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Funções do Modal ---

  const openDialog = (material: Material | null) => {
    setEditingMaterial(material);
    setFormData({
      titulo: material?.titulo || "",
      descricao: material?.descricao || "",
      data: material?.data?.split("T")[0] || "",
      link: material?.link || "",
      professor_id: material?.professor_id?.toString() || "",
      turma_id: material?.turma_id?.toString() || "",
      disciplina_id: materiaId || "",
      arquivo: null,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descricao: "",
      data: "",
      link: "",
      professor_id: "",
      turma_id: "",
      disciplina_id: materiaId || "",
      arquivo: null,
    });
    setEditingMaterial(null);
    setIsDialogOpen(false);
  };

  const handleTurmaChange = (turmaId: string) => {
    const turmaSelecionada = turmas.find(t => t.id.toString() === turmaId);
    const professorId = turmaSelecionada?.professor_id?.toString() || "";
    setFormData(prev => ({
      ...prev,
      turma_id: turmaId,
      professor_id: professorId,
    }));
  };

  // --- Renderização ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Materiais Didáticos</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie documentos, links e arquivos de apoio da disciplina
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Material
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Editar Material" : "Novo Material"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Input placeholder="Título do material" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
              <Textarea placeholder="Descrição (opcional)" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
              <Input type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Turma</Label>
                  <Select value={formData.turma_id} onValueChange={handleTurmaChange} disabled={loadingRefs}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingRefs ? "Carregando..." : "Selecione a turma"} />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.length > 0 ? (
                        turmas.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nome_turma}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="none">Nenhuma turma ativa para esta disciplina</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Professor</Label>
                  <Select
                    value={formData.professor_id}
                    onValueChange={(v) => setFormData({ ...formData, professor_id: v })}
                    disabled={loadingRefs || !!formData.turma_id}
                  >
                    <SelectTrigger className={!!formData.turma_id ? "bg-gray-100 cursor-not-allowed" : ""}>
                      <SelectValue placeholder={!formData.turma_id ? "Selecione uma turma primeiro" : "Professor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Disciplina</Label>
                <Select value={formData.disciplina_id} disabled>
                  <SelectTrigger className="bg-gray-100 cursor-not-allowed">
                    <SelectValue placeholder="Disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinaAtual && (
                      <SelectItem value={disciplinaAtual.id.toString()}>
                        {disciplinaAtual.nome}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Input placeholder="Link (opcional)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
              <div>
                <Label>Arquivo (opcional)</Label>
                <Input type="file" onChange={(e) => setFormData({ ...formData, arquivo: e.target.files?.[0] || null })} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {editingMaterial ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar materiais..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger><SelectValue placeholder="Filtrar por turma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Turmas</SelectItem>
                {turmasOptions.map((t, i) => <SelectItem key={i} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMateriais.map((m) => (
            <Card key={m.id} className="shadow-md rounded-2xl hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle className="text-lg">{m.titulo}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{m.descricao}</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Professor:</span> {m.professor_nome || "—"}</p>
                  <p><span className="font-semibold">Turma:</span> {m.turma_nome || "—"}</p>
                  <p><span className="font-semibold">Disciplina:</span> {m.disciplina_nome || "—"}</p>
                  <p><span className="font-semibold">Data:</span> {m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "—"}</p>
                </div>
                <div className="flex gap-2">
                  {m.link && <Button className="flex-1 gap-2" onClick={() => window.open(m.link, "_blank")}><Download className="h-4 w-4" /> Acessar</Button>}
                  {m.arquivo && <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(`${API_URL}${m.arquivo}`, "_blank")}><Download className="h-4 w-4" /> Baixar</Button>}
                  <Button variant="outline" size="icon" onClick={() => openDialog(m)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredMateriais.length === 0 && !loading && (
            <div className="col-span-full text-center text-muted-foreground py-8">Nenhum material encontrado.</div>
          )}
        </div>
      )}
      {errorMsg && !isDialogOpen && <p className="text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
