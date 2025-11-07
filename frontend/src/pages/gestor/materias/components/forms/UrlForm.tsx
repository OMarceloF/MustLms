// app/producao-academica/components/forms/UrlForm.tsx
"use client"

import { useState } from "react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Button } from "../../../components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { HelpTooltip } from "../form-sections/HelpTooltip";

// Componente para uma única linha de parâmetro
const UrlParameterRow = () => (
  <div className="flex flex-col sm:flex-row items-center gap-2">
    <div className="flex w-full items-center gap-2">
      <span className="text-muted-foreground">&</span>
      <Input placeholder="parâmetro" className="w-full sm:w-40" />
      <span className="text-muted-foreground">=</span>
    </div>
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Escolha uma variável..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user-id">ID do Usuário</SelectItem>
        <SelectItem value="user-firstname">Primeiro Nome do Usuário</SelectItem>
        <SelectItem value="user-lastname">Sobrenome do Usuário</SelectItem>
        <SelectItem value="course-id">ID do Curso</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

export function UrlForm() {
  const [parameterCount, setParameterCount] = useState(3); // Começa com 3 campos

  return (
    <>
      {/* Seção Aparência */}
      <AccordionItem value="aparencia">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Aparência
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
          <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
            <div className="flex items-center gap-2">
              <Label>Exibir</Label>
              <HelpTooltip text="Define como o recurso URL será exibido." />
            </div>
            <Select defaultValue="auto">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="embed">Incorporar</SelectItem>
                <SelectItem value="force">Forçar o download</SelectItem>
                <SelectItem value="open">Abrir</SelectItem>
                <SelectItem value="popup">Em uma janela pop-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox id="show-url-description" />
            <Label htmlFor="show-url-description" className="font-normal">
              Exibir descrição da URL
            </Label>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Seção Variáveis de URL */}
      <AccordionItem value="variaveis">
        <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
          Variáveis de URL
        </AccordionTrigger>
        <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta seção permite que você passe informações internas como parte da URL.
          </p>
          <div className="space-y-3">
            {Array.from({ length: parameterCount }).map((_, index) => (
              <UrlParameterRow key={index} />
            ))}
          </div>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={() => setParameterCount(prev => prev + 1)}
          >
            Adicionar mais parâmetros...
          </Button>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
