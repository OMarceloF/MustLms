//file: frontend/src/pages/aluno/curso/professores-tab.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Button } from "../../gestor/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../gestor/components/ui/tabs"
import { Avatar, AvatarFallback } from "../../gestor/components/ui/avatar"
import { Mail, Users } from "lucide-react"

interface Professor {
  id: string
  nome: string
  disciplina: string
  email: string
  iniciais: string
}

interface Turma {
  id: string
  nome: string
  turno: string
  semestre: string
  orientador: string
  numeroAlunos: number
}

// Mock data
const professores: Professor[] = [
  {
    id: "1",
    nome: "Dr. Carlos Silva",
    disciplina: "Análise de Algoritmos",
    email: "carlos.silva@universidade.edu.br",
    iniciais: "CS",
  },
  {
    id: "2",
    nome: "Dra. Maria Santos",
    disciplina: "Sistemas Distribuídos",
    email: "maria.santos@universidade.edu.br",
    iniciais: "MS",
  },
  {
    id: "3",
    nome: "Dr. João Oliveira",
    disciplina: "Metodologia de Pesquisa Científica",
    email: "joao.oliveira@universidade.edu.br",
    iniciais: "JO",
  },
  {
    id: "4",
    nome: "Dra. Ana Costa",
    disciplina: "Estatística Aplicada",
    email: "ana.costa@universidade.edu.br",
    iniciais: "AC",
  },
]

const turmas: Turma[] = [
  {
    id: "1",
    nome: "Mestrado em Ciência da Computação - Turma 2023",
    turno: "Noturno",
    semestre: "2024.2",
    orientador: "Dr. Carlos Silva",
    numeroAlunos: 18,
  },
  {
    id: "2",
    nome: "Doutorado em Sistemas Computacionais - Turma 2022",
    turno: "Integral",
    semestre: "2024.2",
    orientador: "Dra. Maria Santos",
    numeroAlunos: 12,
  },
]

export function ProfessoresTurmasTab() {
  return (
    <Tabs defaultValue="professores" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="professores">Professores</TabsTrigger>
        <TabsTrigger value="turmas">Minhas Turmas</TabsTrigger>
      </TabsList>

      <TabsContent value="professores" className="mt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {professores.map((professor) => (
            <Card key={professor.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-academic text-academic-foreground">
                      {professor.iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{professor.nome}</CardTitle>
                    <CardDescription>{professor.disciplina}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">{professor.email}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Contato
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="turmas" className="mt-6">
        <div className="space-y-4">
          {turmas.map((turma) => (
            <Card key={turma.id}>
              <CardHeader>
                <CardTitle>{turma.nome}</CardTitle>
                <CardDescription>
                  {turma.turno} • {turma.semestre}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orientador:</span>
                    <span className="font-semibold">{turma.orientador}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Número de alunos:</span>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{turma.numeroAlunos}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
