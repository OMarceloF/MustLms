// src/pages/GestaoTurma.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarGestor from '../components/Sidebar';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { FormVincularAluno } from './FormVincularAluno';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Loader2, PlusCircle, Trash2, CalendarDays, Pencil } from 'lucide-react';
import { getSafeImagePath } from './utils';

// --- Interfaces (sem alterações) ---
interface Turma {
    id: number;
    nome: string;
    ano_letivo: string;
    professor_responsavel?: string;
    materias: { materiaId: number; nome: string }[];
    curso_nome: string;
    materiaId: number | null;
    semestreId: number | null;
    semestre_nome: string;
}

interface Avaliacao {
    id: number;
    descricao: string;
    valor: number;
    data_inicio: string;
    data_fim: string | null;
}

interface AlunoComNotas {
    aluno_id: number;
    aluno_nome: string;
    aluno_foto: string | null;
    matricula?: string;
    status_aluno?: 'ativo' | 'inativo';
    notas: { avaliacao_id: number; nota: number | null }[];
    media_final: number;
    status: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente';
    nota_recuperacao: number | null;
    nota_final: number; // Este campo já vem do backend, mas vamos recalcular para exibição
}

interface DadosCompletosNotas {
    avaliacoes: Avaliacao[];
    alunosComNotas: AlunoComNotas[];
}

// --- Componente Principal ---
export default function GestorTurma() {
    const { id: turmaId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Estados Gerais
    const [turma, setTurma] = useState<Turma | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // Estados para o Módulo de Notas
    const [dadosNotas, setDadosNotas] = useState<DadosCompletosNotas | null>(null);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAvaliacao, setEditingAvaliacao] = useState<Avaliacao | null>(null);
    const [editableNotas, setEditableNotas] = useState<Record<string, string>>({});

    // --- Função Central de Carregamento de Dados ---
    const fetchDadosCompletos = useCallback(async () => {
        if (!turmaId) return;
        setLoading(true);
        setLoadingNotas(true);

        try {
            const cacheBuster = `?_=${new Date().getTime()}`;
            const turmaResponse = await axios.get<Turma>(`/api/turmas-novo/${turmaId}${cacheBuster}`);
            const turmaData = turmaResponse.data;
            setTurma(turmaData);

            if (turmaData && turmaData.materiaId && turmaData.semestreId) {
                const url = `/api/turmas/${turmaData.id}/disciplinas/${turmaData.materiaId}/periodos/${turmaData.semestreId}/dados-academicos${cacheBuster}`;
                const notasResponse = await axios.get<DadosCompletosNotas>(url);
                setDadosNotas(notasResponse.data);

                const initialEditableNotas: Record<string, string> = {};
                notasResponse.data.alunosComNotas.forEach(aluno => {
                    aluno.notas.forEach(nota => {
                        initialEditableNotas[`${aluno.aluno_id}-${nota.avaliacao_id}`] = nota.nota?.toString() ?? '';
                    });
                    if (aluno.nota_recuperacao !== null) {
                        initialEditableNotas[`${aluno.aluno_id}-rec`] = aluno.nota_recuperacao.toString();
                    }
                });
                setEditableNotas(initialEditableNotas);
            } else {
                setDadosNotas(null);
            }
        } catch (err) {
            setErro('Erro ao carregar informações da turma.');
            toast.error("Falha ao buscar dados da turma ou das notas.");
        } finally {
            setLoading(false);
            setLoadingNotas(false);
        }
    }, [turmaId]);

    useEffect(() => {
        fetchDadosCompletos();
    }, [fetchDadosCompletos]);

    // --- Handlers (sem alterações) ---
    const handleNotaChange = (alunoId: number, avaliacaoId: number | 'rec', value: string) => {
        setEditableNotas(prev => ({ ...prev, [`${alunoId}-${avaliacaoId}`]: value }));
    };

    const handleSalvarNota = async (alunoId: number, avaliacaoId: number | 'rec') => {
        if (!turma?.materiaId || !turmaId) return;
        const notaStr = editableNotas[`${alunoId}-${avaliacaoId}`];
        if (notaStr === undefined) return;

        const nota = notaStr.trim() === '' ? null : parseFloat(notaStr);
        if (notaStr.trim() !== '' && (nota === null || isNaN(nota))) {
            toast.error("Insira um valor numérico válido.");
            return;
        }

        try {
            await axios.post('/api/notas/salvar', {
                aluno_id: alunoId, materia_id: turma.materiaId, turma_id: turmaId,
                avaliacao_id: avaliacaoId !== 'rec' ? avaliacaoId : null,
                nota: nota, tipo_nota: avaliacaoId === 'rec' ? 'recuperacao' : 'regular'
            });
            toast.success("Nota salva!");
            fetchDadosCompletos();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao salvar a nota.");
        }
    };

    const handleSaveAvaliacao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAvaliacao || !turma) return;

        const { id, descricao, valor, data_inicio, data_fim } = editingAvaliacao;

        if (!descricao || !valor || !data_inicio) {
            toast.error("Nome, valor e data de início são obrigatórios.");
            return;
        }

        try {
            const payload = {
                descricao,
                valor: parseFloat(String(valor)),
                data_inicio,
                data_fim: data_fim || null,
            };

            if (id === 0) {
                await axios.post('/api/avaliacoes', {
                    ...payload,
                    calendario_id: turma.semestreId,
                    materia_id: turma.materiaId,
                    turma_id: turmaId,
                });
                toast.success("Avaliação adicionada!");
            } else {
                await axios.put(`/api/avaliacoes/${id}`, payload);
                toast.success("Avaliação atualizada!");
            }

            setIsModalOpen(false);
            setEditingAvaliacao(null);
            fetchDadosCompletos();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao salvar avaliação.");
        }
    };

    const handleOpenModal = (avaliacao: Avaliacao | null) => {
        if (avaliacao) {
            setEditingAvaliacao(avaliacao);
        } else {
            setEditingAvaliacao({ id: 0, descricao: '', valor: 0, data_inicio: '', data_fim: null });
        }
        setIsModalOpen(true);
    };

    const handleRemoverAluno = async (alunoId: number) => {
        if (!window.confirm('Tem certeza que deseja remover este aluno da turma?')) return;
        try {
            await axios.delete(`/api/turmas-novo/${turmaId}/alunos/${alunoId}`);
            toast.success('Aluno removido com sucesso!');
            fetchDadosCompletos();
        } catch (err) { toast.error('Erro ao remover aluno da turma.'); }
    };

    const getStatusClass = (status: AlunoComNotas['status']) => {
        switch (status) {
            case 'Aprovado': return 'bg-green-100 text-green-800';
            case 'Recuperação': return 'bg-yellow-100 text-yellow-800';
            case 'Reprovado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // --- Renderização ---
    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>;
    if (erro || !turma) return <div className="flex items-center justify-center min-h-screen"><p className="text-destructive">{erro || 'Turma não encontrada.'}</p></div>;

    const nomeDisciplinaPrincipal = turma.materias?.[0]?.nome || 'Disciplina não definida';
    const alunosDaTurma = dadosNotas?.alunosComNotas || [];

    return (
        <div className="min-h-screen bg-gray-100 w-full min-w-0 overflow-x-hidden">
            <div className="flex flex-col md:flex-row w-full min-w-0 md:flex">
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
                <div className="flex-1 min-w-0 flex flex-col">
                    <TopbarGestorAuto
                        isMenuOpen={sidebarAberta}
                        setIsMenuOpen={setSidebarAberta}
                    />
                    <div className="p-4 sm:p-6 mt-20 max-w-7xl mx-auto w-full space-y-8">
                        <div className="bg-card rounded-xl shadow-sm p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground mb-1">{turma.nome}: {nomeDisciplinaPrincipal}</h1>
                                    <p className="text-sm font-medium text-primary">{turma.curso_nome}</p>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        <span>Ano/Período: {turma.ano_letivo}/{turma.semestre_nome}</span> | <span>Alunos: {alunosDaTurma.length}</span>
                                        {turma.professor_responsavel && <span> | Prof. Responsável: {turma.professor_responsavel}</span>}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 md:mt-0">
                                    <Button onClick={() => handleOpenModal(null)} disabled={!turma.materiaId || !turma.semestreId}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Avaliação
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl shadow-sm p-6 space-y-6">
                            <h2 className="text-2xl font-bold text-foreground">Painel de Notas</h2>
                            {loadingNotas ? <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : dadosNotas ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Aluno</th>
                                                {dadosNotas.avaliacoes.map(av => (
                                                    <th key={av.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span>{av.descricao} ({av.valor} pts)</span>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenModal(av)}>
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="font-normal normal-case text-gray-400">{new Date(av.data_inicio).toLocaleDateString('pt-BR')}</div>
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Média</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rec.</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Final</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {alunosDaTurma.map(aluno => {
                                                // O aluno tem direito à recuperação se a média final (sem recuperação) o colocou nessa faixa.
                                                const teveDireitoRecuperacao = aluno.media_final >= 40 && aluno.media_final < 60;

                                                return (
                                                    <tr key={aluno.aluno_id}>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">{aluno.aluno_nome}</td>
                                                        {dadosNotas.avaliacoes.map(av => (
                                                            <td key={av.id} className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                                <input type="number" value={editableNotas[`${aluno.aluno_id}-${av.id}`] ?? ''} onChange={e => handleNotaChange(aluno.aluno_id, av.id, e.target.value)} onBlur={() => handleSalvarNota(aluno.aluno_id, av.id)} className="w-20 text-center border rounded-md shadow-sm" max={av.valor} min={0} />
                                                            </td>
                                                        ))}
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold">{aluno.media_final.toFixed(1)}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(aluno.status)}`}>{aluno.status}</span></td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                            {teveDireitoRecuperacao ? (
                                                                <input type="number" value={editableNotas[`${aluno.aluno_id}-rec`] ?? ''} onChange={e => handleNotaChange(aluno.aluno_id, 'rec', e.target.value)} onBlur={() => handleSalvarNota(aluno.aluno_id, 'rec')} className="w-20 text-center border rounded-md shadow-sm bg-yellow-50" max={100} min={0} />
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">{notaFinalExibida.toFixed(1)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center p-8"><p className="text-gray-500">Não há dados de notas para esta turma/período ou a turma não possui disciplina/período definidos.</p></div>
                            )}
                        </div>

                        <div className="bg-card rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4">Alunos Vinculados</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border border-border p-3 text-left font-semibold text-foreground w-16">Foto</th>
                                            <th className="border border-border p-3 text-left font-semibold text-foreground">Nome</th>
                                            <th className="border border-border p-3 text-left font-semibold text-foreground">Matrícula</th>
                                            <th className="border border-border p-3 text-left font-semibold text-foreground">Status</th>
                                            <th className="border border-border p-3 text-center font-semibold text-foreground w-20">Remover</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunosDaTurma.map((aluno) => (
                                            <tr key={aluno.aluno_id} className="hover:bg-muted/50 transition-colors">
                                                <td className="border border-border p-2 align-middle">
                                                    {getSafeImagePath(aluno.aluno_foto ?? undefined) ? (
                                                        <img src={`${import.meta.env.VITE_API_URL}${aluno.aluno_foto}`} alt={aluno.aluno_nome} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">{aluno.aluno_nome.substring(0, 2).toUpperCase()}</div>
                                                    )}
                                                </td>
                                                <td className="border border-border p-3 align-middle font-medium text-foreground">{aluno.aluno_nome}</td>
                                                <td className="border border-border p-3 align-middle text-foreground/80">{aluno.matricula || 'N/A'}</td>
                                                <td className="border border-border p-3 align-middle">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${aluno.status_aluno === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {aluno.status_aluno || 'ativo'}
                                                    </span>
                                                </td>
                                                <td className="border border-border p-2 text-center align-middle">
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoverAluno(aluno.aluno_id)} className="text-destructive hover:text-destructive" title="Remover aluno"><Trash2 size={16} /></Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <FormVincularAluno turmaId={turmaId!} onAlunosVinculados={fetchDadosCompletos} />

                    </div>
                </div>

                {isModalOpen && editingAvaliacao && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">{editingAvaliacao.id === 0 ? 'Adicionar Nova Avaliação' : 'Editar Avaliação'}</h2>
                            <form onSubmit={handleSaveAvaliacao} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nome da Avaliação</label>
                                    <input type="text" value={editingAvaliacao.descricao} onChange={e => setEditingAvaliacao({ ...editingAvaliacao, descricao: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Valor (Pontos)</label>
                                    <input type="number" value={editingAvaliacao.valor} onChange={e => setEditingAvaliacao({ ...editingAvaliacao, valor: Number(e.target.value) })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required min="0" step="0.1" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                                        <input type="date" value={editingAvaliacao.data_inicio} onChange={e => setEditingAvaliacao({ ...editingAvaliacao, data_inicio: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Data de Fim (Opcional)</label>
                                        <input type="date" value={editingAvaliacao.data_fim || ''} onChange={e => setEditingAvaliacao({ ...editingAvaliacao, data_fim: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" onClick={() => { setIsModalOpen(false); setEditingAvaliacao(null); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
