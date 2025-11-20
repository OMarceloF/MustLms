// src/pages/gestor/CriarProfessorPage.tsx (VERSÃO ATUALIZADA)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import FormField from './components/ui/FormField'; // Importe o novo componente
import { toast } from 'sonner';
import DocumentosContratacao from "./components/DocumentosContratacao";


// --- Funções de formatação (sem alterações) ---
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

// --- Validação Zod (sem alterações) ---
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
  senha: z.string().min(6, "A senha é obrigatória."),
});

type FormValues = z.infer<typeof formSchema>;

const CriarProfessorPage = () => {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [documentos, setDocumentos] = useState<Record<string, File | null>>({
    rg_frente: null,
    rg_verso: null,
    cpf: null,
    comprovante_residencia: null,
    contrato_trabalho: null,
    termo_admissao: null,
    diploma_certificacao: null,
    outros: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddDocumento = (id: string, file: File | null) => {
    setDocumentos((prev) => ({ ...prev, [id]: file }));
  };

  const handleRemoveDocumento = (id: string) => {
    setDocumentos((prev) => ({ ...prev, [id]: null }));
  };


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const cepValue = watch('endereco_cep');

  const departamentosCompletos = [
    'Matemática', 'Português', 'Biologia', 'Física', 'Química',
    'História', 'Geografia', 'Ciências', 'Educação Física',
    'Artes', 'Inglês', 'Redação'
  ];
  const cargos = ['Professor', 'Gestor'];

  // --- Hooks e lógica (sem alterações) ---
  useEffect(() => {
    const fetchCep = async (cep: string) => {
      try {
        const response = await axios.get(`/api/consulta-cep/${cep}`);
        const { logradouro, bairro, localidade, uf } = response.data;
        if (logradouro) setValue("endereco_logradouro", logradouro);
        if (bairro) setValue("endereco_bairro", bairro);
        if (localidade) setValue("endereco_cidade", localidade);
        if (uf) setValue("endereco_uf", uf);
      } catch {
        toast.error("Erro ao buscar CEP.");
      }
    };
    const cepLimpo = cepValue ? cepValue.replace(/\D/g, "") : "";
    if (cepLimpo.length === 8) fetchCep(cepLimpo);
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
      Object.entries(data).forEach(([key, value]) => {
        if (value) form.append(key, value as string);
      });
      if (foto) form.append("foto", foto);

      Object.entries(documentos).forEach(([key, file]) => {
        if (file) form.append(`documentos_${key}`, file);
      });



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
          <div className="
          bg-card 
          rounded-2xl 
          shadow-lg 
          border 
          border-border 
          p-6 
          md:p-10 
          max-w-5xl 
          w-full
        ">
            {/* HEADER */}
            <h1 className="text-3xl font-bold text-foreground text-center mb-10 tracking-tight">
              Cadastro de Novo Funcionário
            </h1>

            {error && (
              <p className="mb-6 text-destructive text-center font-medium bg-destructive/10 py-2 rounded-lg">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

              {/* SEÇÃO */}
              <section className="space-y-6">
                <div className="border-b pb-3">
                  <h2 className="text-xl font-semibold text-primary">
                    Dados Pessoais
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Informações básicas do colaborador.
                  </p>
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
                  <h2 className="text-xl font-semibold text-primary">
                    Endereço
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Endereço completo para cadastro formal.
                  </p>
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
                  <h2 className="text-xl font-semibold text-primary">
                    Dados Profissionais
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Informações relacionadas à função e contratação.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField id="cargo" label="Cargo" as="select" options={cargos} register={register} error={errors.cargo} />
                  <FormField id="departamento" label="Departamento" as="select" options={departamentosCompletos} register={register} error={errors.departamento} />
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
                  <h2 className="text-xl font-semibold text-primary">
                    Acesso ao Sistema & Foto
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField id="login" label="Login" register={register} error={errors.login} />
                  <FormField id="senha" label="Senha" type="password" register={register} error={errors.senha} />

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-foreground">Foto do Funcionário</label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                    ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
                    />

                    {previewFoto && (
                      <img
                        src={previewFoto}
                        alt="Prévia"
                        className="mt-3 h-24 w-24 object-cover rounded-md border shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </section>

              {/* DOCUMENTOS */}
              <DocumentosContratacao
                documentos={documentos}
                onAdd={handleAddDocumento}
                onRemove={handleRemoveDocumento}
              />

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
                  disabled={isSubmitting}
                  className="rounded-md h-11 px-6 bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Funcionário"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CriarProfessorPage;