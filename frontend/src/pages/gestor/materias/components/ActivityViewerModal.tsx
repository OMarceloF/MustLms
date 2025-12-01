import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../../components/ui/dialog";

import { Button } from "../../components/ui/button";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";

import {
    obterAtividade
} from "../../../../services/producaoAcademicaService";

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
    const [isFullscreen, setIsFullscreen] = useState(false);

    // DEBUG
    useEffect(() => {
        console.log("[ActivityViewerModal] -> open:", isOpen, "id:", activityId);
    }, [isOpen, activityId]);

    // Carregar dados completos da atividade
    useEffect(() => {
        const loadActivity = async () => {
            if (!isOpen || !activityId) return;

            try {
                setLoading(true);
                const data = await obterAtividade(activityId);

                setAtividade(data.atividade || null);
                setConfig(data.config || null);
                setEstrutura(data.estrutura || null);

            } catch (err) {
                console.error("Erro ao carregar atividade:", err);
            } finally {
                setLoading(false);
            }
        };

        loadActivity();

        if (!isOpen) {
            setAtividade(null);
            setConfig(null);
            setEstrutura(null);
            setIsFullscreen(false);
        }

    }, [isOpen, activityId]);

    // Renderizador principal por tipo
    const renderViewer = () => {
        if (!atividade) return null;

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
                if (!open) onClose();
            }}
        >
            <DialogContent
                className={`flex flex-col gap-0 p-0 sm:max-w-4xl transition-all duration-300 
                ${isFullscreen ? "w-screen h-screen max-w-none rounded-none m-0" : "max-h-[90vh]"}`}
            >
                <DialogHeader
                    className="flex flex-row items-center justify-between border-b px-6 py-4 space-y-0"
                >
                    <div className="flex flex-col gap-1">
                        <DialogTitle className="text-xl font-semibold">
                            {atividade?.nome || activityName || "Carregando..."}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Visualização da atividade
                        </DialogDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="h-8 w-8"
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </DialogHeader>

                <div
                    className={`flex-1 overflow-y-auto p-6
                    ${isFullscreen ? "h-[calc(100vh-65px)]" : "max-h-[calc(90vh-65px)]"}`}
                >
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
