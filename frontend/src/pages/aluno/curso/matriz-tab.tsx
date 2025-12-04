// frontend/src/pages/aluno/curso/matriz-tab.tsx

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Badge } from "../../gestor/components/ui/badge"
import { Progress } from "../../gestor/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../gestor/components/ui/accordion"
import { CheckCircle2, Circle, Clock, BookOpen, AlertCircle, Star } from "lucide-react"
import { useAuth } from "../../../hooks/useAuth"

interface Disciplina {
  id: string
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  status: "Concluída" | "Cursando" | "Pendente"
  nota?: string | number
  ementa: string
}

export function MatrizCurricularTab() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  const { user } = useAuth() 
  const usuarioId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);

  useEffect(() => {
    const fetchMatriz = async () => {
      if (!usuarioId) return;

      try {
        const apiUrl = 'http://localhost:3001'; 
        const response = await axios.get(`${apiUrl}/api/alunos/${usuarioId}/progresso-matriz`)
        setDisciplinas(response.data)
        setError("")
      } catch (err) {
        console.error("Erro ao buscar matriz curricular:", err)
        setError("Não foi possível carregar as disciplinas.")
      } finally {
        setLoading(false)
      }
    }

    fetchMatriz()
  }, [usuarioId])

  const getStatusIcon = (status: Disciplina["status"]) => {
    switch (status) {
      case "Concluída": return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "Cursando": return <Clock className="h-5 w-5 text-amber-500" />
      default: return <Circle className="h-5 w-5 text-slate-300" />
    }
  }

  const getStatusBadge = (status: Disciplina["status"]) => {
    switch (status) {
      case "Concluída":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">Concluída</Badge>
      case "Cursando":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none">Cursando</Badge>
      case "Pendente":
        return <Badge variant="outline" className="text-slate-500 border-slate-200">Pendente</Badge>
    }
  }

  // Cálculos
  const concluidas = disciplinas.filter((d) => d.status === "Concluída").length
  const total = disciplinas.filter((d) => Number(d.semestre) !== 0).length // Total sem contar optativas na contagem base (opcional) ou remover filtro para contar tudo
  // Se quiser contar optativas no progresso, use: const total = disciplinas.length;
  
  const progressPercentage = total > 0 ? (concluidas / total) * 100 : 0

  // ORDENAÇÃO: Ordenação numérica simples. 0 vem antes de 1.
  const semestresUnicos = Array.from(new Set(disciplinas.map(d => Number(d.semestre))))
    .sort((a, b) => a - b);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando grade curricular...</div>
  if (error) return <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2"><AlertCircle /><p>{error}</p></div>
  if (disciplinas.length === 0) return <div className="p-8 text-center text-slate-500 flex flex-col items-center"><BookOpen className="h-10 w-10 mb-2 opacity-20" /><p>Nenhuma disciplina encontrada.</p></div>

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-slate-800">Progresso da Grade Curricular</CardTitle>
          <CardDescription>{concluidas} disciplinas concluídas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progressPercentage} className="h-3 flex-1 bg-slate-100" />
            <span className="text-sm font-bold text-slate-700 w-12 text-right">{progressPercentage.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      {semestresUnicos.map((semestre) => {
        const disciplinasSemestre = disciplinas.filter((d) => Number(d.semestre) === semestre)
        
        // Formatação especial para Optativas (Semestre 0)
        const isOptativa = semestre === 0;
        const tituloHeader = isOptativa ? "Disciplinas Optativas" : `${semestre}º Período`;
        
        // Optativas (0) terão destaque amarelo, os demais seguem o padrão
        const corHeader = isOptativa ? "bg-amber-50/50 border-amber-100" : "bg-slate-50/50 border-slate-100";
        const iconHeader = isOptativa ? <Star className="h-4 w-4 text-amber-500 mr-2" /> : null;

        return (
          <Card key={semestre} className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className={`py-3 px-4 border-b ${corHeader}`}>
              <CardTitle className="text-base font-semibold text-slate-700 flex items-center">
                {iconHeader} {tituloHeader}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {disciplinasSemestre.map((disciplina) => (
                  <AccordionItem key={disciplina.id} value={disciplina.id} className="border-b last:border-0 px-4">
                    <AccordionTrigger className="hover:no-underline py-4 group">
                      <div className="flex w-full items-center justify-between pr-2 gap-4">
                        <div className="flex items-center gap-3 overflow-hidden text-left">
                          <div className="mt-0.5 shrink-0">{getStatusIcon(disciplina.status)}</div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate">
                              {disciplina.nome}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                {disciplina.codigo}
                              </span>
                              <span>• {disciplina.creditos} créditos</span>
                              <span>• {disciplina.cargaHoraria}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {disciplina.nota && (
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] uppercase text-slate-400 font-bold block">Nota Final</span>
                              <span className="text-sm font-bold text-slate-700">{disciplina.nota}</span>
                            </div>
                          )}
                          {getStatusBadge(disciplina.status)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pb-4 pl-8 text-sm">
                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                          <span className="font-semibold text-slate-700 block mb-1">Ementa:</span>
                          <p className="text-slate-600 leading-relaxed">{disciplina.ementa}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}