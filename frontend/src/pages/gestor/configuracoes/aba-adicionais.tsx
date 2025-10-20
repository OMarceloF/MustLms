// frontend/src/pages/gestor/configuracoes/aba-adicionais.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { Switch } from "../components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"

export default function AbaAdicionais() {
    const [emailsTransacionais, setEmailsTransacionais] = useState(true)
    const [webhookUrl, setWebhookUrl] = useState("")
    const [webhookSecret, setWebhookSecret] = useState("")
    const [mostrarWebhookSecret, setMostrarWebhookSecret] = useState(false)
    const [autenticacao2FA, setAutenticacao2FA] = useState(false)
    const [exportacoesCSV, setExportacoesCSV] = useState(true)
    const [backupsAutomaticos, setBackupsAutomaticos] = useState(true)
    const [carregando, setCarregando] = useState(false)
    const { toast } = useToast()

    const handleSalvar = () => {
        setCarregando(true)
        setTimeout(() => {
            setCarregando(false)
            toast({
                title: "Configurações salvas!",
                description: "As configurações adicionais foram atualizadas.",
            })
        }, 800)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações Adicionais</CardTitle>
                <CardDescription>Central de integrações e recursos extras do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="emails">
                        <AccordionTrigger>E-mails Transacionais</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="emails-transacionais">Ativar E-mails</Label>
                                    <p className="text-sm text-muted-foreground">Enviar e-mails automáticos para alunos e responsáveis</p>
                                </div>
                                <Switch
                                    id="emails-transacionais"
                                    checked={emailsTransacionais}
                                    onCheckedChange={setEmailsTransacionais}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="webhooks">
                        <AccordionTrigger>Webhooks</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="webhook-url">URL do Webhook</Label>
                                <Input
                                    id="webhook-url"
                                    placeholder="https://seu-servidor.com/webhook"
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="webhook-secret">Secret Key</Label>
                                <div className="relative">
                                    <Input
                                        id="webhook-secret"
                                        type={mostrarWebhookSecret ? "text" : "password"}
                                        placeholder="Digite a chave secreta"
                                        value={webhookSecret}
                                        onChange={(e) => setWebhookSecret(e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarWebhookSecret(!mostrarWebhookSecret)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {mostrarWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="seguranca">
                        <AccordionTrigger>Segurança</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="2fa">Autenticação de Dois Fatores (2FA)</Label>
                                    <p className="text-sm text-muted-foreground">Exigir 2FA para gestores e administradores</p>
                                </div>
                                <Switch id="2fa" checked={autenticacao2FA} onCheckedChange={setAutenticacao2FA} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="exportacao">
                        <AccordionTrigger>Exportação e Backups</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="csv">Exportações CSV</Label>
                                    <p className="text-sm text-muted-foreground">Permitir exportação de dados em formato CSV</p>
                                </div>
                                <Switch id="csv" checked={exportacoesCSV} onCheckedChange={setExportacoesCSV} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="backups">Backups Automáticos</Label>
                                    <p className="text-sm text-muted-foreground">Realizar backup diário dos dados do sistema</p>
                                </div>
                                <Switch id="backups" checked={backupsAutomaticos} onCheckedChange={setBackupsAutomaticos} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSalvar} disabled={carregando}>
                        {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Configurações
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
