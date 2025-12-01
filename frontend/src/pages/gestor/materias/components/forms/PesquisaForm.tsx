import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";

const TIPOS = [
  { value: "texto", label: "Resposta curta" },
  { value: "paragrafo", label: "Parágrafo longo" },
  { value: "multipla", label: "Múltipla escolha (uma resposta)" },
  { value: "caixa", label: "Múltipla escolha (várias respostas)" },
];

export function PesquisaForm({ initialData }: any) {

  const atividadeId = initialData?.atividade?.id;
  const [perguntas, setPerguntas] = useState<any[]>(initialData?.estrutura?.perguntas || []);

  useEffect(() => {
    if (initialData?.estrutura?.perguntas) {
      setPerguntas(initialData.estrutura.perguntas);
    }
  }, [initialData]);

  // -------------------------------
  // PERGUNTAS
  // -------------------------------

  const adicionarPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: null,
        enunciado: "",
        tipo: "texto",
        ordem: prev.length + 1,
        opcoes: []
      }
    ]);
  };

  const salvarPergunta = async (index: number) => {
    const p = perguntas[index];

    if (p.id) {
      // update existente
      try {
        await fetch(`${API_URL}/api/producao-academica/survey/pergunta/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p)
        });

        toast.success("Pergunta atualizada.");
      } catch (err) {
        toast.error("Erro ao atualizar pergunta.");
      }
      return;
    }

    // nova pergunta
    try {
      const resp = await fetch(`${API_URL}/api/producao-academica/survey/${atividadeId}/perguntas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p)
      });

      const data = await resp.json();
      perguntas[index].id = data.pergunta_id;

      setPerguntas([...perguntas]);
      toast.success("Pergunta criada.");
    } catch (err) {
      toast.error("Erro ao criar pergunta.");
    }
  };

  const excluirPergunta = async (index: number) => {
    const p = perguntas[index];

    if (p.id) {
      try {
        await fetch(`${API_URL}/api/producao-academica/survey/pergunta/${p.id}`, {
          method: "DELETE"
        });
      } catch (err) {
        toast.error("Erro ao excluir pergunta.");
        return;
      }
    }

    setPerguntas(perguntas.filter((_, i) => i !== index));
    toast.success("Pergunta removida.");
  };

  // -------------------------------
  // OPÇÕES
  // -------------------------------

  const adicionarOpcao = (pIndex: number) => {
    const nova = [...perguntas];
    const pergunta = nova[pIndex];
    pergunta.opcoes = pergunta.opcoes || [];
    pergunta.opcoes.push({ id: null, texto: "" });
    setPerguntas(nova);
  };

  const salvarOpcao = async (pIndex: number, oIndex: number) => {
    const pergunta = perguntas[pIndex];
    const opcao = pergunta.opcoes[oIndex];

    if (!pergunta.id) {
      toast.error("Salve a pergunta antes de criar opções.");
      return;
    }

    // atualizar
    if (opcao.id) {
      try {
        await fetch(`${API_URL}/api/producao-academica/survey/opcao/${opcao.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opcao)
        });
        toast.success("Opção atualizada.");
      } catch (err) {
        toast.error("Erro ao atualizar opção.");
      }
      return;
    }

    // criar nova
    try {
      const resp = await fetch(`${API_URL}/api/producao-academica/survey/pergunta/${pergunta.id}/opcoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opcao)
      });
      const data = await resp.json();

      pergunta.opcoes[oIndex].id = data.opcao_id;
      setPerguntas([...perguntas]);
      toast.success("Opção criada.");

    } catch (err) {
      toast.error("Erro ao criar opção.");
    }
  };

  const excluirOpcao = async (pIndex: number, oIndex: number) => {
    const opcao = perguntas[pIndex].opcoes[oIndex];

    if (opcao.id) {
      try {
        await fetch(`${API_URL}/api/producao-academica/survey/opcao/${opcao.id}`, {
          method: "DELETE"
        });
      } catch (err) {
        toast.error("Erro ao excluir opção.");
        return;
      }
    }

    perguntas[pIndex].opcoes.splice(oIndex, 1);
    setPerguntas([...perguntas]);
    toast.success("Opção removida.");
  };

  // -------------------------------
  // RENDER
  // -------------------------------

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Perguntas da Pesquisa</h2>
        <Button onClick={adicionarPergunta}>
          <Plus className="w-4 h-4 mr-2" />
          Nova pergunta
        </Button>
      </div>

      {perguntas.length === 0 && (
        <p className="text-muted-foreground">Nenhuma pergunta adicionada ainda.</p>
      )}

      {perguntas.map((p, pIndex) => (
        <Card key={pIndex} className="shadow-md">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold">
              Pergunta {pIndex + 1}
            </CardTitle>

            <Button
              variant="destructive"
              size="icon"
              onClick={() => excluirPergunta(pIndex)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* ENUNCIADO */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enunciado *</label>
              <Textarea
                value={p.enunciado}
                onChange={(e) => {
                  perguntas[pIndex].enunciado = e.target.value;
                  setPerguntas([...perguntas]);
                }}
              />
            </div>

            {/* TIPO */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo *</label>
              <Select
                value={p.tipo}
                onValueChange={(v) => {
                  perguntas[pIndex].tipo = v;
                  setPerguntas([...perguntas]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ORDEM */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordem *</label>
              <Input
                type="number"
                value={p.ordem}
                onChange={(e) => {
                  perguntas[pIndex].ordem = parseInt(e.target.value || "1");
                  setPerguntas([...perguntas]);
                }}
              />
            </div>

            {/* BOTÃO SALVAR PERGUNTA */}
            <div className="flex justify-end">
              <Button onClick={() => salvarPergunta(pIndex)}>
                <Save className="w-4 h-4 mr-2" />
                Salvar pergunta
              </Button>
            </div>

            {/* OPÇÕES (apenas para tipos escolha) */}
            {(p.tipo === "multipla" || p.tipo === "caixa") && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Opções</h3>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => adicionarOpcao(pIndex)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar opção
                  </Button>
                </div>

                {p.opcoes?.length === 0 && (
                  <p className="text-muted-foreground">Nenhuma opção ainda.</p>
                )}

                {p.opcoes?.map((op: any, oIndex: number) => (
                  <Card key={oIndex} className="border p-4 shadow-sm">
                    <div className="flex justify-between mb-3 items-center">
                      <span className="font-medium text-sm">Opção {oIndex + 1}</span>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => excluirOpcao(pIndex, oIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Input
                      placeholder="Texto da opção"
                      value={op.texto}
                      onChange={(e) => {
                        op.texto = e.target.value;
                        setPerguntas([...perguntas]);
                      }}
                      className="mb-4"
                    />

                    {/* Botão salvar */}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => salvarOpcao(pIndex, oIndex)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar opção
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

          </CardContent>
        </Card>
      ))}
    </div>
  );
}
