// app/producao-academica/components/form-sections/RestrictAccess.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

export function RestrictAccess() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Restrições de acesso</Label>
        <div className="rounded-md border border-dashed p-4 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma restrição definida.</p>
          <Button variant="outline" size="sm" className="mt-2">
            Adicionar restrição...
          </Button>
        </div>
      </div>
    </div>
  );
}
