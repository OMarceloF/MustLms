import React, { useState, useEffect } from "react";
// Ajuste os caminhos de importação conforme a estrutura do seu projeto
// Se os componentes UI estiverem na raiz src/components/ui, pode ser necessário subir mais níveis (ex: ../../../../../)
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../../../components/ui/card";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { toast } from "sonner";
import { API_URL } from "@/config";
import { useAuth } from "../../../../../hooks/useAuth";
import { PlayCircle, History, Eye, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

interface QuizBuilderProps {
  activity: any;     // atividade
  config: any;       // configuracoes do quiz
  estrutura: any;    // perguntas + opcoes
  onUpdate?: (data: any) => void;
}

type ViewMode = "overview" | "taking" | "result";

export function QuizBuilder({ activity, config, estrutura }: QuizBuilderProps) {
  const { user: currentUser } = useAuth();
  
  // Estados de Navegação e Dados
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Estados da Tentativa Atual
  const [answers, setAnswers] = useState<any>({});
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [notaFinal, setNotaFinal] = useState<number | null>(null);

  // Estados da Revisão (Modal)
  const [reviewData, setReviewData] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // --- CARREGAR HISTÓRICO AO INICIAR ---
  useEffect(() => {
    if (currentUser?.id && activity?.id) {
      fetchHistory();
    }
  }, [currentUser, activity]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/producao-academica/quiz/${activity.id}/tentativas/${currentUser?.id}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar histórico", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // --- CÁLCULOS DE CONFIGURAÇÃO ---
  const maxTentativas = config.tentativas === -1 || config.tentativas === "unlimited" ? Infinity : Number(config.tentativas);
  const tentativasUsadas = history.length;
  const tentativasRestantes = maxTentativas === Infinity ? Infinity : Math.max(0, maxTentativas - tentativasUsadas);
  const podeTentar = tentativasRestantes > 0;
  const notaAprovacao = Number(config.nota_aprovacao || 0);

  // --- LÓGICA DE EXECUÇÃO DO QUIZ ---

  if (!estrutura || !Array.isArray(estrutura.perguntas) || estrutura.perguntas.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhuma pergunta configurada para este questionário.
      </div>
    );
  }

  const perguntas = [...estrutura.perguntas].sort((a: any, b: any) => a.ordem - b.ordem);

  const handleSingleAnswer = (perguntaId: number, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [perguntaId]: value }));
  };

  const handleMultipleAnswer = (perguntaId: number, opText: string) => {
    const atual = answers[perguntaId] || [];
    let novo;
    if (atual.includes(opText)) {
      novo = atual.filter((i: string) => i !== opText);
    } else {
      novo = [...atual, opText];
    }
    setAnswers((prev: any) => ({ ...prev, [perguntaId]: novo }));
  };

  const iniciarTentativa = async () => {
    try {
      const resp = await fetch(
        `${API_URL}/api/producao-academica/quiz/${activity.id}/tentativas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: currentUser?.id ?? null })
        }
      );

      const data = await resp.json();
      setAttemptId(data.tentativa_id);
      setAnswers({});
      setViewMode("taking");
      toast.success("Tentativa iniciada! Boa sorte.");
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
      // Envia resposta por resposta (pode ser otimizado para batch no futuro)
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
      toast.error("Erro ao registrar respostas parcial.");
    }
  };

  const calcularNotaClientSide = () => {
    let total = 0;
    let corretas = 0;

    for (const pergunta of perguntas) {
      // Ignorar perguntas que não valem nota automaticamente (texto/paragrafo) se necessário,
      // ou contar como erradas até correção manual. Aqui assumimos correção automática simples.
      if (pergunta.tipo === "texto" || pergunta.tipo === "paragrafo") continue;

      total++;
      const respostaAluno = answers[pergunta.id];
      const opcoesCorretas = pergunta.opcoes?.filter((x: any) => x.correta).map((o: any) => o.texto) || [];

      if (pergunta.tipo === "multipla-escolha-multipla") {
        if (Array.isArray(respostaAluno)) {
          const isCorrect =
            respostaAluno.length === opcoesCorretas.length &&
            respostaAluno.every((r: string) => opcoesCorretas.includes(r));
          if (isCorrect) corretas++;
        }
      } else if (pergunta.tipo === "multipla" || pergunta.tipo === "vf") {
        if (opcoesCorretas.includes(respostaAluno)) corretas++;
      }
    }

    return total > 0 ? (corretas / total) * 100 : 0;
  };

  const finalizarTentativa = async () => {
    if (!attemptId) return;

    try {
      await enviarRespostas(); // Garante envio antes de fechar

      const nota = calcularNotaClientSide();
      setNotaFinal(nota);

      await fetch(
        `${API_URL}/api/producao-academica/quiz/tentativa/${attemptId}/finalizar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nota })
        }
      );

      setViewMode("result");
      fetchHistory(); // Atualiza histórico
      toast.success("Questionário finalizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao finalizar tentativa.");
    }
  };

  // --- LÓGICA DE REVISÃO (MODAL) ---
  const abrirRevisao = async (idTentativa: number) => {
    try {
      // Limpa dados anteriores para mostrar loading
      setReviewData(null); 
      setIsReviewOpen(true);

      const res = await fetch(`${API_URL}/api/producao-academica/quiz/tentativa/${idTentativa}/detalhes`);
      
      if (!res.ok) {
          throw new Error("Falha ao buscar dados");
      }

      const data = await res.json();
      setReviewData(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar detalhes da tentativa.");
      setIsReviewOpen(false); // Fecha se der erro
    }
  };

  // --- RENDERIZAÇÃO: MODO VISÃO GERAL (OVERVIEW) ---
  if (viewMode === "overview") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card className="border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">{activity.nome}</CardTitle>
            <CardDescription dangerouslySetInnerHTML={{ __html: activity.descricao || "" }} />
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                <div className="flex flex-col items-center p-3 bg-muted/20 rounded-lg border">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Método de Avaliação</span>
                    <span className="font-medium mt-1">{config.metodo_avaliacao === 'highest' ? 'Nota Mais Alta' : 'Média'}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/20 rounded-lg border">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Nota para Aprovação</span>
                    <span className="font-medium mt-1">{notaAprovacao} pts</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/20 rounded-lg border col-span-2 md:col-span-1">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Tentativas</span>
                    <div className="mt-1">
                        {tentativasRestantes === Infinity ? (
                            <Badge variant="secondary">Ilimitadas</Badge>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className="font-bold">{tentativasRestantes}</span>
                                <span className="text-muted-foreground text-xs">restantes</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Botão de Ação Principal */}
            <div className="flex justify-center pt-2">
                {podeTentar ? (
                    <Button size="lg" onClick={iniciarTentativa} className="w-full md:w-auto px-8 gap-2">
                        <PlayCircle className="w-5 h-5" />
                        {history.length > 0 ? "Tentar Novamente" : "Iniciar Questionário"}
                    </Button>
                ) : (
                    <Alert variant="destructive" className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Tentativas Esgotadas</AlertTitle>
                        <AlertDescription>Você atingiu o limite máximo de tentativas para esta atividade.</AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Tabela de Histórico */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <History className="w-5 h-5" />
                    Resumo de tentativas anteriores
                </h3>
                {loadingHistory ? (
                    <div className="text-center py-4 text-muted-foreground">Carregando histórico...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg bg-muted/10 text-muted-foreground">
                        Nenhuma tentativa realizada ainda.
                    </div>
                ) : (
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px] text-center">Tentativa</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-center">Nota / 100</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Revisão</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((t, idx) => {
                                    const nota = Number(t.nota);
                                    const aprovado = nota >= notaAprovacao;
                                    return (
                                        <TableRow key={t.id}>
                                            <TableCell className="text-center font-medium">{history.length - idx}</TableCell>
                                            <TableCell>{new Date(t.criado_em).toLocaleDateString()} às {new Date(t.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                                            <TableCell className="text-center font-bold">{t.nota !== null ? Number(t.nota).toFixed(1) : "-"}</TableCell>
                                            <TableCell className="text-center">
                                                {t.nota !== null ? (
                                                    aprovado ? <Badge className="bg-green-600 hover:bg-green-700">Aprovado</Badge> 
                                                              : <Badge variant="destructive">Reprovado</Badge>
                                                ) : (
                                                    <Badge variant="outline">Incompleto</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {t.nota !== null && (
                                                    <Button variant="ghost" size="sm" onClick={() => abrirRevisao(t.id)}>
                                                        <Eye className="w-4 h-4 mr-2" /> 
                                                        Detalhes
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* --- MODAL DE REVISÃO (DETALHES) --- */}
<Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          {/* Alteração 1: Adicionei 'w-full' e removi 'overflow-hidden' daqui para deixar a div interna controlar */}
          <DialogContent className="max-w-4xl max-h-[90vh] w-full flex flex-col p-0">
              
              {/* Alteração 2: Adicionei 'shrink-0' para garantir que o cabeçalho não diminua */}
              <DialogHeader className="p-6 border-b bg-white dark:bg-slate-950 z-10 shrink-0">
                  <DialogTitle className="text-xl flex items-center gap-2">
                      <History className="w-5 h-5 text-primary" />
                      Detalhes da Tentativa
                  </DialogTitle>
              </DialogHeader>
              
              {/* Alteração 3: Substituí <ScrollArea> por uma <div className="overflow-y-auto"> */}
              {/* Isso força a barra de rolagem a aparecer quando o conteúdo for grande */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 p-6">
                  
                      {/* PROTEÇÃO: Verifica se reviewData existe e tem os campos necessários */}
                      {reviewData && reviewData.tentativa ? (
                          <div className="space-y-8">
                              {/* Cartão de Resumo da Nota */}
                              <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-xl border shadow-sm gap-4">
                                  <div className="flex items-center gap-4">
                                      <div className={`p-4 rounded-full ${Number(reviewData.tentativa.nota || 0) >= notaAprovacao ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                          {Number(reviewData.tentativa.nota || 0) >= notaAprovacao ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                      </div>
                                      <div>
                                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Nota Final</p>
                                          <div className="flex items-baseline gap-1">
                                              <span className="text-4xl font-extrabold text-foreground">
                                                  {Number(reviewData.tentativa.nota || 0).toFixed(1)}
                                              </span>
                                              <span className="text-muted-foreground font-medium">/ 100</span>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <Badge variant="outline" className="mb-2">
                                          {new Date(reviewData.tentativa.criado_em).toLocaleDateString('pt-BR')}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground">
                                          Realizado às {new Date(reviewData.tentativa.criado_em).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                      </p>
                                  </div>
                              </div>

                              {/* Lista de Questões - O código das questões permanece igual... */}
                              <div className="space-y-6">
                                  {reviewData.questoes && reviewData.questoes.map((q: any, i: number) => {
                                      const opcoes = q.opcoes || [];
                                      const opcaoCorreta = opcoes.find((op: any) => op.correta === 1 || op.correta === true);
                                      
                                      let acertou = false;
                                      const respostaAluno = q.resposta_aluno;

                                      if (q.tipo.includes('multipla') || q.tipo === 'vf') {
                                          acertou = respostaAluno === opcaoCorreta?.texto || respostaAluno == opcaoCorreta?.id;
                                      }

                                      return (
                                          <div key={i} className={`border rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all ${
                                              acertou ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                                          }`}>
                                              {/* ... (Restante do código de renderização das questões igual ao anterior) ... */}
                                              {/* Vou resumir para não ficar gigante, mantenha o código interno das questões igual */}
                                              <div className="p-5 border-b bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-start gap-4">
                                                  <div className="flex gap-4 w-full">
                                                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold mt-0.5">
                                                          {i + 1}
                                                      </span>
                                                      <div className="flex-1">
                                                          <p className="font-medium text-base text-foreground leading-relaxed">{q.enunciado}</p>
                                                          <div className="mt-2 flex gap-2">
                                                              {acertou ? (
                                                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none">Correto</Badge>
                                                              ) : (
                                                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">Incorreto</Badge>
                                                              )}
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                              
                                              <div className="p-5 space-y-3">
                                                  {opcoes.map((op: any) => {
                                                      const isSelected = respostaAluno === op.texto || respostaAluno == op.id;
                                                      const isCorrectOption = op.correta === 1 || op.correta === true;
                                                      
                                                      let containerClass = "p-4 rounded-lg border flex justify-between items-center transition-colors ";
                                                      let icon = null;

                                                      if (isSelected && isCorrectOption) {
                                                          containerClass += "bg-green-50 border-green-500 ring-1 ring-green-500";
                                                          icon = <div className="flex items-center gap-2 text-green-700 font-bold text-xs"><CheckCircle className="w-5 h-5" /> Sua Resposta</div>;
                                                      } else if (isSelected && !isCorrectOption) {
                                                          containerClass += "bg-red-50 border-red-500 ring-1 ring-red-500";
                                                          icon = <div className="flex items-center gap-2 text-red-700 font-bold text-xs"><XCircle className="w-5 h-5" /> Sua Resposta</div>;
                                                      } else if (!isSelected && isCorrectOption) {
                                                          containerClass += "bg-white border-green-300 border-dashed";
                                                          icon = <div className="flex items-center gap-2 text-green-600 font-medium text-xs"><CheckCircle className="w-4 h-4 opacity-60" /> Resposta Correta</div>;
                                                      } else {
                                                          containerClass += "bg-white border-slate-200 text-slate-600 opacity-80 hover:bg-slate-50";
                                                      }

                                                      return (
                                                          <div key={op.id} className={containerClass}>
                                                              <div className="flex items-center gap-3">
                                                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                                                      isSelected 
                                                                          ? (isCorrectOption ? 'border-green-600 bg-green-600 text-white' : 'border-red-600 bg-red-600 text-white') 
                                                                          : 'border-slate-300'
                                                                  }`}>
                                                                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                                  </div>
                                                                  <span className={`text-sm ${isSelected || isCorrectOption ? 'font-medium text-foreground' : ''}`}>
                                                                      {op.texto}
                                                                  </span>
                                                              </div>
                                                              <div className="shrink-0 ml-4">{icon}</div>
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-muted-foreground h-full">
                              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                              <p>Carregando gabarito...</p>
                          </div>
                      )}
                  
              </div>
          </DialogContent>
      </Dialog>
    </div>
    );
  } // <--- ADICIONEI ESTA CHAVE QUE FALTAVA

  // --- RENDERIZAÇÃO: MODO RESULTADO ---
  if (viewMode === "result") {
    return (
      <Card className="shadow-lg max-w-xl mx-auto border-t-4 border-t-green-500">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Questionário Finalizado</CardTitle>
          <CardDescription>Suas respostas foram enviadas com sucesso.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="bg-muted/30 p-6 rounded-lg">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Sua nota final</p>
            {/* USO DE COALESCÊNCIA NULA (?? 0) PARA EVITAR ERRO SE NOTA FOR NULL */}
            <div className="text-4xl font-extrabold text-foreground">{(notaFinal ?? 0).toFixed(1)} <span className="text-lg text-muted-foreground font-normal">/ 100</span></div>
          </div>

          <div className="p-4 rounded-lg border">
            {/* COMPARAÇÃO SEGURA: (notaFinal ?? 0) */}
            {(notaFinal ?? 0) >= notaAprovacao ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{config?.feedback_final?.texto_aprovado || "Parabéns! Você foi aprovado."}</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">{config?.feedback_final?.texto_reprovado || "Você não atingiu a nota mínima."}</span>
                </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pb-8">
            <Button variant="outline" onClick={() => setViewMode("overview")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Menu da Atividade
            </Button>
        </CardFooter>
      </Card>
    );
  }

  // --- RENDERIZAÇÃO: MODO REALIZANDO QUIZ (TAKING) ---
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        {/* Cabeçalho Fixo ou Topo */}
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm sticky top-20 z-10">
            <div>
                <h2 className="font-semibold text-lg">{activity.nome}</h2>
                <p className="text-xs text-muted-foreground">Em andamento...</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => {
                if(window.confirm("Sair agora perderá seu progresso. Continuar?")) setViewMode("overview");
            }}>Cancelar</Button>
        </div>

      {/* Lista de Perguntas */}
      {perguntas.map((p: any, index: number) => (
          <Card key={p.id} className="shadow-sm border-l-4 border-l-blue-500/50">
            <CardHeader className="bg-muted/5 pb-2">
              <CardTitle className="text-base font-semibold flex gap-3">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 flex items-center justify-center rounded-full text-xs shrink-0">
                    {index + 1}
                </span>
                {p.enunciado}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* MULTIPLA ESCOLHA (RADIO) */}
              {p.tipo === "multipla" && (
                <RadioGroup
                  value={answers[p.id] || ""}
                  onValueChange={(v) => handleSingleAnswer(p.id, v)}
                >
                  {p.opcoes?.map((op: any) => (
                    <div key={op.id} className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${answers[p.id] === op.texto ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50 border-transparent'}`}>
                      <RadioGroupItem value={op.texto} id={`opt-${op.id}`} />
                      <label htmlFor={`opt-${op.id}`} className="text-sm w-full cursor-pointer">
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
                    const isChecked = selected.includes(op.texto);
                    return (
                      <div key={op.id} className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${isChecked ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50 border-transparent'}`}>
                        <Checkbox
                          id={`chk-${op.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleMultipleAnswer(p.id, op.texto)}
                        />
                        <label htmlFor={`chk-${op.id}`} className="text-sm w-full cursor-pointer">{op.texto}</label>
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
                  className="flex gap-4"
                >
                  {p.opcoes?.map((op: any) => (
                    <div key={op.id} className={`flex items-center gap-2 p-3 border rounded-md min-w-[120px] ${answers[p.id] === op.texto ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <RadioGroupItem value={op.texto} id={`vf-${op.id}`} />
                      <label htmlFor={`vf-${op.id}`} className="text-sm font-medium cursor-pointer w-full">
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
                  className="max-w-md"
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
      <div className="flex justify-end pt-4 pb-12">
        <Button
          size="lg"
          onClick={async () => {
            if(window.confirm("Tem certeza que deseja finalizar a tentativa?")) {
                await finalizarTentativa();
            }
          }}
          className="px-8 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Finalizar e Enviar
        </Button>
      </div>
    </div>
  );
}