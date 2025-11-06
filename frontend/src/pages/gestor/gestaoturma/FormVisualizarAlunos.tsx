// src/pages/FormVisualizarAlunos.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Trash2, Loader2, RotateCw } from 'lucide-react'; // Adicionado RotateCw
import { getSafeImagePath } from './utils';
import { Button } from '../components/ui/button';

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  foto_url?: string;
  status_vinculo: 'ativo' | 'inativo' | 'trancado'; // Adicionada a propriedade correta
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

  // Esta função não é mais necessária, pois a atualização é feita pela prop onAlunoRemovido
  // que chama a função principal na página GestaoTurma.tsx
  // const fetchAlunos = async () => { ... };

  const handleRemoverAluno = async (alunoId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da turma? O vínculo será desativado, mas o histórico será mantido.')) return;
    try {
      await axios.delete(`/api/turmas-novo/${turmaId}/alunos/${alunoId}`);
      toast.success('Aluno removido com sucesso!');
      onAlunoRemovido(); // Chama a função do componente pai para atualizar tudo
    } catch (err) {
      console.error('Erro ao remover aluno:', err);
      toast.error('Erro ao remover aluno da turma.');
    }
  };

  // Função para obter a classe de cor baseada no status do vínculo
  const getStatusClass = (status: string) => {
    switch (status) {
        case 'ativo': return 'bg-green-100 text-green-800';
        case 'inativo': return 'bg-red-100 text-red-800';
        case 'trancado': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Alunos Vinculados</h2>
        {/* O botão de atualizar pode ser removido se a atualização automática for suficiente */}
      </div>

      {loading && initialAlunos.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Carregando alunos...</p>
        </div>
      ) : alunos.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">Nenhum aluno com vínculo ativo nesta turma.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-3 text-left font-semibold text-foreground w-16">Foto</th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">Nome</th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">Matrícula</th>
                <th className="border border-border p-3 text-left font-semibold text-foreground">Status</th>
                <th className="border border-border p-3 text-center font-semibold text-foreground w-20">Ação</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-muted/50 transition-colors">
                    <td className="border border-border p-2 align-middle">
                      {getSafeImagePath(aluno.foto_url) ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${aluno.foto_url}`}
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
                    {/* Célula de Status Corrigida */}
                    <td className="border border-border p-3 align-middle text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusClass(aluno.status_vinculo)}`}>
                            {aluno.status_vinculo}
                        </span>
                    </td>
                    <td className="border border-border p-2 text-center align-middle">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoverAluno(aluno.id)}
                        className="text-destructive hover:text-destructive"
                        title="Desativar vínculo do aluno"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
