"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Plus, Search } from "lucide-react"
import { TurmaTable } from "./turma-table"
import { TurmaModal } from "./turma-modal"
import { turmas as initialTurmas } from "../../lib/mock-data"
import type { Turma } from "../../lib/types"

export default function TurmasPage() {
    const [turmas, setTurmas] = useState<Turma[]>(initialTurmas)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTurma, setEditingTurma] = useState<Turma | undefined>()

    const filteredTurmas = turmas.filter((turma) => {
        const searchLower = searchTerm.toLowerCase()
        return turma.nomeTurma.toLowerCase().includes(searchLower) || turma.status.toLowerCase().includes(searchLower)
    })

    const handleAddTurma = (turma: Turma) => {
        setTurmas([...turmas, turma])
    }

    const handleEditTurma = (turma: Turma) => {
        setTurmas(turmas.map((t) => (t.id === turma.id ? turma : t)))
    }

    const handleDeleteTurma = (id: string) => {
        setTurmas(turmas.filter((t) => t.id !== id))
    }

    const openEditModal = (turma: Turma) => {
        setEditingTurma(turma)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setEditingTurma(undefined)
    }

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
                                placeholder="Buscar por nome da turma ou status..."
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
                    <TurmaTable turmas={filteredTurmas} onEdit={openEditModal} onDelete={handleDeleteTurma} />
                </div>
            </div>

            {/* Modal */}
            <TurmaModal
                open={isModalOpen}
                onOpenChange={closeModal}
                turma={editingTurma}
                onSave={(turma) => {
                    if (editingTurma) {
                        handleEditTurma(turma)
                    } else {
                        handleAddTurma(turma)
                    }
                    closeModal()
                }}
            />
        </div>
    )
}
