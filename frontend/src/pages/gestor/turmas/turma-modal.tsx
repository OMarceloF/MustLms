"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { TurmaForm } from "./turma-form"
import type { Turma } from "../../lib/types"

interface TurmaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  turma?: Turma
  onSave: (turma: Turma) => void
}

export function TurmaModal({ open, onOpenChange, turma, onSave }: TurmaModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{turma ? "Editar Turma" : "Adicionar Nova Turma"}</DialogTitle>
          <DialogDescription>
            {turma ? "Atualize as informações da turma abaixo." : "Preencha os dados para cadastrar uma nova turma."}
          </DialogDescription>
        </DialogHeader>
        <TurmaForm turma={turma} onSave={onSave} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
