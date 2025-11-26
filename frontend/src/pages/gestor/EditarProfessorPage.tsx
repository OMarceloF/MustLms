// src/pages/gestor/EditarProfessorPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import FormField from './components/ui/FormField';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// --- Funções de formatação (reutilizadas) ---
const formatCPF = (value: string): string => {
  const numericValue = value.replace(/\D/g, '').slice(0, 11);
  if (numericValue.length > 9) return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (numericValue.length > 6) return numericValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  if (numericValue.length > 3) return numericValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  return numericValue;
};

const formatTelefone = (value: string): string => {
  const numericValue = value.replace(/\D/g, '').slice(0, 11);
  if (numericValue.length > 10) return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (numericValue.length > 6) return numericValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  if (numericValue.length > 2) return numericValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return numericValue.replace(/(\d*)/, '($1');
};

const formatCEP = (value: string): string => {
  const numericValue = value.replace(/\D/g, '').slice(0, 8);
  if (numericValue.length > 5) return numericValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  return numericValue;
};

// --- Schema de Validação Zod (senha opcional na edição) ---
const formSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Email inválido."),
  cpf: z.string().min(14, "CPF inválido."),
  telefone: z.string().min(14, "Telefone inválido."),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória."),
  endereco_cep: z.string().min(9, "CEP inválido."),
  endereco_logradouro: z.string().min(1, "Logradouro é obrigatório."),
  endereco_numero: z.string().min(1, "Número é obrigatório."),
  endereco_complemento: z.string().optional(),
  endereco_bairro: z.string().min(1, "Bairro é obrigatório."),
  endereco_cidade: z.string().min(1, "Cidade é obrigatória."),
  endereco_uf: z.string().min(2, "UF é obrigatória."),
  cargo: z.string().min(1, "Selecione um cargo."),
  departamento: z.string().min(1, "Selecione um departamento."),
  data_contratacao: z.string().min(1, "Data de contratação é obrigatória."),
  registro: z.string().optional(),
  formacao_academica: z.string().optional(),
  especialidades: z.string().optional(),
  biografia: z.string().optional(),
  login: z.string().min(3, "O login é obrigatório."),
  senha: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Interface para os dados dos cursos vindos da API
interface Curso {
    id: number;
    nome: string;
}

const EditarProfessorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Estados de UI ---
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Estado para a lista de departamentos
  const [departamentos, setDepartamentos] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const cepValue = watch('endereco_cep');
  const cargos = ['Professor', 'Gestor', 'Secretaria', 'Financeiro'];

  // --- HOOKS DE EFEITO ---

  // Hook para buscar os dados iniciais do funcionário e os departamentos
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Busca os dados do funcionário para preencher o formulário
        const funcionarioResponse = await axios.get(`/api/funcionarios/${id}/edit-data`);
        const funcionarioData = funcionarioResponse.data;
        reset(funcionarioData);
        if (funcionarioData.foto_url) {
          setPreviewUrl(`/${funcionarioData.foto_url}`);
        }

        // Busca os cursos para popular os departamentos
        const cursosResponse = await axios.get<Curso[]>('/api/cursos-posgraduacao');
        const nomesDosCursos = cursosResponse.data.map(curso => curso.nome);
        const departamentosBase = [
          'Graduação', 'Administrativo', 'Financeiro', 'Secretaria', 'Recursos Humanos', 'Tecnologia da Informação'
        ];
        
        // Garante que o departamento atual do funcionário esteja na lista, caso tenha sido removido
        const departamentoAtual = funcionarioData.departamento || '';
        const listaCompleta = [...new Set([...departamentosBase, ...nomesDosCursos, departamentoAtual])].sort();
        setDepartamentos(listaCompleta);

      } catch (err) {
        console.error('Erro ao carregar dados para edição:', err);
        setError('Não foi possível carregar os dados para edição.');
        toast.error('Falha ao carregar dados do funcionário.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  // Hook para buscar dados do CEP
  useEffect(() => {
    const fetchCep = async (cep: string) => {
      try {
        const response = await axios.get(`/api/consulta-cep/${cep}`);
        const { logradouro, bairro, localidade, uf } = response.data;
        if (logradouro) setValue("endereco_logradouro", logradouro);
        if (bairro) setValue("endereco_bairro", bairro);
        if (localidade) setValue("endereco_cidade", localidade);
        if (uf) setValue("endereco_uf", uf);
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    };
    const cepLimpo = cepValue ? cepValue.replace(/\D/g, "") : "";
    if (cepLimpo.length === 8) {
      fetchCep(cepLimpo);
    }
  }, [cepValue, setValue]);

  // --- HANDLERS ---

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const formPayload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'senha' && !value) return;
        if (value) formPayload.append(key, value as string);
      });

      if (fotoFile) formPayload.append('foto', fotoFile);

      await axios.put(`/api/funcionarios/${id}`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Funcionário atualizado com sucesso!');
      navigate('/gestor', { state: { activePage: 'professores' } });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar as alterações.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8"><Skeleton count={15} height={30} /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col pt-20 px-4 sm:px-6">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <main className="flex-1 flex justify-center py-10 px-2 sm:px-0">
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10 max-w-5xl w-full">
            <h1 className="text-3xl font-bold text-foreground text-center mb-10 tracking-tight">
              Editar Cadastro de Funcionário
            </h1>

            {error && (
              <p className="mb-6 text-destructive text-center font-medium bg-destructive/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

              {/* DADOS PESSOAIS */}
              <section className="space-y-6">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-semibold text-primary">Dados Pessoais</h2>
                  <p className="text-sm text-muted-foreground mt-1">Informações básicas do colaborador.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField id="nome" label="Nome Completo" register={register} error={errors.nome} containerClassName="md:col-span-2" />
                  <FormField id="data_nascimento" label="Data de Nascimento" type="date" register={register} error={errors.data_nascimento} />
                  <FormField id="cpf" label="CPF" placeholder="000.000.000-00" register={register} error={errors.cpf} onChange={(e) => e.target.value = formatCPF(e.target.value)} />
                  <FormField id="email" label="Email" type="email" register={register} error={errors.email} />
                  <FormField id="telefone" label="Telefone" placeholder="(00) 00000-0000" register={register} error={errors.telefone} onChange={(e) => e.target.value = formatTelefone(e.target.value)} />
                </div>
              </section>

              {/* ENDEREÇO */}
              <section className="space-y-6">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-semibold text-primary">Endereço</h2>
                  <p className="text-sm text-muted-foreground mt-1">Endereço completo para cadastro formal.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <FormField id="endereco_cep" label="CEP" placeholder="00000-000" register={register} error={errors.endereco_cep} onChange={(e) => e.target.value = formatCEP(e.target.value)} containerClassName="md:col-span-2" />
                  <FormField id="endereco_logradouro" label="Logradouro" register={register} error={errors.endereco_logradouro} containerClassName="md:col-span-4" />
                  <FormField id="endereco_numero" label="Número" register={register} error={errors.endereco_numero} containerClassName="md:col-span-2" />
                  <FormField id="endereco_complemento" label="Complemento" register={register} error={errors.endereco_complemento} containerClassName="md:col-span-4" />
                  <FormField id="endereco_bairro" label="Bairro" register={register} error={errors.endereco_bairro} containerClassName="md:col-span-3" />
                  <FormField id="endereco_cidade" label="Cidade" register={register} error={errors.endereco_cidade} containerClassName="md:col-span-2" />
                  <FormField id="endereco_uf" label="UF" register={register} error={errors.endereco_uf} containerClassName="md:col-span-1" />
                </div>
              </section>

              {/* DADOS PROFISSIONAIS */}
              <section className="space-y-6">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-semibold text-primary">Dados Profissionais</h2>
                  <p className="text-sm text-muted-foreground mt-1">Informações relacionadas à função e contratação.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField id="cargo" label="Cargo" as="select" options={cargos} register={register} error={errors.cargo} />
                  <FormField id="departamento" label="Departamento" as="select" options={departamentos} register={register} error={errors.departamento} />
                  <FormField id="data_contratacao" label="Data de Contratação" type="date" register={register} error={errors.data_contratacao} />
                  <FormField id="registro" label="Registro Profissional" register={register} error={errors.registro} />
                  <FormField id="formacao_academica" label="Formação Acadêmica" register={register} error={errors.formacao_academica} containerClassName="md:col-span-2" />
                  <FormField id="especialidades" label="Especialidades" register={register} error={errors.especialidades} containerClassName="md:col-span-2" />
                  <FormField id="biografia" label="Biografia" as="textarea" rows={3} register={register} error={errors.biografia} containerClassName="md:col-span-2" />
                </div>
              </section>

              {/* FOTO E ACESSO */}
              <section className="space-y-6">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-semibold text-primary">Acesso ao Sistema & Foto</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField id="login" label="Login" register={register} error={errors.login} />
                  <FormField id="senha" label="Nova Senha (opcional)" type="password" register={register} error={errors.senha} placeholder="Deixe em branco para manter a atual" />
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-foreground">Foto do Funcionário</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Prévia"
                        className="mt-3 h-24 w-24 object-cover rounded-md border shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* BOTÕES */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/gestor', { state: { activePage: 'professores' } })}
                  className="rounded-md h-11 px-5 border bg-background text-sm hover:bg-accent transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md h-11 px-6 bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditarProfessorPage;
