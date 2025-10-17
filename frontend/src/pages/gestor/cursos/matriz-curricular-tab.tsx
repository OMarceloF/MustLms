"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Disciplina {
  id: string
  nome: string
  cargaHoraria: number
  creditos: number
  semestre: number
  professor: string
  ementa: string
}

const mockDisciplinas: Disciplina[] = [
  {
    id: "1",
    nome: "Metodologia de Pesquisa Científica",
    cargaHoraria: 60,
    creditos: 4,
    semestre: 1,
    professor: "Dr. João Silva",
    ementa: "Introdução aos métodos de pesquisa científica, elaboração de projetos e análise de dados.",
  },
  {
    id: "2",
    nome: "Estatística Avançada",
    cargaHoraria: 60,
    creditos: 4,
    semestre: 1,
    professor: "Dra. Maria Santos",
    ementa: "Técnicas estatísticas avançadas para análise de dados em pesquisa.",
  },
  {
    id: "3",
    nome: "Seminários de Pesquisa I",
    cargaHoraria: 30,
    creditos: 2,
    semestre: 2,
    professor: "Dr. Pedro Costa",
    ementa: "Apresentação e discussão de projetos de pesquisa em andamento.",
  },
]

export function MatrizCurricularTab() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(mockDisciplinas)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null)
  const [formData, setFormData] = useState<Partial<Disciplina>>({})

  const handleAdd = () => {
    setEditingDisciplina(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const handleEdit = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina)
    setFormData(disciplina)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDisciplinas(disciplinas.filter((d) => d.id !== id))
  }

  const handleSave = () => {
    if (editingDisciplina) {
      setDisciplinas(disciplinas.map((d) => (d.id === editingDisciplina.id ? { ...d, ...formData } : d)))
    } else {
      const newDisciplina: Disciplina = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        cargaHoraria: formData.cargaHoraria || 0,
        creditos: formData.creditos || 0,
        semestre: formData.semestre || 1,
        professor: formData.professor || "",
        ementa: formData.ementa || "",
      }
      setDisciplinas([...disciplinas, newDisciplina])
    }
    setIsDialogOpen(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Matriz Curricular</CardTitle>
            <CardDescription>Gerencie as disciplinas do programa de pós-graduação</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Disciplina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card">
              <DialogHeader>
                <DialogTitle>{editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
                <DialogDescription>Preencha as informações da disciplina</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome da Disciplina</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cargaHoraria">Carga Horária</Label>
                    <Input
                      id="cargaHoraria"
                      type="number"
                      value={formData.cargaHoraria || ""}
                      onChange={(e) => setFormData({ ...formData, cargaHoraria: Number.parseInt(e.target.value) })}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="creditos">Créditos</Label>
                    <Input
                      id="creditos"
                      type="number"
                      value={formData.creditos || ""}
                      onChange={(e) => setFormData({ ...formData, creditos: Number.parseInt(e.target.value) })}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="semestre">Semestre</Label>
                    <Input
                      id="semestre"
                      type="number"
                      value={formData.semestre || ""}
                      onChange={(e) => setFormData({ ...formData, semestre: Number.parseInt(e.target.value) })}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="professor">Professor Responsável</Label>
                  <Input
                    id="professor"
                    value={formData.professor || ""}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ementa">Ementa</Label>
                  <Textarea
                    id="ementa"
                    value={formData.ementa || ""}
                    onChange={(e) => setFormData({ ...formData, ementa: e.target.value })}
                    rows={4}
                    className="bg-background"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead>Nome</TableHead>
                <TableHead className="text-center">Carga Horária</TableHead>
                <TableHead className="text-center">Créditos</TableHead>
                <TableHead className="text-center">Semestre</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplinas.map((disciplina) => (
                <TableRow key={disciplina.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium">{disciplina.nome}</TableCell>
                  <TableCell className="text-center">{disciplina.cargaHoraria}h</TableCell>
                  <TableCell className="text-center">{disciplina.creditos}</TableCell>
                  <TableCell className="text-center">{disciplina.semestre}º</TableCell>
                  <TableCell>{disciplina.professor}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(disciplina)}
                        className="h-8 w-8 hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(disciplina.id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
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
  )
}
