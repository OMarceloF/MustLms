"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Plus, Edit, Trash2, Download, Search } from "lucide-react"

interface Material {
  id: number
  titulo: string
  descricao: string
  autor: string
  arquivo: string
  capa?: string
}

export default function MateriaisDidaticos() {
  const [materiais, setMateriais] = useState<Material[]>([])
  const [filteredMateriais, setFilteredMateriais] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    autor: "",
    arquivo: "",
    capa: "",
  })

  useEffect(() => {
    fetchMockData()
  }, [])

  useEffect(() => {
    const filtered = materiais.filter(
      (m) =>
        m.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.autor.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredMateriais(filtered)
  }, [searchTerm, materiais])

  const fetchMockData = async () => {
    const mockMateriais: Material[] = [
      {
        id: 1,
        titulo: "Apostila de Cálculo I",
        descricao: "Material completo sobre derivadas e integrais",
        autor: "Prof. João Silva",
        arquivo: "calculo-1.pdf",
        capa: "/math-textbook.png",
      },
      {
        id: 2,
        titulo: "Guia de Física Moderna",
        descricao: "Conceitos de relatividade e mecânica quântica",
        autor: "Profa. Maria Santos",
        arquivo: "fisica-moderna.pdf",
        capa: "/physics-book.jpg",
      },
      {
        id: 3,
        titulo: "Estruturas de Dados",
        descricao: "Listas, árvores, grafos e algoritmos",
        autor: "Prof. Carlos Oliveira",
        arquivo: "estruturas-dados.pdf",
        capa: "/computer-science-book.jpg",
      },
    ]
    setMateriais(mockMateriais)
    setFilteredMateriais(mockMateriais)
  }

  const handleCreate = () => {
    const newMaterial: Material = {
      id: Date.now(),
      ...formData,
    }
    setMateriais([...materiais, newMaterial])
    resetForm()
  }

  const handleEdit = () => {
    if (editingMaterial) {
      setMateriais(materiais.map((m) => (m.id === editingMaterial.id ? { ...m, ...formData } : m)))
      resetForm()
    }
  }

  const handleDelete = (id: number) => {
    setMateriais(materiais.filter((m) => m.id !== id))
  }

  const openEditDialog = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      titulo: material.titulo,
      descricao: material.descricao,
      autor: material.autor,
      arquivo: material.arquivo,
      capa: material.capa || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ titulo: "", descricao: "", autor: "", arquivo: "", capa: "" })
    setEditingMaterial(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Materiais Didáticos</h2>
          <p className="text-muted-foreground mt-1">Biblioteca de recursos e apostilas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMaterial(null)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? "Editar Material" : "Novo Material Didático"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Apostila de Cálculo I"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o conteúdo do material"
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
              <div>
                <Label htmlFor="arquivo">Arquivo PDF</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, arquivo: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="capa">Capa (opcional)</Label>
                <Input
                  id="capa"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, capa: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={editingMaterial ? handleEdit : handleCreate}>
                  {editingMaterial ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Materiais Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMateriais.map((material) => (
          <Card key={material.id} className="shadow-md rounded-2xl hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="h-48 bg-muted rounded-t-2xl overflow-hidden">
                <img
                  src={material.capa || "/placeholder.svg?height=200&width=300&query=book cover"}
                  alt={material.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg line-clamp-1">{material.titulo}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{material.descricao}</p>
              </div>
              <p className="text-sm">
                <span className="font-semibold">Autor:</span> {material.autor}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2" variant="default">
                  <Download className="h-4 w-4" />
                  Baixar PDF
                </Button>
                <Button variant="outline" size="icon" onClick={() => openEditDialog(material)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(material.id)}>
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
