"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Plus, Edit, Trash2, Calendar, User } from "lucide-react"

interface Aviso {
  id: number
  titulo: string
  descricao: string
  data: string
  autor: string
}

export default function Avisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [filteredAvisos, setFilteredAvisos] = useState<Aviso[]>([])
  const [selectedPeriodo, setSelectedPeriodo] = useState("todos")
  const [selectedAutor, setSelectedAutor] = useState("todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<Aviso | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    autor: "",
  })

  useEffect(() => {
    fetchMockData()
  }, [])

  useEffect(() => {
    let filtered = avisos
    if (selectedPeriodo !== "todos") {
      // Filter by period logic here
      filtered = filtered.filter((a) => a.data.includes(selectedPeriodo))
    }
    if (selectedAutor !== "todos") {
      filtered = filtered.filter((a) => a.autor === selectedAutor)
    }
    setFilteredAvisos(filtered)
  }, [selectedPeriodo, selectedAutor, avisos])

  const fetchMockData = async () => {
    const mockAvisos: Aviso[] = [
      {
        id: 1,
        titulo: "Início do Período Letivo",
        descricao:
          "Informamos que as aulas do período 2024.1 iniciam no dia 05 de fevereiro. Todos os alunos devem comparecer pontualmente.",
        data: "2024-01-25",
        autor: "Coordenação Acadêmica",
      },
      {
        id: 2,
        titulo: "Prazo para Matrícula em Disciplinas Optativas",
        descricao: "O prazo para matrícula em disciplinas optativas se encerra em 10/02. Não perca o prazo!",
        data: "2024-02-01",
        autor: "Secretaria",
      },
      {
        id: 3,
        titulo: "Semana de Provas do 1º Bimestre",
        descricao:
          "A semana de provas do primeiro bimestre será de 15 a 19 de abril. Consulte o cronograma detalhado no portal.",
        data: "2024-03-20",
        autor: "Prof. João Silva",
      },
      {
        id: 4,
        titulo: "Palestra sobre Inteligência Artificial",
        descricao:
          "Convidamos todos para a palestra sobre IA aplicada à educação, dia 25/03 às 19h no auditório principal.",
        data: "2024-03-15",
        autor: "Profa. Maria Santos",
      },
    ]
    // Sort by date descending (most recent first)
    mockAvisos.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    setAvisos(mockAvisos)
    setFilteredAvisos(mockAvisos)
  }

  const handleCreate = () => {
    const newAviso: Aviso = {
      id: Date.now(),
      ...formData,
    }
    const updatedAvisos = [newAviso, ...avisos].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    setAvisos(updatedAvisos)
    resetForm()
  }

  const handleEdit = () => {
    if (editingAviso) {
      const updatedAvisos = avisos
        .map((a) => (a.id === editingAviso.id ? { ...a, ...formData } : a))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      setAvisos(updatedAvisos)
      resetForm()
    }
  }

  const handleDelete = (id: number) => {
    setAvisos(avisos.filter((a) => a.id !== id))
  }

  const openEditDialog = (aviso: Aviso) => {
    setEditingAviso(aviso)
    setFormData({
      titulo: aviso.titulo,
      descricao: aviso.descricao,
      data: aviso.data,
      autor: aviso.autor,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ titulo: "", descricao: "", data: "", autor: "" })
    setEditingAviso(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Avisos</h2>
          <p className="text-muted-foreground mt-1">Comunicados para alunos e turmas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAviso(null)} className="gap-2">
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
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Início do Período Letivo"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Escreva o conteúdo do aviso..."
                  rows={6}
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
                  <Label htmlFor="autor">Autor</Label>
                  <Input
                    id="autor"
                    value={formData.autor}
                    onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                    placeholder="Nome do autor"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={editingAviso ? handleEdit : handleCreate}>{editingAviso ? "Salvar" : "Criar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Período</Label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Períodos</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Autor</Label>
              <Select value={selectedAutor} onValueChange={setSelectedAutor}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por autor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Autores</SelectItem>
                  <SelectItem value="Coordenação Acadêmica">Coordenação Acadêmica</SelectItem>
                  <SelectItem value="Secretaria">Secretaria</SelectItem>
                  <SelectItem value="Prof. João Silva">Prof. João Silva</SelectItem>
                  <SelectItem value="Profa. Maria Santos">Profa. Maria Santos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avisos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAvisos.map((aviso) => (
          <Card key={aviso.id} className="shadow-md rounded-2xl hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(aviso.data).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {aviso.autor}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{aviso.descricao}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(aviso)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(aviso.id)}>
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
