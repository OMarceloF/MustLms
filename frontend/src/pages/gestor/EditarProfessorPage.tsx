// src/pages/gestor/EditarProfessorPage.tsx (VERSÃO REFATORADA)

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from 'sonner';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// --- FUNÇÕES DE FORMATAÇÃO (REUTILIZADAS) ---
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

// --- LISTAS ESTÁTICAS (CONFIGURAÇÃO) ---
const CARGOS = ['Professor', 'Gestor'];
const DEPARTAMENTOS_ACADEMICOS = ['Matemática  ', 'Portugues ', 'Biologia ', 'Física ', 'Química  ', 'História  ', 'Geografia ', 'Ciencias ', 'Educação Físisca ', 'Artes  ', 'Ingles  ', 'Redação'];
const DEPARTAMENTOS_ADMINISTRATIVOS = [''];
const TODOS_DEPARTAMENTOS = [...DEPARTAMENTOS_ACADEMICOS, ...DEPARTAMENTOS_ADMINISTRATIVOS].sort();

// --- PASSO 1: DEFINIR O SCHEMA ZOD COMPLETO ---
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
  endereco_uf: z.string().min(2, "UF é obrigatório."),
  cargo: z.string().min(1, "Selecione um cargo."),
  departamento: z.string().min(1, "Selecione um departamento."),
  data_contratacao: z.string().min(1, "Data de contratação é obrigatória."),
  registro: z.string().optional(),
  formacao_academica: z.string().optional(),
  especialidades: z.string().optional(),
  biografia: z.string().optional(),
  login: z.string().min(3, "O login é obrigatório."),
  senha: z.string().optional(), // Senha é opcional na edição
});

type FormValues = z.infer<typeof formSchema>;

const EditarProfessorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- ESTADOS DE UI ---
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // --- PASSO 2: IMPLEMENTAR REACT-HOOK-FORM ---
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset, // Essencial para preencher o formulário
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const selectedCargo = watch('cargo');
  const cepValue = watch('endereco_cep');

  // --- PASSO 3: REFATORAR A BUSCA DE DADOS ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/funcionarios/${id}/edit-data`);
        const data = response.data;

        // Popula todo o formulário com os dados recebidos
        reset(data);

        // Define o preview da foto inicial
        if (data.foto_url) {
          setPreviewUrl(`/${data.foto_url}`);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do funcionário:', err);
        setError('Não foi possível carregar os dados para edição.');
        toast.error('Falha ao carregar dados do funcionário.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  // Lógica para buscar CEP (mantida)
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // --- PASSO 5: ATUALIZAR A FUNÇÃO DE SUBMISSÃO ---
  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    setError(null);
    try {
      const formPayload = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'senha' && !value) return; // Não envia senha se estiver vazia
        if (value) formPayload.append(key, value as string);
      });
      if (fotoFile) formPayload.append('foto', fotoFile);

      // Endpoint PUT para atualizar os dados
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
    return <div className="p-8"><Skeleton count={15} /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  // --- PASSO 4: ATUALIZAR O JSX ---
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarGestor isMenuOpen={sidebarAberta} setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })} handleMouseEnter={() => setSidebarAberta(true)} handleMouseLeave={() => setSidebarAberta(false)} />
      <div className="flex-1 flex flex-col pt-20 px-2 sm:px-6">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-4xl w-full mx-auto my-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black text-center mb-6">Editar Funcionário</h1>
          {error && <p className="mb-4 text-red-600 text-center font-medium">{error}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Seção de Foto */}
            <div>
              <label className="block font-medium text-indigo-900 mb-2">Foto</label>
              {previewUrl && <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-full border mb-4" />}
              <input type="file" accept="image/*" onChange={handleFotoChange} className="w-full file-input-style" />
            </div>

            {/* Seção de Dados Pessoais */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="nome">Nome Completo</label>
                  <input id="nome" type="text" {...register("nome")} className="mt-1 w-full input-style" />
                  {errors.nome && <p className="error-message">{errors.nome.message}</p>}
                </div>
                <div>
                  <label htmlFor="data_nascimento">Data de Nascimento</label>
                  <input id="data_nascimento" type="date" {...register("data_nascimento")} className="mt-1 w-full input-style" />
                  {errors.data_nascimento && <p className="error-message">{errors.data_nascimento.message}</p>}
                </div>
                <div>
                  <label htmlFor="cpf">CPF</label>
                  <input id="cpf" type="text" placeholder="000.000.000-00" className="mt-1 w-full input-style" {...register("cpf", { onChange: (e) => { e.target.value = formatCPF(e.target.value); } })} />
                  {errors.cpf && <p className="error-message">{errors.cpf.message}</p>}
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" {...register("email")} className="mt-1 w-full input-style" />
                  {errors.email && <p className="error-message">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="telefone">Telefone</label>
                  <input id="telefone" type="text" placeholder="(00) 00000-0000" className="mt-1 w-full input-style" {...register("telefone", { onChange: (e) => { e.target.value = formatTelefone(e.target.value); } })} />
                  {errors.telefone && <p className="error-message">{errors.telefone.message}</p>}
                </div>
              </div>
            </div>

            {/* Seção de Endereço */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="endereco_cep">CEP</label>
                  <input id="endereco_cep" type="text" placeholder="00000-000" className="mt-1 w-full input-style" {...register("endereco_cep", { onChange: (e) => { e.target.value = formatCEP(e.target.value); } })} />
                  {errors.endereco_cep && <p className="error-message">{errors.endereco_cep.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="endereco_logradouro">Logradouro</label>
                  <input id="endereco_logradouro" type="text" {...register("endereco_logradouro")} className="mt-1 w-full input-style" />
                  {errors.endereco_logradouro && <p className="error-message">{errors.endereco_logradouro.message}</p>}
                </div>
                <div>
                  <label htmlFor="endereco_numero">Número</label>
                  <input id="endereco_numero" type="text" {...register("endereco_numero")} className="mt-1 w-full input-style" />
                  {errors.endereco_numero && <p className="error-message">{errors.endereco_numero.message}</p>}
                </div>
                <div>
                  <label htmlFor="endereco_complemento">Complemento</label>
                  <input id="endereco_complemento" type="text" {...register("endereco_complemento")} className="mt-1 w-full input-style" />
                </div>
                <div>
                  <label htmlFor="endereco_bairro">Bairro</label>
                  <input id="endereco_bairro" type="text" {...register("endereco_bairro")} className="mt-1 w-full input-style" />
                  {errors.endereco_bairro && <p className="error-message">{errors.endereco_bairro.message}</p>}
                </div>
                <div>
                  <label htmlFor="endereco_cidade">Cidade</label>
                  <input id="endereco_cidade" type="text" {...register("endereco_cidade")} className="mt-1 w-full input-style" />
                  {errors.endereco_cidade && <p className="error-message">{errors.endereco_cidade.message}</p>}
                </div>
                <div>
                  <label htmlFor="endereco_uf">Estado (UF)</label>
                  <input id="endereco_uf" type="text" {...register("endereco_uf")} className="mt-1 w-full input-style" />
                  {errors.endereco_uf && <p className="error-message">{errors.endereco_uf.message}</p>}
                </div>
              </div>
            </div>

            {/* Seção de Dados Profissionais */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Dados Profissionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cargo">Cargo</label>
                  <select id="cargo" {...register("cargo")} className="mt-1 w-full input-style">
                    <option value="">Selecione...</option>
                    {CARGOS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.cargo && <p className="error-message">{errors.cargo.message}</p>}
                </div>
                <div>
                  <label htmlFor="departamento">Departamento</label>
                  <select id="departamento" {...register("departamento")} className="mt-1 w-full input-style">
                    <option value="">Selecione...</option>
                    {(selectedCargo === 'Professor' ? DEPARTAMENTOS_ACADEMICOS : TODOS_DEPARTAMENTOS).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.departamento && <p className="error-message">{errors.departamento.message}</p>}
                </div>
                <div>
                  <label htmlFor="data_contratacao">Data de Contratação</label>
                  <input id="data_contratacao" type="date" {...register("data_contratacao")} className="mt-1 w-full input-style" />
                  {errors.data_contratacao && <p className="error-message">{errors.data_contratacao.message}</p>}
                </div>
                <div>
                  <label htmlFor="registro">Registro Profissional (Opcional)</label>
                  <input id="registro" type="text" {...register("registro")} className="mt-1 w-full input-style" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="formacao_academica">Formação Acadêmica (Opcional)</label>
                  <input id="formacao_academica" type="text" placeholder="Ex: Licenciatura em Letras" {...register("formacao_academica")} className="mt-1 w-full input-style" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="especialidades">Especialidades (Opcional)</label>
                  <input id="especialidades" type="text" placeholder="Ex: Matemática, Física, Robótica" {...register("especialidades")} className="mt-1 w-full input-style" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="biografia">Biografia (Opcional)</label>
                  <textarea id="biografia" {...register("biografia")} rows={3} className="mt-1 w-full input-style"></textarea>
                </div>
              </div>
            </div>

            {/* Seção de Acesso */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Acesso</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="login">Login</label>
                  <input id="login" type="text" {...register("login")} className="mt-1 w-full input-style" />
                  {errors.login && <p className="error-message">{errors.login.message}</p>}
                </div>
                <div>
                  <label htmlFor="senha">Nova Senha (opcional)</label>
                  <input id="senha" type="password" {...register("senha")} className="mt-1 w-full input-style" placeholder="Deixe em branco para manter a atual" />
                  {errors.senha && <p className="error-message">{errors.senha.message}</p>}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={() => navigate('/gestor', { state: { activePage: 'professores' } })} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarProfessorPage;
