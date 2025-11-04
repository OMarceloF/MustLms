// frontend/src/pages/gestor/materias/NotasAvaliacoes.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Informacao {
  id: number
  titulo: string
  conteudo: string
  categoria: string
}

export default function InformacoesComplementares() {
  const [informacoes, setInformacoes] = useState<Informacao[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInfo, setEditingInfo] = useState<Informacao | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    categoria: "",
  })

  useEffect(() => {
    fetchMockData()
  }, [])

  const fetchMockData = async () => {
    const mockInformacoes: Informacao[] = [
      {
        id: 1,
        titulo: "Calendário Acadêmico 2024.1",
        conteudo: "Início das aulas: 05/02/2024\nTérmino: 30/06/2024\nRecesso: 28/03 a 01/04",
        categoria: "Administrativo",
      },
      {
        id: 2,
        titulo: "Normas de Avaliação",
        conteudo:
          "Média mínima para aprovação: 7.0\nFrequência mínima: 75%\nRecuperação: disponível para notas entre 5.0 e 6.9",
        categoria: "Acadêmico",
      },
      {
        id: 3,
        titulo: "Semana de Provas Finais",
        conteudo: "Período: 24/06 a 28/06\nHorários especiais\nConsultar cronograma por turma",
        categoria: "Evento",
      },
    ]
    setInformacoes(mockInformacoes)
  }

  const handleCreate = () => {
    const newInfo: Informacao = {
      id: Date.now(),
      ...formData,
    }
    setInformacoes([...informacoes, newInfo])
    resetForm()
  }

  const handleEdit = () => {
    if (editingInfo) {
      setInformacoes(informacoes.map((i) => (i.id === editingInfo.id ? { ...i, ...formData } : i)))
      resetForm()
    }
  }

  const handleDelete = (id: number) => {
    setInformacoes(informacoes.filter((i) => i.id !== id))
  }

  const openEditDialog = (info: Informacao) => {
    setEditingInfo(info)
    setFormData({
      titulo: info.titulo,
      conteudo: info.conteudo,
      categoria: info.categoria,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ titulo: "", conteudo: "", categoria: "" })
    setEditingInfo(null)
    setIsDialogOpen(false)
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Administrativo": return "bg-blue-100 text-blue-800"
      case "Acadêmico": return "bg-green-100 text-green-800"
      case "Evento": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Informações Complementares</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Comunicados e informações gerais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingInfo(null)} className="gap-2 w-full sm:w-auto">
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
                <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Calendário Acadêmico" />
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
                <Button onClick={editingInfo ? handleEdit : handleCreate}>{editingInfo ? "Salvar" : "Criar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Informações */}
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
                  {/* Coluna "Conteúdo" oculta em telas pequenas */}
                  <TableHead className="px-4 md:px-6 hidden sm:table-cell">Conteúdo</TableHead>
                  <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {informacoes.map((info) => (
                  <TableRow key={info.id}>
                    <TableCell className="px-4 md:px-6 py-3 font-medium">{info.titulo}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3">
                      <Badge className={`${getCategoriaColor(info.categoria)} border-transparent`}>{info.categoria}</Badge>
                    </TableCell>
                    {/* Célula "Conteúdo" oculta em telas pequenas */}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}