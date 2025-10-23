"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../gestor/components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../../gestor/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Plus, FileText, Download, Calendar } from "lucide-react"

interface Producao {
  id: string
  titulo: string
  tipo: string
  descricao: string
  autor: string
  data: string
  arquivo?: string
}

const producoesIniciais: Producao[] = [
  {
    id: "1",
    titulo: "Análise Comparativa de Algoritmos de Aprendizado Profundo",
    tipo: "Artigo",
    descricao: "Estudo comparativo entre diferentes arquiteturas de redes neurais para classificação de imagens.",
    autor: "Ana Paula Santos",
    data: "10/04/2025",
    arquivo: "analise-algoritmos-dl.pdf",
  },
  {
    id: "2",
    titulo: "Implementação de Sistema de Recomendação com IA",
    tipo: "Relatório",
    descricao: "Desenvolvimento e avaliação de um sistema de recomendação baseado em filtragem colaborativa.",
    autor: "Ana Paula Santos",
    data: "28/04/2025",
    arquivo: "sistema-recomendacao.pdf",
  },
]

export function ProducaoAcademicaTab() {
  const [producoes, setProducoes] = useState<Producao[]>(producoesIniciais)
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Produções Acadêmicas</h2>
          <p className="text-sm text-muted-foreground">Compartilhe suas produções relacionadas à disciplina</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Produção
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Adicionar Produção Acadêmica</DialogTitle>
              <DialogDescription>
                Preencha os dados da sua produção acadêmica relacionada à disciplina.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" placeholder="Título da produção" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Produção</Label>
                <Select>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="artigo">Artigo</SelectItem>
                    <SelectItem value="resumo">Resumo</SelectItem>
                    <SelectItem value="relatorio">Relatório</SelectItem>
                    <SelectItem value="poster">Pôster</SelectItem>
                    <SelectItem value="apresentacao">Apresentação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Descreva brevemente sua produção" rows={3} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="arquivo">Arquivo (PDF ou Link)</Label>
                <Input id="arquivo" type="file" accept=".pdf" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setOpen(false)}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Productions Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {producoes.map((producao) => (
          <Card key={producao.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base leading-tight">{producao.titulo}</CardTitle>
                  <CardDescription className="mt-1.5">
                    <Badge variant="secondary" className="text-xs">
                      {producao.tipo}
                    </Badge>
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{producao.descricao}</p>
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{producao.data}</span>
                  </div>
                  <div>{producao.autor}</div>
                </div>
                {producao.arquivo && (
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-3 w-3" />
                    Baixar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {producoes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">Nenhuma produção acadêmica cadastrada ainda.</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeira Produção
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
