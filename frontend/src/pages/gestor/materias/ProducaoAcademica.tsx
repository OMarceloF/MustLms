// frontend/src/pages/gestor/materias/NotasAvaliacoes.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { Search, FileCheck } from "lucide-react"

interface Producao {
  id: number
  aluno: string
  titulo: string
  data: string
  status: "Pendente" | "Corrigido"
  nota?: number
  feedback?: string
}

export default function ProducaoAcademica() {
  const [producoes, setProducoes] = useState<Producao[]>([])
  const [filteredProducoes, setFilteredProducoes] = useState<Producao[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProducao, setSelectedProducao] = useState<Producao | null>(null)
  const [correcaoData, setCorrecaoData] = useState({ nota: "", feedback: "" })

  useEffect(() => {
    fetchMockData()
  }, [])

  useEffect(() => {
    const filtered = producoes.filter(
      (p) =>
        p.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.titulo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProducoes(filtered)
  }, [searchTerm, producoes])

  const fetchMockData = async () => {
    const mockProducoes: Producao[] = [
      { id: 1, aluno: "João Silva", titulo: "Trabalho sobre Integrais", data: "2024-03-10", status: "Pendente" },
      {
        id: 2,
        aluno: "Maria Santos",
        titulo: "Projeto de Física Aplicada",
        data: "2024-03-12",
        status: "Corrigido",
        nota: 9.0,
        feedback: "Excelente trabalho!",
      },
      { id: 3, aluno: "Pedro Costa", titulo: "Análise de Algoritmos", data: "2024-03-15", status: "Pendente" },
      {
        id: 4,
        aluno: "Ana Oliveira",
        titulo: "Estudo de Caso - Marketing",
        data: "2024-03-18",
        status: "Corrigido",
        nota: 8.5,
        feedback: "Bom desenvolvimento",
      },
      { id: 5, aluno: "Carlos Mendes", titulo: "Relatório de Estágio", data: "2024-03-20", status: "Pendente" },
    ]
    setProducoes(mockProducoes)
    setFilteredProducoes(mockProducoes)
  }

  const openCorrecaoDialog = (producao: Producao) => {
    setSelectedProducao(producao)
    setCorrecaoData({
      nota: producao.nota?.toString() || "",
      feedback: producao.feedback || "",
    })
    setIsDialogOpen(true)
  }

  const handleCorrigir = () => {
    if (selectedProducao) {
      setProducoes(
        producoes.map((p) =>
          p.id === selectedProducao.id
            ? { ...p, status: "Corrigido" as const, nota: Number(correcaoData.nota), feedback: correcaoData.feedback }
            : p,
        ),
      )
      setIsDialogOpen(false)
      setSelectedProducao(null)
      setCorrecaoData({ nota: "", feedback: "" })
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Produção Acadêmica</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Visualize e corrija trabalhos dos alunos</p>
      </div>

      {/* Card de Busca */}
      <Card className="shadow-md rounded-2xl">
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por aluno ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produções */}
      <Card className="shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Trabalhos Submetidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 md:px-6">Aluno</TableHead>
                  <TableHead className="px-4 md:px-6 hidden md:table-cell">Título</TableHead>
                  <TableHead className="px-4 md:px-6 text-center hidden sm:table-cell">Data</TableHead>
                  <TableHead className="px-4 md:px-6 text-center">Status</TableHead>
                  <TableHead className="px-4 md:px-6 text-center">Nota</TableHead>
                  <TableHead className="px-4 md:px-6 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducoes.map((producao) => (
                  <TableRow key={producao.id}>
                    <TableCell className="px-4 md:px-6 py-3 font-medium">{producao.aluno}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 hidden md:table-cell max-w-sm truncate">{producao.titulo}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-center hidden sm:table-cell">{new Date(producao.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-center">
                      <Badge variant={producao.status === "Corrigido" ? "default" : "secondary"}>{producao.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-center font-semibold">
                      {producao.nota ? producao.nota.toFixed(1) : "-"}
                    </TableCell>
                    <TableCell className="px-4 md:px-6 py-3 text-right">
                      {/* Botão responsivo: ícone em mobile, texto em desktop */}
                      <Button variant="outline" size="sm" onClick={() => openCorrecaoDialog(producao)} className="gap-2">
                        <FileCheck className="h-4 w-4" />
                        <span className="hidden sm:inline">{producao.status === "Pendente" ? "Corrigir" : "Ver"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Correção */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProducao?.status === "Pendente" ? "Corrigir Trabalho" : "Visualizar Correção"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Aluno</p>
              <p className="font-semibold">{selectedProducao?.aluno}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Título</p>
              <p className="font-semibold">{selectedProducao?.titulo}</p>
            </div>
            <div>
              <Label htmlFor="nota">Nota (0-10)</Label>
              <Input
                id="nota"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={correcaoData.nota}
                onChange={(e) => setCorrecaoData({ ...correcaoData, nota: e.target.value })}
                disabled={selectedProducao?.status === "Corrigido"}
              />
            </div>
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={correcaoData.feedback}
                onChange={(e) => setCorrecaoData({ ...correcaoData, feedback: e.target.value })}
                placeholder="Escreva suas observações sobre o trabalho..."
                rows={4}
                disabled={selectedProducao?.status === "Corrigido"}
              />
            </div>
            {selectedProducao?.status === "Pendente" && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCorrigir}>Salvar Correção</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}