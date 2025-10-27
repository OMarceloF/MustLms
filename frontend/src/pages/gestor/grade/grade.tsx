"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import { useToast } from "../hooks/use-toast"
import { useNavigate, useParams } from "react-router-dom";
import { ViewGradeModal } from "./visualizar-grade"
import { EditGradeModal } from "./edit-grade"
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

export type GradeCurricular = {
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
];

const mockMaterias: Materia[] = [
    { id: 101, nome: "Cálculo I", codigo: "MAT101", cargaHoraria: 60 },
    { id: 102, nome: "Algoritmos e Estruturas de Dados", codigo: "COMP102", cargaHoraria: 80 },
    { id: 103, nome: "Arquitetura de Computadores", codigo: "COMP103", cargaHoraria: 60 },
    { id: 201, nome: "Banco de Dados", codigo: "COMP201", cargaHoraria: 60 },
    { id: 202, nome: "Engenharia de Requisitos", codigo: "ENG202", cargaHoraria: 40 },
];

let mockGrades: GradeCurricular[] = [
    {
        id: 1,
        curso: mockCursos[0], // Ciência da Computação
        periodoAcademico: "2024.1",
        periodos: [
            { id: 1, nome: "1º Período", materias: [mockMaterias[0], mockMaterias[1]] },
            { id: 2, nome: "2º Período", materias: [mockMaterias[2]] },
        ],
    },
    {
        id: 2,
        curso: mockCursos[1], // Engenharia de Software
        periodoAcademico: "2024.1",
        periodos: [
            { id: 1, nome: "1º Período", materias: [mockMaterias[0], mockMaterias[4]] },
        ],
    },
    {
        id: 3,
        curso: mockCursos[0], // Ciência da Computação
        periodoAcademico: "2024.2",
        periodos: [
            { id: 3, nome: "3º Período", materias: [mockMaterias[3]] },
        ],
    },
];

// --- FUNÇÕES DE API SIMULADAS (MOCKADAS) ---

// Simula um atraso da rede
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getGrades(params?: { curso?: string; periodo?: string }): Promise<GradeCurricular[]> {
    await delay(500); // Simula o tempo de carregamento da rede
    console.log("Buscando grades com filtros:", params);

    let gradesFiltradas = [...mockGrades];

    if (params?.curso && params.curso !== "all") {
        gradesFiltradas = gradesFiltradas.filter(g => g.curso.id.toString() === params.curso);
    }
    if (params?.periodo && params.periodo !== "all") {
        gradesFiltradas = gradesFiltradas.filter(g => g.periodoAcademico === params.periodo);
    }

    return gradesFiltradas;
}

async function getCursos(): Promise<Curso[]> {
    await delay(300);
    return [...mockCursos];
}

async function deleteGrade(id: number): Promise<void> {
    await delay(500);
    const index = mockGrades.findIndex(g => g.id === id);
    if (index === -1) {
        throw new Error("Grade não encontrada para deletar");
    }
    mockGrades = mockGrades.filter(g => g.id !== id);
    console.log("Grades restantes após deleção:", mockGrades);
}

// --- COMPONENTE REACT (sem alterações na lógica principal) ---

export default function GradeCurricularPage() {
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

    const [grades, setGrades] = useState<GradeCurricular[]>([])
    const [cursos, setCursos] = useState<Curso[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [cursoFilter, setCursoFilter] = useState<string>("")
    const [periodoFilter, setPeriodoFilter] = useState<string>("")

    // Modals
    const [viewGrade, setViewGrade] = useState<GradeCurricular | null>(null)
    const [editGrade, setEditGrade] = useState<GradeCurricular | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<GradeCurricular | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            // As chamadas continuam iguais, mas agora usam as funções mockadas
            const [gradesData, cursosData] = await Promise.all([getGrades(), getCursos()])
            setGrades(gradesData)
            setCursos(cursosData)
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        try {
            setLoading(true)
            const params: { curso?: string; periodo?: string } = {}
            if (cursoFilter) params.curso = cursoFilter
            if (periodoFilter) params.periodo = periodoFilter

            const data = await getGrades(params)
            setGrades(data)
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao pesquisar grades",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClearFilters = () => {
        setCursoFilter("")
        setPeriodoFilter("")
        loadData()
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return

        try {
            await deleteGrade(deleteConfirm.id)
            toast({
                title: "Sucesso",
                description: "Grade excluída com sucesso",
            })
            setDeleteConfirm(null)
            loadData() // Recarrega os dados (da lista de mocks)
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao excluir grade",
                variant: "destructive",
            })
        }
    }

    const getTotalMaterias = (grade: GradeCurricular) => {
        return grade.periodos.reduce((total, periodo) => total + periodo.materias.length, 0)
    }

    const getTotalCargaHoraria = (grade: GradeCurricular) => {
        return grade.periodos.reduce((total, periodo) => {
            return total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0)
        }, 0)
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
                <div className="min-h-screen bg-slate-50">
                    <div className="container mx-auto max-w-7xl p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-balance">Gestão de Grades Curriculares</h1>
                            <p className="mt-2 text-muted-foreground text-pretty">
                                Pesquise, visualize e gerencie as grades curriculares da instituição.
                            </p>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg border p-6 mb-6">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Curso</label>
                                        <Select value={cursoFilter} onValueChange={setCursoFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um curso" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os cursos</SelectItem>
                                                {cursos.map((curso) => (
                                                    <SelectItem key={curso.id} value={curso.id.toString()}>
                                                        {curso.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Período</label>
                                        <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um período" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os períodos</SelectItem>
                                                <SelectItem value="2024.1">2024.1</SelectItem>
                                                <SelectItem value="2024.2">2024.2</SelectItem>
                                                <SelectItem value="2025.1">2025.1</SelectItem>
                                                <SelectItem value="2025.2">2025.2</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <Button onClick={handleSearch} className="flex-1">
                                            <Search className="mr-2 h-4 w-4" />
                                            Pesquisar
                                        </Button>
                                        <Button onClick={handleClearFilters} variant="outline">
                                            Limpar
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => navigate("/gestor/grade/nova")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Grade Curricular
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Curso</TableHead>
                                        <TableHead>Período</TableHead>
                                        <TableHead>Quantidade de Matérias</TableHead>
                                        <TableHead>Carga Horária Total</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Carregando...
                                            </TableCell>
                                        </TableRow>
                                    ) : grades.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Nenhuma grade encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        grades.map((grade) => (
                                            <TableRow key={grade.id}>
                                                <TableCell className="font-medium">{grade.curso.nome}</TableCell>
                                                <TableCell>{grade.periodoAcademico}</TableCell>
                                                <TableCell>{getTotalMaterias(grade)}</TableCell>
                                                <TableCell>{getTotalCargaHoraria(grade)}h</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => setViewGrade(grade)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setEditGrade(grade)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(grade)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* View Modal */}
                        {viewGrade && <ViewGradeModal grade={viewGrade} open={!!viewGrade} onClose={() => setViewGrade(null)} />}

                        {/* Edit Modal */}
                        {editGrade && (
                            <EditGradeModal
                                grade={editGrade}
                                open={!!editGrade}
                                onClose={() => setEditGrade(null)}
                                onSuccess={() => {
                                    setEditGrade(null)
                                    loadData()
                                }}
                            />
                        )}

                        {/* Delete Confirmation */}
                        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                                    <DialogDescription>
                                        Tem certeza que deseja excluir a grade curricular de <strong>{deleteConfirm?.curso.nome}</strong> (
                                        {deleteConfirm?.periodoAcademico})? Esta ação não pode ser desfeita.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                                        Cancelar
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Excluir
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div></div>
    )
}
