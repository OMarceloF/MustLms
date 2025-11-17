// frontend/src/pages/gestor/Trancamento.tsx

import { useState } from "react";
import { Search, Filter, Eye, Lock, Unlock, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { toast } from "./hooks/use-toast";
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';



type StatusMatricula = "Ativa" | "Trancada";

interface Aluno {
    id: string;
    nome: string;
    matricula: string;
    email: string;
    curso: string;
    turma: string;
    status: StatusMatricula;
    foto?: string;
    curso_nome?: string;
    turma_ingresso_nome?: string; // MODIFICADO: de 'turma_nome' para 'turma_ingresso_nome'
}

// Mock de dados para demonstração
const mockAlunos: Aluno[] = [
    {
        id: "1",
        nome: "Ana Silva Santos",
        matricula: "2024001",
        email: "ana.silva@escola.edu",
        curso: "Engenharia de Software",
        turma: "ES-2024-A",
        status: "Ativa",
    },
    {
        id: "2",
        nome: "Carlos Eduardo Oliveira",
        matricula: "2024002",
        email: "carlos.oliveira@escola.edu",
        curso: "Administração",
        turma: "ADM-2024-B",
        status: "Ativa",
    },
    {
        id: "3",
        nome: "Mariana Costa Lima",
        matricula: "2023015",
        email: "mariana.costa@escola.edu",
        curso: "Design Gráfico",
        turma: "DG-2023-A",
        status: "Trancada",
    },
    {
        id: "4",
        nome: "Pedro Henrique Souza",
        matricula: "2024003",
        email: "pedro.souza@escola.edu",
        curso: "Engenharia de Software",
        turma: "ES-2024-A",
        status: "Ativa",
    },
];

const TrancamentoDeMatriculaPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [cursoFilter, setCursoFilter] = useState("");
    const [turmaFilter, setTurmaFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [alunos, setAlunos] = useState<Aluno[]>(mockAlunos);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [modalType, setModalType] = useState<"trancar" | "reativar" | null>(null);
    const [motivo, setMotivo] = useState("");
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const isProfessor = user.role === 'professor';



    // Filtrar alunos
    const alunosFiltrados = alunos.filter((aluno) => {
        const matchSearch =
            aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase());

        const matchCurso = !cursoFilter || aluno.curso === cursoFilter;
        const matchTurma = !turmaFilter || aluno.turma === turmaFilter;
        const matchStatus = !statusFilter || aluno.status === statusFilter;

        return matchSearch && matchCurso && matchTurma && matchStatus;
    });

    // Extrair valores únicos para os filtros
    const cursos = Array.from(new Set(alunos.map((a) => a.curso)));
    const turmas = Array.from(new Set(alunos.map((a) => a.turma)));

    const handleTrancar = async () => {
        if (!selectedAluno) return;
        setIsLoading(true);

        // Simulação de chamada API
        setTimeout(() => {
            setAlunos((prev) =>
                prev.map((a) => (a.id === selectedAluno.id ? { ...a, status: "Trancada" } : a))
            );
            toast({
                title: "Matrícula trancada",
                description: `A matrícula de ${selectedAluno.nome} foi trancada com sucesso.`,
            });
            closeModal();
            setIsLoading(false);
        }, 1000);
    };

    const handleReativar = async () => {
        if (!selectedAluno) return;
        setIsLoading(true);

        setTimeout(() => {
            setAlunos((prev) =>
                prev.map((a) => (a.id === selectedAluno.id ? { ...a, status: "Ativa" } : a))
            );
            toast({
                title: "Matrícula reativada",
                description: `A matrícula de ${selectedAluno.nome} foi reativada com sucesso.`,
            });
            closeModal();
            setIsLoading(false);
        }, 1000);
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

    return (
        <div className="min-h-screen bg-gray-100 w-full min-w-0 overflow-x-hidden">
            <div className="flex flex-col md:flex-row w-full min-w-0 md:flex">
                {/* Sidebar */}
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page: string) =>
                        navigate('/gestor', { state: { activePage: page } })
                    }
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />

                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Topbar */}
                    <TopbarGestorAuto
                        isMenuOpen={sidebarAberta}
                        setIsMenuOpen={setSidebarAberta}
                    />

                    <div className="w-full min-w-0 max-w-7xl mx-auto p-2 sm:p-6 mt-20 my-10">
                        <div className="mx-auto max-w-6xl bg-card rounded-2xl p-6 sm:p-8 shadow-sm">
                            {/* Cabeçalho */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-semibold text-foreground mb-2">
                                    Trancamento de Matrícula
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Localize e gerencie o status de matrícula dos alunos.
                                </p>
                            </div>

                            {/* Busca e Filtros */}
                            <div className="space-y-4 mb-6">
                                {/* Campo de Busca */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Buscar aluno por nome, e-mail ou matrícula..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                {/* Filtros */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <select
                                            value={cursoFilter}
                                            onChange={(e) => setCursoFilter(e.target.value)}
                                            className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Todos os cursos</option>
                                            {cursos.map((curso) => (
                                                <option key={curso} value={curso}>
                                                    {curso}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <select
                                            value={turmaFilter}
                                            onChange={(e) => setTurmaFilter(e.target.value)}
                                            className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Todas as turmas</option>
                                            {turmas.map((turma) => (
                                                <option key={turma} value={turma}>
                                                    {turma}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full appearance-none rounded-lg border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            <option value="">Todos os status</option>
                                            <option value="Ativa">Ativa</option>
                                            <option value="Trancada">Trancada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tabela Desktop */}
                            <div className="hidden lg:block overflow-x-auto rounded-xl border">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Foto</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Nome</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Matrícula</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Curso</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Turma</th>
                                            <th className="text-left p-4 text-sm font-semibold text-foreground">Status</th>
                                            <th className="text-right p-4 text-sm font-semibold text-foreground">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="p-8">
                                                    <div className="text-center border border-dashed rounded-lg p-6 text-muted-foreground">
                                                        Nenhum aluno encontrado com os filtros aplicados.
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            alunosFiltrados.map((aluno) => (
                                                <tr key={aluno.id} className="border-t hover:bg-muted/50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                            {aluno.nome.charAt(0)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-foreground">{aluno.nome}</div>
                                                        <div className="text-xs text-muted-foreground">{aluno.email}</div>
                                                    </td>
                                                    <td className="p-4 text-sm text-foreground">{aluno.matricula}</td>
                                                    <td className="p-4 text-sm text-foreground">{aluno.curso}</td>
                                                    <td className="p-4 text-sm text-foreground">{aluno.turma}</td>
                                                    <td className="p-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${aluno.status === "Ativa"
                                                                ? "bg-success/10 text-success"
                                                                : "bg-destructive/10 text-destructive"
                                                                }`}
                                                        >
                                                            {aluno.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => navigate(isProfessor ? `/professor/alunos/${aluno.id}/visualizaraluno` : `/gestor/alunos/${aluno.id}/visualizaraluno`, { state: { aluno, todosAlunos: alunos } })}><Eye className="size-4" /></Button>
                                                            {aluno.status === "Ativa" ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openModal(aluno, "trancar")}
                                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Lock className="size-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openModal(aluno, "reativar")}
                                                                    className="text-success hover:text-success hover:bg-success/10"
                                                                >
                                                                    <Unlock className="size-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cards Mobile */}
                            <div className="lg:hidden space-y-4">
                                {alunosFiltrados.length === 0 ? (
                                    <div className="text-center border border-dashed rounded-lg p-6 text-muted-foreground">
                                        Nenhum aluno encontrado com os filtros aplicados.
                                    </div>
                                ) : (
                                    alunosFiltrados.map((aluno) => (
                                        <div key={aluno.id} className="rounded-lg border bg-card p-4 shadow-sm">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                                                    {aluno.nome.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-foreground truncate">{aluno.nome}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{aluno.email}</div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${aluno.status === "Ativa"
                                                        ? "bg-success/10 text-success"
                                                        : "bg-destructive/10 text-destructive"
                                                        }`}
                                                >
                                                    {aluno.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                <div>
                                                    <span className="text-muted-foreground">Matrícula:</span>{" "}
                                                    <span className="text-foreground">{aluno.matricula}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Turma:</span>{" "}
                                                    <span className="text-foreground">{aluno.turma}</span>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-muted-foreground">Curso:</span>{" "}
                                                    <span className="text-foreground">{aluno.curso}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Eye className="size-4 mr-1" />
                                                    Visualizar
                                                </Button>
                                                {aluno.status === "Ativa" ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openModal(aluno, "trancar")}
                                                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                                    >
                                                        <Lock className="size-4 mr-1" />
                                                        Trancar
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openModal(aluno, "reativar")}
                                                        className="flex-1 text-success hover:text-success hover:bg-success/10 border-success/20"
                                                    >
                                                        <Unlock className="size-4 mr-1" />
                                                        Reativar
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Modal de Trancamento/Reativação */}
                        {modalType && selectedAluno && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-card rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-lg">
                                    <div className="flex items-start gap-4 mb-4">
                                        {modalType === "trancar" ? (
                                            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="size-6 text-destructive" />
                                            </div>
                                        ) : (
                                            <div className="size-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="size-6 text-success" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-foreground mb-1">
                                                {modalType === "trancar" ? "Confirmar Trancamento" : "Reativar Matrícula"}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {modalType === "trancar"
                                                    ? `Deseja realmente trancar a matrícula de ${selectedAluno.nome}? Essa ação pode ser revertida posteriormente.`
                                                    : `Deseja reativar a matrícula de ${selectedAluno.nome}?`}
                                            </p>
                                        </div>
                                        <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                                            <X className="size-5" />
                                        </button>
                                    </div>

                                    {modalType === "trancar" && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Motivo do trancamento (opcional)
                                            </label>
                                            <textarea
                                                value={motivo}
                                                onChange={(e) => setMotivo(e.target.value)}
                                                placeholder="Descreva o motivo do trancamento..."
                                                rows={4}
                                                className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={closeModal} className="flex-1" disabled={isLoading}>
                                            Cancelar
                                        </Button>
                                        {modalType === "trancar" ? (
                                            <Button
                                                onClick={handleTrancar}
                                                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                                        Trancando...
                                                    </>
                                                ) : (
                                                    "Confirmar Trancamento"
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleReativar}
                                                className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                                        Reativando...
                                                    </>
                                                ) : (
                                                    "Reativar"
                                                )}
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
