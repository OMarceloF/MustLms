// app/producao-academica/components/forms/ArquivoForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Card, CardContent } from "../../../components/ui/card";

export function ArquivoForm() {
    const { watch, setValue } = useFormContext();

    const displayMode = watch("display_mode") || "auto";
    const mostrarDescricao = watch("mostrar_descricao") || false;

    return (
        <Card className="border bg-card">
            <CardContent className="space-y-6 p-6">

                {/* DISPLAY MODE */}
                <div className="space-y-2">
                    <Label className="font-semibold">Modo de exibição</Label>
                    <Select
                        value={displayMode}
                        onValueChange={(v) => setValue("display_mode", v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um modo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Automático</SelectItem>
                            <SelectItem value="embed">Incorporado</SelectItem>
                            <SelectItem value="download">Somente download</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* MOSTRAR DESCRIÇÃO */}
                <div className="flex items-center gap-3">
                    <Switch
                        checked={!!mostrarDescricao}
                        onCheckedChange={(v) => setValue("mostrar_descricao", v)}
                    />
                    <Label>Exibir descrição junto ao arquivo</Label>
                </div>

                <p className="text-sm text-muted-foreground">
                    O arquivo é enviado na seção &quot;Geral&quot; do formulário através da área de upload.
                </p>

            </CardContent>
        </Card>
    );
}
