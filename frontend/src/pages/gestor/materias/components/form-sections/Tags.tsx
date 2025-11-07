// app/producao-academica/components/form-sections/Tags.tsx
"use client"

import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

export function Tags() {
  return (
    <div className="space-y-2">
      <Label htmlFor="tags-input">Tags</Label>
      <Input id="tags-input" placeholder="Inserir tags..." />
      <p className="text-xs text-muted-foreground">Separe as tags com vírgula.</p>
    </div>
  );
}
