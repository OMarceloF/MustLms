import React, { useState } from "react";
import { Download, FileText, AlertCircle, ExternalLink, File as FileIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

interface FileViewerProps {
  activity: any;
  config: {
    url?: string;
    display_mode?: string;
    mostrar_descricao?: boolean;
  };
}

export function FileViewer({ activity, config }: FileViewerProps) {
  const [loading, setLoading] = useState(true);

  // 1. Tratamento da URL
  // Se a URL vier do banco apenas como "/uploads/...", adicionamos a URL da API
  // Ajuste "http://localhost:3000" para a URL real do seu backend
  const API_BASE_URL = "http://localhost:3001"; 
  const rawUrl = config.url || "";
  
  const fileUrl = rawUrl.startsWith("http") 
    ? rawUrl 
    : `${API_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

  // 2. Identificar extensão
  const extension = rawUrl.split('.').pop()?.toLowerCase();
  
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "");
  const isPdf = ["pdf"].includes(extension || "");
  
  // Arquivos do Office (Docx, Xlsx) geralmente não abrem nativamente no navegador
  // sem usar o Google Docs Viewer ou Microsoft Office Viewer.
  // Para Localhost, viewers externos não funcionam.
  const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension || "");

  // 3. Função de Download Forçado
  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Tenta usar o nome original ou um genérico
      link.download = rawUrl.split('/').pop() || `arquivo_atividade_${activity.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      // Fallback simples
      window.open(fileUrl, "_blank");
    }
  };

  const renderPreview = () => {
    if (!rawUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p>Nenhum arquivo anexado a esta atividade.</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="flex justify-center bg-gray-100/50 rounded-lg p-4 border border-dashed">
          <img 
            src={fileUrl} 
            alt="Visualização do arquivo" 
            className="max-w-full max-h-[600px] object-contain rounded shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="w-full h-[800px] border rounded-lg overflow-hidden bg-gray-100">
          <iframe 
            src={fileUrl} 
            className="w-full h-full" 
            title="Visualizador de PDF"
          />
        </div>
      );
    }

    // Para arquivos que o navegador não abre nativamente (Word, Excel, Zip, etc)
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-lg border border-dashed">
        <FileIcon className="h-16 w-16 text-primary/60 mb-4" />
        <h3 className="text-lg font-medium mb-1">Visualização não disponível</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Este tipo de arquivo (.{extension}) não pode ser visualizado diretamente no navegador.
          Por favor, faça o download para visualizar.
        </p>
        <Button onClick={handleDownload} variant="default" size="lg">
          <Download className="mr-2 h-4 w-4" />
          Baixar Arquivo
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Botão de Download */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            {isImage ? <FileText className="h-5 w-5 text-primary" /> : <FileIcon className="h-5 w-5 text-primary" />}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-muted-foreground">Arquivo Anexado</span>
            <span className="text-base font-semibold truncate max-w-[300px]" title={rawUrl.split('/').pop()}>
              {rawUrl.split('/').pop()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* Botão de abrir em nova aba */}
          <Button variant="outline" size="sm" onClick={() => window.open(fileUrl, "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir
          </Button>
          
          {/* Botão Principal de Download */}
          <Button onClick={handleDownload} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
        </div>
      </div>

      {/* Área de Visualização */}
      <Card className="p-1 overflow-hidden">
        {renderPreview()}
      </Card>
    </div>
  );
}