"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Bell, Calendar, CheckCircle2, Circle } from "lucide-react"

interface Aviso {
  id: string
  titulo: string
  conteudo: string
  data: string
  lido: boolean
  importante: boolean
}

const avisosIniciais: Aviso[] = [
  {
    id: "1",
    titulo: "Prorrogação de Prazo - Trabalho 2",
    conteudo:
      "O prazo para entrega do Trabalho 2 (Implementação de Agentes) foi prorrogado até o dia 25/04/2025. Aproveitem o tempo extra para aprimorar suas implementações e documentação.",
    data: "18/04/2025",
    lido: false,
    importante: true,
  },
  {
    id: "2",
    titulo: "Material Complementar Disponível",
    conteudo:
      "Foi disponibilizado na aba de Materiais Didáticos um artigo de revisão sobre Deep Learning. A leitura é obrigatória para a próxima aula.",
    data: "16/04/2025",
    lido: false,
    importante: false,
  },
  {
    id: "3",
    titulo: "Aula Gravada - Redes Neurais",
    conteudo:
      "A gravação da última aula sobre Redes Neurais Artificiais já está disponível na aba de Aulas Gravadas. Recomendo revisarem o conteúdo antes da próxima aula.",
    data: "10/04/2025",
    lido: true,
    importante: false,
  },
  {
    id: "4",
    titulo: "Seminários - Definição de Temas",
    conteudo:
      "Os temas para os seminários devem ser definidos até o dia 20/04/2025. Enviem suas propostas por email com título, resumo e bibliografia inicial.",
    data: "05/04/2025",
    lido: true,
    importante: true,
  },
  {
    id: "5",
    titulo: "Horário de Atendimento",
    conteudo:
      "Estarei disponível para atendimento todas as quartas-feiras das 14h às 16h na sala 305. Podem também agendar horários alternativos por email.",
    data: "01/04/2025",
    lido: true,
    importante: false,
  },
]

export function AvisosTab() {
  const [avisos, setAvisos] = useState<Aviso[]>(avisosIniciais)

  const toggleLido = (id: string) => {
    setAvisos((prev) => prev.map((aviso) => (aviso.id === id ? { ...aviso, lido: !aviso.lido } : aviso)))
  }

  const marcarTodosComoLidos = () => {
    setAvisos((prev) => prev.map((aviso) => ({ ...aviso, lido: true })))
  }

  const naoLidos = avisos.filter((aviso) => !aviso.lido).length

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Avisos da Disciplina</h2>
          <p className="text-sm text-muted-foreground">
            {naoLidos > 0
              ? `${naoLidos} aviso${naoLidos > 1 ? "s" : ""} não lido${naoLidos > 1 ? "s" : ""}`
              : "Todos os avisos foram lidos"}
          </p>
        </div>
        {naoLidos > 0 && (
          <Button variant="outline" onClick={marcarTodosComoLidos}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar Todos como Lidos
          </Button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {avisos.map((aviso) => (
          <Card
            key={aviso.id}
            className={`transition-colors ${!aviso.lido ? "border-primary/50 bg-primary/5" : "bg-muted/30"}`}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleLido(aviso.id)}
                  className="mt-1 transition-colors hover:text-primary"
                  aria-label={aviso.lido ? "Marcar como não lido" : "Marcar como lido"}
                >
                  {aviso.lido ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base leading-tight">{aviso.titulo}</CardTitle>
                    <div className="flex items-center gap-2">
                      {aviso.importante && (
                        <Badge variant="destructive" className="text-xs">
                          Importante
                        </Badge>
                      )}
                      {!aviso.lido && (
                        <Badge variant="default" className="text-xs">
                          Novo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{aviso.data}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="border-t pt-4">
              <p className="text-sm leading-relaxed text-foreground">{aviso.conteudo}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {avisos.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">Nenhum aviso disponível no momento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
    