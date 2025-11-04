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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, Edit, Trash2, FileText } from "lucide-react"

interface Avaliacao {
  id: number
  titulo: string
  descricao: string
  peso: number
  data: string
  turma: string
  arquivo?: string
}

interface Nota {
  id: number
  avaliacaoId: number
  aluno: string
  nota: number
}

export default function NotasAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [notas, setNotas] = useState<Nota[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAvaliacao, setEditingAvaliacao] = useState<Avaliacao | null>(null)
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    peso: "",
    data: "",
    turma: "",
    arquivo: "",
  })

  useEffect(() => {
    fetchMockData()
  }, [])

  const fetchMockData = async () => {
    const mockAvaliacoes: Avaliacao[] = [
      {
        id: 1,
        titulo: "Prova 1 - Cálculo",
        descricao: "Avaliação sobre derivadas",
        peso: 3,
        data: "2024-03-15",
        turma: "Turma A",
      },
      {
        id: 2,
        titulo: "Trabalho em Grupo",
        descricao: "Projeto de pesquisa",
        peso: 2,
        data: "2024-04-10",
        turma: "Turma A",
      },
      { id: 3, titulo: "Prova Final", descricao: "Avaliação completa", peso: 5, data: "2024-06-20", turma: "Turma B" },
    ]
    setAvaliacoes(mockAvaliacoes)

    const mockNotas: Nota[] = [
      { id: 1, avaliacaoId: 1, aluno: "João Silva", nota: 8.5 },
      { id: 2, avaliacaoId: 1, aluno: "Maria Santos", nota: 9.0 },
      { id: 3, avaliacaoId: 1, aluno: "Pedro Costa", nota: 7.5 },
      { id: 4, avaliacaoId: 2, aluno: "João Silva", nota: 9.5 },
      { id: 5, avaliacaoId: 2, aluno: "Maria Santos", nota: 8.0 },
    ]
    setNotas(mockNotas)
  }

  const handleCreate = () => {
    const newAvaliacao: Avaliacao = {
      id: Date.now(),
      titulo: formData.titulo,
      descricao: formData.descricao,
      peso: Number(formData.peso),
      data: formData.data,
      turma: formData.turma,
      arquivo: formData.arquivo,
    }
    setAvaliacoes([...avaliacoes, newAvaliacao])
    resetForm()
  }

  const handleEdit = () => {
    if (editingAvaliacao) {
      setAvaliacoes(
        avaliacoes.map((av) =>
          av.id === editingAvaliacao.id ? { ...av, ...formData, peso: Number(formData.peso) } : av,
        ),
      )
      resetForm()
    }
  }

  const handleDelete = (id: number) => {
    setAvaliacoes(avaliacoes.filter((av) => av.id !== id))
  }

  const openEditDialog = (avaliacao: Avaliacao) => {
    setEditingAvaliacao(avaliacao)
    setFormData({
      titulo: avaliacao.titulo,
      descricao: avaliacao.descricao,
      peso: avaliacao.peso.toString(),
      data: avaliacao.data,
      turma: avaliacao.turma,
      arquivo: avaliacao.arquivo || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ titulo: "", descricao: "", peso: "", data: "", turma: "", arquivo: "" })
    setEditingAvaliacao(null)
    setIsDialogOpen(false)
  }

  const getNotasDistribution = () => {
    if (!selectedAvaliacao) return []
    const avaliacaoNotas = notas.filter((n) => n.avaliacaoId === selectedAvaliacao)
    const distribution = [
      { faixa: "0-4", quantidade: avaliacaoNotas.filter((n) => n.nota < 5).length },
      { faixa: "5-6", quantidade: avaliacaoNotas.filter((n) => n.nota >= 5 && n.nota < 7).length },
      { faixa: "7-8", quantidade: avaliacaoNotas.filter((n) => n.nota >= 7 && n.nota < 9).length },
      { faixa: "9-10", quantidade: avaliacaoNotas.filter((n) => n.nota >= 9).length },
    ]
    return distribution
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho: flex-wrap para mobile, sem wrap para desktop */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        <div>
          {/* Fontes responsivas */}
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Notas e Avaliações</h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gerencie avaliações e lançamento de notas</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {/* Botão com largura total em mobile, automática em desktop */}
            <Button onClick={() => setEditingAvaliacao(null)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAvaliacao ? "Editar Avaliação" : "Nova Avaliação"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ex: Prova 1 - Cálculo" />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Descreva o conteúdo da avaliação" />
              </div>
              {/* Grid do formulário: 1 coluna em mobile, 2 em desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="peso">Peso</Label>
                  <Input id="peso" type="number" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} placeholder="Ex: 3" />
                </div>
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input id="data" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="turma">Turma</Label>
                <Select value={formData.turma} onValueChange={(value) => setFormData({ ...formData, turma: value })}>
                  <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Turma A">Turma A</SelectItem>
                    <SelectItem value="Turma B">Turma B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="arquivo">Arquivo (opcional)</Label>
                <Input id="arquivo" type="file" onChange={(e) => setFormData({ ...formData, arquivo: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={editingAvaliacao ? handleEdit : handleCreate}>{editingAvaliacao ? "Salvar" : "Criar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Avaliações */}
      <Card className="shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Avaliações Cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 md:px-6">Título</TableHead>
                  <TableHead className="px-4 md:px-6 hidden sm:table-cell">Descrição</TableHead>
                  <TableHead className="px-4 md:px-6 text-center">Peso</TableHead>
                  <TableHead className="px-4 md:px-6 text-center hidden md:table-cell">Data</TableHead>
                  <TableHead className="px-4 md:px-6">Turma</TableHead>
                  <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.map((avaliacao) => (
                  <TableRow key={avaliacao.id} className={selectedAvaliacao === avaliacao.id ? "bg-muted/50" : ""}>
                    <TableCell className="px-4 md:px-6 py-3 font-medium">{avaliacao.titulo}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 hidden sm:table-cell max-w-xs truncate">{avaliacao.descricao}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-center">{avaliacao.peso}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-center hidden md:table-cell">{new Date(avaliacao.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3">{avaliacao.turma}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-right">
                      <div className="flex justify-end gap-1 md:gap-2">
                        {/* Botões responsivos: ícone em mobile, normal em desktop */}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAvaliacao(avaliacao.id === selectedAvaliacao ? null : avaliacao.id)}>
                          <FileText className="h-4 w-4" />
                          <span className="hidden lg:inline ml-2">Ver Notas</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(avaliacao)}>
                          <Edit className="h-4 w-4" />
                          <span className="hidden lg:inline ml-2">Editar</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(avaliacao.id)}>
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

      {/* Seção de Notas */}
      {selectedAvaliacao && (
        <div className="space-y-4 md:space-y-6 animate-in fade-in-50">
          <Card className="shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Notas - {avaliacoes.find((a) => a.id === selectedAvaliacao)?.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 md:px-6">Aluno</TableHead>
                      <TableHead className="px-4 md:px-6 text-center">Nota</TableHead>
                      <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notas.filter((n) => n.avaliacaoId === selectedAvaliacao).map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell className="px-4 md:px-6 py-3 font-medium">{nota.aluno}</TableCell>
                        <TableCell className="px-4 md:px-6 py-3 text-center font-semibold">{nota.nota.toFixed(1)}</TableCell>
                        <TableCell className="px-4 md:px-6 py-3 text-right">
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Distribuição de Notas</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getNotasDistribution()} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixa" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade de Alunos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}