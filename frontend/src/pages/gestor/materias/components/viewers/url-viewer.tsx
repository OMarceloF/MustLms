import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { ExternalLink } from "lucide-react";

interface UrlViewerProps {
    activity: any; // { nome, descricao, ... }
    config: {
        url: string;
        display_mode?: string;
        mostrar_descricao?: boolean;
        parametros?: string[];
    };
}

export function UrlViewer({ activity, config }: UrlViewerProps) {
    const [iframeAllowed, setIframeAllowed] = useState(true);

    if (!config || !config.url) {
        return (
            <div className="text-center text-sm text-muted-foreground p-6">
                Nenhuma URL configurada.
            </div>
        );
    }

    // Construir URL com parâmetros se existirem
    let finalUrl = config.url;
    if (config.parametros && Array.isArray(config.parametros) && config.parametros.length > 0) {
        const queryString = config.parametros.join("&");
        finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryString;
    }

    const displayMode = config.display_mode || "auto";

    // Tentativa de verificar se o site permite iframe
    // OBS: Só funciona para algumas origens — quando bloqueado, detectamos pelo error event
    const handleIframeError = () => {
        setIframeAllowed(false);
    };

    const renderIframe = () => (
        <iframe
            src={finalUrl}
            className="w-full h-[75vh] border rounded shadow"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={handleIframeError}
        />
    );

    const renderOpenButton = () => (
        <div className="flex flex-col items-center gap-4 p-10 border rounded bg-muted/40">
            <span className="text-sm text-muted-foreground">
                Esta URL não permite exibição por embed.
            </span>

            <Button asChild>
                <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir em nova aba
                </a>
            </Button>
        </div>
    );

    // LÓGICA PRINCIPAL DE DECISÃO DO VIEWER
    const resolveDisplay = () => {
        // Se modo explícito for "redirect"
        if (displayMode === "redirect") {
            return renderOpenButton();
        }

        // Se modo explícito for "embed"
        if (displayMode === "embed") {
            return iframeAllowed ? renderIframe() : renderOpenButton();
        }

        // AUTO — tentativa de embed primeiro
        if (displayMode === "auto") {
            return iframeAllowed ? renderIframe() : renderOpenButton();
        }

        // fallback
        return renderOpenButton();
    };

    return (
        <div className="space-y-6">

            {/* DESCRIÇÃO, SE HABILITADA */}
            {config.mostrar_descricao && activity.descricao && (
                <div className="prose prose-sm max-w-none mb-6 text-muted-foreground">
                    {activity.descricao}
                </div>
            )}

            {/* VIEWER */}
            {resolveDisplay()}
        </div>
    );
}
