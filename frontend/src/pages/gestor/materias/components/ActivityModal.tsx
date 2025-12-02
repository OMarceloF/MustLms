"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { ActivityForm } from "./ActivityForm";
import { Loader2 } from "lucide-react";
import { obterAtividade } from "../../../../services/producaoAcademicaService";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId?: number | null;
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

  useEffect(() => {
    const fetchActivity = async () => {
      if (!isOpen) return;
      if (!activityId) {
        setInitialData(null);
        return;
      }

      try {
        setLoading(true);
        const data = await obterAtividade(activityId);
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="w-full sm:max-w-3xl max-h-[90vh] overflow-auto p-6 z-[500] mt-[80px] rounded-lg">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {activityId ? "Editar Atividade" : "Nova Atividade"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Criar ou editar atividade de curso
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6">
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
