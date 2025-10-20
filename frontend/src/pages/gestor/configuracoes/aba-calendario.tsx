// frontend/src/pages/gestor/configuracoes/aba-adicionais.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

interface PeriodoLetivo {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
}

export default function AbaCalendario() {
  const [fusoHorario, setFusoHorario] = useState("America/Sao_Paulo")
  const [primeiroDia, setPrimeiroDia] = useState("domingo")
  const [feriados, setFeriados] = useState("")
  const [periodos, setPeriodos] = useState<PeriodoLetivo[]>([
    { id: "1", nome: "1º Semestre", dataInicio: "2024-02-01", dataFim: "2024-06-30" },
  ])
  const [carregando, setCarregando] = useState(false)
  const { toast } = useToast()

  const adicionarPeriodo = () => {
    const novoPeriodo: PeriodoLetivo = {
      id: Date.now().toString(),
      nome: "",
      dataInicio: "",
      dataFim: "",
    }
    setPeriodos([...periodos, novoPeriodo])
  }

  const removerPeriodo = (id: string) => {
    setPeriodos(periodos.filter((p) => p.id !== id))
  }

  const atualizarPeriodo = (id: string, campo: keyof PeriodoLetivo, valor: string) => {
    setPeriodos(periodos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)))
  }

  const handleSalvar = () => {
    setCarregando(true)
    setTimeout(() => {
      setCarregando(false)
      toast({
        title: "Configurações salvas!",
        description: "As configurações de calendário foram atualizadas.",
      })
    }, 800)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Calendário</CardTitle>
        <CardDescription>Configure o calendário acadêmico e períodos letivos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fuso-horario">Fuso Horário</Label>
            <Select value={fusoHorario} onValueChange={setFusoHorario}>
              <SelectTrigger id="fuso-horario">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Sao_Paulo">(GMT-3) Brasília</SelectItem>
                <SelectItem value="America/Manaus">(GMT-4) Manaus</SelectItem>
                <SelectItem value="America/Rio_Branco">(GMT-5) Rio Branco</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primeiro-dia">Primeiro Dia da Semana</Label>
            <Select value={primeiroDia} onValueChange={setPrimeiroDia}>
              <SelectTrigger id="primeiro-dia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="domingo">Domingo</SelectItem>
                <SelectItem value="segunda">Segunda-feira</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="feriados">Feriados (separados por vírgula)</Label>
            <Input
              id="feriados"
              placeholder="01/01, 21/04, 07/09, 12/10, 25/12"
              value={feriados}
              onChange={(e) => setFeriados(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Períodos Letivos</h3>
            <Button variant="outline" size="sm" onClick={adicionarPeriodo}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Período
            </Button>
          </div>

          <div className="space-y-4">
            {periodos.map((periodo) => (
              <div
                key={periodo.id}
                className="grid gap-4 md:grid-cols-[1fr,1fr,1fr,auto] p-4 rounded-lg border bg-card"
              >
                <div className="space-y-2">
                  <Label htmlFor={`nome-${periodo.id}`}>Nome</Label>
                  <Input
                    id={`nome-${periodo.id}`}
                    placeholder="Ex: 1º Semestre"
                    value={periodo.nome}
                    onChange={(e) => atualizarPeriodo(periodo.id, "nome", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`inicio-${periodo.id}`}>Data de Início</Label>
                  <Input
                    id={`inicio-${periodo.id}`}
                    type="date"
                    value={periodo.dataInicio}
                    onChange={(e) => atualizarPeriodo(periodo.id, "dataInicio", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`fim-${periodo.id}`}>Data de Fim</Label>
                  <Input
                    id={`fim-${periodo.id}`}
                    type="date"
                    value={periodo.dataFim}
                    onChange={(e) => atualizarPeriodo(periodo.id, "dataFim", e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button variant="ghost" size="icon" onClick={() => removerPeriodo(periodo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
