"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { Download } from "lucide-react";

interface FileViewerProps {
  activity: any;  // { nome, descricao, tipo, ... }
  config: {
    url?: string;
    arquivo?: string;
    display_mode?: string;
    mostrar_descricao?: boolean;
  };
}

export function FileViewer({ activity, config }: FileViewerProps) {
  if (!config) {
    return (
      <div className="text-center text-sm text-muted-foreground p-6">
        Nenhuma configuração de arquivo encontrada.
      </div>
    );
  }

  // Compatibilidade: backend manda `url`, versão antiga mandava `arquivo`
  const url = config.url || config.arquivo || "";

  if (!url) {
    return (
      <div className="text-center text-sm text-muted-foreground p-6">
        Nenhum arquivo encontrado.
      </div>
    );
  }

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

  const displayMode = config.display_mode || "auto";

  const renderDownloadBlock = () => (
    <div className="flex flex-col items-center gap-4 p-10 border rounded bg-muted/40">
      <span className="text-sm text-muted-foreground">
        Arquivo disponível para download.
      </span>

      <Button asChild>
        <a href={url} download>
          <Download className="w-4 h-4 mr-2" />
          Baixar arquivo
        </a>
      </Button>
    </div>
  );

  // Se explicitamente for "download", não tentamos embed
  if (displayMode === "download") {
    return (
      <div className="space-y-6">
        {config.mostrar_descricao && activity.descricao && (
          <div className="prose prose-sm max-w-none mb-6 text-muted-foreground">
            {activity.descricao}
          </div>
        )}
        {renderDownloadBlock()}
      </div>
    );
  }

  // Se for imagem, PDF ou vídeo e o modo permite embed
  const canInlineRender = isImage || isPdf || isVideo;

  return (
    <div className="space-y-6">

      {/* DESCRIÇÃO DA ATIVIDADE */}
      {config.mostrar_descricao && activity.descricao && (
        <div className="prose prose-sm max-w-none mb-6 text-muted-foreground">
          {activity.descricao}
        </div>
      )}

      {/* IMAGEM */}
      {canInlineRender && isImage && (
        <div className="flex justify-center">
          <img
            src={url}
            alt={activity.nome}
            className="rounded shadow max-h-[70vh] object-contain w-full"
          />
        </div>
      )}

      {/* PDF */}
      {canInlineRender && isPdf && (
        <iframe
          src={url}
          className="w-full h-[75vh] border rounded shadow"
        />
      )}

      {/* VÍDEO */}
      {canInlineRender && isVideo && (
        <div className="flex justify-center">
          <video
            src={url}
            controls
            className="rounded shadow max-h-[70vh] w-full"
          />
        </div>
      )}

      {/* TIPOS NÃO EMBUTÍVEIS → DOWNLOAD */}
      {!canInlineRender && renderDownloadBlock()}
    </div>
  );
}
