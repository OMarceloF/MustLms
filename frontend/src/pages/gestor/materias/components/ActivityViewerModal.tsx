// src/pages/gestor/materias/components/ActivityViewerModal.tsx

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../../components/ui/dialog";

import { Loader2 } from "lucide-react";

import { obterAtividade } from "../../../../services/producaoAcademicaService";

import { FileViewer } from "./viewers/file-viewer";
import { UrlViewer } from "./viewers/url-viewer";
import { QuizBuilder } from "./viewers/QuizBuilder";
import { SurveyBuilder } from "./viewers/SurveyBuilder";

interface ActivityViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    activityId: number | null;
    activityName?: string;
}

export function ActivityViewerModal({
    isOpen,
    onClose,
    activityId,
    activityName
}: ActivityViewerModalProps) {
    const [atividade, setAtividade] = useState<any>(null);   // atividade do BD
    const [config, setConfig] = useState<any>(null);         // config específica por tipo
    const [estrutura, setEstrutura] = useState<any>(null);   // perguntas/itens
    const [loading, setLoading] = useState(false);

    // DEBUG
    useEffect(() => {
        console.log("[ActivityViewerModal] -> open:", isOpen, "id:", activityId);
    }, [isOpen, activityId]);

    // Carregar dados completos da atividade quando abrir
    useEffect(() => {
        if (!isOpen || !activityId) {
            return;
        }

        let cancelled = false;

        const loadActivity = async () => {
            try {
                setLoading(true);
                const data = await obterAtividade(activityId);

                if (cancelled) return;

                setAtividade(data.atividade || null);
                setConfig(data.config || null);
                setEstrutura(data.estrutura || null);
            } catch (err) {
                if (!cancelled) {
                    console.error("Erro ao carregar atividade:", err);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadActivity();

        return () => {
            cancelled = true;
        };
    }, [isOpen, activityId]);

    // Limpar tudo quando o modal for fechado
    const handleClose = () => {
        setAtividade(null);
        setConfig(null);
        setEstrutura(null);
        setLoading(false);
        onClose();
    };

    // Se não tiver ID, não renderiza nada (mas se tiver ID e isOpen=false, renderiza Dialog fechado para animação)
    if (!activityId) {
        return null;
    }

    // Render específico por tipo de atividade
    const renderViewer = () => {
        if (!atividade) {
            return (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Nenhuma atividade carregada.
                </div>
            );
        }

        switch (atividade.tipo) {
            case "arquivo":
                return <FileViewer activity={atividade} config={config} />;

            case "url":
                return <UrlViewer activity={atividade} config={config} />;

            case "questionario":
                return (
                    <QuizBuilder
                        activity={atividade}
                        config={config}
                        estrutura={estrutura}
                        onUpdate={(d: any) => {
                            setConfig(d.config);
                            setEstrutura(d.estrutura);
                        }}
                    />
                );

            case "pesquisa":
                return (
                    <SurveyBuilder
                        activity={atividade}
                        config={config}
                        estrutura={estrutura}
                        onUpdate={(d: any) => {
                            setConfig(d.config);
                            setEstrutura(d.estrutura);
                        }}
                    />
                );

            default:
                return (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        Tipo de atividade não suportado: {atividade.tipo}
                    </div>
                );
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                // clique fora, ESC, botão X padrão do DialogContent
                if (!open) handleClose();
            }}
        >
            <DialogContent
                className="flex flex-col gap-0 p-0 sm:max-w-4xl max-h-[90vh]"
            >
                <DialogHeader className="border-b px-6 py-4">
                    <DialogTitle className="text-xl font-semibold truncate">
                        {atividade?.nome || activityName || "Visualizar atividade"}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Visualização da atividade
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        renderViewer()
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
