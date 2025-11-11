// app/producao-academica/components/forms/PesquisaForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { HelpTooltip } from "../form-sections/HelpTooltip";
import { RichTextEditor } from "../form-sections/RichTextEditor";
import { Input } from "../../../components/ui/input";

// Reutilizando o componente de seletor de data que já temos em outros formulários
const DateTimeSelector = ({ label, id }: { label: string, id: string }) => (
  <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      <HelpTooltip text={`Habilite para definir a data de "${label.toLowerCase()}".`} />
    </div>
    <div className="flex items-center gap-2">
      {/* A lógica de habilitação e os seletores de data iriam aqui */}
      <p className="text-sm text-muted-foreground">[Checkbox e seletores de data]</p>
    </div>
  </div>
);

export function PesquisaForm() {
  return (
    <>
      {/* Seção Disponibilidade */}
      <AccordionItem value="disponibilidade">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Disponibilidade
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <DateTimeSelector id="allow-answers-from" label="Permitir respostas de" />
          <DateTimeSelector id="allow-answers-to" label="Permitir respostas até" />
        </AccordionContent>
      </AccordionItem>

      {/* Seção Configurações de questões e submissões */}
      <AccordionItem value="submission-settings">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Configurações de questões e submissões
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Gravar nomes de usuários</Label>
            <Select defaultValue="anonymous">
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="anonymous">Anônimo</SelectItem>
                <SelectItem value="identified">Identificado (o nome do usuário será registrado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <div className="flex items-center gap-2">
              <Label>Habilitar múltiplas submissões</Label>
              <HelpTooltip text="Permite que os usuários respondam à pesquisa mais de uma vez." />
            </div>
            <Select defaultValue="nao">
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Após envio */}
      <AccordionItem value="after-submission">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Após envio
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Mostrar a página de análise</Label>
            <Select defaultValue="nao">
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="font-semibold">Mensagem de conclusão</Label>
            <RichTextEditor id="completion-message" placeholder="Mensagem a ser exibida após o envio..." rows={5} />
          </div>
          <div className="space-y-3">
            <Label htmlFor="next-activity-link" className="font-semibold">Link para a próxima atividade</Label>
            <Input id="next-activity-link" placeholder="https://..." />
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
   );
}
