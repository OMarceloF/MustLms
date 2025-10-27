"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Checkbox } from "../components/ui/checkbox"
import { useToast } from "../hooks/use-toast"
import SidebarGestor from '../../gestor/components/Sidebar';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { useAuth } from '../../../hooks/useAuth';

// --- TIPAGEM (sem alterações) ---
type TipoCurso = "Graduação" | "Pós" | "Mestrado" | "Doutorado"

type Curso = {
    id: number
    nome: string
    tipo: TipoCurso
}

type Materia = {
    id: number
    nome: string
    codigo: string
    cargaHoraria: number
}

type Periodo = {
    id: number
    nome: string
    materias: Materia[]
}

type GradeCurricular = {
    id: number
    curso: Curso
    periodoAcademico: string
    periodos: Periodo[]
}

// --- MOCKS ADICIONADOS AQUI ---

const mockCursos: Curso[] = [
    { id: 1, nome: "Ciência da Computação", tipo: "Graduação" },
    { id: 2, nome: "Engenharia de Software", tipo: "Graduação" },
    { id: 3, nome: "Inteligência Artificial", tipo: "Pós" },
    { id: 4, nome: "Design Digital", tipo: "Graduação" },
];

const mockMaterias: Materia[] = [
    { id: 101, nome: "Cálculo I", codigo: "MAT101", cargaHoraria: 60 },
    { id: 102, nome: "Algoritmos e Estruturas de Dados I", codigo: "COMP102", cargaHoraria: 80 },
    { id: 103, nome: "Introdução à Programação", codigo: "COMP101", cargaHoraria: 60 },
    { id: 201, nome: "Banco de Dados", codigo: "COMP201", cargaHoraria: 60 },
    { id: 202, nome: "Engenharia de Requisitos", codigo: "ENG202", cargaHoraria: 40 },
    { id: 203, nome: "Teoria da Computação", codigo: "COMP203", cargaHoraria: 60 },
    { id: 301, nome: "Redes de Computadores", codigo: "COMP301", cargaHoraria: 60 },
    { id: 401, nome: "Inteligência Artificial", codigo: "COMP401", cargaHoraria: 80 },
];

// --- FUNÇÕES DE API SIMULADAS (MOCKADAS) ---

// Simula um atraso da rede
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getCursos(): Promise<Curso[]> {
    await delay(300);
    return mockCursos;
}

async function getMaterias(): Promise<Materia[]> {
    await delay(400);
    return mockMaterias;
}

async function createGrade(grade: Omit<GradeCurricular, "id">): Promise<GradeCurricular> {
    await delay(1000); // Simula o tempo de salvamento

    // Simula a criação de um novo ID pela API
    const newId = Math.floor(Math.random() * 1000) + 100;
    const novaGrade = { ...grade, id: newId };

    console.log("--- NOVA GRADE CRIADA (MOCK) ---");
    console.log(JSON.stringify(novaGrade, null, 2));

    // Normalmente, você adicionaria a `novaGrade` à sua lista de mocks
    // para que ela apareça na página de listagem, mas isso é opcional.

    return novaGrade;
}

// --- COMPONENTE REACT (sem alterações na lógica principal) ---

export default function NovaGradePage() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // --- VARIÁVEIS DE CONTROLE DE UI ---
    const isGestor = currentUser?.role === 'gestor';
    const isPerfilPrincipal = String(currentUser?.id) === id;
    const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
    const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');
    const showSidebarAluno = currentUser?.role === 'aluno';

    const navigate = useNavigate();
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [cursos, setCursos] = useState<Curso[]>([])
    const [materias, setMaterias] = useState<Materia[]>([])

    const [cursoId, setCursoId] = useState("")
    const [periodoAcademico, setPeriodoAcademico] = useState("")
    const [periodos, setPeriodos] = useState<Periodo[]>([])
    const [nextPeriodoId, setNextPeriodoId] = useState(1)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            // Mostra o loading apenas para o carregamento inicial dos dados
            setLoading(true);
            const [cursosData, materiasData] = await Promise.all([getCursos(), getMaterias()])
            setCursos(cursosData)
            setMaterias(materiasData)
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao carregar dados",
                variant: "destructive",
            })
        } finally {
            setLoading(false);
        }
    }

    const adicionarPeriodo = () => {
        const novoPeriodo: Periodo = {
            id: nextPeriodoId,
            nome: `${nextPeriodoId}º Período`,
            materias: [],
        }
        setPeriodos((prev) => [...prev, novoPeriodo])
        setNextPeriodoId((prev) => prev + 1)

        toast({
            title: "Período adicionado",
            description: `${novoPeriodo.nome} foi adicionado com sucesso`,
        })
    }

    const removerPeriodo = (periodoId: number) => {
        if (periodos.length === 1 && periodos[0].materias.length === 0) {
            setPeriodos([]);
            setNextPeriodoId(1);
            return;
        }

        setPeriodos((prev) => prev.filter((p) => p.id !== periodoId))

        toast({
            title: "Período removido",
            description: "O período foi removido com sucesso",
        })
    }

    const getCargaHorariaPeriodo = (periodo: Periodo) => {
        return periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0)
    }

    const toggleMateria = (periodoId: number, materia: Materia) => {
        setPeriodos((prev) =>
            prev.map((periodo) => {
                if (periodo.id !== periodoId) return periodo

                const hasMateria = periodo.materias.some((m) => m.id === materia.id)
                return {
                    ...periodo,
                    materias: hasMateria ? periodo.materias.filter((m) => m.id !== materia.id) : [...periodo.materias, materia],
                }
            }),
        )
    }

    const getTotalCargaHoraria = () => {
        return periodos.reduce((total, periodo) => {
            return total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0)
        }, 0)
    }

    const handleSubmit = async () => {
        if (!cursoId || !periodoAcademico) {
            toast({
                title: "Atenção",
                description: "Preencha todos os campos obrigatórios",
                variant: "destructive",
            })
            return
        }

        if (periodos.length === 0 || periodos.every(p => p.materias.length === 0)) {
            toast({
                title: "Atenção",
                description: "Adicione pelo menos uma matéria a um período",
                variant: "destructive",
            })
            return
        }

        // Mostra o loading durante o salvamento
        setLoading(true);
        try {
            const cursoSelecionado = cursos.find((c) => c.id.toString() === cursoId)
            if (!cursoSelecionado) throw new Error("Curso não encontrado")

            await createGrade({
                curso: cursoSelecionado,
                periodoAcademico,
                periodos,
            })

            toast({
                title: "Sucesso",
                description: "Grade criada com sucesso! (Mock)",
            })

            navigate("/gestor/grade")
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao criar grade (Mock)",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden pl-4 ${showSidebar || showSidebarAluno ? 'md:pl-15' : 'md:pl-0'}`}>
            {/* Agora 'navigate' está definida e pode ser passada como prop */}
            {showSidebar && (
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}

            <div className="flex-1 px-4 py-6 pt-16 md:pt-20">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
                <div className="min-h-screen bg-slate-50">            <div className="container mx-auto max-w-7xl p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-balance">Nova Grade Curricular</h1>
                        <p className="mt-2 text-muted-foreground text-pretty">
                            Crie uma nova grade curricular selecionando o curso, período e matérias.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border p-6 space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Curso <span className="text-destructive">*</span>
                                </label>
                                <Select value={cursoId} onValueChange={setCursoId} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um curso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cursos.map((curso) => (
                                            <SelectItem key={curso.id} value={curso.id.toString()}>
                                                {curso.nome} ({curso.tipo})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Período Acadêmico <span className="text-destructive">*</span>
                                </label>
                                <Select value={periodoAcademico} onValueChange={setPeriodoAcademico} disabled={loading}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024.1">2024.1</SelectItem>
                                        <SelectItem value="2024.2">2024.2</SelectItem>
                                        <SelectItem value="2025.1">2025.1</SelectItem>
                                        <SelectItem value="2025.2">2025.2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Total Workload */}
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-sm font-medium">
                                Carga Horária Total: <span className="text-lg font-bold">{getTotalCargaHoraria()}h</span>
                            </p>
                        </div>

                        {/* Periods */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Organização das Matérias por Período</h3>
                                <Button onClick={adicionarPeriodo} size="sm" variant="outline" disabled={loading}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Período
                                </Button>
                            </div>

                            {periodos.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                                    <p className="text-muted-foreground mb-4">Nenhum período adicionado ainda</p>
                                    <Button onClick={adicionarPeriodo} variant="outline" disabled={loading}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Adicionar Primeiro Período
                                    </Button>
                                </div>
                            ) : (
                                <Accordion type="single" collapsible className="w-full" defaultValue="periodo-1">
                                    {periodos.map((periodo) => (
                                        <AccordionItem key={periodo.id} value={`periodo-${periodo.id}`}>
                                            <AccordionTrigger className="hover:no-underline">
                                                <div className="flex justify-between items-center w-full pr-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-medium">{periodo.nome}</span>
                                                        <span className="text-sm text-muted-foreground">{getCargaHorariaPeriodo(periodo)}h</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-muted-foreground">{periodo.materias.length} matérias</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                removerPeriodo(periodo.id)
                                                            }}
                                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            disabled={loading}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-2 pt-2">
                                                    {materias.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground text-center py-4">Nenhuma matéria disponível</p>
                                                    ) : (
                                                        materias.map((materia) => {
                                                            const isSelected = periodo.materias.some((m) => m.id === materia.id)
                                                            return (
                                                                <div
                                                                    key={materia.id}
                                                                    className="flex items-center space-x-3 p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors"
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => toggleMateria(periodo.id, materia)}
                                                                        disabled={loading}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium">{materia.nome}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Código: {materia.codigo} • Carga Horária: {materia.cargaHoraria}h
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Grade"}
                            </Button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}
