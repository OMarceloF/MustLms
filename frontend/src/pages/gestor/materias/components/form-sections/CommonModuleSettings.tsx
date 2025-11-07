// gestor/materias/components/form-sections/CommonModuleSettings.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";

export function CommonModuleSettings() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Disponibilidade</Label>
        <Select defaultValue="show">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="show">Mostrar na página do curso</SelectItem>
            <SelectItem value="hide">Ocultar dos estudantes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="module-id">Número de identificação do módulo</Label>
        <Input id="module-id" placeholder="Opcional, usado para cálculos de notas" />
      </div>
    </div>
  );
}
