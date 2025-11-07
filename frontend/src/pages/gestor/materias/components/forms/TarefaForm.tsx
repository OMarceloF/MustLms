// app/producao-academica/components/forms/TarefaForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { UploadCloud } from "lucide-react";

// Componente auxiliar para seletores de data/hora reutilizáveis
const DateTimeSelector = ({ label, id }: { label: string, id: string }) => (
  <div className="space-y-2 rounded-md border p-3">
    <div className="flex items-center space-x-2">
      <Checkbox id={id}/>
      <Label htmlFor={id}>{label}</Label>
    </div>
    {/* Os campos de data/hora (desabilitados por padrão) ficariam aqui. */}
    <div className="pl-6 text-xs text-muted-foreground">
      Habilite para definir a data.
    </div>
  </div>
);

export function TarefaForm() {
  return (
    <>
      <AccordionItem value="disponibilidade">
        <AccordionTrigger>Disponibilidade</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-3">
          <DateTimeSelector id="allow-from" label="Permite envios a partir de" />
          <DateTimeSelector id="due-date" label="Data de entrega" />
          <DateTimeSelector id="cutoff-date" label="Data limite" />
          <DateTimeSelector id="grading-reminder" label="Lembre-me de avaliar por" />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tipos-envio">
        <AccordionTrigger>Tipos de Envio</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-4">
          <div className="space-y-3">
            <Label>Tipos de envio permitidos</Label>
            <div className="flex items-center space-x-2"><Checkbox id="tipo-texto-online" /><Label htmlFor="tipo-texto-online">Texto online</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="tipo-envio-arquivo" defaultChecked /><Label htmlFor="tipo-envio-arquivo">Envios de arquivo</Label></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-files">Número máximo de arquivos enviados</Label>
            <Input id="max-files" type="number" defaultValue={20} />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tipos-feedback">
        <AccordionTrigger>Tipos de Feedback</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-3">
          <div className="flex items-center space-x-2"><Checkbox id="feedback-comments" defaultChecked /><Label htmlFor="feedback-comments">Comentários de feedback</Label></div>
          <div className="flex items-center space-x-2"><Checkbox id="feedback-files" /><Label htmlFor="feedback-files">Arquivos de feedback</Label></div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="nota">
        <AccordionTrigger>Nota</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2 flex-1">
              <Label>Tipo</Label>
              <Select defaultValue="pontos"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pontos">Pontos</SelectItem><SelectItem value="escala">Escala</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-grade">Nota máxima</Label>
              <Input id="max-grade" type="number" defaultValue={100} className="w-24" />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
