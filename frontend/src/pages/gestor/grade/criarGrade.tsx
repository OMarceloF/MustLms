"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"
import { Checkbox } from "../components/ui/checkbox"
import { useToast } from "../hooks/use-toast"

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
}

type Periodo = {
    id: number
    nome: string
    materias: Materia[]
}

type PeriodoLetivo = {
    id: number;
    nome: string;
}

// --- FUNÇÕES DE API (sem alterações ) ---

async function getCursos(): Promise<Curso[]> {
    const response = await fetch(`${API_BASE_URL}/cursos-posgraduacao`);
    if (!response.ok) throw new Error("Falha ao buscar cursos");
    return response.json();
}

async function getPeriodosLetivos(): Promise<PeriodoLetivo[]> {
    const response = await fetch(`${API_BASE_URL}/grades/form-data/periodos-letivos`);
    if (!response.ok) throw new Error("Falha ao buscar períodos letivos");
    return response.json();
}

async function getDisciplinasAgrupadas(cursoId: string): Promise<Periodo[]> {
    const response = await fetch(`${API_BASE_URL}/grades/form-data/disciplinas-por-curso/${cursoId}`);
    if (!response.ok) throw new Error("Falha ao buscar disciplinas do curso");
    return response.json();
}

async function createGrade(gradeData: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar a grade curricular");
    }
    return response.json();
}

// --- COMPONENTE REACT ---

export default function NovaGradePage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [periodosLetivos, setPeriodosLetivos] = useState<PeriodoLetivo[]>([]);

    const [cursoId, setCursoId] = useState("");
    const [periodoAcademicoId, setPeriodoAcademicoId] = useState("");
    
    // Armazena a estrutura completa vinda da API
    const [estruturaBase, setEstruturaBase] = useState<Periodo[]>([]);
    // Armazena apenas as matérias selecionadas pelo usuário
    const [periodosSelecionados, setPeriodosSelecionados] = useState<Periodo[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [cursosData, periodosLetivosData] = await Promise.all([
                    getCursos(),
                    getPeriodosLetivos()
                ]);
                setCursos(cursosData);
                setPeriodosLetivos(periodosLetivosData);
            } catch (error: any) {
                toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [toast]);

    useEffect(() => {
        if (!cursoId) {
            setEstruturaBase([]);
            setPeriodosSelecionados([]);
            return;
        }

        const fetchDisciplinas = async () => {
            setLoadingPeriodos(true);
            try {
                const data = await getDisciplinasAgrupadas(cursoId);
                setEstruturaBase(data);
                // Inicializa os períodos selecionados com a mesma estrutura, mas com matérias vazias
                setPeriodosSelecionados(data.map(p => ({ ...p, materias: [] })));
            } catch (error: any) {
                toast({ title: "Erro", description: error.message, variant: "destructive" });
                setEstruturaBase([]);
                setPeriodosSelecionados([]);
            } finally {
                setLoadingPeriodos(false);
            }
        };

        fetchDisciplinas();
    }, [cursoId, toast]);

    // ** FUNÇÃO PARA MARCAR/DESMARCAR MATÉRIAS **
    const toggleMateria = (periodoId: number, materia: Materia) => {
        setPeriodosSelecionados(prevPeriodos =>
            prevPeriodos.map(periodo => {
                if (periodo.id !== periodoId) {
                    return periodo;
                }
                const materiaExiste = periodo.materias.some(m => m.id === materia.id);
                if (materiaExiste) {
                    // Remove a matéria
                    return { ...periodo, materias: periodo.materias.filter(m => m.id !== materia.id) };
                } else {
                    // Adiciona a matéria
                    return { ...periodo, materias: [...periodo.materias, materia] };
                }
            })
        );
    };

    const getTotalCargaHoraria = () => {
        return periodosSelecionados.reduce((total, periodo) => 
            total + periodo.materias.reduce((sum, materia) => sum + materia.cargaHoraria, 0), 0);
    };

    const handleSubmit = async () => {
        if (!cursoId || !periodoAcademicoId) {
            toast({ title: "Atenção", description: "Selecione o curso e o período acadêmico.", variant: "destructive" });
            return;
        }
        // Filtra períodos que não têm matérias selecionadas para não enviar dados vazios
        const periodosParaSalvar = periodosSelecionados.filter(p => p.materias.length > 0);

        if (periodosParaSalvar.length === 0) {
            toast({ title: "Atenção", description: "Selecione pelo menos uma matéria para salvar a grade.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const cursoSelecionado = cursos.find((c) => c.id.toString() === cursoId);
            const periodoSelecionado = periodosLetivos.find((p) => p.id.toString() === periodoAcademicoId);

            if (!cursoSelecionado || !periodoSelecionado) throw new Error("Curso ou Período Acadêmico inválido.");

            const gradeData = {
                curso: cursoSelecionado,
                periodoAcademico: periodoSelecionado.nome,
                periodos: periodosParaSalvar,
            };

            await createGrade(gradeData);

            toast({ title: "Sucesso", description: "Grade curricular criada com sucesso!" });
            navigate("/gestor/grade");
        } catch (error: any) {
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container mx-auto max-w-4xl p-8">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 px-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para a listagem
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Nova Grade Curricular</h1>
                    <p className="mt-2 text-muted-foreground">
                        Defina a estrutura de um curso, organizando as matérias por períodos.
                    </p>
                </div>

                <div className="bg-white rounded-lg border p-6 space-y-8">
                    {/* Cabeçalho da Grade */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Curso <span className="text-destructive">*</span></label>
                            <Select value={cursoId} onValueChange={setCursoId} disabled={loading || saving}>
                                <SelectTrigger><SelectValue placeholder="Selecione um curso" /></SelectTrigger>
                                <SelectContent>
                                    {cursos.map((curso) => (
                                        <SelectItem key={curso.id} value={curso.id.toString()}>
                                            {curso.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Período Acadêmico <span className="text-destructive">*</span></label>
                            <Select value={periodoAcademicoId} onValueChange={setPeriodoAcademicoId} disabled={loading || saving}>
                                <SelectTrigger><SelectValue placeholder="Selecione o período" /></SelectTrigger>
                                <SelectContent>
                                    {periodosLetivos.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Carga Horária Total */}
                    <div className="bg-slate-50 rounded-lg p-4 border">
                        <p className="text-sm font-medium">
                            Carga Horária Total da Grade: <span className="text-lg font-bold text-primary">{getTotalCargaHoraria()}h</span>
                        </p>
                    </div>

                    {/* Estrutura dos Períodos */}
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Estrutura dos Períodos</h3>
                        {loadingPeriodos ? (
                            <div className="flex items-center justify-center text-muted-foreground py-12">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span>Carregando disciplinas do curso...</span>
                            </div>
                        ) : !cursoId ? (
                             <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                                <p className="text-muted-foreground">Selecione um curso para ver a estrutura de períodos e disciplinas.</p>
                            </div>
                        ) : estruturaBase.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                                <p className="text-muted-foreground">Nenhuma disciplina encontrada para este curso.</p>
                            </div>
                        ) : (
                            <Accordion type="multiple" className="w-full space-y-3" defaultValue={estruturaBase.map(p => `periodo-${p.id}`)}>
                                {estruturaBase.map((periodoBase) => {
                                    const periodoSelecionado = periodosSelecionados.find(p => p.id === periodoBase.id);
                                    return (
                                        <AccordionItem key={periodoBase.id} value={`periodo-${periodoBase.id}`} className="border rounded-lg bg-white">
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className="font-medium text-base">{periodoBase.nome}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {periodoSelecionado?.materias.length || 0} / {periodoBase.materias.length} matérias selecionadas
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="space-y-2 pt-2 border-t">
                                                    {periodoBase.materias.map((materia) => {
                                                        const isSelected = periodoSelecionado?.materias.some(m => m.id === materia.id) ?? false;
                                                        return (
                                                            <div key={materia.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-slate-50">
                                                                <Checkbox
                                                                    id={`chk-${periodoBase.id}-${materia.id}`}
                                                                    checked={isSelected}
                                                                    onCheckedChange={() => toggleMateria(periodoBase.id, materia)}
                                                                    disabled={saving}
                                                                />
                                                                <label htmlFor={`chk-${periodoBase.id}-${materia.id}`} className="flex-1 cursor-pointer">
                                                                    <p className="font-medium">{materia.nome}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {materia.codigo} • {materia.cargaHoraria}h
                                                                    </p>
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        )}
                    </div>

                    {/* Ações Finais */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={loading || saving || loadingPeriodos}>
                            {saving ? "Salvando..." : "Salvar Grade Curricular"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
