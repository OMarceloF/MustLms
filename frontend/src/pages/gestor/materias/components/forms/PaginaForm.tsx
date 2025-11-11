// app/producao-academica/components/forms/PaginaForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { RichTextEditor } from "../form-sections/RichTextEditor"; // 1. Importe o novo editor

export function PaginaForm() {
  return (
    <>
      {/* Seção de Conteúdo */}
      <AccordionItem value="conteudo">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Conteúdo
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4">
          <div className="space-y-3">
            <Label htmlFor="page-content" className="font-semibold">Conteúdo da página</Label>
            {/* 2. Substitua o Textarea pelo RichTextEditor */}
            <RichTextEditor
              id="page-content"
              placeholder="Comece a escrever o conteúdo da sua página aqui..."
              rows={15}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção de Aparência */}
      <AccordionItem value="aparencia">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Aparência
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox id="show-page-name" defaultChecked />
            <Label htmlFor="show-page-name" className="font-normal">
              Exibir o nome da página
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="show-last-modified" />
            <Label htmlFor="show-last-modified" className="font-normal">
              Mostrar a data da última alteração
            </Label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
