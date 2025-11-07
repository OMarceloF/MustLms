// app/producao-academica/components/ActivityModal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { ActivityForm } from "./ActivityForm"
import { ActivityType } from "../../../lib/activity-types"

interface ActivityModalProps {
  isOpen: boolean
  onClose: () => void
  activity: ActivityType | null
}

export function ActivityModal({ isOpen, onClose, activity }: ActivityModalProps) {
  if (!activity) {
    return null
  }

  // ... (funções de salvar)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 
        A responsividade do DialogContent é controlada aqui.
        - Em telas pequenas (padrão): ocupa quase toda a tela com um pequeno espaçamento.
        - Em telas 'sm' (small) e maiores: tem uma largura máxima de '4xl'.
      */}
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          {/* O tamanho da fonte também pode ser responsivo */}
          <DialogTitle className="text-xl sm:text-2xl">Adicionando: {activity.name}</DialogTitle>
          <DialogDescription className="hidden sm:block"> {/* Opcional: Ocultar descrição em telas muito pequenas */}
            {activity.description}
          </DialogDescription>
        </DialogHeader>

        {/* 
          Garante que o conteúdo do formulário seja rolável em qualquer dispositivo
          se ele exceder a altura da tela.
          - `max-h-[80vh]`: Define a altura máxima como 80% da altura da viewport (tela).
        */}
        <div className="py-4 max-h-[80vh] overflow-y-auto pr-2 sm:pr-6">
          <ActivityForm activityType={activity.id} />
        </div>

        {/* 
          Rodapé Responsivo:
          - Padrão (mobile): `flex-col-reverse` para empilhar botões verticalmente (Cancelar por último).
          - `sm` e maior: `flex-row` e `justify-between` para o layout de desktop.
        */}
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <div>
            {/* Futuro checkbox de notificação */}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="button" variant="secondary" onClick={() => {}} className="w-full sm:w-auto">
              Salvar e mostrar
            </Button>
            <Button type="button" onClick={() => {}} className="w-full sm:w-auto">
              Salvar e voltar ao curso
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
