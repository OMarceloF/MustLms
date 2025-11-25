// frontend/src/pages/VinculadosTab.tsx

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

// --- Interfaces ---
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

// Define os tipos aceitos pelo componente Select
type VinculoStatus = "Ativo" | "Inativo" | "Trancado" | "Concluído";

interface AlunoVinculado {
  id: string;
  nome: string;
  matricula: string;
  status_vinculo: VinculoStatus; 
  vinculoId: number;
}

export function VinculadosTab() {
  const { id: disciplinaId } = useParams<{ id: string }>();

  const [professores, setProfessores] = useState<Professor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunosVinculados, setAlunosVinculados] = useState<AlunoVinculado[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para capitalizar o status vindo do banco (ex: "ativo" -> "Ativo")
  const formatarStatus = (status: string): VinculoStatus => {
    if (!status) return "Ativo";
    const lower = status.toLowerCase();
    // Retorna o formato exato esperado pelo TypeScript e pelo SelectItem
    if (lower === "trancado") return "Trancado";
    if (lower === "inativo") return "Inativo";
    if (lower === "concluido" || lower === "concluído") return "Concluído";
    return "Ativo";
  };

  const fetchVinculados = useCallback(async () => {
    if (!disciplinaId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/disciplinas/${disciplinaId}/vinculados`);
      // Tipamos como any[] aqui para poder processar o status antes de salvar
      const alunosRecebidosRaw: any[] = response.data.alunos || [];
      
      const alunosProcessados: AlunoVinculado[] = alunosRecebidosRaw.map(aluno => ({
        ...aluno,
        // Força a formatação correta do status imediatamente
        status_vinculo: formatarStatus(aluno.status_vinculo)
      }));
      
      // 🔥 LÓGICA DE PRIORIZAÇÃO DE STATUS 🔥
      const alunosMap = new Map<string, AlunoVinculado>();
      // A ordem aqui define a prioridade (índices menores ganham se houver duplicidade)
      // Se preferir que 'Trancado' apareça acima de 'Ativo' caso o aluno tenha os dois, mantenha Trancado no início.
      const statusPrioridade: VinculoStatus[] = ["Trancado", "Inativo", "Concluído", "Ativo"];

      for (const aluno of alunosProcessados) {
        const alunoExistente = alunosMap.get(aluno.id);
        
        if (!alunoExistente) {
          alunosMap.set(aluno.id, aluno);
        } else {
          // Verifica qual status tem maior prioridade (menor índice no array)
          const prioridadeExistente = statusPrioridade.indexOf(alunoExistente.status_vinculo);
          const prioridadeNova = statusPrioridade.indexOf(aluno.status_vinculo);
          
          // Se o novo status tiver prioridade maior (índice menor) ou prioridadeExistente for -1 (erro), substitui
          if (prioridadeNova !== -1 && (prioridadeNova < prioridadeExistente || prioridadeExistente === -1)) {
            alunosMap.set(aluno.id, aluno);
          }
        }
      }

      const alunosUnicos = Array.from(alunosMap.values());
      
      // Ordenar alfabeticamente por nome
      alunosUnicos.sort((a, b) => a.nome.localeCompare(b.nome));

      setAlunosVinculados(alunosUnicos);
      setProfessores(response.data.professores || []);
      setTurmas(response.data.turmas || []);

    } catch (error) {
      console.error("Erro ao buscar dados de vinculados:", error);
      toast.error("Não foi possível carregar os dados vinculados à disciplina.");
    } finally {
      setIsLoading(false);
    }
  }, [disciplinaId]);

  useEffect(() => {
    fetchVinculados();
  }, [fetchVinculados]);

  const handleStatusChange = async (vinculoId: number, newStatus: VinculoStatus) => {
    // Atualização Otimista
    setAlunosVinculados(prevAlunos =>
      prevAlunos.map(aluno =>
        aluno.vinculoId === vinculoId ? { ...aluno, status_vinculo: newStatus } : aluno
      )
    );
    try {
      // Envia o status em minúsculo para o banco, se sua API esperar minúsculo, 
      // ou mantém assim se a API tratar. Geralmente APIs aceitam string simples.
      await axios.patch(`/api/alunos-turmas/${vinculoId}/status`, { status: newStatus });
      toast.success(`Status atualizado para ${newStatus}`);
    } catch (error) {
      toast.error("Falha ao atualizar o status do vínculo.");
      fetchVinculados(); // Reverte em caso de erro recarregando os dados originais
    }
  };

  const renderLoading = () => (
    <div className="flex items-center justify-center p-10 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Carregando...
    </div>
  );

  const renderEmptyState = (text: string, colSpan: number) => (
     <TableRow>
        <TableCell colSpan={colSpan} className="text-center h-24 text-muted-foreground">{text}</TableCell>
     </TableRow>
  );

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Vinculados à Disciplina</CardTitle>
        <CardDescription>Visualize alunos, professores e turmas diretamente ligados a esta disciplina.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alunos" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="alunos" className="data-[state=active]:bg-background">
              <GraduationCap className="mr-2 h-4 w-4" />
              Alunos ({alunosVinculados.length})
            </TabsTrigger>
            <TabsTrigger value="professores" className="data-[state=active]:bg-background">
              <Users className="mr-2 h-4 w-4" />
              Professores ({professores.length})
            </TabsTrigger>
            <TabsTrigger value="turmas" className="data-[state=active]:bg-background">
              <BookOpen className="mr-2 h-4 w-4" />
              Turmas ({turmas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alunos" className="mt-0">
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead className="w-[180px]">Status na Turma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3}>{renderLoading()}</TableCell></TableRow>
                  ) : alunosVinculados.length > 0 ? (
                    alunosVinculados.map((aluno) => (
                      <TableRow key={`${aluno.id}-${aluno.vinculoId}`} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{aluno.nome}</TableCell>
                        <TableCell>{aluno.matricula}</TableCell>
                        <TableCell>
                          <Select
                            value={aluno.status_vinculo} 
                            onValueChange={(value: VinculoStatus) => handleStatusChange(aluno.vinculoId, value)}
                          >
                            <SelectTrigger className="h-8 w-full">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ativo">Ativo</SelectItem>
                              <SelectItem value="Concluído">Concluído</SelectItem>
                              <SelectItem value="Inativo">Inativo</SelectItem>
                              <SelectItem value="Trancado">Trancado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    renderEmptyState("Nenhum aluno vinculado a esta disciplina.", 3)
                  )}
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
                    renderEmptyState("Nenhum professor vinculado a esta disciplina.", 3)
                  )}
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
                    <TableHead>Período</TableHead>
                    <TableHead className="text-right">Alunos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3}>{renderLoading()}</TableCell></TableRow>
                  ) : turmas.length > 0 ? (
                    turmas.map((turma) => (
                      <TableRow key={turma.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{turma.codigo}</TableCell>
                        <TableCell>{turma.periodo}</TableCell>
                        <TableCell className="text-right">{turma.alunos || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    renderEmptyState("Nenhuma turma vinculada a esta disciplina.", 3)
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