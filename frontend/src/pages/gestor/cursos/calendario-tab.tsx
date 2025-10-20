// frontend/src/pages/gestor/cursos/calendario-tab.tsx

"use client"

import { useState } from "react"
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
import { Plus, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Evento {
    id: string
    titulo: string
    dataInicio: string
    dataFim: string
    descricao: string
    tipo: "prazo" | "evento" | "defesa"
}

const mockEventos: Evento[] = [
    {
        id: "1",
        titulo: "Início do Semestre 2024.1",
        dataInicio: "2024-03-01",
        dataFim: "2024-03-01",
        descricao: "Início das aulas do primeiro semestre de 2024",
        tipo: "evento",
    },
    {
        id: "2",
        titulo: "Prazo de Matrícula",
        dataInicio: "2024-02-15",
        dataFim: "2024-02-28",
        descricao: "Período de matrícula para novos alunos",
        tipo: "prazo",
    },
    {
        id: "3",
        titulo: "Defesas de Mestrado",
        dataInicio: "2024-06-10",
        dataFim: "2024-06-30",
        descricao: "Período de defesas de dissertação de mestrado",
        tipo: "defesa",
    },
    {
        id: "4",
        titulo: "Término do Semestre 2024.1",
        dataInicio: "2024-07-15",
        dataFim: "2024-07-15",
        descricao: "Encerramento das atividades do primeiro semestre",
        tipo: "evento",
    },
]

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
    const [eventos, setEventos] = useState<Evento[]>(mockEventos)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState<Partial<Evento>>({ tipo: "evento" })

    const handleAdd = () => {
        setFormData({ tipo: "evento" })
        setIsDialogOpen(true)
    }

    const handleSave = () => {
        const newEvento: Evento = {
            id: Date.now().toString(),
            titulo: formData.titulo || "",
            dataInicio: formData.dataInicio || "",
            dataFim: formData.dataFim || "",
            descricao: formData.descricao || "",
            tipo: formData.tipo as "prazo" | "evento" | "defesa",
        }
        setEventos(
            [...eventos, newEvento].sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()),
        )
        setIsDialogOpen(false)
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        } catch {
            return dateString
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
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    )
}
