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
import { Checkbox } from "../components/ui/checkbox"
import { useToast } from "../hooks/use-toast"
import type { Turma } from "../../lib/types"


const API_BASE_URL = 'http://localhost:3001/api';

// --- Tipos para os dados da API ---
interface CursoAPI { id: string; nome: string; }
interface MateriaAPI { id: string; nome: string; carga_horaria: number; }
interface SemestreAPI { id: string; nome: string; }
interface ProfessorAPI { id: string; nome: string; }


const turmaSchema = z.object({
    nomeTurma: z.string( ).min(3, "Nome deve ter no mínimo 3 caracteres"),
    cursoId: z.string().min(1, "Selecione um curso"),
    materiasIds: z.array(z.string()).min(1, "Selecione ao menos uma matéria"),
    anoInicio: z.coerce.number({ invalid_type_error: "Ano é obrigatório" }).min(2020, "Mínimo 2020").max(2030, "Máximo 2030"),
    semestre: z.string().min(1, "Selecione um semestre"),
    responsavelId: z.string().min(1, "Selecione um responsável"),
    modalidade: z.enum(["Presencial", "Híbrido", "EAD"]),
    quantidadeAlunos: z.coerce.number({ invalid_type_error: "Informe um número" }).positive("Deve ser um número positivo").optional(),
    status: z.enum(["Ativa", "Em Planejamento", "Encerrada"]),
    descricao: z.string().optional(),
});


type TurmaFormValues = z.infer<typeof turmaSchema>

interface TurmaFormProps {
    turma?: Turma
    onSave: (turma: Turma) => void
    onCancel: () => void
}

export function TurmaForm({ turma, onSave, onCancel }: TurmaFormProps) {
    const { toast } = useToast()
    const [selectedCursoId, setSelectedCursoId] = useState<string>(turma?.cursoId || "")

    const [cursos, setCursos] = useState<CursoAPI[]>([]);
    const [materias, setMaterias] = useState<MateriaAPI[]>([]);
    const [semestres, setSemestres] = useState<SemestreAPI[]>([]);
    const [professores, setProfessores] = useState<ProfessorAPI[]>([]);
    const [isLoadingMaterias, setIsLoadingMaterias] = useState(false);

    const form = useForm<TurmaFormValues>({
        resolver: zodResolver(turmaSchema),
        defaultValues: {
            nomeTurma: turma?.nomeTurma ?? "",
            cursoId: turma?.cursoId ?? "",
            materiasIds: turma?.materiasIds ?? [],
            anoInicio: turma?.anoInicio ?? new Date().getFullYear(),
            semestre: turma?.semestre?.toString() ?? "",
            responsavelId: turma?.responsavelId ?? "",
            modalidade: turma?.modalidade ?? "Presencial",
            quantidadeAlunos: turma?.quantidadeAlunos ?? undefined,
            status: turma?.status ?? "Em Planejamento",
            descricao: turma?.descricao ?? "",
        },
    });

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
                console.error("Erro ao buscar dados para o formulário:", error);
                toast({ title: "Erro", description: "Não foi possível carregar os dados do formulário.", variant: "destructive" });
            }
        };
        fetchData();
    }, [toast]);

    useEffect(() => {
        const fetchMaterias = async () => {
            if (selectedCursoId) {
                setIsLoadingMaterias(true);
                try {
                    const res = await fetch(`${API_BASE_URL}/form-data/materias/${selectedCursoId}`);
                    setMaterias(await res.json());
                } catch (error) {
                    console.error("Erro ao buscar matérias:", error);
                    setMaterias([]);
                } finally {
                    setIsLoadingMaterias(false);
                }
            } else {
                setMaterias([]);
            }
        };
        fetchMaterias();
    }, [selectedCursoId]);


    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "cursoId" && value.cursoId) {
                setSelectedCursoId(value.cursoId);
                form.setValue("materiasIds", []);
            }
        })
        return () => subscription.unsubscribe()
    }, [form])

    const onSubmit = (data: TurmaFormValues) => {
        const turmaData: Turma = {
            id: turma?.id ?? Date.now().toString(), // ID temporário para criação
            ...data,
        };
        onSave(turmaData);
    };


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ... (o resto do seu formulário JSX permanece o mesmo) ... */}
                 <FormField
                    control={form.control}
                    name="nomeTurma"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome da Turma *</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Turma A - 2024/1" {...field} />
                            </FormControl>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um curso" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {cursos.map((curso) => (
                                        <SelectItem key={curso.id} value={String(curso.id)}>
                                            {curso.nome}
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
                    name="materiasIds"
                    render={() => (
                        <FormItem>
                            <FormLabel>Matérias Vinculadas *</FormLabel>
                            <div className="space-y-2">
                                {isLoadingMaterias ? (
                                    <p className="text-sm text-muted-foreground">Carregando matérias...</p>
                                ) : materias.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Selecione um curso para ver as matérias</p>
                                ) : (
                                    materias.map((materia) => (
                                        <FormField
                                            key={materia.id}
                                            control={form.control}
                                            name="materiasIds"
                                            render={({ field }) => (
                                                <FormItem key={materia.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(String(materia.id))}
                                                            onCheckedChange={(checked) => {
                                                                const materiaIdStr = String(materia.id);
                                                                const currentSelection = field.value ?? [];
                                                                if (checked) {
                                                                    field.onChange([...currentSelection, materiaIdStr]);
                                                                } else {
                                                                    field.onChange(currentSelection.filter((v) => v !== materiaIdStr));
                                                                }
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {materia.nome} ({materia.carga_horaria}h)
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 <FormField
                    control={form.control}
                    name="anoInicio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ano de Início *</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="2024"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                />
                            </FormControl>
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {semestres.map((sem) => (
                                         <SelectItem key={sem.id} value={String(sem.id)}>
                                            {sem.nome}
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
                    name="responsavelId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Professor Responsável *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um professor" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {professores.map((professor) => (
                                        <SelectItem key={professor.id} value={String(professor.id)}>
                                            {professor.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="modalidade"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modalidade *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
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
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="25"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status da Turma *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Ativa">Ativa</SelectItem>
                                    <SelectItem value="Em Planejamento">Em Planejamento</SelectItem>
                                    <SelectItem value="Encerrada">Encerrada</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição ou Observações</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Informações adicionais sobre a turma..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button type="submit">{turma ? "Atualizar Turma" : "Salvar Turma"}</Button>
                </div>
            </form>
        </Form >
    )
}
