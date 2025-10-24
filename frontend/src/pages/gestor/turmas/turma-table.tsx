"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import type { Turma } from "../../lib/types"
import { cursos, professores } from "../../lib/mock-data"
import { DeleteDialog } from "./delete-dialog"

interface TurmaTableProps {
  turmas: Turma[]
  onEdit: (turma: Turma) => void
  onDelete: (id: string) => void
}

export function TurmaTable({ turmas, onEdit, onDelete }: TurmaTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [turmaToDelete, setTurmaToDelete] = useState<string | null>(null)

  const getCursoNome = (cursoId: string) => {
    return cursos.find((c) => c.id === cursoId)?.nome || "N/A"
  }

  const getProfessorNome = (professorId: string) => {
    return professores.find((p) => p.id === professorId)?.nome || "N/A"
  }

  const getStatusVariant = (status: Turma["status"]) => {
    switch (status) {
      case "Ativa":
        return "default"
      case "Em Planejamento":
        return "secondary"
      case "Encerrada":
        return "outline"
      default:
        return "default"
    }
  }

  const handleDeleteClick = (id: string) => {
    setTurmaToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (turmaToDelete) {
      onDelete(turmaToDelete)
      setTurmaToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  if (turmas.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Nenhuma turma encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Turma</TableHead>
              <TableHead>Curso Vinculado</TableHead>
              <TableHead>Matérias</TableHead>
              <TableHead>Ano/Semestre</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.map((turma) => (
              <TableRow key={turma.id}>
                <TableCell className="font-medium">{turma.nomeTurma}</TableCell>
                <TableCell>{getCursoNome(turma.cursoId)}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {turma.materiasIds.length} {turma.materiasIds.length === 1 ? "matéria" : "matérias"}
                  </span>
                </TableCell>
                <TableCell>
                  {turma.anoInicio}/{turma.semestre}º
                </TableCell>
                <TableCell>{getProfessorNome(turma.responsavelId)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(turma.status)}>{turma.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(turma)}>
                      <Edit className="size-4" />
                      <span className="sr-only">Editar turma</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(turma.id)}>
                      <Trash2 className="size-4" />
                      <span className="sr-only">Excluir turma</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleConfirmDelete} />
    </>
  )
}
