// src/pages/gestor/configuracoes/aba-calendario.tsx

"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

// Interface para definir a estrutura de um período letivo no estado do componente
interface PeriodoLetivo {
  id: string; // Usado no frontend para a key do React e para identificar períodos existentes
  nome: string;
  dataInicio: string;
  dataFim: string;
}

export default function AbaCalendario() {
  // Estados para os campos do formulário
  const [fusoHorario, setFusoHorario] = useState("America/Sao_Paulo");
  const [primeiroDia, setPrimeiroDia] = useState("domingo");
  const [feriados, setFeriados] = useState("");
  const [periodos, setPeriodos] = useState<PeriodoLetivo[]>([]);
  
  // Estados para controlar o fluxo da UI
  const [carregandoSalvamento, setCarregandoSalvamento] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const { toast } = useToast();

  // Efeito para carregar todos os dados do backend quando o componente é montado
  useEffect(() => {
    const fetchConfig = async () => {
      setCarregandoDados(true);
      try {
        // Executa as duas chamadas de API necessárias em paralelo para otimizar o carregamento
        const [configRes, periodosRes] = await Promise.all([
          axios.get('/api/configuracoes/calendario'), // Rota para fuso horário, feriados, etc.
          axios.get('/api/periodos-letivos')         // Rota CORRETA para os períodos letivos
        ]);

        // Preenche os estados com os dados das configurações gerais
        const configData = configRes.data;
        if (configData) {
          setFusoHorario(configData.fuso_horario || "America/Sao_Paulo");
          setPrimeiroDia(configData.primeiro_dia_semana || "domingo");
          setFeriados(configData.feriados_personalizados || "");
        }

        // Preenche o estado dos períodos letivos a partir da tabela correta
        const periodosData = periodosRes.data.map((p: any) => ({
          id: p.id.toString(),
          nome: p.nome,
          dataInicio: p.data_inicio ? p.data_inicio.slice(0, 10) : "",
          dataFim: p.data_fim ? p.data_fim.slice(0, 10) : "",
        }));
        setPeriodos(periodosData);

      } catch (error) {
        console.error("Erro ao carregar configurações do calendário", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar as configurações atuais do calendário.",
        });
      } finally {
        setCarregandoDados(false);
      }
    };

    fetchConfig();
  }, [toast]);

  // Funções para manipular os períodos letivos na UI
  const adicionarPeriodo = () => {
    const novoPeriodo: PeriodoLetivo = {
      id: `novo-${Math.random()}`, // ID temporário para a key do React
      nome: "",
      dataInicio: "",
      dataFim: "",
    };
    setPeriodos([...periodos, novoPeriodo]);
  };

  const removerPeriodo = (id: string) => {
    setPeriodos(periodos.filter((p) => p.id !== id));
  };

  const atualizarPeriodo = (id: string, campo: keyof PeriodoLetivo, valor: string) => {
    setPeriodos(periodos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  // Função para salvar todas as alterações no backend
  const handleSalvar = async () => {
    setCarregandoSalvamento(true);
    try {
      // Validação simples no frontend antes de enviar
      for (const p of periodos) {
        if (!p.nome.trim() || !p.dataInicio || !p.dataFim) {
          toast({
            variant: "destructive",
            title: "Dados incompletos",
            description: "Todos os períodos letivos devem ter nome, data de início e data de fim.",
          });
          setCarregandoSalvamento(false);
          return;
        }
      }

      // Executa as duas chamadas de salvamento em paralelo
      await Promise.all([
        // 1. Salva as configurações gerais (fuso horário, feriados)
        axios.put('/api/configuracoes/calendario', { fusoHorario, primeiroDia, feriados }),
        // 2. Sincroniza os períodos letivos na tabela correta
        axios.post('/api/periodos-letivos', { periodos })
      ]);

      toast({
        title: "Configurações salvas!",
        description: "As configurações de calendário foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações", error);
      toast({
        variant: "destructive",
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as alterações. Verifique os dados e tente novamente.",
      });
    } finally {
      setCarregandoSalvamento(false);
    }
  };

  // Renderiza um spinner enquanto os dados iniciais estão a ser carregados
  if (carregandoDados) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Configurações de Calendário</CardTitle>
            <CardDescription>Configure o calendário acadêmico e períodos letivos</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Renderiza o formulário completo após os dados serem carregados
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
            <Label htmlFor="feriados">Feriados Personalizados (datas no formato AAAA-MM-DD, separadas por vírgula)</Label>
            <Input
              id="feriados"
              placeholder="Ex: 2025-01-01,2025-04-21,2025-12-25"
              value={feriados}
              onChange={(e) => setFeriados(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">Períodos Letivos</h3>
            <Button variant="outline" size="sm" onClick={adicionarPeriodo}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Período
            </Button>
          </div>

          <div className="space-y-4">
            {periodos.map((periodo) => (
              <div
                key={periodo.id}
                className="grid gap-4 md:grid-cols-[1fr,1fr,1fr,auto] items-end p-4 rounded-lg border bg-card"
              >
                <div className="space-y-2">
                  <Label htmlFor={`nome-${periodo.id}`}>Nome do Período</Label>
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
                  <Button variant="ghost" size="icon" onClick={() => removerPeriodo(periodo.id)} aria-label="Remover período">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {periodos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum período letivo adicionado. Clique em "Adicionar Período" para começar.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSalvar} disabled={carregandoSalvamento}>
            {carregandoSalvamento && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
