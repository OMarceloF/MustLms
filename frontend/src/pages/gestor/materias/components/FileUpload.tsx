// app/producao-academica/components/FileUpload.tsx
"use client"

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Label } from '@radix-ui/react-label';

export function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Adiciona os novos arquivos à lista existente, evitando duplicatas
    setFiles(prevFiles => {
      const newFiles = acceptedFiles.filter(
        newFile => !prevFiles.some(prevFile => prevFile.name === newFile.name && prevFile.size === newFile.size)
      );
      return [...prevFiles, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { // Você pode definir os tipos de arquivo aceitos aqui
      // 'image/png': ['.png'],
      // 'application/pdf': ['.pdf'],
    }
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
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
      <Label className="text-base font-semibold text-foreground">Selecionar arquivos</Label>
      
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
          {isDragActive ? "Solte os arquivos aqui..." : "Arraste e solte ou clique para enviar"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Tamanho máximo do arquivo: Ilimitado</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-sm text-foreground">Arquivos na fila:</h4>
          <ul className="divide-y rounded-md border bg-background">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between p-3 text-sm hover:bg-muted/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium text-foreground truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFile(file)} aria-label="Remover arquivo" className="flex-shrink-0">
                  <X className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}