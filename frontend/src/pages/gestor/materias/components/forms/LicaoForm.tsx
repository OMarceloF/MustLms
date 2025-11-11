// app/producao-academica/components/forms/LicaoForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { HelpTooltip } from "../form-sections/HelpTooltip";
import { Input } from "../../../components/ui/input";

export function LicaoForm() {
  return (
    <>
      {/* Seção Aparência */}
      <AccordionItem value="aparencia">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Aparência</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <div className="flex items-center gap-2">
              <Label>Barra de progresso</Label>
              <HelpTooltip text="Exibe uma barra de progresso na parte inferior da página da lição." />
            </div>
            <Select defaultValue="nao"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Mostrar menu</Label>
            <Select defaultValue="nao"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent></Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Controle de Fluxo */}
      <AccordionItem value="controle-fluxo">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Controle de fluxo</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Permitir revisão pelo estudante</Label>
            <Select defaultValue="nao"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Número máximo de tentativas</Label>
            <Input type="number" defaultValue={1} className="max-w-xs" />
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
