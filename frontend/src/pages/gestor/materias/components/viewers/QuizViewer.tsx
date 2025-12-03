import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { AlertCircle, CheckCircle, Clock, History, PlayCircle, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth"; 
import { format } from "date-fns";

interface QuizViewerProps {
    activity: any;
    config: any;
    onStartQuiz: () => void; // Função que muda o estado para exibir as perguntas
}

export function QuizViewer({ activity, config, onStartQuiz }: QuizViewerProps) {
    const { user } = useAuth();
    const [tentativas, setTentativas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [detalhesTentativa, setDetalhesTentativa] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const maxTentativas = config.tentativas === -1 || config.tentativas === "unlimited" ? Infinity : Number(config.tentativas);
    const tentativasRestantes = maxTentativas === Infinity ? Infinity : Math.max(0, maxTentativas - tentativas.length);
    const podeTentar = tentativasRestantes > 0;

    useEffect(() => {
        if (user && activity.id) {
            carregarTentativas();
        }
    }, [user, activity.id]);

    const carregarTentativas = async () => {
        try {
            const res = await axios.get(`/api/producao-academica/quiz/${activity.id}/tentativas/${user?.id}`);
            setTentativas(res.data);
        } catch (error) {
            console.error("Erro ao carregar tentativas", error);
        } finally {
            setLoading(false);
        }
    };

    const verDetalhes = async (tentativaId: number) => {
        try {
            const res = await axios.get(`/api/producao-academica/quiz/tentativa/${tentativaId}/detalhes`);
            setDetalhesTentativa(res.data);
            setModalOpen(true);
        } catch (error) {
            console.error("Erro ao carregar detalhes", error);
        }
    };

    const getNotaColor = (nota: number) => {
        const aprovacao = config.nota_aprovacao || 0;
        if (nota >= aprovacao) return "text-green-600 bg-green-100";
        return "text-red-600 bg-red-100";
    };

    return (
        <div className="space-y-6">
            {/* --- CABEÇALHO DA ATIVIDADE --- */}
            <div className="bg-white rounded-lg p-6 shadow-sm border text-center space-y-4">
                <h2 className="text-2xl font-bold">{activity.nome}</h2>
                <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: activity.descricao || "" }} />
                
                <div className="flex justify-center gap-8 py-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Método de Avaliação</p>
                        <Badge variant="outline" className="text-base px-4 py-1">
                            {config.metodo_avaliacao === 'highest' ? 'Maior Nota' : 'Média'}
                        </Badge>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Tentativas Restantes</p>
                        <Badge variant={tentativasRestantes === 0 ? "destructive" : "secondary"} className="text-base px-4 py-1">
                            {tentativasRestantes === Infinity ? "Ilimitadas" : tentativasRestantes}
                        </Badge>
                    </div>
                </div>

                {podeTentar ? (
                    <Button size="lg" onClick={onStartQuiz} className="w-full md:w-auto gap-2">
                        <PlayCircle className="w-5 h-5" />
                        {tentativas.length > 0 ? "Nova Tentativa" : "Iniciar Tentativa"}
                    </Button>
                ) : (
                    <Alert variant="destructive" className="max-w-md mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Limite atingido</AlertTitle>
                        <AlertDescription>
                            Você já utilizou todas as tentativas permitidas para esta atividade.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* --- LISTA DE TENTATIVAS --- */}
            {tentativas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Histórico de Tentativas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-center">Nota</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tentativas.map((t, idx) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(t.criado_em), "dd/MM/yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={getNotaColor(t.nota)}>
                                                {Number(t.nota).toFixed(1)} / 100
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => verDetalhes(t.id)}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Revisar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* --- MODAL DE DETALHES / REVISÃO --- */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Revisão da Tentativa</DialogTitle>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 pr-4">
                        {detalhesTentativa && detalhesTentativa.questoes.map((q: any, i: number) => {
                            // Lógica para verificar se acertou (exemplo simples para múltipla escolha)
                            const opcaoCorreta = q.opcoes.find((op: any) => op.correta === 1);
                            const acertou = q.tipo.includes('multipla') 
                                ? q.resposta_aluno === opcaoCorreta?.id 
                                : false; // Adaptar lógica para outros tipos

                            return (
                                <div key={i} className="mb-6 border rounded-lg p-4 bg-slate-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-semibold text-sm">Questão {i + 1}</h3>
                                        {acertou ? (
                                            <Badge className="bg-green-600">Correto</Badge>
                                        ) : (
                                            <Badge variant="destructive">Incorreto</Badge>
                                        )}
                                    </div>
                                    <p className="mb-4 text-sm">{q.enunciado}</p>
                                    
                                    <div className="space-y-2">
                                        {q.opcoes.map((op: any) => {
                                            const isSelected = q.resposta_aluno === op.id;
                                            const isCorrect = op.correta === 1;
                                            
                                            let styleClass = "p-3 rounded border text-sm flex justify-between ";
                                            if (isSelected && isCorrect) styleClass += "bg-green-100 border-green-500";
                                            else if (isSelected && !isCorrect) styleClass += "bg-red-100 border-red-500";
                                            else if (!isSelected && isCorrect) styleClass += "bg-green-50 border-green-200 border-dashed";
                                            else styleClass += "bg-white";

                                            return (
                                                <div key={op.id} className={styleClass}>
                                                    <span>{op.texto}</span>
                                                    {isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}