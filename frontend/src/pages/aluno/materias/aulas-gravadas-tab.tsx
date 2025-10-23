"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Play, Clock, Calendar, ExternalLink, CheckCircle2, Circle } from "lucide-react"

interface AulaGravada {
  id: string
  titulo: string
  data: string
  duracao: string
  link: string
  assistida: boolean
  descricao?: string
}

const aulasGravadas: AulaGravada[] = [
  {
    id: "1",
    titulo: "Introdução à Inteligência Artificial",
    data: "05/03/2025",
    duracao: "1h 45min",
    link: "https://youtube.com/watch?v=example1",
    assistida: true,
    descricao: "Conceitos fundamentais, história e aplicações da IA",
  },
  {
    id: "2",
    titulo: "Agentes Inteligentes e Ambientes",
    data: "12/03/2025",
    duracao: "2h 10min",
    link: "https://youtube.com/watch?v=example2",
    assistida: true,
    descricao: "Tipos de agentes, racionalidade e estrutura de ambientes",
  },
  {
    id: "3",
    titulo: "Algoritmos de Busca - Parte 1",
    data: "19/03/2025",
    duracao: "1h 55min",
    link: "https://youtube.com/watch?v=example3",
    assistida: true,
    descricao: "Busca não informada: BFS, DFS, UCS",
  },
  {
    id: "4",
    titulo: "Algoritmos de Busca - Parte 2",
    data: "26/03/2025",
    duracao: "2h 00min",
    link: "https://youtube.com/watch?v=example4",
    assistida: false,
    descricao: "Busca informada: A*, heurísticas e otimizações",
  },
  {
    id: "5",
    titulo: "Introdução ao Machine Learning",
    data: "02/04/2025",
    duracao: "2h 15min",
    link: "https://youtube.com/watch?v=example5",
    assistida: false,
    descricao: "Conceitos básicos, tipos de aprendizado e aplicações",
  },
  {
    id: "6",
    titulo: "Redes Neurais Artificiais",
    data: "09/04/2025",
    duracao: "2h 30min",
    link: "https://youtube.com/watch?v=example6",
    assistida: false,
    descricao: "Perceptron, backpropagation e arquiteturas básicas",
  },
]

export function AulasGravadasTab() {
  const assistidas = aulasGravadas.filter((aula) => aula.assistida).length
  const total = aulasGravadas.length

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Visualização</CardTitle>
          <CardDescription>
            {assistidas} de {total} aulas assistidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-primary transition-all" style={{ width: `${(assistidas / total) * 100}%` }} />
            </div>
            <span className="text-sm font-medium">{Math.round((assistidas / total) * 100)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <div className="space-y-3">
        {aulasGravadas.map((aula) => (
          <Card key={aula.id} className={aula.assistida ? "bg-muted/30" : ""}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {aula.assistida ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">{aula.titulo}</CardTitle>
                      {aula.descricao && <CardDescription className="mt-1.5">{aula.descricao}</CardDescription>}
                    </div>
                    {aula.assistida && (
                      <Badge variant="secondary" className="text-xs">
                        Assistida
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {aula.data}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {aula.duracao}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="border-t pt-4">
              <Button variant="default" size="sm" asChild>
                <a href={aula.link} target="_blank" rel="noopener noreferrer">
                  <Play className="mr-2 h-4 w-4" />
                  Assistir Aula
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
