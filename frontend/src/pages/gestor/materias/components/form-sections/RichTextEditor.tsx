// app/producao-academica/components/RichTextEditor.tsx
"use client"

import { Textarea } from "../../../components/ui/textarea";
import { Bold, Italic, Underline, List, ListOrdered, Link, Image as ImageIcon, Code } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/toggle-group";
import { Separator } from "../../../components/ui/separator";

interface RichTextEditorProps {
  id: string;
  placeholder: string;
  rows?: number;
}

export function RichTextEditor({ id, placeholder, rows = 10 }: RichTextEditorProps) {
  return (
    <div className="rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      {/* Barra de Ferramentas Simulada */}
      <div className="p-2 border-b">
        <ToggleGroup type="multiple" size="sm">
          <ToggleGroupItem value="bold" aria-label="Toggle bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
          <Separator orientation="vertical" className="h-auto mx-2" />
          <ToggleGroupItem value="bullet-list" aria-label="Bullet list"><List className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="ordered-list" aria-label="Ordered list"><ListOrdered className="h-4 w-4" /></ToggleGroupItem>
          <Separator orientation="vertical" className="h-auto mx-2" />
          <ToggleGroupItem value="link" aria-label="Add link"><Link className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="image" aria-label="Add image"><ImageIcon className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="code" aria-label="Code block"><Code className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Área de Texto */}
      <Textarea
        id={id}
        placeholder={placeholder}
        rows={rows}
        // Remove a borda e o anel de foco do textarea para que o contêiner principal controle a aparência
        className="w-full rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-y"
      />
    </div>
  );
}
