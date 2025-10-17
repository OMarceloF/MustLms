"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AbaEscola() {
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [endereco, setEndereco] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [carregando, setCarregando] = useState(false)
  const { toast } = useToast()

  const handleSalvar = async () => {
    setCarregando(true)

    // Simular salvamento
    setTimeout(() => {
      setCarregando(false)
      toast({
        title: "Sucesso!",
        description: "Informações da escola salvas com sucesso.",
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Escola</CardTitle>
        <CardDescription>Gerencie as informações institucionais da sua escola</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome-completo">Nome Completo</Label>
            <Input
              id="nome-completo"
              placeholder="Nome completo da instituição"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="razao-social">Razão Social</Label>
            <Input
              id="razao-social"
              placeholder="Razão social"
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj-escola">CNPJ</Label>
            <Input
              id="cnpj-escola"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Endereço completo"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email-escola">E-mail</Label>
            <Input
              id="email-escola"
              type="email"
              placeholder="contato@escola.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSalvar} disabled={carregando}>
            {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
