"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../gestor/components/ui/collapsible"
import { ChevronDown, FileText } from "lucide-react"
import { Progress } from "../components/ui/progress"

interface Avaliacao {
  id: string
  nome: string
  tipo: "Prova" | "Trabalho" | "Seminário" | "Projeto"
  peso: number
  data: string
  notaObtida: number
  mediaTurma: number
  comentario?: string
}

const avaliacoes: Avaliacao[] = [
  {
    id: "1",
    nome: "Prova 1 - Fundamentos de IA",
    tipo: "Prova",
    peso: 25,
    data: "15/03/2025",
    notaObtida: 8.5,
    mediaTurma: 7.2,
    comentario: "Ótimo domínio dos conceitos fundamentais. Atenção aos algoritmos de busca.",
  },
  {
    id: "2",
    nome: "Trabalho 1 - Implementação de Agentes",
    tipo: "Trabalho",
    peso: 20,
    data: "05/04/2025",
    notaObtida: 9.0,
    mediaTurma: 7.8,
    comentario: "Excelente implementação e documentação. Código limpo e bem estruturado.",
  },
  {
    id: "3",
    nome: "Prova 2 - Machine Learning",
    tipo: "Prova",
    peso: 25,
    data: "10/05/2025",
    notaObtida: 8.8,
    mediaTurma: 7.5,
    comentario: "Bom desempenho. Revisar conceitos de redes neurais profundas.",
  },
  {
    id: "4",
    nome: "Seminário - Aplicações de IA",
    tipo: "Seminário",
    peso: 15,
    data: "25/05/2025",
    notaObtida: 9.2,
    mediaTurma: 8.0,
    comentario: "Apresentação clara e bem fundamentada. Excelente domínio do tema.",
  },
  {
    id: "5",
    nome: "Projeto Final",
    tipo: "Projeto",
    peso: 15,
    data: "20/06/2025",
    notaObtida: 0,
    mediaTurma: 0,
  },
]

export function NotasAvaliacoesTab() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const notaFinal = avaliacoes.reduce((acc, av) => {
    if (av.notaObtida > 0) {
      return acc + (av.notaObtida * av.peso) / 100
    }
    return acc
  }, 0)

  const pesoTotal = avaliacoes.reduce((acc, av) => {
    if (av.notaObtida > 0) {
      return acc + av.peso
    }
    return acc
  }, 0)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Avaliações</CardTitle>
          <CardDescription>Nota parcial calculada com base nas avaliações realizadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nota Parcial</span>
            <span className="text-2xl font-bold">{notaFinal.toFixed(2)}</span>
          </div>
          <Progress value={(notaFinal / 10) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {pesoTotal}% do total avaliado • {100 - pesoTotal}% restante
          </p>
        </CardContent>
      </Card>

      {/* Evaluations List */}
      <div className="space-y-3">
        {avaliacoes.map((avaliacao) => (
          <Collapsible
            key={avaliacao.id}
            open={openItems.includes(avaliacao.id)}
            onOpenChange={() => toggleItem(avaliacao.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">{avaliacao.nome}</CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{avaliacao.tipo}</Badge>
                        <span>•</span>
                        <span>Peso: {avaliacao.peso}%</span>
                        <span>•</span>
                        <span>{avaliacao.data}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {avaliacao.notaObtida > 0 ? (
                        <div className="text-right">
                          <div className="text-2xl font-bold">{avaliacao.notaObtida.toFixed(1)}</div>
                          <div className="text-xs text-muted-foreground">Média: {avaliacao.mediaTurma.toFixed(1)}</div>
                        </div>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                      <ChevronDown
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          openItems.includes(avaliacao.id) ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              {avaliacao.comentario && (
                <CollapsibleContent>
                  <CardContent className="border-t pt-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Comentário do Professor</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{avaliacao.comentario}</p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              )}
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
