// frontend/src/pages/aluno/curso/aulas-gravadas-tab.tsx

"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Button } from "../../gestor/components/ui/button"
import { Badge } from "../../gestor/components/ui/badge"
import { Play, Clock, Calendar, ExternalLink, CheckCircle2, Circle, Video, AlertCircle, Loader2 } from "lucide-react"

interface AulaGravada {
  id: string
  titulo: string
  data: string
  link: string
  descricao?: string
  // Campos calculados/padrão (já que não existem no banco ainda)
  duracao?: string 
  assistida: boolean
}

export function AulasGravadasTab() {
  const { id } = useParams() // Pega o ID da disciplina da URL (/aluno/materias/:id)
  const [aulas, setAulas] = useState<AulaGravada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchAulas = async () => {
      if (!id) return;

      try {
        const apiUrl = 'http://localhost:3001'; // Ajuste conforme a porta do seu backend
        const response = await axios.get(`${apiUrl}/api/disciplinas/${id}/aulas`)
        
        // Mapeia os dados do banco para o formato da interface
        const aulasFormatadas = response.data.map((aula: any) => ({
          id: String(aula.id),
          titulo: aula.titulo,
          // Formata a data para PT-BR
          data: new Date(aula.data).toLocaleDateString('pt-BR'),
          link: aula.link,
          descricao: aula.descricao,
          assistida: false, // Default: o banco ainda não tem controle de visualização
          duracao: "N/A"    // Default: o banco não tem duração
        }))

        setAulas(aulasFormatadas)
        setError("")
      } catch (err) {
        console.error("Erro ao buscar aulas:", err)
        setError("Não foi possível carregar as aulas gravadas.")
      } finally {
        setLoading(false)
      }
    }

    fetchAulas()
  }, [id])

  // Cálculos de progresso (Mockado em 0% até haver backend para isso)
  const assistidas = aulas.filter((aula) => aula.assistida).length
  const total = aulas.length
  const progresso = total > 0 ? (assistidas / total) * 100 : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Carregando aulas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-red-500 gap-2">
        <AlertCircle className="h-8 w-8" />
        <p>{error}</p>
      </div>
    )
  }

  if (aulas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 mt-4">
        <Video className="h-10 w-10 mb-2 opacity-20" />
        <p>Nenhuma aula gravada disponível para esta disciplina.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Card de Progresso */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-800">Progresso de Visualização</CardTitle>
          <CardDescription>
            {assistidas} de {total} aulas assistidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div 
                className="h-full bg-green-600 transition-all duration-500" 
                style={{ width: `${progresso}%` }} 
              />
            </div>
            <span className="text-sm font-bold text-slate-700 w-10 text-right">{Math.round(progresso)}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Aulas */}
      <div className="space-y-4">
        {aulas.map((aula) => (
          <Card key={aula.id} className={`border-slate-200 shadow-sm transition-colors ${aula.assistida ? "bg-slate-50/50" : "hover:border-blue-200"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  {aula.assistida ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-800 leading-tight">
                        {aula.titulo}
                      </CardTitle>
                      {aula.descricao && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {aula.descricao}
                        </p>
                      )}
                    </div>
                    {aula.assistida && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none shrink-0">
                        Assistida
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {aula.data}
                    </span>
                    {/* Exibe duração apenas se disponível */}
                    {aula.duracao !== "N/A" && (
                        <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {aula.duracao}
                        </span>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="border-t border-slate-100 pt-4 bg-slate-50/30">
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white" size="sm" asChild>
                <a href={aula.link} target="_blank" rel="noopener noreferrer">
                  <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                  Assistir Aula
                  <ExternalLink className="ml-2 h-3 w-3 opacity-70" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}