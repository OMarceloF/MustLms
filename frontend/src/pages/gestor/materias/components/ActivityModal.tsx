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

  // CARREGAR DADOS DA ATIVIDADE QUANDO FOR EDIÇÃO
  useEffect(() => {
    const fetchActivity = async () => {
      if (!isOpen) return;

      // Se for criação, não precisa carregar nada
      if (!activityId) {
        setInitialData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await obterAtividade(activityId);
        setInitialData(data); // contém { atividade, config, estrutura }
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
              initialData={initialData}
              cursoId={cursoId}
              materiaId={materiaId}
              turmaId={turmaId}
              onSuccess={() => {
                if (onSuccess) onSuccess();
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
