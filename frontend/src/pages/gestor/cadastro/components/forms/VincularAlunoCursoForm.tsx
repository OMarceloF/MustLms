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
import { ArrowLeft, ArrowRight, Loader2, BookOpen, Users, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// --- Tipagem para os dados da API ---
interface Curso {
    id: number;
    nome: string;
    // Adicione outros campos se a API retornar, como 'descricao', etc.
}

interface Turma {
    id: number;
    nome: string;
    anoLetivo: number;
    // Adicione outros campos se a API retornar, como 'vagas', etc.
}

// --- Schema de Validação com Zod ---
const vincularSchema = z.object({
    cursoId: z.number({ required_error: "Selecione um curso." }),
    turmaId: z.number({ required_error: "Selecione uma turma." }),
    grade: z.enum(['2025.1', '2025.2', '2026.1'], { required_error: "Selecione uma grade." }),
});

type VincularFormData = z.infer<typeof vincularSchema>;

export function VincularAlunoCursoForm() {
    const { state, setCurrentStep, completeStep } = useRegistration();
    const { student } = state.data;

    // --- Estados do Componente ---
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState({ cursos: false, turmas: false, submit: false });
    const [error, setError] = useState<string | null>(null);

    const form = useForm<VincularFormData>({
        resolver: zodResolver(vincularSchema),
        defaultValues: {
           grade: undefined
        }
    });
    
    const { watch, setValue } = form;
    const selectedCursoId = watch('cursoId');

    // --- Efeitos para buscar dados da API ---
    useEffect(() => {
        const fetchCursos = async () => {
            setLoading(prev => ({ ...prev, cursos: true }));
            setError(null);
            try {
                // Substitua pela sua rota de API real
                const response = await fetch('/api/cursos'); 
                if (!response.ok) throw new Error('Falha ao carregar os cursos.');
                const data = await response.json();
                setCursos(data);
            } catch (err: any) {
                setError(err.message);
                toast.error("Erro ao buscar cursos", { description: "Tente recarregar a página." });
            } finally {
                setLoading(prev => ({ ...prev, cursos: false }));
            }
        };
        fetchCursos();
    }, []);

    useEffect(() => {
        if (!selectedCursoId) {
            setTurmas([]);
            setValue('turmaId', undefined as any); // Limpa a seleção de turma
            return;
        }

        const fetchTurmas = async () => {
            setLoading(prev => ({ ...prev, turmas: true }));
            try {
                // Substitua pela sua rota de API real
                const response = await fetch(`/api/cursos/${selectedCursoId}/turmas`);
                if (!response.ok) throw new Error('Falha ao carregar as turmas para este curso.');
                const data = await response.json();
                setTurmas(data);
            } catch (err: any) {
                toast.error("Erro ao buscar turmas.");
            } finally {
                setLoading(prev => ({ ...prev, turmas: false }));
            }
        };

        fetchTurmas();
    }, [selectedCursoId, setValue]);

    // --- Funções de Navegação e Submissão ---
    const goBack = () => {
        // Verifica se o aluno é o próprio responsável para pular as etapas corretas
        const isSelfResponsible = state.completedSteps.includes('responsible');
        setCurrentStep(isSelfResponsible ? 'student' : 'documents');
    };

    const onSubmit = async (data: VincularFormData) => {
        if (!student.id) {
            toast.error("ID do aluno não encontrado.", { description: "Por favor, retorne à etapa de dados do aluno." });
            return;
        }

        setLoading(prev => ({ ...prev, submit: true }));
        try {
            // Substitua pela sua rota de API real para vincular o aluno
            const response = await fetch(`/api/matriculas/vincular-curso`, {
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
            if (!response.ok) throw new Error(result.message || 'Falha ao vincular aluno ao curso.');

            toast.success("Aluno vinculado com sucesso!", { description: `Aluno(a) ${student.nomeCompleto.split(' ')[0]} foi matriculado(a).` });
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
                        Selecione o curso, a turma e o turno para o aluno(a) <span className="font-semibold text-primary">{student.nomeCompleto || "..."}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Campo Curso */}
                    <div>
                        <Label htmlFor="cursoId">Curso *</Label>
                        <Controller
                            name="cursoId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')} disabled={loading.cursos}>
                                    <SelectTrigger id="cursoId" className="mt-1">
                                        <SelectValue placeholder={loading.cursos ? "Carregando cursos..." : "Selecione o curso"} />
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

                    {/* Campo Turma */}
                    <div>
                        <Label htmlFor="turmaId">Turma de Ingresso *</Label>
                        <Controller
                            name="turmaId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value || '')} disabled={!selectedCursoId || loading.turmas}>
                                    <SelectTrigger id="turmaId" className="mt-1">
                                        <SelectValue placeholder={loading.turmas ? "Carregando turmas..." : "Selecione a turma"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {turmas.map(turma => (
                                            <SelectItem key={turma.id} value={String(turma.id)}>{turma.nome} ({turma.anoLetivo})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.turmaId && <p className="text-destructive text-sm mt-1">{form.formState.errors.turmaId.message}</p>}
                    </div>

                    {/* Campo Turno */}
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
                                        <SelectItem value="Manha">2025.1</SelectItem>
                                        <SelectItem value="Tarde">2025.2</SelectItem>
                                        <SelectItem value="Noite">2026.1</SelectItem>
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
