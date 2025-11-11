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
  disciplina_id?: number;
}

interface Disciplina {
  id: number;
  nome: string;
}

export default function MateriaisDidaticos() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [filteredMateriais, setFilteredMateriais] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurma, setSelectedTurma] = useState("todas");
  const { id: materiaId } = useParams<{ id: string }>();

  // Modal / form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Referenciais
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    link: "",
    professor_id: "",
    turma_id: "",
    disciplina_id: "",
    arquivo: null as File | null,
  });

  // 🔹 Força disciplina pela rota (como AulasGravadas)
  useEffect(() => {
    if (materiaId) {
      setFormData((prev) => ({ ...prev, disciplina_id: materiaId }));
    }
  }, [materiaId]);

  // ───────────────────────────────────────────────
  // 🔹 Fetch principal
  // ───────────────────────────────────────────────
  const fetchMateriais = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await fetch(`${API_URL}/api/materiais`);
      if (!res.ok) throw new Error(`Falha ao buscar materiais (${res.status})`);
      const data = await res.json();
      const all = Array.isArray(data) ? data : [];

      const filtered = materiaId
        ? all.filter((m) => String(m.disciplina_id) === String(materiaId))
        : all;

      setMateriais(filtered);
      setFilteredMateriais(filtered);
    } catch (error: any) {
      console.error("Erro ao buscar materiais:", error);
      setErrorMsg(error?.message || "Erro ao buscar materiais.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      setLoadingRefs(true);
      const [resProf, resTurmas, resDisc] = await Promise.all([
        fetch(`${API_URL}/api/professores`),
        fetch(`${API_URL}/api/turmas-novo`),
        fetch(`${API_URL}/api/disciplinas-posgraduacao`),
      ]);

      if (!resProf.ok || !resTurmas.ok || !resDisc.ok)
        throw new Error("Falha ao carregar listas de referência.");

      const [profData, turmasData, discData] = await Promise.all([
        resProf.json(),
        resTurmas.json(),
        resDisc.json(),
      ]);

      setProfessores(
        Array.isArray(profData)
          ? profData.map((p) => ({ id: p.id, nome: p.nome || p.name }))
          : []
      );

      setTurmas(
        Array.isArray(turmasData)
          ? turmasData.map((t) => ({
              id: t.id,
              nome_turma: t.nomeTurma || t.nome_turma || t.nome,
              disciplina_id: t.disciplina_id,
            }))
          : []
      );

      setDisciplinas(
        Array.isArray(discData)
          ? discData.map((d) => ({
              id: d.id,
              nome: d.nome || d.titulo,
            }))
          : []
      );
    } catch (error) {
      console.error("Erro ao carregar referências:", error);
    } finally {
      setLoadingRefs(false);
    }
  };

  useEffect(() => {
    fetchMateriais();
    fetchRefs();
  }, []);

  // ───────────────────────────────────────────────
  // 🔹 Filtros
  // ───────────────────────────────────────────────
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
    () =>
      [...new Set(materiais.map((m) => m.turma_nome).filter(Boolean as any))] as string[],
    [materiais]
  );

  // ───────────────────────────────────────────────
  // 🔹 Criar / Editar Material
  // ───────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.titulo || (!formData.link && !formData.arquivo)) {
      alert("Preencha o título e um link ou arquivo.");
      return;
    }

    const form = new FormData();
    form.append("titulo", formData.titulo);
    form.append("descricao", formData.descricao);
    form.append("data", formData.data);
    form.append("link", formData.link || "");
    form.append("professor_id", formData.professor_id || "");
    form.append("turma_id", formData.turma_id || "");
    form.append(
      "disciplina_id",
      materiaId || formData.disciplina_id || ""
    );
    if (formData.arquivo) form.append("arquivo", formData.arquivo);

    try {
      setLoading(true);
      const method = editingMaterial ? "PUT" : "POST";
      const url = editingMaterial
        ? `${API_URL}/api/materiais/${editingMaterial.id}`
        : `${API_URL}/api/materiais`;

      const res = await fetch(url, { method, body: form });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao salvar material (${res.status}): ${text}`);
      }
      await fetchMateriais();
      resetForm();
    } catch (error: any) {
      console.error("Erro ao salvar material:", error);
      setErrorMsg(error?.message);
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────
  // 🔹 Excluir Material
  // ───────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este material?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/materiais/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir material.");
      await fetchMateriais();
    } catch (error: any) {
      console.error("Erro ao excluir material:", error);
      setErrorMsg(error?.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      titulo: m.titulo,
      descricao: m.descricao || "",
      data: m.data?.split("T")[0] || "",
      link: m.link || "",
      professor_id: m.professor_id?.toString() || "",
      turma_id: m.turma_id?.toString() || "",
      disciplina_id: m.disciplina_id?.toString() || "",
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

  // ───────────────────────────────────────────────
  // 🔹 Render
  // ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Materiais Didáticos</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie documentos, links e arquivos de apoio da disciplina
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMaterial(null)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Material
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? "Editar Material" : "Novo Material"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) =>
                    setFormData({ ...formData, data: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Turma</Label>
                  <Select
                    value={formData.turma_id}
                    onValueChange={(v) => setFormData({ ...formData, turma_id: v })}
                    disabled={loadingRefs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.nome_turma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Professor</Label>
                  <Select
                    value={formData.professor_id}
                    onValueChange={(v) =>
                      setFormData({ ...formData, professor_id: v })
                    }
                    disabled={loadingRefs}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Disciplina</Label>
                <Select
                  value={formData.disciplina_id}
                  onValueChange={(v) =>
                    setFormData({ ...formData, disciplina_id: v })
                  }
                  disabled={!!materiaId || loadingRefs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplinas.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {materiaId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Disciplina fixada pela rota (ID: {materiaId})
                  </p>
                )}
              </div>

              <div>
                <Label>Link (Drive ou site)</Label>
                <Input
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label>Arquivo PDF/DOC</Label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      arquivo: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
                    </>
                  ) : editingMaterial ? (
                    "Salvar"
                  ) : (
                    "Criar"
                  )}
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Turmas</SelectItem>
                {turmasOptions.map((t, i) => (
                  <SelectItem key={i} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMateriais.map((m) => (
            <Card
              key={m.id}
              className="shadow-md rounded-2xl hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{m.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {m.descricao}
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Professor:</span>{" "}
                    {m.professor_nome || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Turma:</span>{" "}
                    {m.turma_nome || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Disciplina:</span>{" "}
                    {m.disciplina_nome || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Data:</span>{" "}
                    {m.data
                      ? new Date(m.data).toLocaleDateString("pt-BR")
                      : "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {m.link && (
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => window.open(m.link, "_blank")}
                    >
                      <Download className="h-4 w-4" /> Acessar
                    </Button>
                  )}
                  {m.arquivo && (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() =>
                        window.open(`${API_URL}${m.arquivo}`, "_blank")
                      }
                    >
                      <Download className="h-4 w-4" /> Baixar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(m)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredMateriais.length === 0 && !loading && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Nenhum material encontrado.
            </div>
          )}
        </div>
      )}

      {errorMsg && !isDialogOpen && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  );
}
