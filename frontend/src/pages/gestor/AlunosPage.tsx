// src/pages/AlunosPage.tsx (VERSÃO ATUALIZADA)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  Eye,
  Settings,
  Trash,
  UserPlus,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '../gestor/components/ui/button';

// --- Interfaces (sem alterações) ---
interface Turma {
  id: number;
  nome: string;
  serie: string; // O nome do campo no backend permanece 'serie'
  ano_letivo: string;
  turno: string;
  qtd_alunos: number;
  etapa_ensino: string;
  professor_responsavel?: string;
}

interface Aluno {
  id: string;
  nome: string;
  email: string;
  login: string;
  role: string;
  matricula?: string;
  foto: string;
  created_at: string;
  curso_nome?: string;
  turma_nome?: string;
}

const AlunosPage = () => {
  // --- Hooks e Estados ---
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Aluno | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });

  // 1. Renomeado o estado para clareza
  const [filterCurso, setFilterCurso] = useState<string>('');
  const [filterTurma, setFilterTurma] = useState<string>('');

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isProfessor = user.role === 'professor';

  // --- Lógica de Fetch ---
  useEffect(() => {
    if (authLoading) return;
    setIsLoading(true);
    const baseUrl = `/api`;
    const url = user.cargo === 'Professor' ? `${baseUrl}/professores/${user.id}/alunos` : `${baseUrl}/listar_alunos`;
    axios.get<Aluno[]>(url)
      .then(({ data }) => {
        setAlunos(data);
        setFilteredAlunos(data);
      })
      .catch((err) => {
        console.error('Erro ao buscar alunos:', err);
        toast.error('Erro ao carregar os dados dos alunos.');
      })
      .finally(() => setIsLoading(false));
  }, [user, authLoading]);

  // --- Lógica de Filtro e Ordenação ---
  useEffect(() => {
    let result = [...alunos];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(aluno =>
        (aluno.nome?.toLowerCase() ?? '').includes(term) ||
        (aluno.email?.toLowerCase() ?? '').includes(term) ||
        (aluno.matricula?.toLowerCase() ?? '').includes(term)
      );
    }
    // 2. A lógica de filtro continua usando o campo 'serie', mas o estado agora é 'filterCurso'
    if (filterCurso) result = result.filter(aluno => aluno.curso_nome === filterCurso);
    if (filterTurma) result = result.filter(aluno => aluno.turma_nome === filterTurma);

    if (sortConfig.key && sortConfig.key !== 'foto') {
      const key = sortConfig.key;
      result.sort((a, b) => {
        const aValue = a[key] ?? '';
        const bValue = b[key] ?? '';
        return sortConfig.direction === 'ascending' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
      });
    }
    setFilteredAlunos(result);
  }, [alunos, searchTerm, filterCurso, filterTurma, sortConfig]);

  const handleSort = (key: keyof Aluno) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/alunos/${id}`);
      setAlunos(prev => prev.filter(aluno => aluno.id !== id));
      setShowDeleteConfirm(null);
      toast.success("Aluno excluído com sucesso!");
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
      toast.error('Não foi possível excluir o aluno.');
    }
  };

  // 3. A lógica para obter valores únicos continua usando o campo 'serie'
  const uniqueCursos = [...new Set(alunos.map(aluno => aluno.curso_nome).filter(Boolean))];
  const uniqueTurmas = [...new Set(alunos.map(aluno => aluno.turma_nome).filter(Boolean))];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // --- ESTRUTURA E DESIGN ATUALIZADOS ---
  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">
              Gerenciamento de Alunos
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Visualize, filtre e gerencie os alunos cadastrados no sistema.
            </p>
          </div>

          {/* Actions Bar */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button
                onClick={() => navigate('/gestor/trancamento')}
                className="gap-2 ml-auto"
              >
                <UserPlus className="size-4" />
                Trancamento de Matrícula
              </Button>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Filtro de Curso */}
              <div className="relative flex-1 sm:max-w-xs">
                <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filterCurso}
                  onChange={(e) => setFilterCurso(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Filtrar por Curso</option>
                  {uniqueCursos.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Turma */}
              <div className="relative flex-1 sm:max-w-xs">
                <Filter className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filterTurma}
                  onChange={(e) => setFilterTurma(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Filtrar por Turma</option>
                  {uniqueTurmas.map((turma) => (
                    <option key={turma} value={turma}>
                      {turma}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabela ou Mensagens de Estado */}
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando alunos...
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">Nenhum aluno encontrado com os filtros atuais.</p>
            </div>
          ) : (
            <>
              {/* Tabela para telas grandes (lg e acima) */}
              <div className="hidden lg:block overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Foto</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('nome')}>Nome</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('matricula')}>Matrícula</th>
                      {/* 5. Cabeçalho da tabela atualizado */}
                     {/* Cabeçalho da tabela ATUALIZADO */}
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('curso_nome')}>Curso</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:bg-muted" onClick={() => handleSort('turma_nome')}>Turma</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredAlunos.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-muted/50">
                        <td className="p-4">
                          <div className="size-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                            {aluno.foto && aluno.foto.startsWith('/uploads') ? (
                              <img src={`${import.meta.env.VITE_API_URL}${encodeURI(aluno.foto)}`} alt={aluno.nome} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-primary">{aluno.nome?.substring(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-foreground">{aluno.nome}</td>
                        <td className="p-4 text-muted-foreground">{aluno.matricula || '—'}</td>
                        {/* O dado exibido ainda é 'aluno.serie', mas o cabeçalho é "Curso" */}
                        <td className="p-4 text-muted-foreground">{aluno.curso_nome || '—'}</td>
                        <td className="p-4 text-muted-foreground">{aluno.turma_nome || '—'}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {showDeleteConfirm === aluno.id ? (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(aluno.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Check className="size-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(null)}><X className="size-4" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => navigate(isProfessor ? `/professor/alunos/${aluno.id}/visualizaraluno` : `/gestor/alunos/${aluno.id}/visualizaraluno`, { state: { aluno, todosAlunos: alunos } })}><Eye className="size-4" /></Button>
                                {!isProfessor && (
                                  <>
                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/aluno/${aluno.id}/configurar`)}><Settings className="size-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(aluno.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash className="size-4" /></Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para telas pequenas (abaixo de lg) */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {filteredAlunos.map((aluno) => (
                  <div key={aluno.id} className="rounded-lg border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                          {aluno.foto && aluno.foto.startsWith('/uploads') ? (
                            <img src={`${import.meta.env.VITE_API_URL}${encodeURI(aluno.foto)}`} alt={aluno.nome} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-bold text-primary">{aluno.nome?.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{aluno.nome}</p>
                          <p className="text-sm text-muted-foreground">{aluno.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {showDeleteConfirm === aluno.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(aluno.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Check className="size-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(null)}><X className="size-4" /></Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => navigate(isProfessor ? `/professor/alunos/${aluno.id}/visualizaraluno` : `/gestor/alunos/${aluno.id}/visualizaraluno`, { state: { aluno, todosAlunos: alunos } })}><Eye className="size-4" /></Button>
                            {!isProfessor && <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(aluno.id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash className="size-4" /></Button>}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 border-t pt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Matrícula</p>
                        <p className="font-medium">{aluno.matricula || '—'}</p>
                      </div>
                      {/* 6. Label do card atualizado */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Curso</p>
                        <p className="font-medium">{aluno.curso_nome || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Turma</p>
                        <p className="font-medium">{aluno.turma_nome || '—'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlunosPage;
