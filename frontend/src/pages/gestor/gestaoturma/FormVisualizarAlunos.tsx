import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { getSafeImagePath } from './utils';
import { Button } from '../components/ui/button';

// ... (Interfaces e props permanecem as mesmas) ...
interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  role: string;
  foto_url?: string;
}

interface FormVisualizarAlunosProps {
  turmaId: string;
  initialAlunos: Aluno[];
  onAlunoRemovido: () => void;
}


export function FormVisualizarAlunos({ turmaId, initialAlunos, onAlunoRemovido }: FormVisualizarAlunosProps) {
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialAlunos) {
      const listaOrdenada = [...initialAlunos].sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunos(listaOrdenada);
    }
  }, [initialAlunos]);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/turmas-novo/${turmaId}`);
      const listaOrdenada = (data.alunos || []).sort((a: Aluno, b: Aluno) => a.nome.localeCompare(b.nome));
      setAlunos(listaOrdenada);
      toast.success('Lista de alunos atualizada!');
    } catch (err) {
      console.error('Erro ao buscar alunos da turma:', err);
      toast.error('Erro ao carregar alunos da turma.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverAluno = async (alunoId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da turma?')) return;
    try {
      await axios.delete(`/api/turmas-novo/${turmaId}/alunos/${alunoId}`);
      toast.success('Aluno removido com sucesso!');
      onAlunoRemovido();
    } catch (err) {
      console.error('Erro ao remover aluno:', err);
      toast.error('Erro ao remover aluno da turma.');
    }
  };

  // <<--- MUDANÇAS DE ESTILO PARA MAIOR IMPACTO VISUAL --->>
  return (
    <div className="bg-card rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Alunos Vinculados</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAlunos}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            'Atualizar'
          )}
        </Button>
      </div>

      {loading && initialAlunos.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Carregando alunos...</p>
        </div>
      ) : alunos.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">Nenhum aluno vinculado a esta turma.</p>
      ) : (
        // Tabela com estilo de grade e maior contraste
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              {/* Cabeçalho com fundo mais forte e bordas definidas */}
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left font-semibold text-foreground w-16">Foto</th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">Nome</th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">Matrícula</th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">Status</th>
                <th className="border border-border p-3 text-center font-semibold text-foreground w-20">Remover</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => {
                const safePath = getSafeImagePath(aluno.foto_url);
                return (
                  // Linhas com bordas em todas as células
                  <tr key={aluno.id} className="hover:bg-muted/50 transition-colors">
                    <td className="border border-border p-2 align-middle">
                      {safePath ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${safePath}`}
                          alt={aluno.nome}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                          {aluno.nome.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="border border-border p-3 align-middle font-medium text-foreground">{aluno.nome}</td>
                    <td className="border border-border p-3 align-middle text-foreground/80">{aluno.matricula}</td>
                    <td className="border border-border p-3 align-middle text-foreground/80">{aluno.role}</td>
                    <td className="border border-border p-2 text-center align-middle">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoverAluno(aluno.id)}
                        className="text-destructive hover:text-destructive"
                        title="Remover aluno"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
