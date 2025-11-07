// app/producao-academica/components/forms/PaginaForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";

export function PaginaForm() {
  return (
    <Accordion type="multiple" defaultValue={['conteudo']} className="w-full">
      <AccordionItem value="conteudo">
        <AccordionTrigger>Conteúdo</AccordionTrigger>
        <AccordionContent className="p-1 pt-4">
          <div className="space-y-2">
            <Label htmlFor="page-content">Conteúdo da página</Label>
            <Textarea id="page-content" rows={10} placeholder="Escreva o conteúdo aqui..." />
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="aparencia">
        <AccordionTrigger>Aparência</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="show-page-description" />
            <Label htmlFor="show-page-description">Exibir descrição da página</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-last-modified" />
            <Label htmlFor="show-last-modified">Mostrar a data da última alteração</Label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
