"use client"

import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import type { Turma } from "../../lib/types"
import { DeleteDialog } from "./delete-dialog"
import { useAuth } from '../../../hooks/useAuth';


interface TurmaTableProps {
  turmas: Turma[]
  onEdit: (turma: Turma) => void
  onDelete: (id: number) => void
}


export function TurmaTable({ turmas, onEdit, onDelete }: TurmaTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [turmaToDelete, setTurmaToDelete] = useState<number | null>(null)
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProfessor = user?.role === 'professor';

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

  const handleDeleteClick = (id: number) => {
    setTurmaToDelete(id)
    setDeleteDialogOpen(true)
  }


  const handleConfirmDelete = () => {
    if (turmaToDelete !== null) {
      onDelete(turmaToDelete)
      setTurmaToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleVisualizar = (id: number) => {
    if (isProfessor) {
      navigate(`/professor/gestao-turma/${id}`)
    } else {
      navigate(`/gestor/gestao-turma/${id}`)
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
              <TableHead>Matéria</TableHead>
              <TableHead>Ano/Semestre</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmas.map((turma) => (
              <TableRow key={turma.id}>
                <TableCell className="font-medium">{turma.nomeTurma}</TableCell>
                <TableCell>{turma.cursoNome || "N/A"}</TableCell>
                <TableCell>
                  {/* *** ALTERAÇÃO AQUI *** */}
                  {/* Lógica aprimorada para exibir o nome da matéria ou um fallback */}
                  {turma.materiasNomes && turma.materiasNomes.length > 0
                    ? turma.materiasNomes[0]
                    : "Nenhuma matéria vinculada"
                  }
                  {turma.materiasNomes && turma.materiasNomes.length > 1 && (
                    <span className="ml-2 text-muted-foreground text-xs font-medium">
                      (+{turma.materiasNomes.length - 1})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {turma.anoInicio}/{turma.semestreNome || turma.semestre}
                </TableCell>
                <TableCell>{turma.responsavelNome || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(turma.status)}>{turma.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleVisualizar(turma.id)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Visualizar turma</span>
                    </Button>
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
