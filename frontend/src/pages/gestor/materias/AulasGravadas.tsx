"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Plus, Edit, Trash2, Play, Search } from "lucide-react"

interface Aula {
  id: number
  titulo: string
  descricao: string
  data: string
  link: string
  professor: string
  turma: string
  arquivo?: string
}

export default function AulasGravadas() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [filteredAulas, setFilteredAulas] = useState<Aula[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTurma, setSelectedTurma] = useState("todas")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    link: "",
    professor: "",
    turma: "",
    arquivo: "",
  })

  useEffect(() => {
    fetchMockData()
  }, [])

  useEffect(() => {
    let filtered = aulas
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (selectedTurma !== "todas") {
      filtered = filtered.filter((a) => a.turma === selectedTurma)
    }
    setFilteredAulas(filtered)
  }, [searchTerm, selectedTurma, aulas])

  const fetchMockData = async () => {
    const mockAulas: Aula[] = [
      {
        id: 1,
        titulo: "Introdução ao Cálculo Diferencial",
        descricao: "Conceitos básicos de derivadas e aplicações",
        data: "2024-03-10",
        link: "https://youtube.com/watch?v=example1",
        professor: "Prof. João Silva",
        turma: "Turma A",
      },
      {
        id: 2,
        titulo: "Física Quântica - Parte 1",
        descricao: "Fundamentos da mecânica quântica",
        data: "2024-03-12",
        link: "https://youtube.com/watch?v=example2",
        professor: "Profa. Maria Santos",
        turma: "Turma B",
      },
      {
        id: 3,
        titulo: "Algoritmos de Ordenação",
        descricao: "Bubble Sort, Quick Sort e Merge Sort",
        data: "2024-03-15",
        link: "https://youtube.com/watch?v=example3",
        professor: "Prof. Carlos Oliveira",
        turma: "Turma A",
      },
    ]
    setAulas(mockAulas)
    setFilteredAulas(mockAulas)
  }

  const handleCreate = () => {
    const newAula: Aula = {
      id: Date.now(),
      ...formData,
    }
    setAulas([...aulas, newAula])
    resetForm()
  }

  const handleEdit = () => {
    if (editingAula) {
      setAulas(aulas.map((a) => (a.id === editingAula.id ? { ...a, ...formData } : a)))
      resetForm()
    }
  }

  const handleDelete = (id: number) => {
    setAulas(aulas.filter((a) => a.id !== id))
  }

  const openEditDialog = (aula: Aula) => {
    setEditingAula(aula)
    setFormData({
      titulo: aula.titulo,
      descricao: aula.descricao,
      data: aula.data,
      link: aula.link,
      professor: aula.professor,
      turma: aula.turma,
      arquivo: aula.arquivo || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ titulo: "", descricao: "", data: "", link: "", professor: "", turma: "", arquivo: "" })
    setEditingAula(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Aulas Gravadas</h2>
          <p className="text-muted-foreground mt-1">Gerencie o repositório de videoaulas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAula(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Aula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAula ? "Editar Aula" : "Nova Aula Gravada"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título da Aula</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Introdução ao Cálculo"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o conteúdo da aula"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="turma">Turma</Label>
                  <Select value={formData.turma} onValueChange={(value) => setFormData({ ...formData, turma: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Turma A">Turma A</SelectItem>
                      <SelectItem value="Turma B">Turma B</SelectItem>
                      <SelectItem value="Turma C">Turma C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="link">Link do Vídeo</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="professor">Professor</Label>
                <Input
                  id="professor"
                  value={formData.professor}
                  onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  placeholder="Nome do professor"
                />
              </div>
              <div>
                <Label htmlFor="arquivo">Arquivo Complementar (opcional)</Label>
                <Input
                  id="arquivo"
                  type="file"
                  onChange={(e) => setFormData({ ...formData, arquivo: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={editingAula ? handleEdit : handleCreate}>{editingAula ? "Salvar" : "Criar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aulas..."
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
                <SelectItem value="Turma A">Turma A</SelectItem>
                <SelectItem value="Turma B">Turma B</SelectItem>
                <SelectItem value="Turma C">Turma C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Aulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAulas.map((aula) => (
          <Card key={aula.id} className="shadow-md rounded-2xl hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{aula.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{aula.descricao}</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Professor:</span> {aula.professor}
                </p>
                <p>
                  <span className="font-semibold">Turma:</span> {aula.turma}
                </p>
                <p>
                  <span className="font-semibold">Data:</span> {new Date(aula.data).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" onClick={() => window.open(aula.link, "_blank")}>
                  <Play className="h-4 w-4" />
                  Assistir
                </Button>
                <Button variant="outline" size="icon" onClick={() => openEditDialog(aula)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(aula.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
