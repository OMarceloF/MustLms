// app/producao-academica/components/forms/QuestionarioForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { HelpTooltip } from "../form-sections/HelpTooltip";
import { RichTextEditor } from "../form-sections/RichTextEditor";
import { Button } from "../../../components/ui/button";

// Componente auxiliar para as opções de revisão
const ReviewOptionsGrid = ({ title }: { title: string }) => (
  <div className="space-y-2 rounded-md border p-3 bg-background">
    <h4 className="font-semibold text-sm">{title}</h4>
    <div className="space-y-2 pl-2">
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">A tentativa</Label></div>
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">Acertos/Erros</Label></div>
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">Notas</Label></div>
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">Feedback específico</Label></div>
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">Feedback geral</Label></div>
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">Resposta correta</Label></div>
      <div className="flex items-center gap-3"><Checkbox defaultChecked /><Label className="font-normal">Feedback final</Label></div>
    </div>
  </div>
);

export function QuestionarioForm() {
  return (
    <>
      {/* Seção Duração (já existente, mas podemos refinar) */}
      <AccordionItem value="duracao">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Duração</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          {/* ... código da seção Duração ... */}
        </AccordionContent>
      </AccordionItem>

      {/* Seção Nota (Aprimorada) */}
      <AccordionItem value="nota">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Nota</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Categoria de notas</Label>
            <Select defaultValue="uncategorized"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="uncategorized">Não categorizado</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Nota para aprovação</Label>
            <Input type="number" placeholder="Ex: 7.0" className="max-w-xs" />
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Tentativas permitidas</Label>
            <Select defaultValue="unlimited"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unlimited">Ilimitado</SelectItem><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Método de avaliação</Label>
            <Select defaultValue="highest"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="highest">Nota mais alta</SelectItem><SelectItem value="average">Média das notas</SelectItem><SelectItem value="first">Primeira tentativa</SelectItem><SelectItem value="last">Última tentativa</SelectItem></SelectContent></Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Layout (Aprimorada) */}
      <AccordionItem value="layout">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Layout</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Nova página</Label>
            <Select defaultValue="every"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="every">Cada questão</SelectItem><SelectItem value="every2">A cada 2 questões</SelectItem></SelectContent></Select>
          </div>
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <Label>Método de navegação</Label>
            <Select defaultValue="free"><SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="free">Livre</SelectItem><SelectItem value="sequential">Sequencial</SelectItem></SelectContent></Select>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Opções de Revisão (Nova) */}
      <AccordionItem value="review-options">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Opções de revisão</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Controle quais informações os estudantes podem ver ao revisar uma tentativa.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReviewOptionsGrid title="Durante a tentativa" />
            <ReviewOptionsGrid title="Após a tentativa" />
            <ReviewOptionsGrid title="Mais tarde, enquanto o questionário estiver aberto" />
            <ReviewOptionsGrid title="Depois do fechamento do questionário" />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Feedback Final (Nova) */}
      <AccordionItem value="final-feedback">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">Feedback final</AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Exibe um feedback geral ao final da tentativa, baseado na nota do estudante.</p>
          <div className="space-y-3 p-4 border rounded-md bg-background">
            <Label className="font-semibold">Feedback para nota 100%</Label>
            <RichTextEditor id="feedback-100" placeholder="Parabéns, você gabaritou!" rows={3} />
          </div>
          <div className="space-y-3 p-4 border rounded-md bg-background">
            <Label className="font-semibold">Feedback para nota 70%</Label>
            <RichTextEditor id="feedback-70" placeholder="Bom trabalho, continue estudando!" rows={3} />
          </div>
          <Button variant="link" className="p-0 h-auto">Adicionar mais campos de feedback</Button>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
