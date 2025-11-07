// app/producao-academica/components/ActivityForm.tsx
"use client"

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import { UploadCloud } from "lucide-react"; // Importe o ícone

// Importe TODOS os formulários e seções
import { ArquivoForm } from "./forms/ArquivoForm";
import { PaginaForm } from "./forms/PaginaForm";
import { UrlForm } from "./forms/UrlForm";
import { TarefaForm } from "./forms/TarefaForm";
import { CommonModuleSettings } from "./form-sections/CommonModuleSettings";
import { ActivityCompletion } from "./form-sections/ActivityCompletion";
import { RestrictAccess } from "./form-sections/RestrictAccess";
import { Tags } from "./form-sections/Tags";
import { FileUpload } from './FileUpload';

interface ActivityFormProps {
  activityType: string;
}

export function ActivityForm({ activityType }: ActivityFormProps) {
  // Componente para a área de upload de arquivos
  const FileUploadSection = () => (
    <div className="space-y-2">
      <Label>Selecionar arquivos</Label>
      <div className="flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
        <div className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-muted-foreground">
            Você pode arrastar e soltar arquivos aqui para adicioná-los.
          </p>
        </div>
      </div>
    </div>
  );

  // Seção "Geral", agora com lógica condicional
  const GeneralSection = () => (
    <div className="space-y-6"> {/* Aumenta o espaçamento vertical */}
      <div className="space-y-3">
        <Label htmlFor="activity-name" className="text-base font-semibold">Nome *</Label>
        <Input id="activity-name" required />
      </div>
      <div className="space-y-3">
        <Label htmlFor="activity-description" className="text-base font-semibold">Descrição</Label>
        <div className="prose prose-sm max-w-none rounded-md border">
          {/* Este div simula a aparência de um editor de texto rico. */}
          <Textarea
            id="activity-description"
            placeholder="Forneça instruções ou detalhes..."
            rows={6}
            className="border-0 focus-visible:ring-0" // Remove a borda e o foco do textarea para que a borda do div prevaleça
          />
        </div>
      </div>
      <div className="flex items-center space-x-3 pt-2">
        <Checkbox id="show-description" />
        <Label htmlFor="show-description" className="font-normal">Exibir descrição na página do curso</Label>
      </div>

      {activityType === 'file' && <FileUpload />}
    </div>
  );


  const renderSpecificSections = () => {
    switch (activityType) {
      case 'arquivo': return <ArquivoForm />;
      case 'pagina': return <PaginaForm />;
      case 'url': return <UrlForm />;
      case 'tarefa': return <TarefaForm />;
      default: return null;
    }
  };

  return (
    <form>
      <Accordion type="multiple" defaultValue={['geral']} className="w-full space-y-4">

        <AccordionItem value="geral" className="rounded-lg border bg-card">
          <AccordionTrigger className="text-lg font-semibold px-4 hover:no-underline">
            Geral
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-0">
            <GeneralSection />
          </AccordionContent>
        </AccordionItem>

        {renderSpecificSections()}

        <AccordionItem value="common-settings">
          <AccordionTrigger>Configurações comuns de módulos</AccordionTrigger>
          <AccordionContent className="p-1 pt-4">
            <CommonModuleSettings />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="restrict-access">
          <AccordionTrigger>Restringir acesso</AccordionTrigger>
          <AccordionContent className="p-1 pt-4">
            <RestrictAccess />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="completion">
          <AccordionTrigger>Conclusão de atividade</AccordionTrigger>
          <AccordionContent className="p-1 pt-4">
            <ActivityCompletion />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tags">
          <AccordionTrigger>Tags</AccordionTrigger>
          <AccordionContent className="p-1 pt-4">
            <Tags />
          </AccordionContent>
        </AccordionItem>

        {/* A seção "Competências" pode ser adicionada da mesma forma */}
      </Accordion>
    </form>
  );
}
