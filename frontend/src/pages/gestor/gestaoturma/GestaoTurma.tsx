import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarGestor from '../components/Sidebar';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { FormVincularAluno } from './FormVincularAluno';
import { FormVisualizarAlunos } from './FormVisualizarAlunos';
import { FormBoletim } from './FormBoletim';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';

// Interface para um único aluno, conforme a API
interface Aluno {
    id: number;
    nome: string;
    matricula: string;
    role: string;
    foto_url?: string;
}

// Interface para os dados completos da turma, conforme a API
interface Turma {
    id: number;
    nome: string;
    ano_letivo: string;
    qtd_alunos: number;
    professor_responsavel?: string;
    serie?: string; // Mapeado de curso_nome
    turno?: string; // Mapeado de modalidade
    alunos: Aluno[];
    materias: { materiaId: number; nome: string }[];
}

export default function GestorTurma() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [turma, setTurma] = useState<Turma | null>(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    // O ID da matéria agora é derivado diretamente dos dados da turma
    const materiaId = turma?.materias?.[0]?.materiaId;
    const [sidebarAberta, setSidebarAberta] = useState(false);

    const isProfessor = user?.role === 'professor';

    // Função centralizada para buscar todos os dados da turma.
    const fetchTurma = useCallback(async () => {
        if (!id) return;
        try {
            const { data } = await axios.get(`/api/turmas-novo/${id}`);
            setTurma(data);
        } catch (err) {
            console.error('Erro ao carregar turma:', err);
            setErro('Erro ao carregar informações da turma.');
            toast.error('Erro ao carregar informações da turma.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Busca inicial dos dados da turma
    useEffect(() => {
        setLoading(true);
        fetchTurma();
    }, [fetchTurma]);

    // Função de callback para atualizar a página
    const handleAlunosUpdate = () => {
        fetchTurma();
    };

    // Funções de navegação atualizadas
    const handleNotas = () => {
        if (!materiaId) {
            toast.error('Nenhuma matéria encontrada para esta turma.');
            return;
        }
        const base = isProfessor ? '/professor' : '/gestor';
        navigate(`${base}/turmas/${id}/materias/${materiaId}/avaliacoes-notas`);
    };

    const handleDiario = () => {
        if (!materiaId) {
            toast.error('Nenhuma matéria encontrada para esta turma.');
            return;
        }
        const base = isProfessor ? '/professor' : '/gestor';
        navigate(`${base}/turmas/${id}/materias/${materiaId}/diario`);
    };

    // Renderização de estados de carregamento e erro
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/30">
                <div className="text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    <p className="mt-2 font-medium text-muted-foreground">Carregando turma...</p>
                </div>
            </div>
        );
    }

    if (erro) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/30">
                <p className="text-lg font-semibold text-destructive">{erro}</p>
            </div>
        );
    }

    if (!turma) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/30">
                <p className="text-lg text-muted-foreground">Turma não encontrada.</p>
            </div>
        );
    }

    // Renderização principal
    return (
        <div className="flex min-h-screen bg-muted/30">
            <SidebarGestor
                isMenuOpen={sidebarAberta}
                setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })}
                handleMouseEnter={() => setSidebarAberta(true)}
                handleMouseLeave={() => setSidebarAberta(false)}
            />

            <div className="flex-1 min-w-0 flex flex-col">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

                {/* Estrutura de layout original mantida */}
                <div className="p-6 mt-20 max-w-6xl mx-auto w-full space-y-10">
                    {/* Cabeçalho com novas cores */}
                    <div className="bg-card rounded-xl shadow-sm p-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground mb-2">{turma.nome}</h1>
                                <p className="text-muted-foreground"><strong>Ano Letivo:</strong> {turma.ano_letivo}</p>
                                <p className="text-muted-foreground"><strong>Qtd. de Alunos:</strong> {turma.alunos.length}</p>
                                {turma.professor_responsavel && (
                                    <p className="text-muted-foreground"><strong>Professor Responsável:</strong> {turma.professor_responsavel}</p>
                                )}
                            </div>

                            {/* Botões de ação com o novo componente Button */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <Button
                                    onClick={handleNotas}
                                    disabled={!materiaId}
                                >
                                    Avaliações & Notas
                                </Button>

                                <Button
                                    variant="secondary"
                                    onClick={handleDiario}
                                    disabled={!materiaId}
                                >
                                    Ver Diário
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Forms principais (a estrutura que os envolve é a mesma) */}
                    <FormVisualizarAlunos
                        turmaId={id!}
                        initialAlunos={turma.alunos}
                        onAlunoRemovido={handleAlunosUpdate}
                    />
                    <FormVincularAluno
                        turmaId={id!}
                        onAlunosVinculados={handleAlunosUpdate}
                    />
                    <FormBoletim turmaId={id!} />

                    {/* Botão voltar com o novo componente Button */}
                    <div className="flex justify-end mt-10">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/gestor', { state: { activePage: 'turmas' } })}
                        >
                            Voltar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
