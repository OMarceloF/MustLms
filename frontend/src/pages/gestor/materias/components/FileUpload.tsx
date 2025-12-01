// app/producao-academica/components/FileUpload.tsx
"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  initialFile?: string;
}

export function FileUpload({ onUploadComplete, initialFile }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialFile || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Only accept one file for now as per the requirement logic (one activity = one file usually)
    // But keeping the array structure if we want to expand later.
    const file = acceptedFiles[0];
    if (!file) return;

    setFiles([file]);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/uploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { fileUrl } = response.data;
      setUploadedUrl(fileUrl);
      if (onUploadComplete) {
        onUploadComplete(fileUrl);
      }
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar arquivo.");
      setFiles([]); // Clear file on error
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1, // Limit to 1 file for now
  });

  const removeFile = () => {
    setFiles([]);
    setUploadedUrl(null);
    if (onUploadComplete) {
      onUploadComplete('');
    }
  };

  // Função para formatar o tamanho do arquivo
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <Label className="text-base font-semibold text-foreground">Selecionar arquivo</Label>

      {!uploadedUrl && !files.length ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-input bg-background hover:border-primary/50'}`}
        >
          <input {...getInputProps()} />
          <div className="rounded-full bg-muted p-3">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-base font-medium text-foreground">
            {isDragActive ? "Solte o arquivo aqui..." : "Arraste e solte ou clique para enviar"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Tamanho máximo do arquivo: Ilimitado</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-md border bg-background p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-foreground truncate">
                    {files[0]?.name || uploadedUrl?.split('/').pop() || 'Arquivo enviado'}
                  </span>
                  {files[0] && <span className="text-xs text-muted-foreground">{formatBytes(files[0].size)}</span>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} aria-label="Remover arquivo" className="flex-shrink-0">
                <X className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}