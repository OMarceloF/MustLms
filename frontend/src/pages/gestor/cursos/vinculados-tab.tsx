// frontend/src/pages/gestor/cursos/vinculados-tab.tsx


"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { GraduationCap, Users, BookOpen } from "lucide-react"

const mockAlunos = [
  { id: "1", nome: "Ana Paula Oliveira", matricula: "2023001", status: "Ativo", nivel: "Mestrado" },
  { id: "2", nome: "Carlos Eduardo Santos", matricula: "2023002", status: "Ativo", nivel: "Doutorado" },
  { id: "3", nome: "Beatriz Lima", matricula: "2022015", status: "Concluído", nivel: "Mestrado" },
  { id: "4", nome: "Daniel Ferreira", matricula: "2023003", status: "Ativo", nivel: "Mestrado" },
  { id: "5", nome: "Fernanda Costa", matricula: "2021008", status: "Desistente", nivel: "Doutorado" },
]

const mockProfessores = [
  { id: "1", nome: "Dr. João Silva", departamento: "Ciências Exatas", orientandos: 5 },
  { id: "2", nome: "Dra. Maria Santos", departamento: "Ciências Humanas", orientandos: 3 },
  { id: "3", nome: "Dr. Pedro Costa", departamento: "Ciências Biológicas", orientandos: 4 },
  { id: "4", nome: "Dra. Ana Rodrigues", departamento: "Engenharia", orientandos: 6 },
]

const mockTurmas = [
  { id: "1", codigo: "MEST-2024-1", periodo: "2024.1", alunos: 15, disciplina: "Metodologia de Pesquisa" },
  { id: "2", codigo: "DOUT-2024-1", periodo: "2024.1", alunos: 8, disciplina: "Estatística Avançada" },
  { id: "3", codigo: "MEST-2024-2", periodo: "2024.2", alunos: 12, disciplina: "Seminários de Pesquisa" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "Ativo":
      return "bg-success/10 text-success border-success/20"
    case "Concluído":
      return "bg-info/10 text-info border-info/20"
    case "Desistente":
      return "bg-destructive/10 text-destructive border-destructive/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function VinculadosTab() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Vinculados ao Programa</CardTitle>
        <CardDescription>Visualize alunos, professores e turmas vinculadas ao curso</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alunos" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="alunos" className="data-[state=active]:bg-background">
              <GraduationCap className="mr-2 h-4 w-4" />
              Alunos
            </TabsTrigger>
            <TabsTrigger value="professores" className="data-[state=active]:bg-background">
              <Users className="mr-2 h-4 w-4" />
              Professores
            </TabsTrigger>
            <TabsTrigger value="turmas" className="data-[state=active]:bg-background">
              <BookOpen className="mr-2 h-4 w-4" />
              Turmas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alunos" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAlunos.map((aluno) => (
                    <TableRow key={aluno.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{aluno.nome}</TableCell>
                      <TableCell>{aluno.matricula}</TableCell>
                      <TableCell>{aluno.nivel}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(aluno.status)}>
                          {aluno.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="professores" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Orientandos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProfessores.map((professor) => (
                    <TableRow key={professor.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{professor.nome}</TableCell>
                      <TableCell>{professor.departamento}</TableCell>
                      <TableCell className="text-right">{professor.orientandos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="turmas" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Código</TableHead>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Alunos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTurmas.map((turma) => (
                    <TableRow key={turma.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium">{turma.codigo}</TableCell>
                      <TableCell>{turma.disciplina}</TableCell>
                      <TableCell>{turma.periodo}</TableCell>
                      <TableCell className="text-right">{turma.alunos}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
