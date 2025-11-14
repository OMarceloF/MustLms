// frontend/src/pages/gestor/cursos/calendario-tab.tsx

"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom" // 1. Importar useParams para pegar o ID do curso
import axios from "axios" // 2. Importar axios para chamadas de API
import { toast } from "sonner" // 3. Importar toast para notificações
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Badge } from "../components/ui/badge"
import { Plus, CalendarIcon, Clock, Loader2 } from "lucide-react" // Adicionado Loader2
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Interface para o evento, alinhada com o backend
interface Evento {
    id: string | number;
    titulo: string;
    dataInicio: string;
    dataFim: string;
    descricao: string;
    tipo: "prazo" | "evento" | "defesa";
}

// Funções de estilo (sem alteração)
const getTipoColor = (tipo: string) => {
    switch (tipo) {
        case "prazo":
            return "bg-warning/10 text-warning border-warning/20"
        case "evento":
            return "bg-info/10 text-info border-info/20"
        case "defesa":
            return "bg-success/10 text-success border-success/20"
        default:
            return "bg-muted text-muted-foreground"
    }
}

const getTipoLabel = (tipo: string) => {
    switch (tipo) {
        case "prazo":
            return "Prazo"
        case "evento":
            return "Evento"
        case "defesa":
            return "Defesa"
        default:
            return tipo
    }
}

export function CalendarioTab() {
    const { id: cursoId } = useParams<{ id: string }>(); // Pega o ID do curso da URL
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Estado para o botão de salvar
    const [formData, setFormData] = useState<Partial<Evento>>({ tipo: "evento" });

    // 4. Função para buscar os eventos da API
    const fetchEventos = async () => {
        if (!cursoId) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/cursos/${cursoId}/calendario`);
            // Ordena os eventos por data de início ao receber
            const eventosOrdenados = response.data.sort((a: Evento, b: Evento) => 
                new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
            );
            setEventos(eventosOrdenados);
        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
            toast.error("Não foi possível carregar os eventos do calendário.");
        } finally {
            setIsLoading(false);
        }
    };

    // 5. useEffect para chamar a busca de eventos quando o componente montar
    useEffect(() => {
        fetchEventos();
    }, [cursoId]);

    const handleAdd = () => {
        setFormData({ tipo: "evento", dataInicio: "", dataFim: "", titulo: "", descricao: "" });
        setIsDialogOpen(true);
    }

    // 6. Função de salvar modificada para enviar dados para a API
    const handleSave = async () => {
        if (!formData.titulo || !formData.dataInicio || !formData.dataFim) {
            toast.warning("Por favor, preencha o título e as datas do evento.");
            return;
        }
        
        setIsSaving(true);
        try {
            await axios.post(`/api/cursos/${cursoId}/calendario`, {
                titulo: formData.titulo,
                dataInicio: formData.dataInicio,
                dataFim: formData.dataFim,
                descricao: formData.descricao || "",
                tipo: formData.tipo,
            });
            toast.success("Evento adicionado com sucesso!");
            setIsDialogOpen(false);
            fetchEventos(); // Re-busca os eventos para atualizar a lista
        } catch (error) {
            console.error("Erro ao salvar evento:", error);
            toast.error("Falha ao salvar o evento. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    }

    // Função para formatar data (sem alteração, mas com try-catch melhorado)
    const formatDate = (dateString: string) => {
        if (!dateString) return "Data inválida";
        try {
            // Adiciona T00:00:00 para evitar problemas de fuso horário
            return format(new Date(`${dateString}T00:00:00`), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        } catch {
            return dateString;
        }
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Calendário Acadêmico
                        </CardTitle>
                        <CardDescription>Gerencie eventos, prazos e defesas do programa</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Evento
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-card">
                            <DialogHeader>
                                <DialogTitle>Novo Evento</DialogTitle>
                                <DialogDescription>Adicione um novo evento ao calendário acadêmico</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="titulo">Título do Evento</Label>
                                    <Input
                                        id="titulo"
                                        value={formData.titulo || ""}
                                        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                        className="bg-background"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tipo">Tipo</Label>
                                    <select
                                        id="tipo"
                                        value={formData.tipo}
                                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    >
                                        <option value="evento">Evento</option>
                                        <option value="prazo">Prazo</option>
                                        <option value="defesa">Defesa</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="dataInicio">Data de Início</Label>
                                        <Input
                                            id="dataInicio"
                                            type="date"
                                            value={formData.dataInicio || ""}
                                            onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dataFim">Data de Término</Label>
                                        <Input
                                            id="dataFim"
                                            type="date"
                                            value={formData.dataFim || ""}
                                            onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="descricao">Descrição</Label>
                                    <Textarea
                                        id="descricao"
                                        value={formData.descricao || ""}
                                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        rows={3}
                                        className="bg-background"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} className="bg-primary text-primary-foreground" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-4 text-gray-600">Carregando eventos...</span>
                    </div>
                ) : eventos.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        Nenhum evento cadastrado para este curso.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {eventos.map((evento) => (
                            <Card key={evento.id} className="border-border bg-secondary">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{evento.titulo}</h3>
                                                <Badge variant="outline" className={getTipoColor(evento.tipo)}>
                                                    {getTipoLabel(evento.tipo)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{formatDate(evento.dataInicio)}</span>
                                                </div>
                                                {evento.dataInicio !== evento.dataFim && (
                                                    <>
                                                        <span>→</span>
                                                        <span>{formatDate(evento.dataFim)}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
