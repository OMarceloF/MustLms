// frontend/src/pages/gestor/cursos/matriz-curricular-mesclada-tab.tsx

"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"
import { Button } from "../components/ui/button"
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
import { Plus, Pencil, Trash2 } from "lucide-react"

// Interface unificada para a disciplina
interface Disciplina {
  id: string
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  ementa: string
}

// Dados de exemplo (mock data)
const mockDisciplinas: Disciplina[] = [
  {
    id: "1",
    nome: "Metodologia de Pesquisa Científica",
    codigo: "POS-001",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 1,
    ementa:
      "Introdução aos métodos de pesquisa científica. Elaboração de projetos de pesquisa. Normas ABNT. Ética em pesquisa.",
  },
  {
    id: "2",
    nome: "Estatística Aplicada",
    codigo: "POS-002",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 1,
    ementa:
      "Estatística descritiva e inferencial. Testes de hipóteses. Análise de variância. Regressão linear e múltipla.",
  },
  {
    id: "3",
    nome: "Seminários de Pesquisa I",
    codigo: "POS-003",
    creditos: 2,
    cargaHoraria: 30,
    semestre: 1,
    ementa: "Apresentação e discussão de projetos de pesquisa dos alunos. Análise crítica de trabalhos científicos.",
  },
  {
    id: "4",
    nome: "Tópicos Avançados em Computação",
    codigo: "POS-004",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 2,
    ementa: "Tendências atuais em computação. Inteligência artificial. Machine learning. Cloud computing.",
  },
  {
    id: "5",
    nome: "Análise de Algoritmos",
    codigo: "POS-005",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 2,
    ementa: "Complexidade computacional. Análise assintótica. Algoritmos de ordenação e busca. Programação dinâmica.",
  },
]

export function MatrizCurricularTab() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(mockDisciplinas)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null)
  const [formData, setFormData] = useState<Partial<Disciplina>>({})
  const [semestres, setSemestres] = useState([1, 2, 3]) // Gerencia os semestres dinamicamente

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
    // Adicionei um confirm para segurança
    if (window.confirm("Tem certeza que deseja apagar esta disciplina?")) {
      setDisciplinas(disciplinas.filter((d) => d.id !== id))
    }
  }

  const handleSave = () => {
    if (editingDisciplina) {
      // Edita uma disciplina existente
      setDisciplinas(
        disciplinas.map((d) => (d.id === editingDisciplina.id ? { ...d, ...(formData as Disciplina) } : d))
      )
    } else {
      // Adiciona uma nova disciplina
      const newDisciplina: Disciplina = {
        id: Date.now().toString(),
        nome: formData.nome || "",
        codigo: formData.codigo || "",
        creditos: formData.creditos || 0,
        cargaHoraria: formData.cargaHoraria || 0,
        semestre: formData.semestre || 1,
        ementa: formData.ementa || "",
      }
      setDisciplinas([...disciplinas, newDisciplina])
      // Adiciona o novo semestre à lista se ele não existir
      if (formData.semestre && !semestres.includes(formData.semestre)) {
        setSemestres([...semestres, formData.semestre].sort((a, b) => a - b))
      }
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestão da Matriz Curricular</CardTitle>
              <CardDescription>Adicione, edite ou remova as disciplinas do curso.</CardDescription>
            </div>
            <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Disciplina
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Disciplinas agrupadas por Semestre */}
      {semestres.map((semestre) => {
        const disciplinasSemestre = disciplinas.filter((d) => d.semestre === semestre).sort((a, b) => a.nome.localeCompare(b.nome));
        if (disciplinasSemestre.length === 0) return null

        return (
          <Card key={semestre}>
            <CardHeader>
              <CardTitle>{semestre}º Semestre</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {disciplinasSemestre.map((disciplina) => (
                  <AccordionItem key={disciplina.id} value={disciplina.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="text-left">
                          <p className="font-semibold">{disciplina.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {disciplina.codigo} • {disciplina.creditos} créditos • {disciplina.cargaHoraria}h
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); // Impede que o acordeão abra/feche
                              handleEdit(disciplina);
                            }}
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation(); // Impede que o acordeão abra/feche
                              handleDelete(disciplina.id);
                            }}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <h4 className="mb-2 font-semibold">Ementa:</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{disciplina.ementa}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )
      })}

      {/* Modal (Dialog) para Adicionar/Editar Disciplina */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>{editingDisciplina ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
            <DialogDescription>Preencha as informações da disciplina.</DialogDescription>
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
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo || ""}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cargaHoraria">Carga Horária (h)</Label>
                <Input
                  id="cargaHoraria"
                  type="number"
                  value={formData.cargaHoraria || ""}
                  onChange={(e) => setFormData({ ...formData, cargaHoraria: Number.parseInt(e.target.value) || 0 })}
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creditos">Créditos</Label>
                <Input
                  id="creditos"
                  type="number"
                  value={formData.creditos || ""}
                  onChange={(e) => setFormData({ ...formData, creditos: Number.parseInt(e.target.value) || 0 })}
                  className="bg-background"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="semestre">Semestre</Label>
                <Input
                  id="semestre"
                  type="number"
                  value={formData.semestre || ""}
                  onChange={(e) => setFormData({ ...formData, semestre: Number.parseInt(e.target.value) || 1 })}
                  className="bg-background"
                />
              </div>
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
  )
}
