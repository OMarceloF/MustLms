import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getSafeImagePath } from './utils';

// Interface para a estrutura de um aluno disponível
interface AlunoDisponivel {
  id: number;
  nome: string;
  foto_url?: string;
}

// Props que o componente espera receber do pai
interface FormVincularAlunoProps {
  turmaId: string;
  onAlunosVinculados: () => void; // Função para notificar o pai sobre a vinculação
}

export function FormVincularAluno({ turmaId, onAlunosVinculados }: FormVincularAlunoProps) {
    const [alunosDisponiveis, setAlunosDisponiveis] = useState<AlunoDisponivel[]>([]);
    const [busca, setBusca] = useState('');
    const [selecionados, setSelecionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Função para buscar alunos disponíveis, agora com useCallback
    const fetchAlunosDisponiveis = useCallback(async () => {
        if (!turmaId) return;
        setLoading(true);
        try {
            const res = await axios.get(`/api/turmas-novo/${turmaId}/alunos-disponiveis`);
            setAlunosDisponiveis(res.data);
        } catch (error) {
            toast.error('Erro ao carregar alunos para vínculo.');
            console.error('Erro ao buscar alunos disponíveis:', error);
        } finally {
            setLoading(false);
        }
    }, [turmaId]);

    // Busca inicial dos alunos disponíveis
    useEffect(() => {
        fetchAlunosDisponiveis();
    }, [fetchAlunosDisponiveis]);

    // Filtra os alunos com base na busca do usuário
    const alunosFiltrados = alunosDisponiveis.filter(a =>
        a.nome.toLowerCase().includes(busca.toLowerCase())
    );

    // Alterna a seleção de um aluno
    const toggleSelect = (id: number) => {
        setSelecionados(prev =>
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    // Função para vincular os alunos selecionados
    const handleVincular = async () => {
        if (selecionados.length === 0) {
            toast.error('Selecione pelo menos um aluno para vincular.');
            return;
        }
        try {
            await axios.post(`/api/turmas-novo/${turmaId}/adicionar-alunos`, { alunos: selecionados });
            toast.success('Alunos vinculados com sucesso!');
            
            // Limpa a seleção local
            setSelecionados([]);
            
            // 1. Notifica o componente pai para que ele atualize a lista de "Alunos Vinculados"
            onAlunosVinculados(); 
            
            // 2. Busca novamente a lista de alunos disponíveis para remover os que foram vinculados
            fetchAlunosDisponiveis();

        } catch (error) {
            toast.error('Ocorreu um erro ao vincular os alunos.');
            console.error('Erro ao vincular alunos:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4">Vincular Alunos</h2>

            <input
                type="text"
                placeholder="Buscar aluno..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full mb-2 px-3 py-2 border border-indigo-500 rounded-md focus:ring-2 focus:ring-indigo-700 focus:outline-none"
            />

            <div className="max-h-48 overflow-y-auto border border-indigo-300 rounded-md p-2">
                {loading ? (
                    <p className="text-center text-gray-500 py-4">Carregando...</p>
                ) : alunosFiltrados.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum aluno disponível para vincular.</p>
                ) : (
                    alunosFiltrados.map(a => (
                        <label
                            key={a.id}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                                selecionados.includes(a.id) ? 'bg-indigo-100' : 'hover:bg-indigo-50'
                            }`}
                            onClick={() => toggleSelect(a.id)}
                        >
                            {getSafeImagePath(a.foto_url) ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${a.foto_url}`}
                                    alt={a.nome}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-800">
                                    {a.nome.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span>{a.nome}</span>
                        </label>
                    ))
                )}
            </div>

            <button
                onClick={handleVincular}
                disabled={selecionados.length === 0 || loading}
                className="mt-3 w-full sm:w-auto bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Vincular Selecionados
            </button>
        </div>
    );
}
