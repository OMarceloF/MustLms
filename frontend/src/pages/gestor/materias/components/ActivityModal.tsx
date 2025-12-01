// app/producao-academica/components/ActivityModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { ActivityForm } from "./ActivityForm";
import { obterAtividade } from "../../../../services/producaoAcademicaService";
import { Loader2 } from "lucide-react";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId?: number | null;   // agora usamos ID, não o objeto inteiro
  activityType: string;
  cursoId?: number;
  materiaId?: number | null;
  turmaId?: number | null;
  onSuccess?: () => void;
}

export function ActivityModal({
  isOpen,
  onClose,
  activityId,
  activityType,
  cursoId,
  materiaId = null,
  turmaId = null,
  onSuccess,
}: ActivityModalProps) {
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // DEBUG
  useEffect(() => {
    console.log("[ActivityModal] open:", isOpen, "activityId:", activityId);
  }, [isOpen, activityId]);

  // Carregar dados da atividade quando for edição
  useEffect(() => {
    const fetchActivity = async () => {
      if (!isOpen) return;

      // Criação → não carrega nada
      if (!activityId) {
        setInitialData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await obterAtividade(activityId);
        // data = { atividade, config, estrutura }
        setInitialData(data);
      } catch (err) {
        console.error("Erro ao carregar atividade:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [isOpen, activityId]);

  const handleClose = () => {
    setInitialData(null);
    setLoading(false);
    onClose();
  };

  // Se não está aberto, não renderiza nada
  // REMOVIDO: if (!isOpen) return null; 
  // Isso causava problemas com o Radix UI que precisa controlar o estado de saída.

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-3xl p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {activityId ? "Editar Atividade" : "Nova Atividade"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Criar ou editar atividade de curso
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <ActivityForm
              activityType={activityType}
              initialData={initialData}   // { atividade, config, estrutura } ou null
              cursoId={cursoId}
              materiaId={materiaId}
              turmaId={turmaId}
              onSuccess={() => {
                onSuccess?.();
                handleClose();
              }}
              onCancel={handleClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
