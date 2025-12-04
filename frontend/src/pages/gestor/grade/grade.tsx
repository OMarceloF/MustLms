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
import { useNavigate } from "react-router-dom";
import { ViewGradeModal } from "./visualizar-grade"
import { EditGradeModal } from "./edit-grade"

// --- CONSTANTES E TIPAGEM ---
const API_BASE_URL = 'http://localhost:3001/api';

type TipoCurso = "Graduação" | "Pós" | "Mestrado" | "Doutorado" | "especializacao";

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
    tipo: 'obrigatoria' | 'optativa'
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

// NOVO TIPO
type PeriodoLetivo = {
    id: number;
    nome: string;
}

// --- FUNÇÕES DE API ---

async function getGrades(params?: { curso?: string; periodo?: string } ): Promise<GradeCurricular[]> {
    const url = new URL(`${API_BASE_URL}/grades`);
    if (params?.curso && params.curso !== "all") url.searchParams.append('curso', params.curso);
    if (params?.periodo && params.periodo !== "all") url.searchParams.append('periodo', params.periodo);
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Falha ao buscar grades curriculares");
    return response.json();
}

async function getCursos(): Promise<Curso[]> {
    const response = await fetch(`${API_BASE_URL}/cursos-posgraduacao`);
    if (!response.ok) throw new Error("Falha ao buscar cursos");
    return response.json();
}

// NOVA FUNÇÃO DE API
async function getPeriodosLetivos(): Promise<PeriodoLetivo[]> {
    const response = await fetch(`${API_BASE_URL}/grades/form-data/periodos-letivos`);
    if (!response.ok) throw new Error("Falha ao buscar períodos letivos");
    return response.json();
}


async function deleteGrade(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/grades/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir grade");
    }
}

// --- COMPONENTE REACT ---

export default function GradeCurricularPage() {
    const navigate = useNavigate();
    const { toast } = useToast()

    const [grades, setGrades] = useState<GradeCurricular[]>([])
    const [cursos, setCursos] = useState<Curso[]>([])
    const [periodosLetivos, setPeriodosLetivos] = useState<PeriodoLetivo[]>([]) // <-- NOVO ESTADO
    const [loading, setLoading] = useState(true)

    // Filters
    const [cursoFilter, setCursoFilter] = useState<string>("")
    const [periodoFilter, setPeriodoFilter] = useState<string>("")

    // Modals
    const [viewGrade, setViewGrade] = useState<GradeCurricular | null>(null)
    const [editGrade, setEditGrade] = useState<GradeCurricular | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<GradeCurricular | null>(null)

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            // Busca grades, cursos e períodos letivos em paralelo
            const [gradesData, cursosData, periodosData] = await Promise.all([
                getGrades(), 
                getCursos(),
                getPeriodosLetivos() // <-- BUSCA OS PERÍODOS
            ]);
            setGrades(gradesData);
            setCursos(cursosData);
            setPeriodosLetivos(periodosData); // <-- ATUALIZA O ESTADO
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message || "Não foi possível carregar os dados iniciais.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const params = { curso: cursoFilter, periodo: periodoFilter };
            const data = await getGrades(params);
            setGrades(data);
        } catch (error: any) {
            toast({
                title: "Erro na busca",
                description: error.message || "Não foi possível filtrar as grades.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setCursoFilter("");
        setPeriodoFilter("");
        loadInitialData();
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteGrade(deleteConfirm.id);
            toast({
                title: "Sucesso",
                description: "Grade curricular excluída com sucesso.",
            });
            setDeleteConfirm(null);
            const updatedGrades = await getGrades({ curso: cursoFilter, periodo: periodoFilter });
            setGrades(updatedGrades);
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message || "Não foi possível remover a grade.",
                variant: "destructive",
            });
        }
    };

    const getTotalMaterias = (grade: GradeCurricular) => {
        return grade.periodos.reduce((total, periodo) => total + periodo.materias.length, 0);
    };

    const getTotalCargaHoraria = (grade: GradeCurricular) => {
        return grade.periodos.reduce((total, periodo) => {
            return total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0);
        }, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto p-8 max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-balance">Gestão de Grades Curriculares</h1>
                    <p className="mt-2 text-muted-foreground text-pretty">
                        Pesquise, visualize e gerencie as grades curriculares da instituição.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

                        {/* ===== ÁREA MODIFICADA ===== */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Período Acadêmico</label>
                            <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os períodos</SelectItem>
                                    {periodosLetivos.map((periodo) => (
                                        <SelectItem key={periodo.id} value={periodo.nome}>
                                            {periodo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* ========================== */}

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
                                <TableHead>Qtd. Disciplinas</TableHead>
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
                                        Nenhuma grade encontrada.
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

                {/* Modals */}
                {viewGrade && <ViewGradeModal grade={viewGrade} open={!!viewGrade} onClose={() => setViewGrade(null)} />}
                {editGrade && (
                    <EditGradeModal
                        grade={editGrade}
                        open={!!editGrade}
                        onClose={() => setEditGrade(null)}
                        onSuccess={() => {
                            setEditGrade(null);
                            handleSearch();
                        }}
                    />
                )}
                <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Exclusão</DialogTitle>
                            <DialogDescription>
                                Tem certeza que deseja excluir a grade curricular de <strong>{deleteConfirm?.curso.nome}</strong> ({deleteConfirm?.periodoAcademico})? Esta ação não pode ser desfeita.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
                            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
