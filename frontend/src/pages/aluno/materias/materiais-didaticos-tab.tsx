"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { FileText, Download, Calendar, File, Presentation, Sheet } from "lucide-react"

interface Material {
  id: string
  nome: string
  tipo: "PDF" | "Slides" | "Planilha" | "Documento"
  dataUpload: string
  tamanho: string
  descricao?: string
}

const materiais: Material[] = [
  {
    id: "1",
    nome: "Slides - Introdução à IA",
    tipo: "Slides",
    dataUpload: "05/03/2025",
    tamanho: "2.4 MB",
    descricao: "Apresentação da primeira aula",
  },
  {
    id: "2",
    nome: "Apostila - Fundamentos de IA",
    tipo: "PDF",
    dataUpload: "05/03/2025",
    tamanho: "8.7 MB",
    descricao: "Material completo sobre fundamentos",
  },
  {
    id: "3",
    nome: "Lista de Exercícios 1",
    tipo: "PDF",
    dataUpload: "12/03/2025",
    tamanho: "1.2 MB",
    descricao: "Exercícios sobre agentes inteligentes",
  },
  {
    id: "4",
    nome: "Slides - Algoritmos de Busca",
    tipo: "Slides",
    dataUpload: "19/03/2025",
    tamanho: "3.1 MB",
  },
  {
    id: "5",
    nome: "Código Exemplo - Busca A*",
    tipo: "Documento",
    dataUpload: "26/03/2025",
    tamanho: "45 KB",
    descricao: "Implementação em Python",
  },
  {
    id: "6",
    nome: "Dataset - Classificação",
    tipo: "Planilha",
    dataUpload: "02/04/2025",
    tamanho: "512 KB",
    descricao: "Dados para exercícios de ML",
  },
  {
    id: "7",
    nome: "Slides - Redes Neurais",
    tipo: "Slides",
    dataUpload: "09/04/2025",
    tamanho: "4.2 MB",
  },
  {
    id: "8",
    nome: "Artigo - Deep Learning Review",
    tipo: "PDF",
    dataUpload: "16/04/2025",
    tamanho: "1.8 MB",
    descricao: "Leitura complementar obrigatória",
  },
]

const getIconForType = (tipo: Material["tipo"]) => {
  switch (tipo) {
    case "PDF":
      return <FileText className="h-5 w-5" />
    case "Slides":
      return <Presentation className="h-5 w-5" />
    case "Planilha":
      return <Sheet className="h-5 w-5" />
    case "Documento":
      return <File className="h-5 w-5" />
  }
}

const getColorForType = (tipo: Material["tipo"]) => {
  switch (tipo) {
    case "PDF":
      return "text-red-500"
    case "Slides":
      return "text-orange-500"
    case "Planilha":
      return "text-green-500"
    case "Documento":
      return "text-blue-500"
  }
}

export function MateriaisDidaticosTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Materiais Didáticos</h2>
        <p className="text-sm text-muted-foreground">Acesse todos os materiais disponibilizados pelo professor</p>
      </div>

      {/* Materials Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materiais.map((material) => (
          <Card key={material.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${getColorForType(material.tipo)}`}>{getIconForType(material.tipo)}</div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-sm leading-tight">{material.nome}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {material.tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{material.tamanho}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-4">
              {material.descricao && (
                <p className="text-sm leading-relaxed text-muted-foreground">{material.descricao}</p>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Enviado em {material.dataUpload}</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Baixar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
