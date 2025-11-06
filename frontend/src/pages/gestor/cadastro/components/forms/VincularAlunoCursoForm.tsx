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
import { ArrowLeft, ArrowRight, Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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

// --- Schema de Validação ---
const vincularSchema = z.object({
    cursoId: z.coerce.number({ required_error: "Selecione um curso." }).min(1, "Selecione um curso."),
    turmaId: z.coerce.number({ required_error: "Selecione uma turma." }).min(1, "Selecione uma turma."),
    grade: z.string({ required_error: "Selecione uma grade." }),
});

type VincularFormData = z.infer<typeof vincularSchema>;

export function VincularAlunoCursoForm() {
    const { state, setCurrentStep, completeStep } = useRegistration();
    const { student } = state.data;

    const [cursos, setCursos] = useState<Curso[]>([]);
    const [todasTurmasIngresso, setTodasTurmasIngresso] = useState<TurmaIngresso[]>([]);
    const [turmasFiltradas, setTurmasFiltradas] = useState<TurmaIngresso[]>([]);
    const [loading, setLoading] = useState({ cursos: true, turmas: true, submit: false });
    const [error, setError] = useState<string | null>(null);

    const form = useForm<VincularFormData>({
        resolver: zodResolver(vincularSchema),
    });
    
    const { watch, setValue } = form;
    const selectedCursoId = watch('cursoId');

    useEffect(() => {
        const fetchData = async () => {
            setLoading({ cursos: true, turmas: true, submit: false });
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

    useEffect(() => {
        // Abre o console do navegador (F12) para ver estas mensagens
        console.log('ID do curso selecionado:', selectedCursoId, '| Tipo:', typeof selectedCursoId);
        if (todasTurmasIngresso.length > 0) {
            console.log('Dados da primeira turma na lista completa:', todasTurmasIngresso[0]);
            console.log('Tipo do ID do curso na lista de turmas:', typeof todasTurmasIngresso[0].curso_posgraduacao_id);
        }

        if (selectedCursoId) {
            // GARANTIA DE COMPARAÇÃO CORRETA: Converte ambos os valores para número.
            const cursoIdNumerico = Number(selectedCursoId);
            const filtradas = todasTurmasIngresso.filter(
                (turma) => Number(turma.curso_posgraduacao_id) === cursoIdNumerico
            );
            console.log('Turmas encontradas para este curso:', filtradas);
            setTurmasFiltradas(filtradas);
        } else {
            setTurmasFiltradas([]);
        }
        setValue('turmaId', undefined as any);
    }, [selectedCursoId, todasTurmasIngresso, setValue]);

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
                    grade: data.grade,
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

                    <div>
                        <Label htmlFor="turmaId">Turma de Ingresso *</Label>
                        <Controller
                            name="turmaId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={!selectedCursoId || loading.turmas}>
                                    <SelectTrigger id="turmaId" className="mt-1">
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

                    <div>
                        <Label htmlFor="grade">Grade *</Label>
                        <Controller
                            name="grade"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <SelectTrigger id="grade" className="mt-1">
                                        <SelectValue placeholder="Selecione a grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2025.1">2025.1</SelectItem>
                                        <SelectItem value="2025.2">2025.2</SelectItem>
                                        <SelectItem value="2026.1">2026.1</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.grade && <p className="text-destructive text-sm mt-1">{form.formState.errors.grade.message}</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="outline" onClick={goBack} disabled={loading.submit}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <Button type="submit" disabled={loading.submit || loading.cursos || loading.turmas}>
                    {loading.submit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Continuar para o Contrato
                </Button>
            </div>
        </form>
    );
}


