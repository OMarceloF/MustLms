// app/producao-academica/components/forms/UrlForm.tsx
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "../../../components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function UrlForm() {
  const { watch, setValue } = useFormContext();

  const displayMode = watch("display_mode") || "auto";
  const mostrarDescricao = watch("mostrar_descricao") || false;
  const parametros = watch("parametros") || [];

  const addParametro = () => {
    const updated = [...parametros, { nome: "", valor: "" }];
    setValue("parametros", updated);
  };

  const updateParametro = (index: number, key: "nome" | "valor", val: string) => {
    const updated = [...parametros];
    updated[index][key] = val;
    setValue("parametros", updated);
  };

  const removeParametro = (index: number) => {
    const updated = parametros.filter((_: any, i: number) => i !== index);
    setValue("parametros", updated);
  };

  return (
    <Card className="border bg-card">
      <CardContent className="space-y-8 p-6">

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
              <SelectItem value="newtab">Abrir em nova aba</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DESCRIÇÃO */}
        <div className="flex items-center gap-3">
          <Switch
            checked={!!mostrarDescricao}
            onCheckedChange={(v) => setValue("mostrar_descricao", v)}
          />
          <Label>Exibir descrição junto da URL</Label>
        </div>

        {/* PARÂMETROS */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label className="font-semibold">Parâmetros GET (opcional)</Label>
            <Button variant="outline" size="sm" onClick={addParametro}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>

          {parametros.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum parâmetro adicionado.</p>
          )}

          {parametros.map((p: any, index: number) => (
            <div key={index} className="grid grid-cols-5 gap-3 items-end border rounded p-3">
              <div className="col-span-2">
                <Label>Nome</Label>
                <Input
                  value={p.nome}
                  onChange={(e) => updateParametro(index, "nome", e.target.value)}
                />
              </div>

              <div className="col-span-2">
                <Label>Valor</Label>
                <Input
                  value={p.valor}
                  onChange={(e) => updateParametro(index, "valor", e.target.value)}
                />
              </div>

              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeParametro(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
