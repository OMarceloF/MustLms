// frontend/src/pages/gestor/configuracoes/aba-financeiro.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function AbaFinanceiro() {
  const [nomeEscola, setNomeEscola] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const [mostrarSecret, setMostrarSecret] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const { toast } = useToast()

  const handleSalvar = async () => {
    if (!clientId || !clientSecret || !cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setCarregando(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/mercadopago/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          cnpj: cnpj,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Configurações financeiras salvas com sucesso.",
        })
      } else {
        toast({
          title: "Erro ao salvar",
          description: data.message || "Ocorreu um erro ao salvar as configurações.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Financeiras</CardTitle>
        <CardDescription>Configure as informações do setor financeiro e integração com Mercado Pago</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome-escola">Nome da Escola</Label>
            <Input
              id="nome-escola"
              placeholder="Digite o nome da escola"
              value={nomeEscola}
              onChange={(e) => setNomeEscola(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium">Integração Mercado Pago</h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID *</Label>
              <Input
                id="client-id"
                placeholder="Digite o Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-secret">Client Secret *</Label>
              <div className="relative">
                <Input
                  id="client-secret"
                  type={mostrarSecret ? "text" : "password"}
                  placeholder="Digite o Client Secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSecret(!mostrarSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

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
