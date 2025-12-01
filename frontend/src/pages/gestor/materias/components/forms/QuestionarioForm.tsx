// app/producao-academica/components/forms/QuestionarioForm.tsx

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

// Tipos de pergunta suportados
const TIPOS_PERGUNTA = [
  { value: "multipla", label: "Múltipla Escolha (Uma resposta)" },
  { value: "multipla-escolha-multipla", label: "Múltipla Escolha (Múltiplas respostas)" },
  { value: "vf", label: "Verdadeiro / Falso" },
  { value: "texto", label: "Resposta curta" },
  { value: "paragrafo", label: "Parágrafo longo" }
];

interface QuestionarioFormProps {
  initialData: any;
  onChange: (data: any) => void;
}

export function QuestionarioForm({ initialData, onChange }: QuestionarioFormProps) {
  const [perguntas, setPerguntas] = useState<any[]>(initialData?.estrutura?.perguntas ?? []);

  // Sincronizar com initialData se mudar (ex: carregamento)
  useEffect(() => {
    if (initialData?.estrutura?.perguntas) {
      setPerguntas(initialData.estrutura.perguntas);
    }
  }, [initialData]);

  // Propagar mudanças para o pai
  useEffect(() => {
    onChange({ perguntas });
  }, [perguntas, onChange]);

  // Criar nova pergunta
  const adicionarPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: null, // ID null indica nova pergunta
        enunciado: "",
        ordem: prev.length + 1,
        tipo: "multipla",
        opcoes: []
      }
    ]);
  };

  // Remover pergunta
  const excluirPergunta = (index: number) => {
    setPerguntas((prev) => prev.filter((_, i) => i !== index));
  };

  // Atualizar campo da pergunta
  const atualizarPergunta = (index: number, field: string, value: any) => {
    const novasPerguntas = [...perguntas];
    novasPerguntas[index] = { ...novasPerguntas[index], [field]: value };
    setPerguntas(novasPerguntas);
  };

  // --- OPÇÕES ---

  const adicionarOpcao = (pIndex: number) => {
    const novasPerguntas = [...perguntas];
    const pergunta = novasPerguntas[pIndex];
    pergunta.opcoes = pergunta.opcoes || [];
    pergunta.opcoes.push({ id: null, texto: "", correta: false });
    setPerguntas(novasPerguntas);
  };

  const excluirOpcao = (pIndex: number, oIndex: number) => {
    const novasPerguntas = [...perguntas];
    novasPerguntas[pIndex].opcoes.splice(oIndex, 1);
    setPerguntas(novasPerguntas);
  };

  const atualizarOpcao = (pIndex: number, oIndex: number, field: string, value: any) => {
    const novasPerguntas = [...perguntas];
    const opcao = novasPerguntas[pIndex].opcoes[oIndex];
    novasPerguntas[pIndex].opcoes[oIndex] = { ...opcao, [field]: value };
    setPerguntas(novasPerguntas);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Perguntas do Questionário</h2>
        <Button onClick={adicionarPergunta} type="button" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Nova pergunta
        </Button>
      </div>

      {perguntas.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
          Nenhuma pergunta adicionada. Clique em "Nova pergunta" para começar.
        </div>
      )}

      {perguntas.map((p, pIndex) => (
        <Card key={pIndex} className="shadow-sm border">
          <CardHeader className="flex flex-row justify-between items-center bg-muted/30 py-3">
            <CardTitle className="text-base font-medium">
              Pergunta {pIndex + 1}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90"
              onClick={() => excluirPergunta(pIndex)}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* ENUNCIADO */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enunciado *</label>
              <Textarea
                placeholder="Digite o enunciado da pergunta..."
                value={p.enunciado}
                onChange={(e) => atualizarPergunta(pIndex, "enunciado", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* TIPO */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo *</label>
                <Select
                  value={p.tipo}
                  onValueChange={(v) => atualizarPergunta(pIndex, "tipo", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_PERGUNTA.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ORDEM */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordem</label>
                <Input
                  type="number"
                  value={p.ordem}
                  onChange={(e) => atualizarPergunta(pIndex, "ordem", parseInt(e.target.value || "0"))}
                />
              </div>
            </div>

            {/* OPÇÕES (somente tipos que possuem opções) */}
            {(p.tipo.includes("multipla") || p.tipo === "vf") && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-muted-foreground">Alternativas</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => adicionarOpcao(pIndex)}
                    type="button"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Adicionar opção
                  </Button>
                </div>

                {(!p.opcoes || p.opcoes.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">Nenhuma opção definida.</p>
                )}

                <div className="space-y-3">
                  {p.opcoes?.map((op: any, oIndex: number) => (
                    <div key={oIndex} className="flex items-center gap-3 bg-card p-2 rounded border">
                      <div className="flex-1">
                        <Input
                          placeholder={`Opção ${oIndex + 1}`}
                          value={op.texto}
                          onChange={(e) => atualizarOpcao(pIndex, oIndex, "texto", e.target.value)}
                          className="h-9"
                        />
                      </div>

                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Checkbox
                          checked={!!op.correta}
                          onCheckedChange={(v) => atualizarOpcao(pIndex, oIndex, "correta", !!v)}
                          id={`correta-${pIndex}-${oIndex}`}
                        />
                        <label
                          htmlFor={`correta-${pIndex}-${oIndex}`}
                          className="text-sm cursor-pointer select-none"
                        >
                          Correta
                        </label>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => excluirOpcao(pIndex, oIndex)}
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
