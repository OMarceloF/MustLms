// app/producao-academica/components/forms/UrlForm.tsx
"use client"

import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";

export function UrlForm() {
  return (
    <>
      {/* O campo URL externa é parte da seção Geral, mas o adicionamos aqui para manter a lógica específica junta */}
      <div className="space-y-2 px-1 pb-4">
        <Label htmlFor="external-url">URL externa *</Label>
        <Input id="external-url" type="url" placeholder="https://www.exemplo.com" required />
      </div>

      <AccordionItem value="aparencia">
        <AccordionTrigger>Aparência</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Exibir</Label>
            <Select defaultValue="auto">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="embed">Incorporar</SelectItem>
                <SelectItem value="open">Abrir</SelectItem>
                <SelectItem value="popup">Em janela pop-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="show-url-description" />
            <Label htmlFor="show-url-description">Exibir descrição da URL</Label>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="variaveis">
        <AccordionTrigger>Variáveis de URL</AccordionTrigger>
        <AccordionContent className="p-1 pt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Passe dados internos, como o nome do usuário, como parâmetros na URL.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">&</span>
            <Input placeholder="parâmetro" className="w-1/3" />
            <span className="text-muted-foreground">=</span>
            <Select>
              <SelectTrigger className="flex-1">
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
          {/* Poderíamos adicionar um botão "Adicionar mais parâmetros" aqui */}
        </AccordionContent>
      </AccordionItem>
    </>
   );
}
