// app/producao-academica/components/forms/ArquivoForm.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";

export function ArquivoForm() {
    return (
        <>
            <AccordionItem value="aparencia">
                <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
                    Aparência
                </AccordionTrigger>
                {/* 
          - bg-muted/50: Um fundo cinza muito sutil para o conteúdo.
          - rounded-b-md: Arredonda os cantos inferiores para um visual mais suave.
          - p-4: Aumenta o padding interno.
        */}
                <AccordionContent className="bg-muted/50 rounded-b-md p-4 space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="display-mode" className="font-semibold">Exibir</Label>
                        <Select defaultValue="auto">
                            <SelectTrigger id="display-mode">
                                <SelectValue />
                            </SelectTrigger>
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
                        <Checkbox id="show-resource-description" />
                        <Label htmlFor="show-resource-description" className="font-normal">
                            Exibir a descrição dos recursos
                        </Label>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </>
    );
}
