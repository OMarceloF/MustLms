"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Plus, Search } from "lucide-react"
import { TurmaTable } from "./turma-table"
import { TurmaModal } from "./turma-modal"
import type { Turma } from "../../lib/types" // Seu tipo está correto
import { useToast } from "../hooks/use-toast"

// URL base da sua API
const API_BASE_URL = 'http://localhost:3001/api';

export default function TurmasPage() {
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTurma, setEditingTurma] = useState<Turma | undefined>();
    const { toast } = useToast();

    useEffect(() => {
        const fetchTurmas = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/turmas-novo`);
                if (!response.ok) {
                    throw new Error('Falha ao buscar os dados das turmas.');
                }
                const data: Turma[] = await response.json();
                setTurmas(data);
            } catch (error) {
                console.error("Erro ao buscar turmas:", error);
                toast({
                    title: "Erro de Conexão",
                    description: "Não foi possível carregar as turmas. Verifique se o backend está rodando.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTurmas();
    }, [toast]);

    // <<--- CORREÇÃO FINAL APLICADA AQUI --->>
    const filteredTurmas = turmas.filter((turma) => {
        const searchLower = searchTerm.toLowerCase();

        // 1. Busca nos campos principais (sempre existentes)
        const nomeTurmaMatch = turma.nomeTurma.toLowerCase().includes(searchLower);
        const statusMatch = turma.status.toLowerCase().includes(searchLower);

        // 2. Busca nos campos de nomes relacionados (verificando se existem)
        const cursoMatch = turma.cursoNome?.toLowerCase().includes(searchLower) ?? false;
        const professorMatch = turma.responsavelNome?.toLowerCase().includes(searchLower) ?? false;

        // 3. Busca no array de nomes de matérias
        const materiaMatch =
            turma.materiasNomes?.some(nome => nome.toLowerCase().includes(searchLower)) ?? false;

        return nomeTurmaMatch || statusMatch || cursoMatch || professorMatch || materiaMatch;
    });

    const refreshTurmas = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/turmas-novo`);
            const data = await response.json();
            setTurmas(data);
        } catch (error) {
            console.error("Erro ao recarregar turmas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveTurma = async (turmaData: Turma) => {
        const isEditing = !!editingTurma;
        // Removendo os campos de nomes para não enviá-los de volta para a API
        const { cursoNome, responsavelNome, materiasNomes, ...payload } = turmaData;

        const url = isEditing ? `${API_BASE_URL}/turmas-novo/${payload.id}` : `${API_BASE_URL}/turmas-novo`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), // Enviando apenas os dados necessários
            });

            if (!response.ok) {
                throw new Error(isEditing ? 'Falha ao atualizar a turma.' : 'Falha ao criar a turma.');
            }

            toast({
                title: isEditing ? "Turma atualizada!" : "Turma criada!",
                description: `A turma "${turmaData.nomeTurma}" foi salva com sucesso.`,
            });

            refreshTurmas();
            closeModal();

        } catch (error) {
            console.error("Erro ao salvar turma:", error);
            toast({
                title: "Erro ao Salvar",
                description: "Não foi possível salvar a turma. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteTurma = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/turmas-novo/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir a turma.');
            }

            toast({
                title: "Turma excluída!",
                description: "A turma foi removida com sucesso.",
            });

            refreshTurmas();

        } catch (error) {
            console.error("Erro ao excluir turma:", error);
            toast({
                title: "Erro ao Excluir",
                description: "Não foi possível excluir a turma. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const openEditModal = (turma: Turma) => {
        setEditingTurma(turma);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTurma(undefined);
    };

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="mx-auto max-w-7xl">
                <div className="rounded-2xl bg-card p-8 shadow-sm">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">Gestão de Turmas</h1>
                        <p className="mt-2 text-pretty text-muted-foreground">
                            Visualize e cadastre turmas vinculadas aos cursos e matérias.
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por turma, curso, matéria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                            <Plus className="size-4" />
                            Adicionar Nova Turma
                        </Button>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <p className="text-muted-foreground">Carregando turmas...</p>
                        </div>
                    ) : (
                        <TurmaTable turmas={filteredTurmas} onEdit={openEditModal} onDelete={handleDeleteTurma} />
                    )}
                </div>
            </div>

            {/* Modal */}
            <TurmaModal
                open={isModalOpen}
                onOpenChange={closeModal}
                turma={editingTurma}
                onSave={handleSaveTurma}
            />
        </div>
    )
}
