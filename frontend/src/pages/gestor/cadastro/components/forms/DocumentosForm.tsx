import React, { useRef, useState } from 'react';
import { useRegistration } from '../../contexts/RegistrationContext';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ArrowLeft, Upload, X, FileText, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../../lib/utils';

const requiredDocuments = [
  { key: 'foto3x4', label: 'Foto 3x4', required: true },
  { key: 'comprovanteResidencia', label: 'Comprovante de Residência', required: true },
  { key: 'documentoAluno', label: 'Documento de Identificação do Aluno', required: true },
  { key: 'documentoResponsavel', label: 'Documento de Identificação do Responsável', required: true },
  { key: 'certidaoNascimento', label: 'Certidão de Nascimento', required: true },
];

const optionalDocuments = [
  { key: 'historicoEscolar', label: 'Histórico Escolar', required: false },
  { key: 'laudoMedico', label: 'Laudo Médico', required: false },
];

// Interface para o estado dos arquivos, permitindo File ou File[]
interface FilesState {
  [key: string]: File | File[] | undefined;
}

export function DocumentsForm() {
  const { state, setCurrentStep, completeStep } = useRegistration();
  const alunoId = state.data.student.id;
  
  const [files, setFiles] = useState<FilesState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
    }
  };

  const removeFile = (key: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }
  };

  const addAdditionalDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Permite selecionar múltiplos arquivos
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    input.onchange = (e) => {
      const selectedFiles = (e.target as HTMLInputElement).files;
      if (selectedFiles) {
        const currentAdicionais = (files['adicionais'] as File[] | undefined) || [];
        const newFiles = [...currentAdicionais, ...Array.from(selectedFiles)];
        setFiles(prev => ({ ...prev, adicionais: newFiles }));
      }
    };
    input.click();
  };

  const removeAdditionalDocument = (index: number) => {
    const currentAdicionais = (files['adicionais'] as File[] | undefined) || [];
    const newFiles = currentAdicionais.filter((_, i) => i !== index);
    setFiles(prev => ({ ...prev, adicionais: newFiles }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alunoId) {
      toast.error("ID do aluno não encontrado. Volte para a etapa de dados do aluno.");
      return;
    }

    const missingDocuments = requiredDocuments.filter(doc => !files[doc.key]);
    if (missingDocuments.length > 0) {
      toast.error(`Documentos obrigatórios faltando: ${missingDocuments.map(d => d.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    // Anexa todos os arquivos ao FormData
    for (const key in files) {
      const fileOrFiles = files[key];
      if (Array.isArray(fileOrFiles)) {
        fileOrFiles.forEach((file) => {
          // Anexa múltiplos arquivos com o mesmo nome de campo, o que é suportado pelo multer .any()
          formData.append('adicionais', file);
        });
      } else if (fileOrFiles) {
        formData.append(key, fileOrFiles);
      }
    }

    try {
      const response = await fetch(`/api/alunos/${alunoId}/documentos`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Falha ao enviar documentos.');
      }

      toast.success('Documentos enviados com sucesso!');
      completeStep('documents');
      setCurrentStep('contract');

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    // A lógica de voltar pode depender se o aluno é o próprio responsável
    const isSelfResponsible = state.completedSteps.includes('responsible');
    setCurrentStep(isSelfResponsible ? 'student' : 'responsible');
  };

  const DocumentUpload = ({ docKey, label, required }: { docKey: string; label: string; required: boolean; }) => {
    const file = files[docKey] as File | undefined;
    
    return (
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <Label className="font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {file && (
            <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(docKey)} className="text-destructive hover:text-destructive">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {file ? (
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{file.name}</span>
            <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRefs.current[docKey]?.click()}
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Clique para fazer upload</p>
            <p className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG (máx. 10MB)</p>
          </div>
        )}
        
        <input
          ref={(ref) => (fileInputRefs.current[docKey] = ref)}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileChange(docKey, e.target.files ? e.target.files[0] : null)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
            <span>Documentos Obrigatórios</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredDocuments.map((doc) => <DocumentUpload key={doc.key} docKey={doc.key} label={doc.label} required={doc.required} />)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Documentos Opcionais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {optionalDocuments.map((doc) => <DocumentUpload key={doc.key} docKey={doc.key} label={doc.label} required={doc.required} />)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documentos Adicionais</span>
            <Button type="button" variant="outline" size="sm" onClick={addAdditionalDocument}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
        {files.adicionais && (files.adicionais as File[]).length > 0 ? (
          <div className="space-y-3">
            {(files.adicionais as File[]).map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAdditionalDocument(index)} className="text-destructive hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nenhum documento adicional foi adicionado.
          </p>
        )}
      </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={goBack} className="px-6" disabled={isSubmitting}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button type="submit" className="gradient-primary text-primary-foreground px-8" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continuar para Contrato'}
        </Button>
      </div>
    </form>
  );
}
