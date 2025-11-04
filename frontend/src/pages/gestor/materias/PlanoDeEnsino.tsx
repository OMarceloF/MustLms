"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Plus, Edit, Trash2, FileText, Printer } from "lucide-react"

interface PlanoEnsino {
  id: number
  disciplina: string
  objetivos: string
  competencias: string
  conteudos: string
  cronograma: string
  avaliacoes: string
}

export default function PlanoDeEnsino() {
  const [planos, setPlanos] = useState<PlanoEnsino[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlano, setEditingPlano] = useState<PlanoEnsino | null>(null)
  const [expandedPlano, setExpandedPlano] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    disciplina: "",
    objetivos: "",
    competencias: "",
    conteudos: "",
    cronograma: "",
    avaliacoes: "",
  })

  useEffect(() => {
    fetchMockData()
  }, [])

  const fetchMockData = async () => {
    const mockPlanos: PlanoEnsino[] = [
      {
        id: 1,
        disciplina: "Cálculo Diferencial e Integral I",
        objetivos:
          "Compreender os conceitos fundamentais de limites, derivadas e integrais. Desenvolver habilidades de resolução de problemas matemáticos aplicados.",
        competencias: "Análise matemática, raciocínio lógico, resolução de problemas complexos",
        conteudos:
          "1. Limites e Continuidade\n2. Derivadas\n3. Aplicações de Derivadas\n4. Integrais Definidas e Indefinidas\n5. Técnicas de Integração",
        cronograma: "Semana 1-4: Limites\nSemana 5-8: Derivadas\nSemana 9-12: Integrais\nSemana 13-16: Aplicações",
        avaliacoes:
          "Prova 1 (peso 3) - Semana 8\nTrabalho em Grupo (peso 2) - Semana 12\nProva Final (peso 5) - Semana 16",
      },
      {
        id: 2,
        disciplina: "Estruturas de Dados",
        objetivos:
          "Dominar estruturas de dados fundamentais e algoritmos de manipulação. Implementar soluções eficientes para problemas computacionais.",
        competencias: "Programação, análise de complexidade, otimização de algoritmos",
        conteudos: "1. Arrays e Listas\n2. Pilhas e Filas\n3. Árvores Binárias\n4. Grafos\n5. Tabelas Hash",
        cronograma:
          "Semana 1-3: Listas\nSemana 4-6: Pilhas e Filas\nSemana 7-10: Árvores\nSemana 11-14: Grafos\nSemana 15-16: Hash",
        avaliacoes:
          "Projeto Prático 1 (peso 3) - Semana 6\nProjeto Prático 2 (peso 3) - Semana 14\nProva Final (peso 4) - Semana 16",
      },
    ]
    setPlanos(mockPlanos)
  }

  const handleCreate = () => {
    const newPlano: PlanoEnsino = {
      id: Date.now(),
      ...formData,
    }
    setPlanos([...planos, newPlano])
    resetForm()
  }

  const handleEdit = () => {
    if (editingPlano) {
      setPlanos(planos.map((p) => (p.id === editingPlano.id ? { ...p, ...formData } : p)))
      resetForm()
    }
  }

  const handleDelete = (id: number) => {
    setPlanos(planos.filter((p) => p.id !== id))
  }

  const openEditDialog = (plano: PlanoEnsino) => {
    setEditingPlano(plano)
    setFormData({
      disciplina: plano.disciplina,
      objetivos: plano.objetivos,
      competencias: plano.competencias,
      conteudos: plano.conteudos,
      cronograma: plano.cronograma,
      avaliacoes: plano.avaliacoes,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ disciplina: "", objetivos: "", competencias: "", conteudos: "", cronograma: "", avaliacoes: "" })
    setEditingPlano(null)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Plano de Ensino</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie os planos de ensino das disciplinas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingPlano(null)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlano ? "Editar Plano de Ensino" : "Novo Plano de Ensino"}</DialogTitle>
            </DialogHeader>
            {/* O formulário dentro do modal já usa um layout de uma coluna (space-y-4), que é naturalmente responsivo. */}
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="disciplina">Disciplina</Label>
                <Input id="disciplina" value={formData.disciplina} onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })} placeholder="Nome da disciplina" />
              </div>
              <div>
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea id="objetivos" value={formData.objetivos} onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })} placeholder="Descreva os objetivos..." rows={3} />
              </div>
              <div>
                <Label htmlFor="competencias">Competências</Label>
                <Textarea id="competencias" value={formData.competencias} onChange={(e) => setFormData({ ...formData, competencias: e.target.value })} placeholder="Liste as competências..." rows={3} />
              </div>
              <div>
                <Label htmlFor="conteudos">Conteúdos</Label>
                <Textarea id="conteudos" value={formData.conteudos} onChange={(e) => setFormData({ ...formData, conteudos: e.target.value })} placeholder="Liste os conteúdos..." rows={5} />
              </div>
              <div>
                <Label htmlFor="cronograma">Cronograma</Label>
                <Textarea id="cronograma" value={formData.cronograma} onChange={(e) => setFormData({ ...formData, cronograma: e.target.value })} placeholder="Descreva o cronograma..." rows={4} />
              </div>
              <div>
                <Label htmlFor="avaliacoes">Avaliações</Label>
                <Textarea id="avaliacoes" value={formData.avaliacoes} onChange={(e) => setFormData({ ...formData, avaliacoes: e.target.value })} placeholder="Liste as avaliações..." rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={editingPlano ? handleEdit : handleCreate}>{editingPlano ? "Salvar" : "Criar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Planos */}
      <Card className="shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Planos de Ensino Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 md:px-6">Disciplina</TableHead>
                  {/* Coluna "Objetivos" oculta em telas pequenas */}
                  <TableHead className="px-4 md:px-6 hidden sm:table-cell">Objetivos</TableHead>
                  <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planos.map((plano) => (
                  <TableRow key={plano.id} className={expandedPlano === plano.id ? "bg-muted/50" : ""}>
                    <TableCell className="px-4 md:px-6 py-3 font-medium">{plano.disciplina}</TableCell>
                    {/* Célula "Objetivos" oculta em telas pequenas */}
                    <TableCell className="px-4 md:px-6 py-3 hidden sm:table-cell">
                      <p className="line-clamp-2 text-sm text-muted-foreground max-w-md">{plano.objetivos}</p>
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-right">
                      <div className="flex justify-end gap-0 md:gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setExpandedPlano(expandedPlano === plano.id ? null : plano.id)}>
                          <FileText className="h-4 w-4" />
                          <span className="hidden lg:inline ml-2">Ver</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(plano)}>
                          <Edit className="h-4 w-4" />
                          <span className="hidden lg:inline ml-2">Editar</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => window.print()}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(plano.id)}>
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

      {/* Detalhes do Plano Expandido */}
      {expandedPlano && planos.find((p) => p.id === expandedPlano) && (
        <Card className="shadow-md rounded-2xl animate-in fade-in-50">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">{planos.find((p) => p.id === expandedPlano)?.disciplina}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Seções de detalhes com fontes e espaçamentos responsivos */}
            <div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Objetivos</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{planos.find((p) => p.id === expandedPlano)?.objetivos}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Competências</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{planos.find((p) => p.id === expandedPlano)?.competencias}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Conteúdos Programáticos</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{planos.find((p) => p.id === expandedPlano)?.conteudos}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Cronograma</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{planos.find((p) => p.id === expandedPlano)?.cronograma}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-lg mb-2">Avaliações Previstas</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{planos.find((p) => p.id === expandedPlano)?.avaliacoes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}