// src/pages/gestor/CriarProfessorPage.tsx (VERSÃO ATUALIZADA)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from 'sonner';

// Funções de formatação (reutilizadas)
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

// 1. SCHEMA ATUALIZADO
const formSchema = z.object({
  // Dados Pessoais
  nome: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Email inválido."),
  cpf: z.string().min(14, "CPF inválido."),
  telefone: z.string().min(14, "Telefone inválido."),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória."),
  
  // Endereço
  endereco_cep: z.string().min(9, "CEP inválido."),
  endereco_logradouro: z.string().min(1, "Logradouro é obrigatório."),
  endereco_numero: z.string().min(1, "Número é obrigatório."),
  endereco_complemento: z.string().optional(),
  endereco_bairro: z.string().min(1, "Bairro é obrigatório."),
  endereco_cidade: z.string().min(1, "Cidade é obrigatória."),
  endereco_uf: z.string().min(2, "UF é obrigatório."),

  // Dados Profissionais
  cargo: z.string().min(1, "Selecione um cargo."),
  departamento: z.string().min(1, "Selecione um departamento."),
  data_contratacao: z.string().min(1, "Data de contratação é obrigatória."),
  registro: z.string().optional(),
  formacao_academica: z.string().optional(),
  especialidades: z.string().optional(),
  biografia: z.string().optional(),

  // Acesso
  login: z.string().min(3, "O login é obrigatório."),
  senha: z.string().min(6, "A senha é obrigatória."),
});

type FormValues = z.infer<typeof formSchema>;

const CriarProfessorPage = () => {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const selectedCargo = watch('cargo');
  const cepValue = watch('endereco_cep');

  // Listas estáticas (mantidas por enquanto)
  const departamentosCompletos = [ 'Matemática  ',   'Portugues ',  'Biologia ',  'Física ',  'Química  ',   'História  ',   'Geografia ',  'Ciencias ',  'Educação Físisca ',  'Artes  ',   'Ingles  ', 'Redação' ];
  const departamentosParaProfessor = [ 'Matemática  ',   'Portugues ',  'Biologia ',  'Física ',  'Química  ',   'História  ',   'Geografia ',  'Ciencias ',  'Educação Físisca ',  'Artes  ',   'Ingles  ',   'Redação', /* ... */ ];
  const cargos = ['Professor', 'Gestor'];

  // Lógica para buscar CEP (reutilizada)
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
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      // Adiciona todos os dados do formulário
      Object.entries(data).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      if (foto) form.append("foto", foto);

      // O backend precisará ser atualizado para receber estes campos
      await axios.post(`/api/funcionarios`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Funcionário criado com sucesso!');
      navigate('/gestor', { state: { activePage: 'professores' } });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erro ao criar funcionário.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarGestor isMenuOpen={sidebarAberta} setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })} handleMouseEnter={() => setSidebarAberta(true)} handleMouseLeave={() => setSidebarAberta(false)} />
      <div className="flex-1 flex flex-col pt-20 px-2 sm:px-6">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-4xl w-full mx-auto my-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black text-center mb-6">Adicionar Novo Funcionário</h1>
          {error && <p className="mb-4 text-red-600 text-center font-medium">{error}</p>}

          {/* 2. JSX ATUALIZADO */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* --- SEÇÃO: DADOS PESSOAIS --- */}
            <div className="border-b border-indigo-300 pb-6">
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

            {/* --- SEÇÃO: ENDEREÇO --- */}
            <div className="border-b border-indigo-300 pb-6">
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

            {/* --- SEÇÃO: DADOS PROFISSIONAIS --- */}
            <div className="border-b border-indigo-300 pb-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Dados Profissionais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cargo">Cargo</label>
                  <select id="cargo" {...register("cargo")} className="mt-1 w-full input-style">
                    <option value="">Selecione...</option>
                    {cargos.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.cargo && <p className="error-message">{errors.cargo.message}</p>}
                </div>
                <div>
                  <label htmlFor="departamento">Departamento</label>
                  <select id="departamento" {...register("departamento")} className="mt-1 w-full input-style">
                    <option value="">Selecione...</option>
                    {(selectedCargo === 'Professor' ? departamentosParaProfessor : departamentosCompletos).map((d) => <option key={d} value={d}>{d}</option>)}
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

            {/* --- SEÇÃO: ACESSO E FOTO --- */}
            <div className="border-b border-indigo-300 pb-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Acesso e Foto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="login">Login</label>
                  <input id="login" type="text" {...register("login")} className="mt-1 w-full input-style" autoComplete="off" />
                  {errors.login && <p className="error-message">{errors.login.message}</p>}
                </div>
                <div>
                  <label htmlFor="senha">Senha</label>
                  <input id="senha" type="password" {...register("senha")} className="mt-1 w-full input-style" autoComplete="new-password" />
                  {errors.senha && <p className="error-message">{errors.senha.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="foto">Foto do Funcionário</label>
                  <input id="foto" type="file" accept="image/*" onChange={handleFotoChange} className="mt-1 w-full file-input-style" />
                  {previewFoto && <img src={previewFoto} alt="Prévia" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
                </div>
              </div>
            </div>

            {/* --- BOTÕES DE ENVIO --- */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => navigate("/gestor", { state: { activePage: "professores" } })} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Funcionário"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CriarProfessorPage;
