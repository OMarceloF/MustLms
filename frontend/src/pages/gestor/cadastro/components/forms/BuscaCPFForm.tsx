// src/pages/gestor/cadastro/components/forms/BuscaCPFForm.tsx
import { useState } from "react";
import { useRegistration } from "../../contexts/RegistrationContext";
import { toast } from "sonner";

// ==================================================================
// INÍCIO DA CORREÇÃO: Reutilizando seus componentes e ícones originais
// para resolver os erros de importação.
// ==================================================================

// Componentes UI simplificados
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  variant?: "outline" | "default";
  size?: "default" | "lg";
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, type = "button", className = "", variant = "default", size = "default" }) => {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = variant === "outline"
    ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
    : "bg-blue-600 text-white hover:bg-blue-700";
  const sizeClasses = size === "lg" ? "px-6 py-3 text-lg" : "text-sm";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`}>{children}</button>;
};

interface InputProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  className?: string;
}

const Input: React.FC<InputProps> = ({ id, placeholder, value, onChange, maxLength, className = "" }) => (
  <input id={id} type="text" placeholder={placeholder} value={value} onChange={onChange} maxLength={maxLength} className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} />
);

interface CardProps { children: React.ReactNode; className?: string; }
const Card: React.FC<CardProps> = ({ children, className = "" }) => <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>{children}</div>;
const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
const CardContent: React.FC<CardProps> = ({ children, className = "" }) => <div className={`px-6 py-4 ${className}`}>{children}</div>;
const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
const CardDescription: React.FC<CardProps> = ({ children, className = "" }) => <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>;

// Ícones profissionais (SVG embutido para não depender de bibliotecas externas)
const Icon: React.FC<{ path: string; className?: string }> = ({ path, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
  );

const Search = ({ className = "" }) => <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" className={`h-4 w-4 ${className}`} />;
const Loader2 = ({ className = "" }) => <Icon path="M21 12a9 9 0 11-6.219-8.56" className={`h-4 w-4 animate-spin ${className}`} />;
const UserCheck = ({ className = "" }) => <Icon path="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M8.5 3.5a4 4 0 100 8 4 4 0 000-8z M20 8l-4 4-2-2" className={`h-6 w-6 ${className}`} />;
const UserX = ({ className = "" }) => <Icon path="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M8.5 3.5a4 4 0 100 8 4 4 0 000-8z M18 8l5 5m0-5l-5 5" className={`h-6 w-6 ${className}`} />;
const UserPlus = ({ className = "" }) => <Icon path="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M8.5 3.5a4 4 0 100 8 4 4 0 000-8z M20 8v6m3-3h-6" className={`h-4 w-4 ${className}`} />;
const ArrowLeft = ({ className = "" }) => <Icon path="M19 12H5m7 7l-7-7 7-7" className={`h-4 w-4 ${className}`} />;
const Phone = ({ className = "" }) => <Icon path="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" className={`h-5 w-5 ${className}`} />;
const Mail = ({ className = "" }) => <Icon path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" className={`h-5 w-5 ${className}`} />;
const MapPin = ({ className = "" }) => <Icon path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a3 3 0 100-6 3 3 0 000 6z" className={`h-5 w-5 ${className}`} />;
const CreditCard = ({ className = "" }) => <Icon path="M22 8V6a2 2 0 00-2-2H4a2 2 0 00-2 2v2h20z M2 18a2 2 0 002 2h16a2 2 0 002-2v-6H2v6z" className={`h-5 w-5 ${className}`} />;
const ShieldCheck = ({ className = "" }) => <Icon path="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" className={`h-5 w-5 ${className}`} />;

// ==================================================================
// FIM DA CORREÇÃO
// ==================================================================

interface ResponsavelEncontrado {
  id: number;
  nome: string;
  cpf: string;
  cpf_formatado: string;
  rg: string;
  email: string;
  numero1: string;
  numero2?: string;
  telefone: string;
  telefone_formatado: string;
  grau_parentesco: string;
  estado_civil?: string;
  profissao?: string;
  endereco_completo: string;
  responsavel_financeiro: 'Sim' | 'Não';
  id_aluno1?: number;
  id_aluno2?: number;
  id_aluno3?: number;
}

export function BuscaCPFForm() {
  const { state, setCurrentStep } = useRegistration();
  const alunoId = state.data.student.id;

  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [responsavelEncontrado, setResponsavelEncontrado] = useState<ResponsavelEncontrado | null>(null);
  const [buscaRealizada, setBuscaRealizada] = useState(false);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateCpf = (value: string): boolean => {
    const cleanCpf = value.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setError("CPF deve conter 11 dígitos.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleBuscaCPF = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCpf(cpf)) return;

    setLoading(true);
    setResponsavelEncontrado(null);
    setBuscaRealizada(true); // Marcar que a busca foi feita
    setNaoEncontrado(false);

    const cleanCpf = cpf.replace(/\D/g, '');

    try {
      // ======================= INÍCIO DA CORREÇÃO FUNCIONAL =======================
      // A URL foi corrigida para corresponder à rota do backend.
      const response = await fetch(`/api/responsaveis/cpf/${cleanCpf}`);
      // ======================== FIM DA CORREÇÃO FUNCIONAL =========================
      
      const data = await response.json();

      if (response.ok) {
        setResponsavelEncontrado(data as ResponsavelEncontrado);
        toast.success("Responsável encontrado!");
      } else if (response.status === 404) {
        setNaoEncontrado(true);
        toast.info(data.message || "Responsável não encontrado.");
      } else {
        throw new Error(data.error || "Erro ao buscar responsável.");
      }
    } catch (err: any) {
      console.error("Erro ao buscar CPF:", err);
      toast.error(err.message || "Ocorreu um erro na busca. Tente novamente.");
      setNaoEncontrado(true); // Garante que a mensagem de erro apareça
    } finally {
      setLoading(false);
    }
  };

  const handleVincular = async () => {
    if (!responsavelEncontrado || !alunoId) {
      toast.error("Não há responsável ou aluno para vincular.");
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
        toast.success("Responsável vinculado com sucesso!");
        setResponsavelEncontrado(null);
        setBuscaRealizada(false);
        setNaoEncontrado(false);
        setCpf("");
        setCurrentStep('responsible'); // Avança para a próxima tela
      } else {
        throw new Error(result.message || result.error || "Falha ao vincular responsável.");
      }
    } catch (err: any) {
      console.error("Erro ao vincular responsável:", err);
      toast.error(err.message);
    } finally {
      setLinking(false);
    }
  };

  const irParaCadastroResponsavel = () => {
    setCurrentStep('responsible');
  };

  const voltarParaAluno = () => {
    setCurrentStep('student');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(value);
    if (error) validateCpf(value);
  };

  // O JSX abaixo é mantido exatamente como no arquivo original para não haver alteração visual.
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
            Buscar Responsável por CPF
          </CardTitle>
          <CardDescription>
            Verifique se um responsável já possui cadastro no sistema para agilizar o processo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscaCPF} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full">
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                  CPF do Responsável
                </label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className={error ? "border-red-500" : ""}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="mr-2" /> : <Search className="mr-2" />}
                Buscar
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800">Não encontrou ou é um novo responsável?</h4>
                <p className="text-sm text-gray-500">Prossiga para o cadastro manual completo.</p>
              </div>
              <Button
                type="button"
                onClick={irParaCadastroResponsavel}
                variant="outline"
              >
                <UserPlus className="mr-2" />
                Cadastrar Novo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {buscaRealizada && responsavelEncontrado && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <UserCheck className="text-green-600" />
              Responsável Encontrado
            </CardTitle>
            <CardDescription className="text-green-700">
              Os dados abaixo correspondem ao responsável localizado. Verifique as informações e vincule-o ao aluno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{responsavelEncontrado.nome}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <CreditCard className="text-gray-400" />
                  <div>
                    <p className="text-gray-500">CPF</p>
                    <p className="font-medium text-gray-700">{responsavelEncontrado.cpf_formatado}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="text-gray-400" />
                  <div>
                    <p className="text-gray-500">RG</p>
                    <p className="font-medium text-gray-700">{responsavelEncontrado.rg || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-gray-400" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-700">{responsavelEncontrado.email || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" />
                  <div>
                    <p className="text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-700">{responsavelEncontrado.telefone_formatado || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {responsavelEncontrado.endereco_completo && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500">Endereço</p>
                  <p className="font-medium text-gray-700">{responsavelEncontrado.endereco_completo}</p>
                </div>
              </div>
            )}

            {responsavelEncontrado.responsavel_financeiro === 'Sim' && (
              <div className="bg-blue-100 border border-blue-200 text-blue-800 text-sm p-3 rounded-md flex items-center gap-3">
                <ShieldCheck className="flex-shrink-0" />
                <p className="font-medium">Este é o responsável financeiro principal.</p>
              </div>
            )}

            <Button
              onClick={handleVincular}
              disabled={linking}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {linking ? <Loader2 className="mr-2" /> : <UserPlus className="mr-2" />}
              Vincular este Responsável ao Aluno
            </Button>
          </CardContent>
        </Card>
      )}

      {buscaRealizada && naoEncontrado && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-800">
              <UserX className="text-amber-600" />
              Responsável Não Encontrado
            </CardTitle>
            <CardDescription className="text-amber-700">
              Nenhum responsável foi localizado com o CPF informado. Por favor, prossiga com o cadastro de um novo responsável.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={irParaCadastroResponsavel}
              className="w-full"
              size="lg"
            >
              <UserPlus className="mr-2" />
              Cadastrar Novo Responsável
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-start mt-8">
        <Button variant="outline" onClick={voltarParaAluno}>
          <ArrowLeft className="mr-2" />
          Voltar para Dados do Aluno
        </Button>
      </div>
    </div>
  );
}
