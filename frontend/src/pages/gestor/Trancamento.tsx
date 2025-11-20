// frontend/src/pages/gestor/Trancamento.tsx

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Eye, Lock, Unlock, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { useToast } from "./hooks/use-toast";
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type StatusMatricula = "Ativa" | "Trancada" | "Inativo";

// Interface atualizada para incluir o ID único do vínculo
interface Aluno {
    id: string;
    vinculoId: number | null; // ID único da tabela vincular_aluno_curso
    nome: string;
    matricula: string;
    email: string;
    curso: string;
    turma: string;
    status: StatusMatricula | null;
    foto?: string;
}

const TrancamentoDeMatriculaPage = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [cursoFilter, setCursoFilter] = useState("");
    const [turmaFilter, setTurmaFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [modalType, setModalType] = useState<"trancar" | "reativar" | null>(null);
    const [motivo, setMotivo] = useState("");
    const [sidebarAberta, setSidebarAberta] = useState(false);

    const isProfessor = user?.role === 'professor';

    useEffect(() => {
        const fetchAlunos = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/trancamento/alunos');
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados dos alunos.');
                }
                const data: Aluno[] = await response.json();
                setAlunos(data);
            } catch (error) {
                console.error(error);
                toast({
                    title: "Erro ao carregar alunos",
                    description: "Não foi possível buscar a lista de alunos. Tente novamente mais tarde.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlunos();
    }, [toast]);

    const alunosFiltrados = useMemo(() => alunos.filter((aluno) => {
        const statusReal = aluno.status || (aluno.curso !== 'Não vinculado' ? 'Ativa' : null);

        const matchSearch =
            (aluno.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (aluno.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (aluno.matricula || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchCurso = !cursoFilter || aluno.curso === cursoFilter;
        const matchTurma = !turmaFilter || aluno.turma === turmaFilter;
        const matchStatus = !statusFilter || statusReal === statusFilter;

        return matchSearch && matchCurso && matchTurma && matchStatus;
    }), [alunos, searchTerm, cursoFilter, turmaFilter, statusFilter]);

    const cursos = useMemo(() => Array.from(new Set(alunos.map((a) => a.curso).filter(c => c !== 'Não vinculado'))), [alunos]);
    const turmas = useMemo(() => Array.from(new Set(alunos.map((a) => a.turma).filter(t => t !== 'Não vinculada'))), [alunos]);

    const handleUpdateStatus = async (novoStatus: "Trancada" | "Ativa") => {
        if (!selectedAluno || !selectedAluno.vinculoId) {
            toast({ title: "Erro na Operação", description: "ID do vínculo da matrícula não foi encontrado.", variant: "destructive" });
            return;
        }
        setIsUpdating(true);

        try {
            // CORREÇÃO: A URL da API agora usa o ID do vínculo para garantir a precisão
            const response = await fetch(`/api/trancamento/vinculos/${selectedAluno.vinculoId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: novoStatus,
                    motivo: novoStatus === 'Trancada' ? motivo : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Falha ao ${novoStatus === 'Trancada' ? 'trancar' : 'reativar'} matrícula.`);
            }

            // CORREÇÃO: Atualiza o estado local usando o vinculoId para identificar a linha correta
            setAlunos((prev) =>
                prev.map((a) => (a.vinculoId === selectedAluno.vinculoId ? { ...a, status: novoStatus } : a))
            );

            toast({
                title: `Matrícula ${novoStatus === 'Trancada' ? 'trancada' : 'reativada'}`,
                description: `A matrícula de ${selectedAluno.nome} para o curso ${selectedAluno.curso} foi atualizada.`,
            });

            closeModal();
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro na operação",
                description: error.message || "Ocorreu um erro. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const openModal = (aluno: Aluno, type: "trancar" | "reativar") => {
        setSelectedAluno(aluno);
        setModalType(type);
        setMotivo("");
    };

    const closeModal = () => {
        setSelectedAluno(null);
        setModalType(null);
        setMotivo("");
    };

    if (authLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

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

                    <div className="w-full min-w-0 max-w-7xl mx-auto p-2 sm:p-6 mt-20 my-10">
                        <div className="mx-auto max-w-6xl bg-card rounded-2xl p-6 sm:p-8 shadow-sm">
                            <div className="mb-8">
                                <h1 className="text-3xl font-semibold text-foreground mb-2">Trancamento de Matrícula</h1>
                                <p className="text-sm text-muted-foreground">Localize e gerencie o status de matrícula dos alunos.</p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="text" placeholder="Buscar aluno por nome, e-mail ou matrícula..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <select value={cursoFilter} onChange={(e) => setCursoFilter(e.target.value)} className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                            <option value="">Todos os cursos</option>
                                            {cursos.map((curso) => (<option key={curso} value={curso}>{curso}</option>))}
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1_2 size-4 text-muted-foreground pointer-events-none" />
                                        <select value={turmaFilter} onChange={(e) => setTurmaFilter(e.target.value)} className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                            <option value="">Todas as turmas</option>
                                            {turmas.map((turma) => (<option key={turma} value={turma}>{turma}</option>))}
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                                            <option value="">Todos os status</option>
                                            <option value="Ativa">Ativa</option>
                                            <option value="Trancada">Trancada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="text-left p-4 text-sm font-semibold text-foreground">Aluno</th>
                                                <th className="text-left p-4 text-sm font-semibold text-foreground">Matrícula</th>
                                                <th className="text-left p-4 text-sm font-semibold text-foreground">Curso</th>
                                                <th className="text-left p-4 text-sm font-semibold text-foreground">Turma</th>
                                                <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                                                <th className="text-right p-4 text-sm font-semibold text-foreground">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alunosFiltrados.length === 0 ? (
                                                <tr><td colSpan={6} className="p-8"><div className="text-center border border-dashed rounded-lg p-6 text-muted-foreground">Nenhum aluno encontrado.</div></td></tr>
                                            ) : (
                                                alunosFiltrados.map((aluno, index) => {
                                                    const statusReal = aluno.status || (aluno.curso !== 'Não vinculado' ? 'Ativa' : null);
                                                    if (!aluno.vinculoId) return null; // Não renderiza linhas sem vínculo de curso

                                                    return (
                                                        <tr key={`${aluno.id}-${aluno.vinculoId}`} className="border-t hover:bg-muted/50 transition-colors">
                                                            <td className="p-4 flex items-center gap-3">
                                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                                    {aluno.foto ? <img src={aluno.foto} alt={aluno.nome} className="rounded-full w-full h-full object-cover" /> : aluno.nome.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium text-foreground">{aluno.nome}</div>
                                                                    <div className="text-xs text-muted-foreground">{aluno.email}</div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4 text-sm text-foreground">{aluno.matricula}</td>
                                                            <td className="p-4 text-sm text-foreground">{aluno.curso}</td>
                                                            <td className="p-4 text-sm text-foreground">{aluno.turma}</td>
                                                            <td className="p-4">
                                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusReal === "Ativa" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                                    {statusReal}
                                                                </span>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button variant="ghost" size="icon" onClick={() => navigate(isProfessor ? `/professor/alunos/${aluno.id}/visualizaraluno` : `/gestor/alunos/${aluno.id}/visualizaraluno`, { state: { aluno, todosAlunos: alunos } })}><Eye className="size-4" /></Button>
                                                                    {statusReal === "Ativa" ? (
                                                                        <Button variant="ghost" size="sm" onClick={() => openModal(aluno, "trancar")} className="text-destructive hover:text-destructive hover:bg-destructive/10"><Lock className="size-4" /></Button>
                                                                    ) : (
                                                                        <Button variant="ghost" size="sm" onClick={() => openModal(aluno, "reativar")} className="text-green-600 hover:text-green-700 hover:bg-green-50"><Unlock className="size-4" /></Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {modalType && selectedAluno && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-card rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-lg">
                                    <div className="flex items-start gap-4 mb-4">
                                        {modalType === "trancar" ? (
                                            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0"><AlertCircle className="size-6 text-destructive" /></div>
                                        ) : (
                                            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"><CheckCircle className="size-6 text-green-600" /></div>
                                        )}
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-foreground mb-1">{modalType === "trancar" ? "Confirmar Trancamento" : "Reativar Matrícula"}</h2>
                                            <p className="text-sm text-muted-foreground">{modalType === "trancar" ? `Deseja realmente trancar a matrícula de ${selectedAluno.nome} no curso ${selectedAluno.curso}?` : `Deseja reativar a matrícula de ${selectedAluno.nome}?`}</p>
                                        </div>
                                        <button onClick={closeModal} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
                                    </div>
                                    {modalType === "trancar" && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-foreground mb-2">Motivo do trancamento (opcional)</label>
                                            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva o motivo do trancamento..." rows={4} className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={closeModal} className="flex-1" disabled={isUpdating}>Cancelar</Button>
                                        {modalType === "trancar" ? (
                                            <Button onClick={() => handleUpdateStatus("Trancada")} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isUpdating}>
                                                {isUpdating ? <><Loader2 className="size-4 mr-2 animate-spin" />Trancando...</> : "Confirmar Trancamento"}
                                            </Button>
                                        ) : (
                                            <Button onClick={() => handleUpdateStatus("Ativa")} className="flex-1 bg-green-600 text-white hover:bg-green-700" disabled={isUpdating}>
                                                {isUpdating ? <><Loader2 className="size-4 mr-2 animate-spin" />Reativando...</> : "Reativar"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrancamentoDeMatriculaPage;
