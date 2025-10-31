"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { GraduationCap, Users, BookOpen, Loader2 } from "lucide-react"

// --- Interfaces para os dados da API ---
interface Professor {
  id: string;
  nome: string;
  departamento: string;
  orientandos: number;
}

interface Turma {
  id: string;
  codigo: string;
  periodo: string;
  alunos: number;
  disciplina: string;
}

// Interface para os dados dos alunos vindos da API
interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  status: "regular" | "transferido" | "concluido/formado" | "inativo";
}

// Função para converter o status do DB para um texto mais amigável
const getStatusText = (status: string) => {
  switch (status) {
    case "regular":
      return "Ativo";
    case "concluido/formado":
      return "Concluído";
    case "inativo":
      return "Inativo";
    case "transferido":
      return "Transferido";
    default:
      // Capitaliza a primeira letra para outros casos
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Função para definir a cor do badge com base no status
const getStatusColor = (status: string) => {
  switch (status) {
    case "regular":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700";
    case "concluido/formado":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700";
    case "inativo":
    case "transferido":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
  }
}

export function VinculadosTab() {
  const { id: cursoId } = useParams<{ id: string }>();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]); // Estado para os alunos reais
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVinculados = async () => {
      if (!cursoId) return;
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/cursos/${cursoId}/vinculados`);
        setProfessores(response.data.professores || []);
        setTurmas(response.data.turmas || []);
        setAlunos(response.data.alunos || []); // Popula o estado com os alunos da API
      } catch (error) {
        console.error("Erro ao buscar dados de vinculados:", error);
        toast.error("Não foi possível carregar os dados vinculados ao curso.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVinculados();
  }, [cursoId]);

  const renderLoading = () => (
    <div className="flex items-center justify-center p-10 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Carregando...
    </div>
  );

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

          {/* Aba de Alunos (AGORA COM DADOS REAIS) */}
          <TabsContent value="alunos" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3}>{renderLoading()}</TableCell></TableRow>
                  ) : alunos.length > 0 ? (
                    alunos.map((aluno) => (
                      <TableRow key={aluno.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{aluno.nome}</TableCell>
                        <TableCell>{aluno.matricula}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(aluno.status)}>
                            {getStatusText(aluno.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center h-24">Nenhum aluno vinculado a este curso.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Aba de Professores (Dados REAIS) */}
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
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3}>{renderLoading()}</TableCell></TableRow>
                  ) : professores.length > 0 ? (
                    professores.map((professor) => (
                      <TableRow key={professor.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{professor.nome}</TableCell>
                        <TableCell>{professor.departamento || 'Não informado'}</TableCell>
                        <TableCell className="text-right">{professor.orientandos}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center h-24">Nenhum professor vinculado a este curso.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Aba de Turmas (Dados REAIS) */}
          <TabsContent value="turmas" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Código</TableHead>
                    <TableHead>Disciplina(s)</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Alunos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={4}>{renderLoading()}</TableCell></TableRow>
                  ) : turmas.length > 0 ? (
                    turmas.map((turma) => (
                      <TableRow key={turma.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{turma.codigo}</TableCell>
                        <TableCell>{turma.disciplina || 'N/A'}</TableCell>
                        <TableCell>{turma.periodo}</TableCell>
                        <TableCell className="text-right">{turma.alunos || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">Nenhuma turma vinculada a este curso.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
