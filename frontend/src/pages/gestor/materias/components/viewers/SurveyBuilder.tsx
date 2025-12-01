import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { toast } from "sonner";
import { API_URL } from "@/config";

interface SurveyBuilderProps {
    activity: any;     // atividade
    config: any;       // config de pesquisa
    estrutura: any;    // perguntas e opcoes
    onUpdate?: (data: any) => void;
}

export function SurveyBuilder({ activity, config, estrutura, onUpdate }: SurveyBuilderProps) {

    const [answers, setAnswers] = useState<any>({});
    const [submitted, setSubmitted] = useState(false);

    if (!estrutura || !estrutura.perguntas) {
        return (
            <div className="text-center text-muted-foreground p-6">
                Nenhuma pergunta configurada para esta pesquisa.
            </div>
        );
    }

    const perguntas = estrutura.perguntas.sort((a: any, b: any) => a.ordem - b.ordem);

    const handleChange = (perguntaId: number, resposta: any) => {
        setAnswers((prev: any) => ({
            ...prev,
            [perguntaId]: resposta
        }));
    };

    const submitSurvey = async () => {
        try {
            const payload = {
                usuario_id: null, // futuro: pegar do auth
                resposta: answers
            };

            await fetch(`${API_URL}/api/producao-academica/survey/${activity.id}/respostas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            setSubmitted(true);
            toast.success("Pesquisa enviada com sucesso!");

        } catch (err) {
            console.error(err);
            toast.error("Erro ao enviar pesquisa.");
        }
    };

    if (submitted) {
        return (
            <Card className="shadow">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Obrigado por participar!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>{config?.mensagem_conclusao || "Sua resposta foi registrada."}</p>

                    {config?.proxima_url && (
                        <Button asChild>
                            <a href={config.proxima_url} target="_blank" rel="noopener noreferrer">
                                Continuar
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">

            {/* DESCRIÇÃO DA ATIVIDADE */}
            {config?.mostrar_descricao && activity.descricao && (
                <p className="text-muted-foreground">{activity.descricao}</p>
            )}

            {/* LISTA DE PERGUNTAS */}
            {perguntas.map((p: any) => (
                <Card key={p.id} className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">
                            {p.enunciado}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        {/* QUESTÃO ABERTA - RESPOSTA CURTA */}
                        {p.tipo === "texto" && (
                            <Input
                                placeholder="Digite sua resposta..."
                                value={answers[p.id] || ""}
                                onChange={(e) => handleChange(p.id, e.target.value)}
                            />
                        )}

                        {/* QUESTÃO ABERTA - PARÁGRAFO */}
                        {p.tipo === "paragrafo" && (
                            <Textarea
                                rows={4}
                                placeholder="Digite sua resposta..."
                                value={answers[p.id] || ""}
                                onChange={(e) => handleChange(p.id, e.target.value)}
                            />
                        )}

                        {/* MÚLTIPLA ESCOLHA (RADI0) */}
                        {p.tipo === "multipla" && (
                            <RadioGroup
                                value={answers[p.id] || ""}
                                onValueChange={(v) => handleChange(p.id, v)}
                            >
                                {p.opcoes?.map((op: any) => (
                                    <div
                                        key={op.id}
                                        className="flex items-center space-x-3 py-1"
                                    >
                                        <RadioGroupItem value={op.texto} id={`opt-${op.id}`} />
                                        <label
                                            htmlFor={`opt-${op.id}`}
                                            className="text-sm font-medium"
                                        >
                                            {op.texto}
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {/* CAIXAS DE SELEÇÃO (CHECKBOX MÚLTIPLOS) */}
                        {p.tipo === "caixa" && (
                            <div className="space-y-2">
                                {p.opcoes?.map((op: any) => {
                                    const selected = answers[p.id] || [];

                                    const toggle = () => {
                                        let next = [...selected];
                                        if (next.includes(op.texto)) {
                                            next = next.filter((i) => i !== op.texto);
                                        } else {
                                            next.push(op.texto);
                                        }
                                        handleChange(p.id, next);
                                    };

                                    return (
                                        <div
                                            key={op.id}
                                            className="flex items-center gap-3"
                                        >
                                            <Checkbox
                                                id={`chk-${op.id}`}
                                                checked={selected.includes(op.texto)}
                                                onCheckedChange={toggle}
                                            />
                                            <label
                                                htmlFor={`chk-${op.id}`}
                                                className="text-sm"
                                            >
                                                {op.texto}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end pt-4">
                <Button onClick={submitSurvey} className="px-6">
                    Enviar respostas
                </Button>
            </div>
        </div>
    );
}
