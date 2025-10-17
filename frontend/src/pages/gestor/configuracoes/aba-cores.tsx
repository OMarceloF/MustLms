"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AbaCores() {
  const [corPrimaria, setCorPrimaria] = useState("#3b82f6")
  const [corSecundaria, setCorSecundaria] = useState("#8b5cf6")
  const [corSucesso, setCorSucesso] = useState("#10b981")
  const [corErro, setCorErro] = useState("#ef4444")
  const [corFundo, setCorFundo] = useState("#0a0a0a")
  const [carregando, setCarregando] = useState(false)
  const { toast } = useToast()

  const handleAplicarTema = () => {
    setCarregando(true)
    setTimeout(() => {
      setCarregando(false)
      toast({
        title: "Tema aplicado!",
        description: "As cores do sistema foram atualizadas.",
      })
    }, 800)
  }

  const handleReporPadrao = () => {
    setCorPrimaria("#3b82f6")
    setCorSecundaria("#8b5cf6")
    setCorSucesso("#10b981")
    setCorErro("#ef4444")
    setCorFundo("#0a0a0a")
    toast({
      title: "Tema restaurado",
      description: "As cores padrão foram restauradas.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Cores (Tema)</CardTitle>
        <CardDescription>
          Personalize as cores do sistema de acordo com a identidade visual da sua escola
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cor-primaria">Cor Primária</Label>
            <div className="flex gap-3">
              <Input
                id="cor-primaria"
                type="color"
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} placeholder="#3b82f6" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor-secundaria">Cor Secundária</Label>
            <div className="flex gap-3">
              <Input
                id="cor-secundaria"
                type="color"
                value={corSecundaria}
                onChange={(e) => setCorSecundaria(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} placeholder="#8b5cf6" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor-sucesso">Cor de Sucesso</Label>
            <div className="flex gap-3">
              <Input
                id="cor-sucesso"
                type="color"
                value={corSucesso}
                onChange={(e) => setCorSucesso(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input value={corSucesso} onChange={(e) => setCorSucesso(e.target.value)} placeholder="#10b981" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cor-erro">Cor de Erro</Label>
            <div className="flex gap-3">
              <Input
                id="cor-erro"
                type="color"
                value={corErro}
                onChange={(e) => setCorErro(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input value={corErro} onChange={(e) => setCorErro(e.target.value)} placeholder="#ef4444" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cor-fundo">Cor de Fundo</Label>
            <div className="flex gap-3">
              <Input
                id="cor-fundo"
                type="color"
                value={corFundo}
                onChange={(e) => setCorFundo(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input value={corFundo} onChange={(e) => setCorFundo(e.target.value)} placeholder="#0a0a0a" />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-sm font-medium mb-4">Pré-visualização</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: corPrimaria }} />
              <span className="text-xs text-muted-foreground">Primária</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: corSecundaria }} />
              <span className="text-xs text-muted-foreground">Secundária</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: corSucesso }} />
              <span className="text-xs text-muted-foreground">Sucesso</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: corErro }} />
              <span className="text-xs text-muted-foreground">Erro</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: corFundo }} />
              <span className="text-xs text-muted-foreground">Fundo</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleReporPadrao}>
            Repor Padrão
          </Button>
          <Button onClick={handleAplicarTema} disabled={carregando}>
            {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aplicar Tema
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
