"use client"

import { Card } from "../../gestor/components/ui/card"
import { Button } from "../../gestor/components/ui/button"
import { ClipboardList, Calendar, Clock, AlertCircle, ChevronRight } from "lucide-react"

interface Atividade {
  id: number
  titulo: string
  disciplina: string
  dataEntrega: string
  tipo: "prova" | "trabalho" | "exercicio" | "projeto"
  status: "pendente" | "em_andamento" | "entregue"
}

interface ProximasAtividadesProps {
  data: Atividade[]
}

const tipoStyles: Record<string, { bg: string; text: string; label: string }> = {
  prova: { bg: "bg-red-100", text: "text-red-700", label: "Prova" },
  trabalho: { bg: "bg-blue-100", text: "text-blue-700", label: "Trabalho" },
  exercicio: { bg: "bg-green-100", text: "text-green-700", label: "Exercício" },
  projeto: { bg: "bg-purple-100", text: "text-purple-700", label: "Projeto" },
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  pendente: { bg: "bg-amber-100", text: "text-amber-700", label: "Pendente" },
  em_andamento: { bg: "bg-blue-100", text: "text-blue-700", label: "Em Andamento" },
  entregue: { bg: "bg-green-100", text: "text-green-700", label: "Entregue" },
}

export function ProximasAtividades({ data }: ProximasAtividadesProps) {
  const safeData = Array.isArray(data) ? data : []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return "Atrasado"
    if (days === 0) return "Hoje"
    if (days === 1) return "Amanhã"
    if (days <= 7) return `Em ${days} dias`
    return date.toLocaleDateString("pt-BR")
  }

  const isUrgent = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days <= 2
  }

  return (
    <Card className="p-5 shadow-lg border-gray-200 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#363776] flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Próximas Atividades
        </h3>
        <span className="text-xs bg-[#363776] text-white px-2 py-1 rounded-full font-semibold">
          {safeData.filter((a) => a.status !== "entregue").length} pendentes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {safeData.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Nenhuma atividade pendente</p>
          </div>
        ) : (
          safeData.map((atividade) => {
            const tipoStyle = tipoStyles[atividade.tipo] || tipoStyles.exercicio
            const statusStyle = statusStyles[atividade.status] || statusStyles.pendente
            const urgent = isUrgent(atividade.dataEntrega) && atividade.status !== "entregue"

            return (
              <div
                key={atividade.id}
                className={`p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 transition-all hover:shadow-lg cursor-pointer group ${
                  urgent ? "border-red-200 bg-red-50/30" : "border-gray-100 hover:border-[#363776]/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${tipoStyle.bg} flex-shrink-0`}>
                    <Calendar className={`h-4 w-4 ${tipoStyle.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${tipoStyle.bg} ${tipoStyle.text} font-semibold`}
                      >
                        {tipoStyle.label}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text} font-semibold`}
                      >
                        {statusStyle.label}
                      </span>
                      {urgent && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>

                    <h4 className="font-bold text-sm text-foreground mb-1 group-hover:text-[#363776] transition-colors">
                      {atividade.titulo}
                    </h4>

                    <p className="text-xs text-muted-foreground mb-2">{atividade.disciplina}</p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className={urgent ? "text-red-600 font-semibold" : ""}>
                        {formatDate(atividade.dataEntrega)}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#363776] transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full hover:bg-[#363776] hover:text-white transition-colors font-semibold text-xs bg-transparent"
        >
          Ver todas as atividades
        </Button>
      </div>
    </Card>
  )
}
