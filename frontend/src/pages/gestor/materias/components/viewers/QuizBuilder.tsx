import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "sonner";
import { API_URL } from "@/config";

interface QuizBuilderProps {
  activity: any;     // atividade
  config: any;       // configuracoes do quiz
  estrutura: any;    // perguntas + opcoes
  onUpdate?: (data: any) => void;
}

export function QuizBuilder({ activity, config, estrutura }: QuizBuilderProps) {
  const [answers, setAnswers] = useState<any>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [notaFinal, setNotaFinal] = useState<number | null>(null);

  if (!estrutura || !Array.isArray(estrutura.perguntas) || estrutura.perguntas.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhuma pergunta configurada para este questionário.
      </div>
    );
  }

  const perguntas = [...estrutura.perguntas].sort((a: any, b: any) => a.ordem - b.ordem);

  const handleSingleAnswer = (perguntaId: number, value: string) => {
    setAnswers((prev: any) => ({
      ...prev,
      [perguntaId]: value
    }));
  };

  const handleMultipleAnswer = (perguntaId: number, opText: string) => {
    const atual = answers[perguntaId] || [];
    let novo;
    if (atual.includes(opText)) {
      novo = atual.filter((i: string) => i !== opText);
    } else {
      novo = [...atual, opText];
    }
    setAnswers((prev: any) => ({
      ...prev,
      [perguntaId]: novo
    }));
  };

  const iniciarTentativa = async () => {
    try {
      const resp = await fetch(
        `${API_URL}/api/producao-academica/quiz/${activity.id}/tentativas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: null }) // futuro: puxar do auth
        }
      );

      const data = await resp.json();
      setAttemptId(data.tentativa_id);
      toast.success("Tentativa iniciada!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar tentativa.");
    }
  };

  const enviarRespostas = async () => {
    if (!attemptId) {
      toast.error("Tentativa não iniciada.");
      return;
    }

    try {
      for (const pergunta of perguntas) {
        const resposta = answers[pergunta.id] ?? null;

        await fetch(
          `${API_URL}/api/producao-academica/quiz/tentativa/${attemptId}/respostas`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pergunta_id: pergunta.id,
              resposta
            })
          }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar respostas.");
    }
  };

  const calcularNota = () => {
    let total = 0;
    let corretas = 0;

    for (const pergunta of perguntas) {
      total++;

      const respostaAluno = answers[pergunta.id];
      const opcoesCorretas =
        pergunta.opcoes?.filter((x: any) => x.correta).map((o: any) => o.texto) || [];

      if (pergunta.tipo === "multipla-escolha-multipla") {
        if (Array.isArray(respostaAluno)) {
          const isCorrect =
            respostaAluno.length === opcoesCorretas.length &&
            respostaAluno.every((r: string) => opcoesCorretas.includes(r));

          if (isCorrect) corretas++;
        }
      } else if (pergunta.tipo === "multipla" || pergunta.tipo === "vf") {
        if (opcoesCorretas.includes(respostaAluno)) corretas++;
      } else if (pergunta.tipo === "texto" || pergunta.tipo === "paragrafo") {
        total--;
      }
    }

    const nota = total > 0 ? (corretas / total) * 100 : 0;
    return nota;
  };

  const finalizarTentativa = async () => {
    if (!attemptId) return;

    try {
      const nota = calcularNota();
      setNotaFinal(nota);

      await fetch(
        `${API_URL}/api/producao-academica/quiz/tentativa/${attemptId}/finalizar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nota })
        }
      );

      setIsFinished(true);
      toast.success("Questionário finalizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao finalizar tentativa.");
    }
  };

  if (isFinished) {
    return (
      <Card className="shadow max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Resultado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Sua nota final: <strong>{notaFinal?.toFixed(2)}%</strong>
          </p>

          {notaFinal !== null && notaFinal >= (config?.nota_aprovacao ?? 0) ? (
            <p className="text-emerald-600 font-medium">
              {config?.feedback_final?.texto_aprovado ||
                "Parabéns! Você atingiu a nota mínima."}
            </p>
          ) : (
            <p className="text-red-600 font-medium">
              {config?.feedback_final?.texto_reprovado ||
                "Você não atingiu a nota mínima."}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* DESCRIÇÃO */}
      {activity.descricao && (
        <p className="text-muted-foreground">{activity.descricao}</p>
      )}

      {/* INICIAR TENTATIVA */}
      {!attemptId && (
        <Button onClick={iniciarTentativa} className="px-6">
          Iniciar tentativa
        </Button>
      )}

      {/* PERGUNTAS */}
      {attemptId &&
        perguntas.map((p: any) => (
          <Card key={p.id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {p.enunciado}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* MULTIPLA ESCOLHA (RADIO) */}
              {p.tipo === "multipla" && (
                <RadioGroup
                  value={answers[p.id] || ""}
                  onValueChange={(v) => handleSingleAnswer(p.id, v)}
                >
                  {p.opcoes?.map((op: any) => (
                    <div key={op.id} className="flex items-center gap-3">
                      <RadioGroupItem value={op.texto} id={`opt-${op.id}`} />
                      <label htmlFor={`opt-${op.id}`} className="text-sm">
                        {op.texto}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* MULTIPLA COM MÚLTIPLAS (CHECKBOX) */}
              {p.tipo === "multipla-escolha-multipla" && (
                <div className="space-y-2">
                  {p.opcoes?.map((op: any) => {
                    const selected = answers[p.id] || [];

                    return (
                      <div key={op.id} className="flex items-center gap-3">
                        <Checkbox
                          checked={selected.includes(op.texto)}
                          onCheckedChange={() =>
                            handleMultipleAnswer(p.id, op.texto)
                          }
                        />
                        <span className="text-sm">{op.texto}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VERDADEIRO/FALSO */}
              {p.tipo === "vf" && (
                <RadioGroup
                  value={answers[p.id] || ""}
                  onValueChange={(v) => handleSingleAnswer(p.id, v)}
                >
                  {p.opcoes?.map((op: any) => (
                    <div key={op.id} className="flex items-center gap-3">
                      <RadioGroupItem value={op.texto} id={`vf-${op.id}`} />
                      <label htmlFor={`vf-${op.id}`} className="text-sm">
                        {op.texto}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* TEXTO CURTO */}
              {p.tipo === "texto" && (
                <Input
                  value={answers[p.id] || ""}
                  onChange={(e) => handleSingleAnswer(p.id, e.target.value)}
                  placeholder="Digite sua resposta..."
                />
              )}

              {/* PARÁGRAFO */}
              {p.tipo === "paragrafo" && (
                <Textarea
                  rows={4}
                  value={answers[p.id] || ""}
                  onChange={(e) => handleSingleAnswer(p.id, e.target.value)}
                  placeholder="Digite sua resposta completa..."
                />
              )}
            </CardContent>
          </Card>
        ))}

      {/* BOTÃO DE FINALIZAÇÃO */}
      {attemptId && (
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              await enviarRespostas();
              await finalizarTentativa();
            }}
            className="px-6"
          >
            Finalizar Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
