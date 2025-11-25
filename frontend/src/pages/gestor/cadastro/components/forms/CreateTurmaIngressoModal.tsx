import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'; // Importar Select
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// --- Tipagens de suporte ---
interface CursoInfo {
    nome: string;
    sigla: string;
}

interface Grade {
    id: number;
    periodoAcademico: string;
}

// --- Schema de Validação (Atualizado) ---
const createTurmaSchema = z.object({
    nome: z.string().min(3, "O nome da turma deve ter pelo menos 3 caracteres."),
    gradeId: z.coerce.number({ required_error: "Selecione um período/grade." }).min(1, "Selecione um período/grade."),
});

type CreateTurmaFormData = z.infer<typeof createTurmaSchema>;

interface CreateTurmaIngressoModalProps {
    isOpen: boolean;
    onClose: () => void;
    cursoId: number;
    // Adicione cursoSigla e cursoNome para exibição
    cursoSigla: string | undefined;
    cursoNome: string | undefined;
    onTurmaCreated: (newTurma: { id: number; nome: string; curso_posgraduacao_id: number; }) => void;
}

export function CreateTurmaIngressoModal({ isOpen, onClose, cursoId, cursoSigla, cursoNome, onTurmaCreated }: CreateTurmaIngressoModalProps) {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(false);

    const form = useForm<CreateTurmaFormData>({
        resolver: zodResolver(createTurmaSchema),
        defaultValues: {
            nome: '',
            gradeId: undefined as any,
        }
    });

    const { handleSubmit, formState: { isSubmitting, errors }, reset, control, setError } = form;

    // Efeito para buscar as grades do curso selecionado assim que o modal abrir
    useEffect(() => {
        if (isOpen && cursoId) {
            const fetchGrades = async () => {
                setLoadingGrades(true);
                setGrades([]);
                try {
                    // Reutiliza o endpoint de grades
                    const response = await fetch(`/api/grades/por-curso/${cursoId}`);
                    if (!response.ok) throw new Error('Falha ao buscar as grades para a nova turma.');
                    const gradesData = await response.json();
                    setGrades(gradesData);
                } catch (err: any) {
                    toast.error("Erro ao carregar grades", { description: err.message });
                    setError('gradeId', { message: "Erro ao carregar grades." });
                } finally {
                    setLoadingGrades(false);
                }
            };
            fetchGrades();
        }

        // Limpa o formulário quando o modal fechar
        if (!isOpen) {
            reset();
            setGrades([]);
        }
    }, [isOpen, cursoId, reset, setError]);

    const onSubmit = async (data: CreateTurmaFormData) => {
        if (!cursoId) {
            toast.error("Erro", { description: "É necessário selecionar um curso para criar a turma." });
            return;
        }

        try {
            const payload = {
                nome: data.nome,
                curso_posgraduacao_id: cursoId,
                grade_id: data.gradeId, // NOVO: Enviando a grade/período selecionado
            };

            const response = await fetch('/api/turmas-ingresso', { // **Ajuste o endpoint se for diferente**
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Falha ao criar a nova turma.");
            }

            toast.success(`Turma "${data.nome}" criada com sucesso!`);

            // Assume que a API retorna o objeto da nova turma com 'id', 'nome' e 'curso_posgraduacao_id'
            onTurmaCreated(result.turma);

            onClose();
        } catch (err: any) {
            toast.error("Erro na Criação da Turma", { description: err.message });
        }
    };

    const isFormDisabled = isSubmitting || loadingGrades || !cursoId;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Turma de Ingresso</DialogTitle>
                    <DialogDescription>
                        Crie uma turma e defina o período acadêmico (grade) para o curso selecionado.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Exibição do Curso/Sigla (apenas leitura) */}
                    <div className="p-3 bg-muted/30 rounded-md">
                        <Label className="font-semibold text-sm">Curso Selecionado:</Label>
                        <p className="text-md font-medium mt-1">
                            {cursoNome || '...'} **({cursoSigla || '...'})**
                        </p>
                    </div>

                    {/* Campo: Nome da Turma */}
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Turma *</Label>
                        <Input
                            id="nome"
                            placeholder="Ex: 2024/1, Turma B"
                            {...form.register('nome')}
                            disabled={isFormDisabled}
                        />
                        {errors.nome && <p className="text-destructive text-sm">{errors.nome.message}</p>}
                    </div>

                    {/* Campo: Período (Grade) */}
                    <div className="space-y-2">
                        <Label htmlFor="gradeId">Período Acadêmico (Grade) *</Label>
                        <Controller
                            name="gradeId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={isFormDisabled || grades.length === 0}>
                                    <SelectTrigger id="gradeId">
                                        <SelectValue placeholder={loadingGrades ? "Carregando períodos..." : (grades.length === 0 ? "Nenhuma grade encontrada" : "Selecione o período")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grades.map(grade => (
                                            <SelectItem key={grade.id} value={String(grade.id)}>
                                                {grade.periodoAcademico}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.gradeId && <p className="text-destructive text-sm">{errors.gradeId.message}</p>}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isFormDisabled || grades.length === 0}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Criar Turma
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}