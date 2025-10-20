//file: frontend/src/pages/aluno/curso/evolucao-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Badge } from "../../gestor/components/ui/badge"
import { Progress } from "../../gestor/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../gestor/components/ui/accordion"
import { CheckCircle2, Circle, Clock } from "lucide-react"

interface Disciplina {
  id: string
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  status: "Concluída" | "Cursando" | "Pendente"
  nota?: number
  ementa: string
}

// Mock data
const disciplinas: Disciplina[] = [
  {
    id: "1",
    nome: "Metodologia de Pesquisa Científica",
    codigo: "POS-001",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 1,
    status: "Concluída",
    nota: 9.5,
    ementa:
      "Introdução aos métodos de pesquisa científica. Elaboração de projetos de pesquisa. Normas ABNT. Ética em pesquisa.",
  },
  {
    id: "2",
    nome: "Estatística Aplicada",
    codigo: "POS-002",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 1,
    status: "Concluída",
    nota: 8.8,
    ementa:
      "Estatística descritiva e inferencial. Testes de hipóteses. Análise de variância. Regressão linear e múltipla.",
  },
  {
    id: "3",
    nome: "Seminários de Pesquisa I",
    codigo: "POS-003",
    creditos: 2,
    cargaHoraria: 30,
    semestre: 1,
    status: "Concluída",
    nota: 9.0,
    ementa: "Apresentação e discussão de projetos de pesquisa dos alunos. Análise crítica de trabalhos científicos.",
  },
  {
    id: "4",
    nome: "Tópicos Avançados em Computação",
    codigo: "POS-004",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 2,
    status: "Concluída",
    nota: 9.2,
    ementa: "Tendências atuais em computação. Inteligência artificial. Machine learning. Cloud computing.",
  },
  {
    id: "5",
    nome: "Análise de Algoritmos",
    codigo: "POS-005",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 2,
    status: "Cursando",
    ementa: "Complexidade computacional. Análise assintótica. Algoritmos de ordenação e busca. Programação dinâmica.",
  },
  {
    id: "6",
    nome: "Sistemas Distribuídos",
    codigo: "POS-006",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 2,
    status: "Cursando",
    ementa: "Arquiteturas distribuídas. Comunicação entre processos. Sincronização. Tolerância a falhas.",
  },
  {
    id: "7",
    nome: "Banco de Dados Avançado",
    codigo: "POS-007",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 3,
    status: "Pendente",
    ementa: "Modelagem avançada. Otimização de consultas. Bancos de dados NoSQL. Big Data.",
  },
  {
    id: "8",
    nome: "Engenharia de Software",
    codigo: "POS-008",
    creditos: 4,
    cargaHoraria: 60,
    semestre: 3,
    status: "Pendente",
    ementa: "Processos de desenvolvimento. Arquitetura de software. Padrões de projeto. Testes de software.",
  },
]

const getStatusIcon = (status: Disciplina["status"]) => {
  switch (status) {
    case "Concluída":
      return <CheckCircle2 className="h-5 w-5 text-academic" />
    case "Cursando":
      return <Clock className="h-5 w-5 text-warning" />
    case "Pendente":
      return <Circle className="h-5 w-5 text-muted-foreground" />
  }
}

const getStatusBadge = (status: Disciplina["status"]) => {
  switch (status) {
    case "Concluída":
      return (
        <Badge variant="default" className="bg-academic text-academic-foreground">
          Concluída
        </Badge>
      )
    case "Cursando":
      return (
        <Badge variant="default" className="bg-warning text-warning-foreground">
          Cursando
        </Badge>
      )
    case "Pendente":
      return <Badge variant="outline">Pendente</Badge>
  }
}

export function MatrizCurricularTab() {
  const concluidas = disciplinas.filter((d) => d.status === "Concluída").length
  const total = disciplinas.length
  const progressPercentage = (concluidas / total) * 100

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso da Matriz Curricular</CardTitle>
          <CardDescription>
            {concluidas} de {total} disciplinas concluídas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <p className="mt-2 text-sm text-muted-foreground">{progressPercentage.toFixed(0)}% completo</p>
        </CardContent>
      </Card>

      {/* Disciplines by Semester */}
      {[1, 2, 3].map((semestre) => {
        const disciplinasSemestre = disciplinas.filter((d) => d.semestre === semestre)
        if (disciplinasSemestre.length === 0) return null

        return (
          <Card key={semestre}>
            <CardHeader>
              <CardTitle>{semestre}º Semestre</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {disciplinasSemestre.map((disciplina) => (
                  <AccordionItem key={disciplina.id} value={disciplina.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(disciplina.status)}
                          <div className="text-left">
                            <p className="font-semibold">{disciplina.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {disciplina.codigo} • {disciplina.creditos} créditos • {disciplina.cargaHoraria}h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {disciplina.nota && (
                            <span className="text-sm font-semibold text-academic">Nota: {disciplina.nota}</span>
                          )}
                          {getStatusBadge(disciplina.status)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <h4 className="mb-2 font-semibold">Ementa:</h4>
                        <p className="text-sm leading-relaxed text-muted-foreground">{disciplina.ementa}</p>
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
