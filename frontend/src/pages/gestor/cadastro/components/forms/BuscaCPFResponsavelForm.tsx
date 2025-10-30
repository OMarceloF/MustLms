// frontend/src/pages/gestor/cadastro/components/forms/BuscaCPFResponsavelForm.tsx

import React, { useState } from "react";
import { useRegistration } from "../../contexts/RegistrationContext";
import { toast } from "sonner";

// Importando os componentes e ícones corretos da sua biblioteca UI
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Loader2, Search, UserCheck, UserX, UserPlus, ArrowLeft, Phone, Mail, CreditCard, ShieldCheck } from 'lucide-react';
import { cn } from "../../../../lib/utils";

interface ResponsavelEncontrado {
  id: number;
  nome: string;
  cpf: string;
  rg: string;
  email: string;
  numero1: string;
  numero2?: string;
  grau_parentesco: string;
  estado_civil?: string;
  profissao?: string;
  responsavel_financeiro: 'Sim' | 'Não';
}

export function BuscaCPFForm() {
  const { state, setCurrentStep, completeStep, updateResponsible } = useRegistration();
  const alunoId = state.data.student.id;

  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [responsavelEncontrado, setResponsavelEncontrado] = useState<ResponsavelEncontrado | null>(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value);
    if (error) setError(null);
  };

  const handleBuscaCPF = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setError("CPF deve conter 11 dígitos.");
      toast.error("CPF inválido.");
      return;
    }

    setLoading(true);
    setResponsavelEncontrado(null);
    setNaoEncontrado(false);
    setBuscaRealizada(true);

    try {
      const response = await fetch(`/api/responsaveis/cpf/${cleanCpf}`);
      const data = await response.json();

      if (response.ok) {
        setResponsavelEncontrado(data as ResponsavelEncontrado);
        toast.success("Responsável encontrado no sistema!");
      } else if (response.status === 404) {
        setNaoEncontrado(true);
        updateResponsible({ cpf });
        toast.info("Responsável não encontrado. Prossiga para o cadastro manual.");
      } else {
        throw new Error(data.message || "Erro ao buscar responsável.");
      }
    } catch (err: any) {
      console.error("Erro ao buscar CPF do responsável:", err);
      toast.error(err.message || "Ocorreu um erro na busca.");
      setNaoEncontrado(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVincular = async () => {
    if (!responsavelEncontrado || !alunoId) {
      toast.error("Não há responsável ou aluno para vincular. Por favor, retorne à etapa anterior.");
      return;
    }

    setLinking(true);
    try {
      const response = await fetch(`/api/alunos/vincular-responsavel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunoId: alunoId,
          responsavelId: responsavelEncontrado.id,
          parentesco: responsavelEncontrado.grau_parentesco || 'Não informado',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Responsável vinculado com sucesso!");
        setResponsavelEncontrado(null);
        setBuscaRealizada(false);
        setCpf("");
        setCurrentStep('responsible');
      } else {
        throw new Error(result.message || "Falha ao vincular responsável.");
      }
    } catch (err: any) {
      console.error("Erro ao vincular responsável:", err);
      toast.error(err.message);
    } finally {
      setLinking(false);
    }
  };

  const irParaCadastroResponsavel = () => {
    completeStep('searchCpf');
    setCurrentStep('responsible');
  };

  const voltarParaAluno = () => {
    setCurrentStep('student');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
            Buscar Responsável por CPF
          </CardTitle>
          <CardDescription>
            Verifique se um responsável já possui cadastro para agilizar o processo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscaCPF} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full">
                <label htmlFor="cpf-responsavel" className="block text-sm font-medium text-foreground mb-1">
                  CPF do Responsável
                </label>
                <Input
                  id="cpf-responsavel"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className={cn(error && "border-destructive")}
                />
                {error && <p className="text-destructive text-sm mt-1">{error}</p>}
              </div>
              <Button type="submit" disabled={loading || cpf.length < 14} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Buscar
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Não encontrou ou é um novo responsável?</h4>
                <p className="text-sm text-muted-foreground">Prossiga para o cadastro manual completo.</p>
              </div>
              <Button
                type="button"
                onClick={irParaCadastroResponsavel}
                variant="outline"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Novo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {buscaRealizada && responsavelEncontrado && (
        <Card className="border-green-500 bg-green-50/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700">
              <UserCheck className="h-6 w-6" />
              Responsável Encontrado
            </CardTitle>
            <CardDescription className="text-green-600">
              Verifique as informações e vincule este responsável ao aluno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{responsavelEncontrado.nome}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <InfoItem icon={CreditCard} label="CPF" value={responsavelEncontrado.cpf} />
                <InfoItem icon={CreditCard} label="RG" value={responsavelEncontrado.rg} />
                {/* ======================================================================= */}
                {/* CORREÇÃO APLICADA AQUI */}
                {/* ======================================================================= */}
                <InfoItem icon={Mail} label="Email" value={responsavelEncontrado.email} />
                <InfoItem icon={Phone} label="Telefone" value={responsavelEncontrado.numero1} />
              </div>
            </div>

            {responsavelEncontrado.responsavel_financeiro === 'Sim' && (
              <div className="bg-blue-100 border border-blue-200 text-blue-800 text-sm p-3 rounded-md flex items-center gap-3">
                <ShieldCheck className="flex-shrink-0 h-5 w-5" />
                <p className="font-medium">Este já é um responsável financeiro em outros cadastros.</p>
              </div>
            )}

            <Button
              onClick={handleVincular}
              disabled={linking}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {linking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Vincular este Responsável ao Aluno
            </Button>
          </CardContent>
        </Card>
      )}

      {buscaRealizada && naoEncontrado && (
        <Card className="border-blue-500 bg-blue-50/50 animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-700">
              <UserX className="h-6 w-6" />
              Responsável Não Encontrado
            </CardTitle>
            <CardDescription className="text-blue-600">
              Nenhum responsável foi localizado. Clique abaixo para cadastrar um novo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={irParaCadastroResponsavel}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar Novo Responsável
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-start mt-8">
        <Button variant="outline" onClick={voltarParaAluno}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Dados do Aluno
        </Button>
      </div>
    </div>
  );
}

// Componente auxiliar para exibir informações de forma padronizada
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | null }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div>
            <p className="text-xs font-semibold text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value || 'Não informado'}</p>
        </div>
    </div>
);
