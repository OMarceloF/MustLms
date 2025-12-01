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

// Tipos de pergunta suportados
const TIPOS_PERGUNTA = [
  { value: "multipla", label: "Múltipla Escolha (Uma resposta)" },
  { value: "multipla-escolha-multipla", label: "Múltipla Escolha (Múltiplas respostas)" },
  { value: "vf", label: "Verdadeiro / Falso" },
  { value: "texto", label: "Resposta curta" },
  { value: "paragrafo", label: "Parágrafo longo" }
];

export function QuestionarioForm({ initialData }: any) {

  const atividadeId = initialData?.atividade?.id;

  const [perguntas, setPerguntas] = useState<any[]>(initialData?.estrutura?.perguntas || []);

  useEffect(() => {
    if (initialData?.estrutura?.perguntas) {
      setPerguntas(initialData.estrutura.perguntas);
    }
  }, [initialData]);

  // Salvar NOVA pergunta no banco
  const salvarPergunta = async (index: number) => {
    const p = perguntas[index];

    // pergunta existente → atualizar
    if (p.id) {
      try {
        await fetch(`${API_URL}/api/producao-academica/quiz/pergunta/${p.id}`, {
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

    // nova pergunta → criar
    try {
      const resp = await fetch(`${API_URL}/api/producao-academica/quiz/${atividadeId}/perguntas`, {
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

  // Excluir pergunta do banco
  const excluirPergunta = async (index: number) => {
    const p = perguntas[index];

    if (p.id) {
      try {
        await fetch(`${API_URL}/api/producao-academica/quiz/pergunta/${p.id}`, {
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

  // Criar nova pergunta
  const adicionarPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: null,
        enunciado: "",
        ordem: prev.length + 1,
        tipo: "multipla",
        opcoes: []
      }
    ]);
  };

  // --- OPÇÕES ---

  const adicionarOpcao = (pIndex: number) => {
    const novaLista = [...perguntas];
    const pergunta = novaLista[pIndex];
    pergunta.opcoes = pergunta.opcoes || [];
    pergunta.opcoes.push({ id: null, texto: "", correta: false });
    setPerguntas(novaLista);
  };

  const salvarOpcao = async (pIndex: number, oIndex: number) => {
    const pergunta = perguntas[pIndex];
    const opcao = pergunta.opcoes[oIndex];

    if (!pergunta.id) {
      toast.error("Salve a pergunta antes de criar opções!");
      return;
    }

    // atualizar opção existente
    if (opcao.id) {
      try {
        await fetch(`${API_URL}/api/producao-academica/quiz/opcao/${opcao.id}`, {
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

    // nova opção
    try {
      const resp = await fetch(`${API_URL}/api/producao-academica/quiz/pergunta/${pergunta.id}/opcoes`, {
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
        await fetch(`${API_URL}/api/producao-academica/quiz/opcao/${opcao.id}`, {
          method: "DELETE"
        });
      } catch (err) {
        toast.error("Erro ao excluir opção.");
        return;
      }
    }

    // remover localmente
    perguntas[pIndex].opcoes.splice(oIndex, 1);
    setPerguntas([...perguntas]);
    toast.success("Opção removida.");
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Perguntas do Questionário</h2>
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

            {/* BOTÃO SALVAR */}
            <div className="flex justify-end">
              <Button onClick={() => salvarPergunta(pIndex)}>
                <Save className="w-4 h-4 mr-2" />
                Salvar pergunta
              </Button>
            </div>

            {/* OPÇÕES (somente tipos que possuem opções) */}
            {(p.tipo.includes("multipla") || p.tipo === "vf") && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex justify-between items-center">
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
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-sm">Opção {oIndex + 1}</span>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => excluirOpcao(pIndex, oIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* TEXTO */}
                    <Input
                      placeholder="Texto da opção"
                      value={op.texto}
                      onChange={(e) => {
                        op.texto = e.target.value;
                        setPerguntas([...perguntas]);
                      }}
                      className="mb-4"
                    />

                    {/* CORRETA */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={!!op.correta}
                        onCheckedChange={(v) => {
                          op.correta = !!v;
                          setPerguntas([...perguntas]);
                        }}
                      />
                      <span className="text-sm">Resposta correta</span>
                    </div>

                    {/* BOTÃO SALVAR */}
                    <div className="flex justify-end pt-4">
                      <Button size="sm" onClick={() => salvarOpcao(pIndex, oIndex)}>
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
