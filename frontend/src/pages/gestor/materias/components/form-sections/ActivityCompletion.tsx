// app/producao-academica/components/form-sections/ActivityCompletion.tsx
"use client"

import { useState } from "react";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { CalendarIcon } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip"; // Importe o novo componente

export function ActivityCompletion() {
  // Estado para controlar se o seletor de data está habilitado
  const [dateEnabled, setDateEnabled] = useState(false);

  // Arrays para preencher os seletores de data/hora
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="space-y-6">
      {/* Linha 1: Acompanhamento de conclusão */}
      <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
        <div className="flex items-center gap-2">
          <Label htmlFor="completion-tracking">Acompanhamento de conclusão</Label>
          <HelpTooltip text="Define como a conclusão da atividade é rastreada." />
        </div>
        <Select defaultValue="manual">
          <SelectTrigger id="completion-tracking">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Não indicar a conclusão da atividade</SelectItem>
            <SelectItem value="manual">Os estudantes podem marcar manualmente a atividade como concluída</SelectItem>
            <SelectItem value="auto">Mostrar atividade como concluída quando as condições forem satisfeitas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Linha 2: Conclusão esperada em */}
      <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_2fr]">
        <div className="flex items-center gap-2">
          <Label>Conclusão esperada em</Label>
          <HelpTooltip text="Define uma data limite para a conclusão, que aparece no calendário." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="enable-completion-date"
              checked={dateEnabled}
              onCheckedChange={(checked) => setDateEnabled(checked as boolean)}
            />
            <Label htmlFor="enable-completion-date" className="font-normal">Habilitar</Label>
          </div>

          {/* Seletores de Data e Hora */}
          <div className={`flex flex-wrap items-center gap-2 transition-opacity ${dateEnabled ? 'opacity-100' : 'opacity-50'}`}>
            <Select disabled={!dateEnabled} defaultValue="7">
              <SelectTrigger className="w-[60px]"><SelectValue /></SelectTrigger>
              <SelectContent>{days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Select disabled={!dateEnabled} defaultValue="novembro">
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select disabled={!dateEnabled} defaultValue="2025">
              <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
            <Select disabled={!dateEnabled} defaultValue="14">
              <SelectTrigger className="w-[65px]"><SelectValue /></SelectTrigger>
              <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
            </Select>
            <Select disabled={!dateEnabled} defaultValue="36">
              <SelectTrigger className="w-[65px]"><SelectValue /></SelectTrigger>
              <SelectContent>{minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Button variant="outline" size="icon" disabled={!dateEnabled}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
