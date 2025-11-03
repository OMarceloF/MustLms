import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { getSafeImagePath } from './utils';
// <<--- PASSO 1: Importar componentes de UI e ícones --->>
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Loader2 } from 'lucide-react';

// ... (Interfaces e props permanecem as mesmas) ...
interface AlunoDisponivel {
    id: number;
    nome: string;
    foto_url?: string;
}

interface FormVincularAlunoProps {
    turmaId: string;
    onAlunosVinculados: () => void;
}

export function FormVincularAluno({ turmaId, onAlunosVinculados }: FormVincularAlunoProps) {
    const [alunosDisponiveis, setAlunosDisponiveis] = useState<AlunoDisponivel[]>([]);
    const [busca, setBusca] = useState('');
    const [selecionados, setSelecionados] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

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

    useEffect(() => {
        fetchAlunosDisponiveis();
    }, [fetchAlunosDisponiveis]);

    const alunosFiltrados = alunosDisponiveis.filter(a =>
        a.nome.toLowerCase().includes(busca.toLowerCase())
    );

    const toggleSelect = (id: number) => {
        setSelecionados(prev =>
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    const handleVincular = async () => {
        if (selecionados.length === 0) {
            toast.error('Selecione pelo menos um aluno para vincular.');
            return;
        }
        try {
            await axios.post(`/api/turmas-novo/${turmaId}/adicionar-alunos`, { alunos: selecionados });
            toast.success('Alunos vinculados com sucesso!');
            setSelecionados([]);
            onAlunosVinculados();
            fetchAlunosDisponiveis();
        } catch (error) {
            toast.error('Ocorreu um erro ao vincular os alunos.');
            console.error('Erro ao vincular alunos:', error);
        }
    };

    // <<--- PASSO 2: Aplicar novo design ao JSX --->>
    return (
        <div className="bg-card rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Vincular Alunos</h2>

            {/* Input de busca com novo estilo */}
            <Input
                type="text"
                placeholder="Buscar aluno para vincular..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="mb-3"
            />

            {/* Lista de alunos com novo estilo */}
            <div className="max-h-52 overflow-y-auto rounded-md border p-2 space-y-1">
                {loading ? (
                    <div className="flex items-center justify-center p-4 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Carregando...</span>
                    </div>
                ) : alunosFiltrados.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum aluno disponível para vincular.</p>
                ) : (
                    alunosFiltrados.map(a => (
                        <label
                            key={a.id}
                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${selecionados.includes(a.id)
                                    ? 'bg-primary/10 ring-1 ring-primary' // Estilo para item selecionado
                                    : 'hover:bg-muted'
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
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground">
                                    {a.nome.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <span className="font-medium text-foreground">{a.nome}</span>
                        </label>
                    ))
                )}
            </div>

            {/* Botão de vincular com novo estilo */}
            <Button
                onClick={handleVincular}
                disabled={selecionados.length === 0 || loading}
                className="mt-4 w-full sm:w-auto"
            >
                Vincular {selecionados.length > 0 ? selecionados.length : ''} {selecionados.length === 1 ? 'Aluno' : selecionados.length > 1 ? 'Alunos' : ''}
            </Button>
        </div>
    );
}
