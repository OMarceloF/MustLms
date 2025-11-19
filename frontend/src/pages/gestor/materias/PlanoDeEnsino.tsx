"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"

// Componentes de UI
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"

// Ícones
import { Plus, Edit, Trash2, FileText, Printer, Loader2, Frown } from "lucide-react"

// Interfaces
interface PlanoEnsino {
  id: number
  disciplina: string
  objetivos: string
  competencias: string
  conteudos: string
  cronograma: string
  avaliacoes: string
}

interface PlanoDeEnsinoProps {
  disciplinaId: string | number;
}

export default function PlanoDeEnsino({ disciplinaId }: PlanoDeEnsinoProps) {
  // Estados do componente
  const [plano, setPlano] = useState<PlanoEnsino | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState({
    disciplina: "",
    objetivos: "",
    competencias: "",
    conteudos: "",
    cronograma: "",
    avaliacoes: "",
  })

  // Função para buscar os dados da API
  const fetchPlanoDeEnsino = async () => {
    if (!disciplinaId) return
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/disciplinas/${disciplinaId}/plano-ensino`)
      setPlano(response.data)
      // Se um plano for encontrado, preenche o formulário para edição futura
      if (response.data) {
        setFormData({
          disciplina: response.data.disciplina || "",
          objetivos: response.data.objetivos || "",
          competencias: response.data.competencias || "",
          conteudos: response.data.conteudos || "",
          cronograma: response.data.cronograma || "",
          avaliacoes: response.data.avaliacoes || "",
        })
      }
    } catch (error) {
      console.error("Erro ao buscar plano de ensino:", error)
      toast.error("Falha ao carregar o plano de ensino.")
    } finally {
      setIsLoading(false)
    }
  }

  // Efeito para carregar os dados quando o componente montar
  useEffect(() => {
    fetchPlanoDeEnsino()
  }, [disciplinaId])

  // Função para salvar (criar ou atualizar) o plano de ensino
  const handleSave = async () => {
    if (isSubmitting || !disciplinaId) return
    setIsSubmitting(true)
    try {
      // Usamos a rota de "upsert" que cria ou atualiza
      await axios.post(`/api/disciplinas/${disciplinaId}/plano-ensino`, formData)
      toast.success("Plano de ensino salvo com sucesso!")
      fetchPlanoDeEnsino() // Recarrega os dados
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar plano de ensino:", error)
      toast.error("Falha ao salvar o plano de ensino.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para deletar o plano de ensino
  const handleDelete = async () => {
    if (!plano || !window.confirm("Tem certeza que deseja excluir este plano de ensino? A ação não pode ser desfeita.")) return

    try {
      await axios.delete(`/api/disciplinas/${disciplinaId}/plano-ensino`)
      toast.success("Plano de ensino excluído com sucesso!")
      setPlano(null) // Limpa o estado local
      setFormData({ disciplina: "", objetivos: "", competencias: "", conteudos: "", cronograma: "", avaliacoes: "" })
    } catch (error) {
      console.error("Erro ao excluir plano de ensino:", error)
      toast.error("Falha ao excluir o plano de ensino.")
    }
  }

  // Abre o diálogo de edição, garantindo que os dados mais recentes estejam no formulário
  const openEditDialog = () => {
    if (plano) {
      setFormData({
        disciplina: plano.disciplina || "",
        objetivos: plano.objetivos || "",
        competencias: plano.competencias || "",
        conteudos: plano.conteudos || "",
        cronograma: plano.cronograma || "",
        avaliacoes: plano.avaliacoes || "",
      })
    } else {
      // Se não existe plano, busca o nome da disciplina para preencher o campo
      axios.get(`/api/disciplinas/${disciplinaId}`).then(res => {
        setFormData(prev => ({ ...prev, disciplina: res.data.nome }))
      })
    }
    setIsDialogOpen(true)
  }

  // Reseta o formulário e fecha o diálogo
  const resetForm = () => {
    setIsDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Plano de Ensino</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie o plano de ensino da disciplina</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openEditDialog} className="gap-2 w-full sm:w-auto">
              {plano ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {plano ? "Editar Plano" : "Criar Plano"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{plano ? "Editar Plano de Ensino" : "Novo Plano de Ensino"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="disciplina">Disciplina</Label>
                <Input id="disciplina" value={formData.disciplina} onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })} placeholder="Nome da disciplina" disabled />
              </div>
              <div>
                <Label htmlFor="objetivos">Objetivos</Label>
                <Textarea id="objetivos" value={formData.objetivos} onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })} placeholder="Descreva os objetivos da disciplina..." rows={3} />
              </div>
              <div>
                <Label htmlFor="competencias">Competências</Label>
                <Textarea id="competencias" value={formData.competencias} onChange={(e) => setFormData({ ...formData, competencias: e.target.value })} placeholder="Liste as competências a serem desenvolvidas..." rows={3} />
              </div>
              <div>
                <Label htmlFor="conteudos">Conteúdos Programáticos</Label>
                <Textarea id="conteudos" value={formData.conteudos} onChange={(e) => setFormData({ ...formData, conteudos: e.target.value })} placeholder="Liste os conteúdos abordados, separados por linha..." rows={5} />
              </div>
              <div>
                <Label htmlFor="cronograma">Cronograma</Label>
                <Textarea id="cronograma" value={formData.cronograma} onChange={(e) => setFormData({ ...formData, cronograma: e.target.value })} placeholder="Descreva o cronograma de aulas e atividades..." rows={4} />
              </div>
              <div>
                <Label htmlFor="avaliacoes">Metodologia de Avaliação</Label>
                <Textarea id="avaliacoes" value={formData.avaliacoes} onChange={(e) => setFormData({ ...formData, avaliacoes: e.target.value })} placeholder="Descreva como os alunos serão avaliados..." rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela ou Mensagem de Plano Inexistente */}
      {!plano ? (
        <Card className="shadow-md rounded-2xl overflow-hidden text-center">
            <CardContent className="p-12">
                <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum Plano de Ensino Encontrado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Clique em "Criar Plano" para adicionar um plano de ensino para esta disciplina.
                </p>
            </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Plano de Ensino Cadastrado</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 md:px-6">Disciplina</TableHead>
                      <TableHead className="px-4 md:px-6 hidden sm:table-cell">Objetivos</TableHead>
                      <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="px-4 md:px-6 py-3 font-medium">{plano.disciplina}</TableCell>
                      <TableCell className="px-4 md:px-6 py-3 hidden sm:table-cell">
                        <p className="line-clamp-2 text-sm text-muted-foreground max-w-md">{plano.objetivos}</p>
                      </TableCell>
                      <TableCell className="px-4 md:px-6 py-3 text-right">
                        <div className="flex justify-end gap-0 md:gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                            <FileText className="h-4 w-4" />
                            <span className="hidden lg:inline ml-2">{isExpanded ? "Ocultar" : "Ver"}</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={openEditDialog}>
                            <Edit className="h-4 w-4" />
                            <span className="hidden lg:inline ml-2">Editar</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => window.print()}>
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes do Plano Expandido */}
          {isExpanded && (
            <Card className="shadow-md rounded-2xl animate-in fade-in-50 mt-6">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg">{plano.disciplina}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Objetivos</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.objetivos}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Competências</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.competencias}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Conteúdos Programáticos</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.conteudos}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Cronograma</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.cronograma}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Metodologia de Avaliação</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{plano.avaliacoes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
