"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
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

type VinculoStatus = "ativo" | "inativo" | "trancado";

// Interface para os dados dos alunos, agora com vinculoId
interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  status: VinculoStatus;
  vinculoId: number; // ID do registro na tabela alunos_turmas
}

// Objeto para mapear status do DB para texto na UI
const statusMap: Record<VinculoStatus, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  trancado: "Trancado",
};

export function VinculadosTab() {
  const { id: cursoId } = useParams<{ id: string }>();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os dados, agora com useCallback para otimização
  const fetchVinculados = useCallback(async () => {
    if (!cursoId) return;
    try {
      // A flag de loading só é ativada na primeira vez para evitar piscar a tela
      if (alunos.length === 0) setIsLoading(true);
      const response = await axios.get(`/api/cursos/${cursoId}/vinculados`);
      setProfessores(response.data.professores || []);
      setTurmas(response.data.turmas || []);
      setAlunos(response.data.alunos || []);
    } catch (error) {
      console.error("Erro ao buscar dados de vinculados:", error);
      toast.error("Não foi possível carregar os dados vinculados ao curso.");
    } finally {
      setIsLoading(false);
    }
  }, [cursoId, alunos.length]);

  useEffect(() => {
    fetchVinculados();
  }, [fetchVinculados]);

  /**
   * Atualiza o status do vínculo de um aluno em uma turma.
   * @param vinculoId O ID da linha na tabela `alunos_turmas`.
   * @param newStatus O novo status a ser aplicado.
   */
  const handleStatusChange = async (vinculoId: number, newStatus: VinculoStatus) => {
    // Atualização otimista: muda a UI primeiro para uma resposta rápida
    setAlunos(prevAlunos =>
      prevAlunos.map(aluno =>
        aluno.vinculoId === vinculoId ? { ...aluno, status: newStatus } : aluno
      )
    );

    try {
      // Rota específica para atualizar o status do vínculo
      await axios.patch(`/api/alunos-turmas/${vinculoId}/status`, { status: newStatus });
      toast.success(`Status do aluno atualizado com sucesso!`);
    } catch (error) {
      toast.error("Falha ao atualizar o status do vínculo.");
      // Em caso de erro, reverte a mudança na UI buscando os dados frescos do servidor
      fetchVinculados();
    }
  };

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

          {/* Aba de Alunos com Status Editável */}
          <TabsContent value="alunos" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead className="w-[180px]">Status no Vínculo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3}>{renderLoading()}</TableCell></TableRow>
                  ) : alunos.length > 0 ? (
                    alunos.map((aluno) => (
                      <TableRow key={aluno.vinculoId} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{aluno.nome}</TableCell>
                        <TableCell>{aluno.matricula}</TableCell>
                        <TableCell>
                          <Select
                            value={aluno.status}
                            onValueChange={(value: VinculoStatus) => handleStatusChange(aluno.vinculoId, value)}
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue placeholder="Alterar status..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="inativo">Inativo</SelectItem>
                              <SelectItem value="trancado">Trancado</SelectItem>
                            </SelectContent>
                          </Select>
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

          {/* Aba de Professores (sem alterações) */}
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

          {/* Aba de Turmas (sem alterações) */}
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
