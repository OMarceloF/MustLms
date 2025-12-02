"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="space-y-6">

      {/* Nome da Atividade */}
      <div className="font-semibold text-xl text-foreground">
        {activity.nome || "Sem nome"}
      </div>

      {/* Descrição da Atividade */}
      {config.mostrar_descricao && activity.descricao && (
        <div className="prose prose-sm max-w-none mb-6 text-muted-foreground">
          {activity.descricao}
        </div>
      )}

      {/* Link para o site */}
      <div className="flex justify-center">
        <Button asChild>
          <a href={finalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir no site
          </a>
        </Button>
      </div>
    </div>
  );
}
