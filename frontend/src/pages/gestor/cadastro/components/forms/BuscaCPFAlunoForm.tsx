import React, { useState } from 'react';
import { useRegistration } from '../../contexts/RegistrationContext';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Loader2, UserCheck, UserX, UserPlus, ArrowRight, Fingerprint, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para os dados do aluno que virão da API
interface AlunoEncontrado {
    id: number;
    nome: string;
    cpf: string;
    rg: string;
    matricula: string;
    email: string;
    telefone: string;
    data_nascimento: string; // Vem como string da API
    foto: string | null;
}

export function BuscaCPFAlunoForm() {
    const { setCurrentStep, completeStep, updateStudent } = useRegistration();
    const [cpf, setCpf] = useState("");
    const [loading, setLoading] = useState(false);
    const [alunoEncontrado, setAlunoEncontrado] = useState<AlunoEncontrado | null>(null);
    const [naoEncontrado, setNaoEncontrado] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para formatar o CPF automaticamente durante a digitação
    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // 1. Remove tudo que não for dígito
        value = value.replace(/\D/g, '');

        // 2. Aplica a máscara de CPF (###.###.###-##)
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        // 3. Atualiza o estado
        setCpf(value);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanCpf = cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
            setError("CPF deve conter 11 dígitos.");
            return;
        }

        setLoading(true);
        setError(null);
        setAlunoEncontrado(null);
        setNaoEncontrado(false);

        try {
            const response = await fetch(`/api/alunos/buscar-por-cpf/${cleanCpf}`);
            const data = await response.json();

            if (response.ok) {
                setAlunoEncontrado(data);
                toast.success("Aluno encontrado no sistema!");
            } else if (response.status === 404) {
                setNaoEncontrado(true);
                toast.info("CPF não encontrado. Prossiga com um novo cadastro.");
            } else {
                throw new Error(data.message || "Erro ao buscar CPF.");
            }
        } catch (err: any) {
            toast.error(err.message || "Ocorreu um erro na busca.");
        } finally {
            setLoading(false);
        }
    };

    const handleCadastrarNovo = () => {
        completeStep('searchCpfAluno');
        setCurrentStep('student');
    };
    
    const handleContinuarComAluno = () => {
        if (!alunoEncontrado) return;
        
        updateStudent({
            id: alunoEncontrado.id,
            nomeCompleto: alunoEncontrado.nome,
            cpf: alunoEncontrado.cpf,
            rg: alunoEncontrado.rg,
            matricula: alunoEncontrado.matricula,
            email: alunoEncontrado.email,
            telefone: alunoEncontrado.telefone,
            dataNascimento: new Date(alunoEncontrado.data_nascimento),
            fotoUrl: alunoEncontrado.foto,
        });
        
        toast.success(`Dados de ${alunoEncontrado.nome.split(' ')[0]} carregados.`);
        completeStep('searchCpfAluno');
        completeStep('student');
        setCurrentStep('searchCpf');
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Busca por CPF do Aluno</CardTitle>
                    <CardDescription>Verifique se o aluno já possui um cadastro no sistema antes de prosseguir.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex items-start gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Digite o CPF do aluno..."
                                value={cpf}
                                onChange={handleCpfChange}
                                maxLength={14} // Ajustado para o formato com máscara
                            />
                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            Verificar
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {alunoEncontrado && (
                <Card className="border-green-500 bg-green-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700"><UserCheck /> Aluno Encontrado</CardTitle>
                        <CardDescription>Os dados abaixo foram localizados. Você pode continuar a matrícula para este aluno.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={alunoEncontrado.foto || '/placeholder-avatar.png'} alt="Foto do aluno" className="w-20 h-20 rounded-full object-cover border-2 border-green-200" />
                            <div>
                                <h3 className="text-xl font-bold">{alunoEncontrado.nome}</h3>
                                <p className="text-sm text-muted-foreground">Matrícula: {alunoEncontrado.matricula}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                            <InfoItem icon={Fingerprint} label="CPF" value={alunoEncontrado.cpf} />
                            <InfoItem icon={Fingerprint} label="RG" value={alunoEncontrado.rg} />
                            <InfoItem icon={Mail} label="Email" value={alunoEncontrado.email} />
                            <InfoItem icon={Phone} label="Telefone" value={alunoEncontrado.telefone} />
                            <InfoItem icon={CalendarIcon} label="Nascimento" value={format(new Date(alunoEncontrado.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })} />
                        </div>
                        <Button onClick={handleContinuarComAluno} className="w-full mt-4">
                            Continuar Matrícula para este Aluno <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {naoEncontrado && (
                <Card className="border-blue-500 bg-blue-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700"><UserX /> Nenhum Cadastro Encontrado</CardTitle>
                        <CardDescription>Não há aluno com o CPF informado. Prossiga para criar um novo cadastro.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleCadastrarNovo} className="w-full">
                            <UserPlus className="mr-2 h-4 w-4" /> Cadastrar Novo Aluno
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Componente auxiliar para exibir informações de forma padronizada
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div>
            <p className="text-xs font-semibold text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    </div>
);
