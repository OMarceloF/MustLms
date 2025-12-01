import React from "react";
import { Button } from "../../../components/ui/button";
import { Download } from "lucide-react";

interface FileViewerProps {
    activity: any;  // { nome, descricao, tipo, ... }
    config: {
        arquivo: string;
        display_mode?: string;
        mostrar_descricao?: boolean;
    };
}

export function FileViewer({ activity, config }: FileViewerProps) {

    if (!config || !config.arquivo) {
        return (
            <div className="text-center text-sm text-muted-foreground p-6">
                Nenhum arquivo encontrado.
            </div>
        );
    }

    const url = config.arquivo;

    // Detectar tipo pelo final da URL
    const lowerUrl = url.toLowerCase();

    const isImage =
        lowerUrl.endsWith(".png") ||
        lowerUrl.endsWith(".jpg") ||
        lowerUrl.endsWith(".jpeg") ||
        lowerUrl.endsWith(".gif") ||
        lowerUrl.endsWith(".webp");

    const isPdf = lowerUrl.endsWith(".pdf");
    const isVideo =
        lowerUrl.endsWith(".mp4") ||
        lowerUrl.endsWith(".webm") ||
        lowerUrl.endsWith(".ogg");

    return (
        <div className="space-y-6">

            {/* DESCRIÇÃO DA ATIVIDADE */}
            {config.mostrar_descricao && activity.descricao && (
                <div className="prose prose-sm max-w-none mb-6 text-muted-foreground">
                    {activity.descricao}
                </div>
            )}

            {/* IMAGEM */}
            {isImage && (
                <div className="flex justify-center">
                    <img
                        src={url}
                        alt={activity.nome}
                        className="rounded shadow max-h-[70vh] object-contain"
                    />
                </div>
            )}

            {/* PDF */}
            {isPdf && (
                <iframe
                    src={url}
                    className="w-full h-[75vh] border rounded shadow"
                />
            )}

            {/* VÍDEO */}
            {isVideo && (
                <div className="flex justify-center">
                    <video
                        src={url}
                        controls
                        className="rounded shadow max-h-[70vh]"
                    />
                </div>
            )}

            {/* ARQUIVOS COMUNS */}
            {!isImage && !isPdf && !isVideo && (
                <div className="flex flex-col items-center gap-4 p-10 border rounded bg-muted/40">
                    <span className="text-sm text-muted-foreground">
                        Arquivo não visualizável diretamente.
                    </span>

                    <Button asChild>
                        <a href={url} download>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar arquivo
                        </a>
                    </Button>
                </div>
            )}
        </div>
    );
}
