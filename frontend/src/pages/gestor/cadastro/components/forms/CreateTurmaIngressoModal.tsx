// frontend/src/pages/gestor/cadastro/components/forms/CreateTurmaIngressoModal.tsx

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

// --- Interfaces ---
interface CreateTurmaIngressoModalProps {
    isOpen: boolean;
    onClose: () => void;
    cursoId: number;
    cursoNome?: string;
    cursoSigla?: string;
    onTurmaCreated: (turma: { id: number; nome: string; curso_posgraduacao_id: number }) => void;
}

interface PeriodoLetivo {
    id: number;
    nome: string;
}

// --- Schema de Validação ---
const turmaSchema = z.object({
    nome: z.string().min(3, "O nome da turma deve ter pelo menos 3 caracteres."),
    periodoLetivoId: z.string({ required_error: "Selecione um período acadêmico." }).min(1, "Selecione um período."),
});

type TurmaFormData = z.infer<typeof turmaSchema>;

export function CreateTurmaIngressoModal({
    isOpen,
    onClose,
    cursoId,
    cursoNome,
    cursoSigla,
    onTurmaCreated
}: CreateTurmaIngressoModalProps) {
    const [loading, setLoading] = useState(false);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [periodos, setPeriodos] = useState<PeriodoLetivo[]>([]);

    const form = useForm<TurmaFormData>({
        resolver: zodResolver(turmaSchema),
        defaultValues: {
            nome: '',
            periodoLetivoId: ''
        }
    });

    // 1. Buscar Períodos Letivos ao abrir o modal
    useEffect(() => {
        if (isOpen) {
            const fetchPeriodos = async () => {
                setLoadingPeriodos(true);
                try {
                    const response = await fetch('/api/form-data/periodos-letivos');
                    if (!response.ok) throw new Error('Erro ao buscar períodos.');
                    const data = await response.json();
                    setPeriodos(data);
                } catch (error) {
                    console.error(error);
                    toast.error("Erro", { description: "Não foi possível carregar os períodos letivos." });
                } finally {
                    setLoadingPeriodos(false);
                }
            };
            fetchPeriodos();
            form.reset(); // Limpa o formulário sempre que abre
        }
    }, [isOpen, form]);

    // 2. Enviar dados para o Backend
    const onSubmit = async (data: TurmaFormData) => {
        if (!cursoId) {
            toast.error("Erro interno", { description: "ID do curso não informado." });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/turmas-ingresso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: data.nome,
                    periodoLetivoId: Number(data.periodoLetivoId),
                    cursoId: cursoId
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao criar turma.');
            }

            toast.success("Sucesso!", { description: "Turma de ingresso criada." });

            // Atualiza o select do formulário pai
            onTurmaCreated(result.turma);
            
            onClose();
        } catch (error: any) {
            toast.error("Erro ao criar turma", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Criar Nova Turma de Ingresso</DialogTitle>
                    <DialogDescription>
                        Crie uma turma e defina o período acadêmico (grade) para o curso selecionado.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    
                    {/* Exibição do Curso Selecionado (Read-Only) */}
                    <div className="grid gap-2">
                        <Label className="text-muted-foreground">Curso Selecionado:</Label>
                        <div className="p-3 bg-muted/50 rounded-md text-sm font-medium border">
                            {cursoSigla ? `${cursoNome} (${cursoSigla})` : cursoNome || "..."}
                        </div>
                    </div>

                    {/* Nome da Turma */}
                    <div className="grid gap-2">
                        <Label htmlFor="nome">Nome da Turma *</Label>
                        <Input 
                            id="nome" 
                            placeholder="Ex: 2025/1, Turma B" 
                            {...form.register('nome')} 
                        />
                        {form.formState.errors.nome && (
                            <span className="text-xs text-destructive">{form.formState.errors.nome.message}</span>
                        )}
                    </div>

                    {/* Select de Período Acadêmico */}
                    <div className="grid gap-2">
                        <Label htmlFor="periodo">Período Acadêmico (Grade) *</Label>
                        <Controller
                            name="periodoLetivoId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={loadingPeriodos}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingPeriodos ? "Carregando..." : "Selecione o período"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periodos.map((periodo) => (
                                            <SelectItem key={periodo.id} value={String(periodo.id)}>
                                                {periodo.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.periodoLetivoId && (
                            <span className="text-xs text-destructive">{form.formState.errors.periodoLetivoId.message}</span>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || loadingPeriodos}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Criar Turma
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}