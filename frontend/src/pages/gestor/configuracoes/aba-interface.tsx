"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Switch } from "../components/ui/switch"

export default function AbaInterface() {
    const [idioma, setIdioma] = useState("pt-BR")
    const [densidade, setDensidade] = useState("padrao")
    const [cantosArredondados, setCantosArredondados] = useState(true)
    const [dicasContextuais, setDicasContextuais] = useState(true)
    const [animacoes, setAnimacoes] = useState(true)
    const [carregando, setCarregando] = useState(false)
    const { toast } = useToast()

    const handleSalvar = () => {
        setCarregando(true)
        setTimeout(() => {
            setCarregando(false)
            toast({
                title: "Preferências salvas!",
                description: "Suas configurações de interface foram atualizadas.",
            })
        }, 800)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações de Interface</CardTitle>
                <CardDescription>Personalize a aparência e comportamento do painel administrativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="idioma">Idioma</Label>
                        <Select value={idioma} onValueChange={setIdioma}>
                            <SelectTrigger id="idioma">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                <SelectItem value="en-US">English (US)</SelectItem>
                                <SelectItem value="es-ES">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="densidade">Densidade</Label>
                        <Select value={densidade} onValueChange={setDensidade}>
                            <SelectTrigger id="densidade">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="compacta">Compacta</SelectItem>
                                <SelectItem value="padrao">Padrão</SelectItem>
                                <SelectItem value="confortavel">Confortável</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-medium">Preferências Visuais</h3>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="cantos">Cantos Arredondados</Label>
                            <p className="text-sm text-muted-foreground">Aplicar bordas arredondadas nos elementos</p>
                        </div>
                        <Switch id="cantos" checked={cantosArredondados} onCheckedChange={setCantosArredondados} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="dicas">Dicas Contextuais</Label>
                            <p className="text-sm text-muted-foreground">Exibir dicas e tooltips ao passar o mouse</p>
                        </div>
                        <Switch id="dicas" checked={dicasContextuais} onCheckedChange={setDicasContextuais} />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="animacoes">Animações</Label>
                            <p className="text-sm text-muted-foreground">Ativar transições e animações suaves</p>
                        </div>
                        <Switch id="animacoes" checked={animacoes} onCheckedChange={setAnimacoes} />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSalvar} disabled={carregando}>
                        {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Preferências
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
