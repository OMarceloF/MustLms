"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Plus, Edit, Trash2, Play, Search, Loader2 } from "lucide-react"
import { useParams } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

// --- Interfaces de Tipo ---
interface Aula {
  id: number
  titulo: string
  descricao: string
  data: string
  link: string
  professor_id?: number
  turma_id?: number
  disciplina_id?: number
  professor_nome?: string
  turma_nome?: string
  disciplina_nome?: string
  arquivo?: string
}

interface Professor {
  id: number
  nome: string
}

// 👇 --- INTERFACE CORRIGIDA E SINCRONIZADA COM CONTROLLER --- 👇
interface Turma {
  id: number
  nome_turma: string
  professor_id: number // Campo essencial para o autofill do professor
}

interface Disciplina {
  id: number
  nome: string
}

// --- Componente Principal ---
export default function AulasGravadas() {
  const { id: materiaId } = useParams<{ id: string }>()

  // Estados da UI e de dados
  const [aulas, setAulas] = useState<Aula[]>([])
  const [filteredAulas, setFilteredAulas] = useState<Aula[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTurmaFilter, setSelectedTurmaFilter] = useState("todas")

  // Estados do Modal e Formulário
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    link: "",
    professor_id: "",
    turma_id: "",
    disciplina_id: materiaId || "",
    arquivo: null as File | null,
  })

  // Estados de carregamento e erro
  const [loading, setLoading] = useState(false)
  const [loadingRefs, setLoadingRefs] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Estados para os dados dos seletores (dropdowns)
  const [professores, setProfessores] = useState<Professor[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [disciplinaAtual, setDisciplinaAtual] = useState<Disciplina | null>(null)

  // --- Funções de Busca de Dados (API) ---

  const fetchAulas = async () => {
    if (!materiaId) return;
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await fetch(`${API_URL}/api/aulas-gravadas`)
      if (!res.ok) throw new Error(`Falha ao buscar aulas (${res.status})`)
      
      const data: Aula[] = await res.json()
      const filtered = data.filter(a => String(a.disciplina_id) === String(materiaId))
      
      setAulas(filtered)
    } catch (error: any) {
      console.error("Erro ao buscar aulas:", error)
      setErrorMsg(error?.message || "Erro ao buscar aulas.")
    } finally {
      setLoading(false)
    }
  }

 const fetchReferences = async () => {
    if (!materiaId) return;
    try {
      setLoadingRefs(true);
      setErrorMsg(null);

      const [profRes, disciplinaRes, turmasRes] = await Promise.all([
        fetch(`${API_URL}/api/professores`),
        fetch(`${API_URL}/api/disciplinas/${materiaId}`),
        // Rota que deve retornar o array de turmas com { id, nome_turma, professor_id }
        fetch(`${API_URL}/api/disciplinas/${materiaId}/turmas-ativas-para-aulas`) 
      ]);

      if (!profRes.ok) throw new Error(`Falha ao buscar professores (${profRes.status})`);
      if (!disciplinaRes.ok) throw new Error(`Falha ao buscar disciplina (${disciplinaRes.status})`);
      if (!turmasRes.ok) throw new Error(`Falha ao buscar turmas (${turmasRes.status})`);

      const [profData, disciplinaData, turmasData] = await Promise.all([
        profRes.json(),
        disciplinaRes.json(),
        turmasRes.json(),
      ]);

      // Logs de debug para confirmar no console do navegador se os dados chegaram
      console.log("Turmas recebidas da API:", turmasData);

      setProfessores(Array.isArray(profData) ? profData : []);
      setDisciplinaAtual(disciplinaData);
      setTurmas(Array.isArray(turmasData) ? turmasData : []);

    } catch (error: any) {
      console.error("Erro ao carregar referências:", error);
      setErrorMsg(error?.message || "Erro ao carregar dados do formulário.");
    } finally {
      setLoadingRefs(false);
    }
  };

  useEffect(() => {
    fetchAulas()
    fetchReferences()
  }, [materiaId])

  // --- Lógica de Filtros ---

  useEffect(() => {
    let filtered = aulas
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(a => a.titulo?.toLowerCase().includes(q) || (a.descricao || "").toLowerCase().includes(q))
    }
    if (selectedTurmaFilter !== "todas") {
      filtered = filtered.filter(a => a.turma_nome === selectedTurmaFilter)
    }
    setFilteredAulas(filtered)
  }, [searchTerm, selectedTurmaFilter, aulas])

  const turmasOptionsFromAulas = useMemo(() => [...new Set(aulas.map(a => a.turma_nome).filter(Boolean as any))] as string[], [aulas])

  // --- Funções de CRUD (Salvar, Excluir) ---

  const handleSave = async () => {
    if (!formData.titulo || !formData.data || !formData.link) {
      alert("Campos obrigatórios: título, data e link.")
      return
    }

    const form = new FormData()
    form.append("titulo", formData.titulo)
    form.append("descricao", formData.descricao)
    form.append("data", formData.data)
    form.append("link", formData.link)
    form.append("professor_id", formData.professor_id || "")
    form.append("turma_id", formData.turma_id || "")
    form.append("disciplina_id", materiaId || "")
    if (formData.arquivo) form.append("arquivo", formData.arquivo)

    try {
      setLoading(true)
      setErrorMsg(null)
      const method = editingAula ? "PUT" : "POST"
      const url = editingAula ? `${API_URL}/api/aulas-gravadas/${editingAula.id}` : `${API_URL}/api/aulas-gravadas`

      const res = await fetch(url, { method, body: form })
      if (!res.ok) throw new Error(`Falha ao salvar aula (${res.status})`)

      await fetchAulas()
      resetForm()
    } catch (err: any) {
      console.error("Erro ao salvar aula:", err)
      setErrorMsg(err?.message || "Erro ao salvar aula.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta aula?")) return
    try {
      setLoading(true)
      setErrorMsg(null)
      const res = await fetch(`${API_URL}/api/aulas-gravadas/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Falha ao excluir aula (${res.status})`)
      await fetchAulas()
    } catch (error: any) {
      console.error("Erro ao excluir aula:", error)
      setErrorMsg(error?.message || "Erro ao excluir aula.")
    } finally {
      setLoading(false)
    }
  }

  // --- Funções do Modal ---

  const openDialog = (aula: Aula | null) => {
    const isEditing = !!aula;
    setEditingAula(aula);
    setFormData({
      titulo: isEditing ? aula.titulo : "",
      descricao: isEditing ? aula.descricao || "" : "",
      data: isEditing ? aula.data?.split("T")[0] || "" : "",
      link: isEditing ? aula.link : "",
      professor_id: isEditing ? aula.professor_id?.toString() || "" : "",
      turma_id: isEditing ? aula.turma_id?.toString() || "" : "",
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
    })
    setEditingAula(null)
    setIsDialogOpen(false)
  }

  // 👇 --- FUNÇÃO CORRIGIDA PARA SELEÇÃO DE TURMA --- 👇
  const handleTurmaChange = (turmaId: string) => {
    const turmaSelecionada = turmas.find(t => t.id.toString() === turmaId);
    
    // Verifica se a turma tem professor_id vinculado
    const professorId = turmaSelecionada && turmaSelecionada.professor_id 
      ? turmaSelecionada.professor_id.toString() 
      : "";

    setFormData(prev => ({
      ...prev,
      turma_id: turmaId,
      professor_id: professorId, // Auto-seleciona o professor
    }));
  };

  // --- Renderização ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Aulas Gravadas</h2>
          <p className="text-muted-foreground mt-1">Gerencie o repositório de videoaulas com professores, turmas e disciplinas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAula ? "Editar Aula" : "Nova Aula Gravada"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input id="titulo" placeholder="Título da aula" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} />
              <Textarea id="descricao" placeholder="Descrição breve sobre o conteúdo da aula" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
                </div>
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
                        <SelectItem disabled value="none">Nenhuma turma para esta disciplina</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Professor</Label>
                  <Select value={formData.professor_id} onValueChange={(v) => setFormData({ ...formData, professor_id: v })} disabled={loadingRefs}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingRefs ? "Carregando..." : "Selecione o professor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {professores.map((p) => (<SelectItem key={p.id} value={p.id.toString()}>{p.nome}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Disciplina</Label>
                  <Select value={formData.disciplina_id} disabled>
                    <SelectTrigger>
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
              </div>
              <Input id="link" placeholder="Link do Vídeo (YouTube, Vimeo, etc.)" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} />
              <div>
                <Label htmlFor="arquivo">Arquivo Complementar (opcional)</Label>
                <Input id="arquivo" type="file" onChange={(e) => setFormData({ ...formData, arquivo: e.target.files?.[0] || null })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={loading || !formData.titulo || !formData.data || !formData.link}>
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>) : editingAula ? "Salvar" : "Criar"}
                </Button>
              </div>
              {errorMsg && (<p className="text-sm text-red-600">{errorMsg}</p>)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar aulas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedTurmaFilter} onValueChange={setSelectedTurmaFilter}>
              <SelectTrigger><SelectValue placeholder="Filtrar por turma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Turmas</SelectItem>
                {turmasOptionsFromAulas.map((turma, i) => (<SelectItem key={i} value={turma}>{turma}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAulas.map((aula) => (
            <Card key={aula.id} className="shadow-md rounded-2xl hover:shadow-lg transition-shadow">
              <CardHeader><CardTitle className="text-lg">{aula.titulo}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{aula.descricao}</p>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold">Professor:</span> {aula.professor_nome || "—"}</p>
                  <p><span className="font-semibold">Turma:</span> {aula.turma_nome || "—"}</p>
                  <p><span className="font-semibold">Disciplina:</span> {aula.disciplina_nome || "—"}</p>
                  <p><span className="font-semibold">Data:</span> {aula.data ? new Date(aula.data).toLocaleDateString("pt-BR") : "—"}</p>
                  {aula.arquivo && (<p><a href={`${API_URL}${aula.arquivo}`} target="_blank" className="text-blue-600 hover:underline">Baixar material</a></p>)}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => window.open(aula.link, "_blank")}><Play className="h-4 w-4" />Assistir</Button>
                  <Button variant="outline" size="icon" onClick={() => openDialog(aula)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(aula.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredAulas.length === 0 && !loading && (
            <div className="col-span-full text-center text-muted-foreground py-8">Nenhuma aula encontrada.</div>
          )}
        </div>
      )}
      {errorMsg && !isDialogOpen && (<p className="text-sm text-red-600">{errorMsg}</p>)}
    </div>
  )
}