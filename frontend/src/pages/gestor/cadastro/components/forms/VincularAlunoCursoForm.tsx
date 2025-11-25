// frontend/src/pages/gestor/cadastro/components/forms/VincularAlunoCursoForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { ArrowLeft, ArrowRight, Loader2, BookOpen, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { CreateTurmaIngressoModal } from './CreateTurmaIngressoModal';

// --- Tipagens ---
interface Curso {
    id: number;
    nome: string;
    sigla: string;
}

interface TurmaIngresso {
    id: number;
    nome: string;
    curso_posgraduacao_id: number;
}

// NOVA TIPAGEM PARA A GRADE
interface Grade {
    id: number;
    periodoAcademico: string;
}

// --- Schema de Validação ---
const vincularSchema = z.object({
    cursoId: z.coerce.number({ required_error: "Selecione um curso." }).min(1, "Selecione um curso."),
    turmaId: z.coerce.number({ required_error: "Selecione uma turma." }).min(1, "Selecione uma turma."),
    gradeId: z.coerce.number({ required_error: "Selecione uma grade." }).min(1, "Selecione uma grade."), // Alterado para gradeId
});

type VincularFormData = z.infer<typeof vincularSchema>;

export function VincularAlunoCursoForm() {

    const { state, setCurrentStep, completeStep } = useRegistration();
    const { student } = state.data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [todasTurmasIngresso, setTodasTurmasIngresso] = useState<TurmaIngresso[]>([]);
    const [turmasFiltradas, setTurmasFiltradas] = useState<TurmaIngresso[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]); // <-- NOVO ESTADO PARA GRADES
    const [loading, setLoading] = useState({ cursos: true, turmas: true, grades: false, submit: false });
    const [error, setError] = useState<string | null>(null);

    const form = useForm<VincularFormData>({
        resolver: zodResolver(vincularSchema),
    });

    const { watch, setValue } = form;
    const selectedCursoId = watch('cursoId');

    // Função de callback para ser chamada após a criação bem-sucedida da turma
    const handleTurmaCreated = (newTurma: TurmaIngresso) => {
        // 1. Adiciona a nova turma à lista de todas as turmas
        setTodasTurmasIngresso(prev => [...prev, newTurma]);

        // 2. Garante que ela apareça na lista filtrada, já que o cursoId está selecionado
        setTurmasFiltradas(prev => [...prev, newTurma]);

        // 3. Define a nova turma como selecionada no formulário
        setValue('turmaId', newTurma.id, { shouldValidate: true });
    };


    // Efeito para buscar dados iniciais (cursos e turmas)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(prev => ({ ...prev, cursos: true, turmas: true }));
            setError(null);
            try {
                const [cursosResponse, turmasResponse] = await Promise.all([
                    fetch('/api/cursos-posgraduacao'),
                    fetch('/api/turmas-ingresso')
                ]);

                if (!cursosResponse.ok) throw new Error('Falha ao carregar os cursos.');
                if (!turmasResponse.ok) throw new Error('Falha ao carregar as turmas de ingresso.');

                const cursosData = await cursosResponse.json();
                const turmasData = await turmasResponse.json();

                setCursos(cursosData);
                setTodasTurmasIngresso(turmasData);

            } catch (err: any) {
                setError(err.message);
                toast.error("Erro ao buscar dados iniciais", { description: err.message });
            } finally {
                setLoading(prev => ({ ...prev, cursos: false, turmas: false }));
            }
        };
        fetchData();
    }, []);

    // Efeito para filtrar turmas e buscar grades quando o curso muda
    useEffect(() => {
        if (selectedCursoId) {
            // Filtra turmas
            const cursoIdNumerico = Number(selectedCursoId);
            const filtradas = todasTurmasIngresso.filter(
                (turma) => Number(turma.curso_posgraduacao_id) === cursoIdNumerico
            );
            setTurmasFiltradas(filtradas);

            // Busca as grades para o curso selecionado
            const fetchGrades = async () => {
                setLoading(prev => ({ ...prev, grades: true }));
                try {
                    const response = await fetch(`/api/grades/por-curso/${selectedCursoId}`);
                    if (!response.ok) throw new Error('Falha ao buscar as grades do curso.');
                    const gradesData = await response.json();
                    setGrades(gradesData);
                } catch (err: any) {
                    toast.error("Erro ao buscar grades", { description: err.message });
                    setGrades([]);
                } finally {
                    setLoading(prev => ({ ...prev, grades: false }));
                }
            };
            fetchGrades();

        } else {
            setTurmasFiltradas([]);
            setGrades([]); // Limpa as grades se nenhum curso estiver selecionado
        }
        // Reseta os campos dependentes
        setValue('turmaId', undefined as any);
        setValue('gradeId', undefined as any);
    }, [selectedCursoId, todasTurmasIngresso, setValue]);
    const selectedCurso = cursos.find(c => c.id === selectedCursoId);
    const goBack = () => setCurrentStep('documents');

    const onSubmit = async (data: VincularFormData) => {
        if (!student.id) {
            toast.error("ID do aluno não encontrado.");
            return;
        }
        setLoading(prev => ({ ...prev, submit: true }));
        try {
            const response = await fetch(`/api/matriculas/vincular-aluno-curso`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alunoId: student.id,
                    cursoId: data.cursoId,
                    turmaId: data.turmaId,
                    gradeId: data.gradeId, // Enviando o ID da grade
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Falha ao vincular aluno.');
            toast.success("Aluno vinculado com sucesso!");
            completeStep('vincularAluno');
            setCurrentStep('contract');
        } catch (err: any) {
            toast.error("Erro na Matrícula", { description: err.message });
        } finally {
            setLoading(prev => ({ ...prev, submit: false }));
        }
    };

    return (
        // FRAGMENTO ABERTO AQUI: Permite retornar o <form> e o <CreateTurmaIngressoModal>
        <>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <BookOpen className="h-6 w-6" />
                            Vincular Aluno ao Curso
                        </CardTitle>
                        <CardDescription>
                            Selecione o curso, a turma e a grade para o aluno(a) <span className="font-semibold text-primary">{student.nomeCompleto || "..."}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Campo de Curso (sem alteração) */}
                        <div>
                            <Label htmlFor="cursoId">Curso *</Label>
                            <Controller
                                name="cursoId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={loading.cursos}>
                                        <SelectTrigger id="cursoId" className="mt-1">
                                            <SelectValue placeholder={loading.cursos ? "Carregando..." : "Selecione o curso"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cursos.map(curso => (
                                                <SelectItem key={curso.id} value={String(curso.id)}>{curso.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.cursoId && <p className="text-destructive text-sm mt-1">{form.formState.errors.cursoId.message}</p>}
                        </div>

                        {/* Turma de Ingresso com Botão de Criação */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                {/* Label da Turma */}
                                <Label htmlFor="turmaId">Turma de Ingresso *</Label>

                                {/* Botão para abrir o Modal - Agora mais visível e descritivo */}
                                <Button
                                    type="button"
                                    // variant="outline"
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={!selectedCursoId || loading.cursos || loading.turmas}
                                    className="h-8 px-3 text-xs" // Estilo compacto
                                >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Criar Turma de Ingresso
                                </Button>
                            </div>

                            {/* Campo de Seleção da Turma (Select) */}
                            <Controller
                                name="turmaId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={!selectedCursoId || loading.turmas}>
                                        <SelectTrigger id="turmaId">
                                            <SelectValue placeholder={!selectedCursoId ? "Selecione um curso primeiro" : (loading.turmas ? "Carregando..." : "Selecione a turma")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {turmasFiltradas.map(turma => (
                                                <SelectItem key={turma.id} value={String(turma.id)}>
                                                    {turma.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.turmaId && <p className="text-destructive text-sm mt-1">{form.formState.errors.turmaId.message}</p>}
                        </div>

                        {/* Botão + para Abrir o Modal
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(true)}
                            disabled={!selectedCursoId || loading.cursos || loading.turmas}
                            className="mt-1 h-9 flex-shrink-0 p-3" // Ajuste para ficar do mesmo tamanho do input
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
 */}

                        {/* Campo de Grade (mantido) */}
                        <div>
                            <Label htmlFor="gradeId">Grade *</Label>
                            <Controller
                                name="gradeId"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={!selectedCursoId || loading.grades}>
                                        <SelectTrigger id="gradeId" className="mt-1">
                                            <SelectValue placeholder={!selectedCursoId ? "Selecione um curso primeiro" : (loading.grades ? "Carregando grades..." : "Selecione a grade")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.length > 0 ? (
                                                grades.map(grade => (
                                                    <SelectItem key={grade.id} value={String(grade.id)}>
                                                        Grade de {grade.periodoAcademico}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                !loading.grades && <p className="p-4 text-sm text-muted-foreground">Nenhuma grade encontrada para este curso.</p>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.gradeId && <p className="text-destructive text-sm mt-1">{form.formState.errors.gradeId.message}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center pt-4">
                    <Button type="button" variant="outline" onClick={goBack} disabled={loading.submit}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <Button type="submit" disabled={loading.submit || loading.cursos || loading.turmas || loading.grades}>
                        {loading.submit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                        Continuar para o Contrato
                    </Button>
                </div>
            </form >

            {/* Modal de Criação da Turma, passando nome e sigla */}
            <CreateTurmaIngressoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cursoId={Number(selectedCursoId)}
                cursoNome={selectedCurso?.nome} // NOVO
                cursoSigla={selectedCurso?.sigla} // NOVO
                onTurmaCreated={handleTurmaCreated}
            />
        </>
        // FRAGMENTO FECHADO AQUI: Envolvendo <form> e <CreateTurmaIngressoModal>
    );
}