//file: frontend/src/pages/aluno/curso/calendario-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Badge } from "../../gestor/components/ui/badge"
import { Button } from "../../gestor/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../gestor/components/ui/dialog"
import { Calendar, Clock, MapPin } from "lucide-react"

interface Evento {
  id: string
  titulo: string
  data: string
  tipo: "inicio" | "termino" | "prazo" | "defesa" | "banca" | "feriado"
  descricao: string
  local?: string
  horario?: string
}

// Mock data
const eventos: Evento[] = [
  {
    id: "1",
    titulo: "Início do Semestre 2024.2",
    data: "2024-08-01",
    tipo: "inicio",
    descricao: "Início das aulas do segundo semestre de 2024",
    local: "Campus Principal",
  },
  {
    id: "2",
    titulo: "Prazo para Matrícula",
    data: "2024-08-15",
    tipo: "prazo",
    descricao: "Último dia para realizar matrícula em disciplinas",
  },
  {
    id: "3",
    titulo: "Defesa de Mestrado - João Silva",
    data: "2024-09-10",
    tipo: "defesa",
    descricao: "Defesa de dissertação de mestrado",
    local: "Auditório Principal",
    horario: "14:00",
  },
  {
    id: "4",
    titulo: "Banca de Qualificação - Maria Santos",
    data: "2024-09-20",
    tipo: "banca",
    descricao: "Exame de qualificação de doutorado",
    local: "Sala de Reuniões 201",
    horario: "10:00",
  },
  {
    id: "5",
    titulo: "Feriado Nacional",
    data: "2024-10-12",
    tipo: "feriado",
    descricao: "Dia de Nossa Senhora Aparecida - Não haverá aulas",
  },
  {
    id: "6",
    titulo: "Prazo para Entrega de Relatórios",
    data: "2024-10-31",
    tipo: "prazo",
    descricao: "Último dia para entrega de relatórios semestrais",
  },
  {
    id: "7",
    titulo: "Semana de Defesas",
    data: "2024-11-15",
    tipo: "defesa",
    descricao: "Semana dedicada às defesas de mestrado e doutorado",
    local: "Diversos auditórios",
  },
  {
    id: "8",
    titulo: "Término do Semestre 2024.2",
    data: "2024-12-15",
    tipo: "termino",
    descricao: "Encerramento das atividades do segundo semestre",
  },
]

const getTipoBadge = (tipo: Evento["tipo"]) => {
  switch (tipo) {
    case "inicio":
      return (
        <Badge variant="default" className="bg-academic text-academic-foreground">
          Início
        </Badge>
      )
    case "termino":
      return (
        <Badge variant="default" className="bg-muted text-muted-foreground">
          Término
        </Badge>
      )
    case "prazo":
      return (
        <Badge variant="default" className="bg-warning text-warning-foreground">
          Prazo
        </Badge>
      )
    case "defesa":
      return <Badge variant="default">Defesa</Badge>
    case "banca":
      return <Badge variant="outline">Banca</Badge>
    case "feriado":
      return <Badge variant="secondary">Feriado</Badge>
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString + "T00:00:00")
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

const groupEventsByMonth = (eventos: Evento[]) => {
  const grouped: { [key: string]: Evento[] } = {}

  eventos.forEach((evento) => {
    const date = new Date(evento.data + "T00:00:00")
    const monthYear = date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })

    if (!grouped[monthYear]) {
      grouped[monthYear] = []
    }
    grouped[monthYear].push(evento)
  })

  return grouped
}

export function CalendarioTab() {
  const groupedEvents = groupEventsByMonth(eventos)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendário Acadêmico 2024.2</CardTitle>
          <CardDescription>Eventos importantes do semestre</CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(groupedEvents).map(([month, events]) => (
        <Card key={month}>
          <CardHeader>
            <CardTitle className="text-xl capitalize">{month}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((evento) => (
                <Dialog key={evento.id}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="h-auto w-full justify-start p-4 text-left hover:bg-muted/50">
                      <div className="flex w-full items-start gap-4">
                        <div className="flex flex-col items-center">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span className="mt-1 text-xs text-muted-foreground">
                            {new Date(evento.data + "T00:00:00").getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-semibold">{evento.titulo}</h4>
                            {getTipoBadge(evento.tipo)}
                          </div>
                          <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                          {evento.horario && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{evento.horario}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{evento.titulo}</DialogTitle>
                      <DialogDescription>{formatDate(evento.data)}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-semibold">Descrição</h4>
                        <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                      </div>
                      {evento.horario && (
                        <div>
                          <h4 className="mb-2 font-semibold">Horário</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{evento.horario}</span>
                          </div>
                        </div>
                      )}
                      {evento.local && (
                        <div>
                          <h4 className="mb-2 font-semibold">Local</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{evento.local}</span>
                          </div>
                        </div>
                      )}
                      <div className="pt-2">{getTipoBadge(evento.tipo)}</div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
