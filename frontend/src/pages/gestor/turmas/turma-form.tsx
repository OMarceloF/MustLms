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
import { cursos, materias, professores } from "../../lib/mock-data"

const turmaSchema = z.object({
    nomeTurma: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    cursoId: z.string().min(1, "Selecione um curso"),
    materiasIds: z.array(z.string()).min(1, "Selecione ao menos uma matéria"),

    // <- Agora é number de fato (o coerce já converte de string do input)
    anoInicio: z.coerce
        .number({ invalid_type_error: "Ano é obrigatório" })
        .min(2020, "Mínimo 2020")
        .max(2030, "Máximo 2030"),

    semestre: z.enum(["1", "2"]),
    responsavelId: z.string().min(1, "Selecione um responsável"),
    modalidade: z.enum(["Presencial", "Híbrido", "EAD"]),

    // <- Número opcional (coerce converte string->number; vazio você manda undefined)
    quantidadeAlunos: z.coerce
        .number({ invalid_type_error: "Informe um número" })
        .positive("Deve ser um número positivo")
        .optional(),

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

    const form = useForm<TurmaFormValues>({
        resolver: zodResolver(turmaSchema),
        defaultValues: {
            nomeTurma: turma?.nomeTurma ?? "",
            cursoId: turma?.cursoId ?? "",
            materiasIds: turma?.materiasIds ?? [],
            // <- number
            anoInicio: turma?.anoInicio ?? new Date().getFullYear(),
            // <- strings "1" | "2" (ok, pois seu schema define enum de string)
            semestre: (turma?.semestre?.toString() as "1" | "2") ?? "1",
            responsavelId: turma?.responsavelId ?? "",
            modalidade: turma?.modalidade ?? "Presencial",
            // <- number | undefined (não use string vazia)
            quantidadeAlunos: turma?.quantidadeAlunos ?? undefined,
            status: turma?.status ?? "Em Planejamento",
            descricao: turma?.descricao ?? "",
        },
    });


    const availableMaterias = materias.filter((materia) => materia.cursoId === selectedCursoId)

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "cursoId" && value.cursoId) {
                setSelectedCursoId(value.cursoId)
                // Reset selected materias when course changes
                form.setValue("materiasIds", [])
            }
        })
        return () => subscription.unsubscribe()
    }, [form])

    const onSubmit = (data: TurmaFormValues) => {
        const turmaData: Turma = {
            id: turma?.id ?? Date.now().toString(),
            nomeTurma: data.nomeTurma,
            cursoId: data.cursoId,
            materiasIds: data.materiasIds,
            anoInicio: data.anoInicio, // já é number
            semestre: Number.parseInt(data.semestre) as 1 | 2,
            responsavelId: data.responsavelId,
            modalidade: data.modalidade,
            quantidadeAlunos: data.quantidadeAlunos, // number | undefined
            status: data.status,
            descricao: data.descricao,
        };

        onSave(turmaData);

        toast({
            title: turma ? "Turma atualizada!" : "Turma criada!",
            description: turma
                ? "As informações da turma foram atualizadas com sucesso."
                : "A nova turma foi cadastrada com sucesso.",
        });
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
                                        <SelectItem key={curso.id} value={curso.id}>
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
                                {availableMaterias.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Selecione um curso primeiro</p>
                                ) : (
                                    availableMaterias.map((materia) => (
                                        <FormField
                                            key={materia.id}
                                            control={form.control}
                                            name="materiasIds"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem key={materia.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(materia.id)}
                                                                onCheckedChange={(checked) => {
                                                                    const isChecked = checked === true;
                                                                    return isChecked
                                                                        ? field.onChange([...(field.value ?? []), materia.id])
                                                                        : field.onChange((field.value ?? []).filter((v) => v !== materia.id));
                                                                }}
                                                            />

                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {materia.nome} ({materia.cargaHoraria}h)
                                                        </FormLabel>
                                                    </FormItem>
                                                )
                                            }}
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
                                    // value é number | undefined -> para o input, use string:
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        // se vazio, deixe undefined (deixa o Zod acusar obrigatoriedade)
                                        if (v === "") return field.onChange(undefined);
                                        // valueAsNumber pode virar NaN se campo vazio; por isso checamos:
                                        const n = e.target.valueAsNumber;
                                        field.onChange(Number.isNaN(n) ? undefined : n);
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                    ref={field.ref}
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
                                    <SelectItem value="1">1º Semestre</SelectItem>
                                    <SelectItem value="2">2º Semestre</SelectItem>
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
                                        <SelectItem key={professor.id} value={professor.id}>
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
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            // opcional: vazio => undefined
                                            if (v === "") return field.onChange(undefined);
                                            const n = e.target.valueAsNumber;
                                            field.onChange(Number.isNaN(n) ? undefined : n);
                                        }}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
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
