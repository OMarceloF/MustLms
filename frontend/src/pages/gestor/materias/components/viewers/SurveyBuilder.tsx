import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"; // Certifique-se de ter este componente ou use botões
import { Progress } from "../../../components/ui/progress"; // Opcional, para barras de progresso
import { toast } from "sonner";
import axios from "axios";
import { Check, X, Save, Loader2 } from "lucide-react";

interface SurveyBuilderProps {
  activity: any;
  config: any;
  estrutura: any;
  onUpdate?: (data: any) => void;
}

export function SurveyBuilder({ activity, config, estrutura }: SurveyBuilderProps) {
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  
  // Estados para visualização de resultados
  const [activeTab, setActiveTab] = useState("preview");
  const [resultados, setResultados] = useState<any>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Estado para gerenciar correções (Chave: "respostaId_perguntaId")
  const [corrections, setCorrections] = useState<Record<string, { status: string, feedback: string }>>({});

  // Carregar resultados quando trocar para a aba de resultados
  useEffect(() => {
    if (activeTab === "results") {
      fetchResultados();
    }
  }, [activeTab]);

  const fetchResultados = async () => {
    setLoadingResults(true);
    try {
      const response = await axios.get(`/api/producao-academica/survey/${activity.id}/resultados`);
      const data = response.data;
      setResultados(data);

      // Popula o estado local de correções com o que veio do banco
      const initialCorrections: any = {};
      
      // Itera sobre as perguntas
      Object.keys(data.resultados || {}).forEach((perguntaId) => {
        const stats = data.resultados[perguntaId];
        // Se tiver análise de texto, itera sobre as respostas
        if (stats.analise && Array.isArray(stats.analise)) {
          stats.analise.forEach((item: any) => {
            if (item.correcao) {
              // Chave única composta pelo ID da resposta (submissão) e ID da pergunta
              const key = `${item.id}_${perguntaId}`;
              initialCorrections[key] = {
                status: item.correcao.status, // 'correta' | 'errada'
                feedback: item.correcao.feedback || ""
              };
            }
          });
        }
      });
      
      setCorrections(initialCorrections);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar resultados.");
    } finally {
      setLoadingResults(false);
    }
  };

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

      await axios.post(`/api/producao-academica/survey/${activity.id}/respostas`, payload);

      setSubmitted(true);
      toast.success("Pesquisa enviada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar pesquisa.");
    }
  };

  // Atualiza o estado local das correções
  const handleCorrectionChange = (respostaId: number, perguntaId: number, field: 'status' | 'feedback', value: string) => {
    const key = `${respostaId}_${perguntaId}`;
    setCorrections(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { status: '', feedback: '' }),
        [field]: value
      }
    }));
  };

  // Salva no banco de dados
  const handleSaveCorrection = async (perguntaId: number, respostaId: number) => {
    const key = `${respostaId}_${perguntaId}`;
    const dataToSave = corrections[key];

    if (!dataToSave || !dataToSave.status) {
      toast.warning("Selecione se está Correta ou Errada antes de salvar.");
      return;
    }

    try {
      await axios.post(`/api/producao-academica/survey/correcao`, {
        resposta_id: respostaId,
        pergunta_id: perguntaId,
        status: dataToSave.status,
        feedback: dataToSave.feedback
      });
      toast.success("Correção salva com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar correção.");
    }
  };

  if (!estrutura || !Array.isArray(estrutura.perguntas) || estrutura.perguntas.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-6">
        Nenhuma pergunta configurada para esta pesquisa.
      </div>
    );
  }

  const perguntas = [...estrutura.perguntas].sort((a: any, b: any) => a.ordem - b.ordem);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        {activity.descricao && (
          <p className="text-muted-foreground">{activity.descricao}</p>
        )}
      </div>

      <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="preview">Visualizar Formulário</TabsTrigger>
          <TabsTrigger value="results">Ver Respostas / Estatísticas</TabsTrigger>
        </TabsList>

        {/* ================= ABA FORMULÁRIO ================= */}
        <TabsContent value="preview" className="space-y-8">
          {submitted ? (
            <Card className="shadow max-w-xl mx-auto bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-green-700 dark:text-green-400">
                  Obrigado por participar!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>{config?.mensagem_conclusao || "Sua resposta foi registrada."}</p>
                {config?.proxima_url && (
                  <Button asChild variant="outline">
                    <a href={config.proxima_url} target="_blank" rel="noopener noreferrer">
                      Continuar
                    </a>
                  </Button>
                )}
                <Button variant="link" onClick={() => setSubmitted(false)} className="pl-0">
                  Enviar outra resposta (Teste)
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {perguntas.map((p: any) => (
                <Card key={p.id} className="shadow-sm border-l-4 border-l-primary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      {p.enunciado}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    {/* Renderização condicional baseada no tipo */}
                    {p.tipo === "texto" && (
                      <Input
                        placeholder="Digite sua resposta..."
                        value={answers[p.id] || ""}
                        onChange={(e) => handleChange(p.id, e.target.value)}
                        className="w-full"
                      />
                    )}
                    {p.tipo === "paragrafo" && (
                      <Textarea
                        rows={4}
                        placeholder="Digite sua resposta..."
                        value={answers[p.id] || ""}
                        onChange={(e) => handleChange(p.id, e.target.value)}
                        className="w-full"
                      />
                    )}
                    {p.tipo === "multipla" && (
                      <RadioGroup
                        value={answers[p.id] || ""}
                        onValueChange={(v) => handleChange(p.id, v)}
                      >
                        {p.opcoes?.map((op: any) => (
                          <div key={op.id} className="flex items-center gap-3 py-1">
                            <RadioGroupItem value={op.texto} id={`opt-${p.id}-${op.id}`} />
                            <label htmlFor={`opt-${p.id}-${op.id}`} className="text-sm cursor-pointer">
                              {op.texto}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {p.tipo === "caixa" && (
                      <div className="space-y-2">
                        {p.opcoes?.map((op: any) => {
                          const selected = answers[p.id] || [];
                          const toggle = () => {
                            let next = [...selected];
                            if (next.includes(op.texto)) next = next.filter((i:any) => i !== op.texto);
                            else next.push(op.texto);
                            handleChange(p.id, next);
                          };
                          return (
                            <div key={op.id} className="flex items-center gap-3">
                              <Checkbox
                                id={`chk-${p.id}-${op.id}`}
                                checked={selected.includes(op.texto)}
                                onCheckedChange={toggle}
                              />
                              <label htmlFor={`chk-${p.id}-${op.id}`} className="text-sm cursor-pointer">
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

              <div className="flex justify-end pt-4 pb-8">
                <Button onClick={submitSurvey} className="px-6 w-full md:w-auto">
                  Enviar respostas
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* ================= ABA RESULTADOS ================= */}
        <TabsContent value="results" className="space-y-6">
          {loadingResults ? (
             <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Carregando estatísticas...</p>
             </div>
          ) : !resultados ? (
             <div className="text-center py-10">Não foi possível carregar os dados.</div>
          ) : (
            <>
              <div className="bg-muted/50 p-4 rounded-lg border text-center mb-6">
                <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Total de Participações</span>
                <p className="text-3xl font-bold text-primary">{resultados.total_submissoes}</p>
              </div>

              <div className="grid gap-6">
                {perguntas.map((p: any) => {
                  const stats = resultados.resultados[p.id];
                  if (!stats) return null;

                  return (
                    <Card key={p.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/20 border-b pb-3">
                        <CardTitle className="text-base font-semibold">{p.enunciado}</CardTitle>
                        <div className="text-xs text-muted-foreground capitalize">
                          Tipo: {p.tipo === 'multipla' ? 'Múltipla Escolha' : p.tipo} | 
                          Respostas: {stats.total_respostas}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        
                        {/* Visualização para Múltipla Escolha e Caixa de Seleção */}
                        {(p.tipo === 'multipla' || p.tipo === 'caixa') && (
                          <div className="space-y-4">
                            {p.opcoes?.map((op: any) => {
                              const count = stats.analise[op.texto] || 0;
                              const percent = stats.total_respostas > 0 
                                ? Math.round((count / stats.total_respostas) * 100) 
                                : 0;
                              
                              return (
                                <div key={op.id} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>{op.texto}</span>
                                    <span className="font-medium">{count} votos ({percent}%)</span>
                                  </div>
                                  <Progress value={percent} className="h-2" />
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Visualização para Texto Livre com Correção */}
                        {(p.tipo === 'texto' || p.tipo === 'paragrafo') && (
                          <div className="space-y-4">
                            {stats.analise.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">Nenhuma resposta de texto ainda.</p>
                            ) : (
                              <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
                                {stats.analise.map((item: any, idx: number) => {
                                  const key = `${item.id}_${p.id}`;
                                  const currentCorrection = corrections[key] || { status: '', feedback: '' };

                                  return (
                                    <div key={idx} className="bg-background border rounded-lg p-4 shadow-sm flex flex-col gap-3 hover:border-primary/30 transition-colors">
                                      
                                      {/* Resposta do Aluno */}
                                      <div>
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-2 py-1 rounded">Resposta {idx + 1}</span>
                                          <span className="text-xs text-muted-foreground">ID: {item.id}</span>
                                        </div>
                                        <div className="p-3 bg-muted/20 rounded-md border text-sm">
                                          {item.texto}
                                        </div>
                                      </div>

                                      {/* Área de Correção */}
                                      <div className="mt-2 pt-3 border-t grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-center">
                                        
                                        {/* Opções Correta/Errada */}
                                        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border">
                                          <label 
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                                              currentCorrection.status === 'correta' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' 
                                                : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                                            }`}
                                          >
                                            <input 
                                              type="radio" 
                                              name={`correction-${p.id}-${item.id}`} 
                                              className="sr-only" 
                                              checked={currentCorrection.status === 'correta'}
                                              onChange={() => handleCorrectionChange(item.id, p.id, 'status', 'correta')}
                                            />
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm font-medium">Correta</span>
                                          </label>

                                          <div className="w-px h-6 bg-border mx-1"></div>

                                          <label 
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                                              currentCorrection.status === 'errada' 
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' 
                                                : 'hover:bg-red-50 dark:hover:bg-red-900/20'
                                            }`}
                                          >
                                            <input 
                                              type="radio" 
                                              name={`correction-${p.id}-${item.id}`} 
                                              className="sr-only"
                                              checked={currentCorrection.status === 'errada'}
                                              onChange={() => handleCorrectionChange(item.id, p.id, 'status', 'errada')}
                                            />
                                            <X className="w-4 h-4" />
                                            <span className="text-sm font-medium">Errada</span>
                                          </label>
                                        </div>

                                        {/* Campo de Feedback */}
                                        <Input 
                                          placeholder="Escreva um feedback para o aluno..." 
                                          className="h-10"
                                          value={currentCorrection.feedback}
                                          onChange={(e) => handleCorrectionChange(item.id, p.id, 'feedback', e.target.value)}
                                        />

                                        {/* Botão Salvar */}
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleSaveCorrection(p.id, item.id)}
                                          className="h-10 px-4 gap-2"
                                        >
                                          <Save className="w-4 h-4" />
                                          Salvar
                                        </Button>

                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}