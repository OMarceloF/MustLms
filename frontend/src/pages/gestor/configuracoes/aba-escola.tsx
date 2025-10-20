// frontend/src/pages/gestor/configuracoes/aba-escola.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Loader2 } from "lucide-react"
import axios from "axios";
import InputMask from 'react-input-mask';

export default function AbaEscola() {
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [razaoSocial, setRazaoSocial] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [endereco, setEndereco] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [carregando, setCarregando] = useState(false)
  const { toast } = useToast()

  // As funções de busca e salvamento continuam as mesmas...
  useEffect(() => {
    const fetchSchoolData = async () => {
      setCarregando(true);
      try {
        const response = await axios.get('/api/configuracoes-escola');
        const data = response.data;
        if (data) {
          setNomeCompleto(data.nome_completo || "");
          setRazaoSocial(data.razao_social || "");
          setCnpj(data.cnpj || "");
          setEndereco(data.endereco || "");
          setEmail(data.email || "");
          setTelefone(data.telefone || "");
        }
      } catch (error) {
        console.error("Erro ao buscar dados da escola:", error);
      } finally {
        setCarregando(false);
      }
    };
    fetchSchoolData();
  }, []);

  const handleSalvar = async () => {
    setCarregando(true);
    const schoolData = {
      nome_completo: nomeCompleto,
      razao_social: razaoSocial,
      cnpj: cnpj.replace(/[^\d]/g, ''), // Remove máscara
      endereco,
      email,
      telefone: telefone.replace(/[^\d]/g, ''), // Remove máscara
    };

    try {
      await axios.post('/api/configuracoes-escola', schoolData);
      toast({
        title: "Sucesso!",
        description: "Informações da escola salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro!",
        description: "Ocorreu um problema ao salvar as informações.",
        variant: "destructive",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Escola</CardTitle>
        <CardDescription>Gerencie as informações institucionais da sua escola</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Campos normais */}
          <div className="space-y-2">
            <Label htmlFor="nome-completo">Nome Completo</Label>
            <Input id="nome-completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="razao-social">Razão Social</Label>
            <Input id="razao-social" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
          </div>

          {/* --- CAMPO DE CNPJ CORRIGIDO --- */}
          <div className="space-y-2">
            <Label htmlFor="cnpj-escola">CNPJ</Label>
            <InputMask
              mask="99.999.999/9999-99"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            >
              {(inputProps: any) => (
                <Input {...inputProps} id="cnpj-escola" placeholder="00.000.000/0000-00" />
              )}
            </InputMask>
          </div>

          {/* --- CAMPO DE TELEFONE CORRIGIDO --- */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <InputMask
              mask="(99) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            >
              {(inputProps: any) => (
                <Input {...inputProps} id="telefone" placeholder="(00) 00000-0000" />
              )}
            </InputMask>
          </div>

          {/* Campos normais */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email-escola">E-mail</Label>
            <Input id="email-escola" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
  );
}