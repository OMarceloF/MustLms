"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import { useToast } from "../hooks/use-toast"
import type { Turma } from "../../lib/types"

const API_BASE_URL = 'http://localhost:3001/api';

// --- Tipos para os dados da API ---
interface CursoAPI { id: string; nome: string; }
interface DisciplinaAPI { id: string; nome: string; }
interface SemestreAPI { id: string; nome: string; }
interface ProfessorAPI { id: string; nome: string; }

// --- Schema de Validação Atualizado para o novo fluxo ---
const turmaSchema = z.object({
    nomeTurma: z.string( ).min(3, "O nome da turma deve ter no mínimo 3 caracteres."),
    cursoId: z.string().min(1, "É obrigatório selecionar um curso."),
    disciplinaId: z.string().min(1, "É obrigatório selecionar uma disciplina."),
    semestre: z.string().min(1, "É obrigatório selecionar um semestre."),
    responsavelId: z.string().min(1, "É obrigatório selecionar um professor responsável."),
    modalidade: z.enum(["Presencial", "Híbrido", "EAD"]),
    quantidadeAlunos: z.coerce.number().positive("O número deve ser positivo.").optional(),
    descricao: z.string().optional(),
});

type TurmaFormValues = z.infer<typeof turmaSchema>;

interface TurmaFormProps {
    turma?: Turma;
    onSave: (turma: Turma) => void;
    onCancel: () => void;
}

export function TurmaForm({ turma, onSave, onCancel }: TurmaFormProps) {
    const { toast } = useToast();
    const [selectedCursoId, setSelectedCursoId] = useState<string>(turma?.cursoId || "");

    // --- Estados do Formulário ---
    const [cursos, setCursos] = useState<CursoAPI[]>([]);
    const [disciplinas, setDisciplinas] = useState<DisciplinaAPI[]>([]);
    const [semestres, setSemestres] = useState<SemestreAPI[]>([]);
    const [professores, setProfessores] = useState<ProfessorAPI[]>([]);
    const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);

    const form = useForm<TurmaFormValues>({
        resolver: zodResolver(turmaSchema),
        defaultValues: {
            nomeTurma: turma?.nomeTurma ?? "",
            cursoId: turma?.cursoId ?? "",
            disciplinaId: turma?.disciplinaId ?? "",
            semestre: turma?.semestre?.toString() ?? "",
            responsavelId: turma?.responsavelId ?? "",
            modalidade: turma?.modalidade ?? "Presencial",
            quantidadeAlunos: turma?.quantidadeAlunos ?? undefined,
            descricao: turma?.descricao ?? "",
        },
    });

    // Efeito para buscar dados estáticos (cursos, semestres, professores)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cursosRes, semestresRes, professoresRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/form-data/cursos`),
                    fetch(`${API_BASE_URL}/form-data/semestres`),
                    fetch(`${API_BASE_URL}/form-data/professores`)
                ]);
                setCursos(await cursosRes.json());
                setSemestres(await semestresRes.json());
                setProfessores(await professoresRes.json());
            } catch (error) {
                toast({ title: "Erro de Conexão", description: "Não foi possível carregar os dados para o formulário.", variant: "destructive" });
            }
        };
        fetchData();
    }, [toast]);

    // Efeito para buscar disciplinas dinamicamente quando o curso muda
    useEffect(() => {
        const fetchDisciplinas = async () => {
            if (selectedCursoId) {
                setIsLoadingDisciplinas(true);
                try {
                    const res = await fetch(`${API_BASE_URL}/form-data/materias/${selectedCursoId}`);
                    if (!res.ok) throw new Error("Falha ao buscar disciplinas");
                    setDisciplinas(await res.json());
                } catch (error) {
                    setDisciplinas([]);
                    toast({ title: "Erro", description: "Não foi possível carregar as disciplinas do curso.", variant: "destructive" });
                } finally {
                    setIsLoadingDisciplinas(false);
                }
            } else {
                setDisciplinas([]);
            }
        };
        fetchDisciplinas();
    }, [selectedCursoId, toast]);

    // Efeito para observar a mudança no campo de curso e resetar o campo de disciplina
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "cursoId" && value.cursoId !== selectedCursoId) {
                setSelectedCursoId(value.cursoId || "");
                form.setValue("disciplinaId", ""); // Reseta a disciplina selecionada
            }
        });
        return () => subscription.unsubscribe();
    }, [form, selectedCursoId]);

    const onSubmit = (data: TurmaFormValues) => {
        const turmaData: any = { // Usamos 'any' temporariamente para flexibilidade
            id: turma?.id ?? -Date.now(),
            status: "Em Planejamento", // O status é sempre definido pelo backend
            ...data,
        };
        onSave(turmaData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nomeTurma"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome da Turma *</FormLabel>
                            <FormControl><Input placeholder="Ex: T1 - Fundamentos de IA" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="cursoId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Curso Vinculado *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione um curso" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {cursos.map((curso) => (
                                        <SelectItem key={curso.id} value={String(curso.id)}>{curso.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="disciplinaId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Disciplina *</FormLabel>
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value} 
                                disabled={!selectedCursoId || isLoadingDisciplinas}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            !selectedCursoId ? "Selecione um curso primeiro" :
                                            isLoadingDisciplinas ? "Carregando disciplinas..." : "Selecione uma disciplina"
                                        } />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {disciplinas.map((disciplina) => (
                                        <SelectItem key={disciplina.id} value={String(disciplina.id)}>
                                            {disciplina.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="semestre"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Semestre *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o semestre de oferta" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {semestres.map((sem) => (
                                         <SelectItem key={sem.id} value={String(sem.id)}>{sem.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="responsavelId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Professor Responsável *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione um professor" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {professores.map((professor) => (
                                        <SelectItem key={professor.id} value={String(professor.id)}>{professor.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="modalidade"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modalidade *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Presencial">Presencial</SelectItem>
                                        <SelectItem value="Híbrido">Híbrido</SelectItem>
                                        <SelectItem value="EAD">EAD</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quantidadeAlunos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Alunos (estimado)</FormLabel>
                                <FormControl><Input type="number" placeholder="30" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição ou Observações</FormLabel>
                            <FormControl><Textarea placeholder="Informações adicionais sobre a turma..." className="resize-none" rows={3} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">{turma ? "Atualizar Turma" : "Salvar Turma"}</Button>
                </div>
            </form>
        </Form>
    );
}
