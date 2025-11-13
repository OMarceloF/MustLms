// frontend/src/pages/gestor/materias/Relatorios.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Users, TrendingUp, TrendingDown, UserCheck, Loader2, UserX } from "lucide-react"

// --- Interfaces ---
interface Metrics {
  totalAlunos: number;
  taxaAprovacao: number;
  taxaReprovacao: number;
  taxaDesistencia: number;
  totalProfessores: number;
}

interface TurmaData {
  turma: string;
  professor: string;
  aprovados: number;
  reprovados: number;
  desistentes: number;
  mediaGeral: number;
}

interface ChartData {
  turma: string;
  aprovados: number;
  reprovados: number;
  desistentes: number;
}

interface RelatoriosResponse {
  metrics: Metrics;
  turmas: TurmaData[];
  chartData: ChartData[];
}

interface FiltroOption {
  id: string;
  nome: string;
  semestre_id?: number; 
}

export default function Relatorios() {
  const { id: disciplinaId } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RelatoriosResponse | null>(null);
  
  const [periodos, setPeriodos] = useState<FiltroOption[]>([]);
  const [allTurmas, setAllTurmas] = useState<FiltroOption[]>([]);
  const [turmasFiltro, setTurmasFiltro] = useState<FiltroOption[]>([]);
  
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("all");
  const [selectedTurma, setSelectedTurma] = useState<string>("all");

  useEffect(() => {
    const fetchFiltros = async () => {
        if (!disciplinaId) return;
        try {
            const [periodosRes, turmasRes] = await Promise.all([
                axios.get('/api/periodos-letivos/todos'),
                axios.get(`/api/disciplinas/${disciplinaId}/turmas`)
            ]);
            setPeriodos(periodosRes.data);
            setAllTurmas(turmasRes.data);
            setTurmasFiltro(turmasRes.data);
        } catch (error) {
            toast.error("Falha ao carregar filtros.");
        }
    };
    fetchFiltros();
  }, [disciplinaId]);

  // *** LÓGICA DE FILTRO EM CASCATA CORRIGIDA ***
  useEffect(() => {
    if (selectedPeriodo === 'all') {
        setTurmasFiltro(allTurmas);
    } else {
        const turmasDoPeriodo = allTurmas.filter(turma => String(turma.semestre_id) === selectedPeriodo);
        setTurmasFiltro(turmasDoPeriodo);
    }
    setSelectedTurma("all"); 
  }, [selectedPeriodo, allTurmas]);

  useEffect(() => {
    const fetchRelatorios = async () => {
      if (!disciplinaId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedPeriodo !== "all") params.append("periodoId", selectedPeriodo);
        if (selectedTurma !== "all") params.append("turmaId", selectedTurma);

        const response = await axios.get<RelatoriosResponse>(`/api/disciplinas/${disciplinaId}/relatorios`, { params });
        setData(response.data);
      } catch (error) {
        toast.error("Erro ao carregar os dados do relatório.");
        console.error("Erro ao buscar relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorios();
  }, [disciplinaId, selectedPeriodo, selectedTurma]);

  const MetricCard = ({ title, value, icon: Icon, trend, suffix = '' }: any) => (
    <Card className="shadow-sm rounded-lg overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold mt-1">{value}{suffix}</p>
          </div>
          <div className={`p-2 rounded-lg flex-shrink-0 ${trend === "up" ? "bg-green-100" : trend === "down" ? "bg-red-100" : "bg-blue-100"}`}>
            <Icon className={`h-5 w-5 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-blue-600"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando relatórios...</span>
        </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8 text-muted-foreground">Não foi possível carregar os dados.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Relatórios e Indicadores da Disciplina</h2>
        <p className="text-muted-foreground text-sm">Visão geral do desempenho da disciplina em diferentes turmas e períodos.</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Período Letivo</label>
              <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Períodos</SelectItem>
                  {periodos.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Turma</label>
              <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Turmas</SelectItem>
                  {turmasFiltro.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard title="Alunos" value={data.metrics.totalAlunos} icon={Users} trend="neutral" />
        <MetricCard title="Aprovação" value={data.metrics.taxaAprovacao} suffix="%" icon={TrendingUp} trend="up" />
        <MetricCard title="Reprovação" value={data.metrics.taxaReprovacao} suffix="%" icon={TrendingDown} trend="down" />
        <MetricCard title="Desistência" value={data.metrics.taxaDesistencia} suffix="%" icon={UserX} trend="down" />
        <MetricCard title="Professores" value={data.metrics.totalProfessores} icon={UserCheck} trend="neutral" />
      </div>

      {/* Chart */}
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold">Desempenho Comparativo por Turma</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="turma" fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ fontSize: '10px' }} labelStyle={{ fontWeight: 'bold' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="aprovados" fill="#22c55e" name="Aprovados" />
              <Bar dataKey="reprovados" fill="#ef4444" name="Reprovados" />
              <Bar dataKey="desistentes" fill="#f59e0b" name="Desistentes" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-semibold">Resumo por Turma</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 text-xs">Turma</TableHead>
                  <TableHead className="px-3 text-xs">Professor</TableHead>
                  <TableHead className="px-3 text-xs text-center">Aprovados</TableHead>
                  <TableHead className="px-3 text-xs text-center">Reprovados</TableHead>
                  <TableHead className="px-3 text-xs text-center">Desistentes</TableHead>
                  <TableHead className="px-3 text-xs text-center">Média Geral</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.turmas.length > 0 ? data.turmas.map((turma, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-3 py-2 text-xs font-medium">{turma.turma}</TableCell>
                    <TableCell className="px-3 py-2 text-xs">{turma.professor}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold text-green-600">{turma.aprovados}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold text-red-600">{turma.reprovados}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold text-yellow-600">{turma.desistentes}</TableCell>
                    <TableCell className="px-3 py-2 text-xs text-center font-semibold">{turma.mediaGeral.toFixed(1)}</TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Nenhum dado encontrado para os filtros selecionados.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
