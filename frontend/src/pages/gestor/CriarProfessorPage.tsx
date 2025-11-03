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
    <div className="flex min-h-screen bg-muted/30">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col pt-20 px-4 sm:px-6">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <main className="flex-1 flex justify-center py-8">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8 max-w-4xl w-full">
            <h1 className="text-2xl font-bold text-foreground text-center mb-8">
              Adicionar Novo Funcionário
            </h1>

            {error && <p className="mb-4 text-destructive text-center font-medium">{error}</p>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* --- DADOS PESSOAIS --- */}
              <section>
                <h2 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                  <FormField id="nome" label="Nome Completo" register={register} error={errors.nome} containerClassName="md:col-span-2" />
                  <FormField id="data_nascimento" label="Data de Nascimento" type="date" register={register} error={errors.data_nascimento} />
                  <FormField id="cpf" label="CPF" placeholder="000.000.000-00" register={register} error={errors.cpf} onChange={(e) => e.target.value = formatCPF(e.target.value)} />
                  <FormField id="email" label="Email" type="email" register={register} error={errors.email} />
                  <FormField id="telefone" label="Telefone" placeholder="(00) 00000-0000" register={register} error={errors.telefone} onChange={(e) => e.target.value = formatTelefone(e.target.value)} />
                </div>
              </section>

              {/* --- ENDEREÇO --- */}
              <section>
                <h2 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6 gap-y-4 pt-4">
                  <FormField id="endereco_cep" label="CEP" placeholder="00000-000" register={register} error={errors.endereco_cep} onChange={(e) => e.target.value = formatCEP(e.target.value)} containerClassName="md:col-span-2" />
                  <FormField id="endereco_logradouro" label="Logradouro" register={register} error={errors.endereco_logradouro} containerClassName="md:col-span-4" />
                  <FormField id="endereco_numero" label="Número" register={register} error={errors.endereco_numero} containerClassName="md:col-span-2" />
                  <FormField id="endereco_complemento" label="Complemento (Opcional)" register={register} error={errors.endereco_complemento} containerClassName="md:col-span-4" />
                  <FormField id="endereco_bairro" label="Bairro" register={register} error={errors.endereco_bairro} containerClassName="md:col-span-3" />
                  <FormField id="endereco_cidade" label="Cidade" register={register} error={errors.endereco_cidade} containerClassName="md:col-span-2" />
                  <FormField id="endereco_uf" label="UF" register={register} error={errors.endereco_uf} containerClassName="md:col-span-1" />
                </div>
              </section>

              {/* --- DADOS PROFISSIONAIS --- */}
              <section>
                <h2 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Dados Profissionais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                  <FormField id="cargo" label="Cargo" as="select" options={cargos} register={register} error={errors.cargo} />
                  <FormField id="departamento" label="Departamento" as="select" options={departamentosCompletos} register={register} error={errors.departamento} />
                  <FormField id="data_contratacao" label="Data de Contratação" type="date" register={register} error={errors.data_contratacao} />
                  <FormField id="registro" label="Registro Profissional (Opcional)" register={register} error={errors.registro} />
                  <FormField id="formacao_academica" label="Formação Acadêmica" register={register} error={errors.formacao_academica} containerClassName="md:col-span-2" />
                  <FormField id="especialidades" label="Especialidades" register={register} error={errors.especialidades} containerClassName="md:col-span-2" />
                  <FormField id="biografia" label="Biografia" as="textarea" rows={3} register={register} error={errors.biografia} containerClassName="md:col-span-2" />
                </div>
              </section>

              {/* --- ACESSO E FOTO --- */}
              <section>
                <h2 className="text-lg font-semibold text-primary mb-4 border-b pb-2">Acesso e Foto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                  <FormField id="login" label="Login" register={register} error={errors.login} autoComplete="off" />
                  <FormField id="senha" label="Senha" type="password" register={register} error={errors.senha} autoComplete="new-password" />
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Foto do Funcionário
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    {previewFoto && (
                      <img
                        src={previewFoto}
                        alt="Prévia"
                        // 3. Prévia da imagem com borda arredondada
                        className="mt-3 h-24 w-24 object-cover rounded-md border border-border"
                      />
                    )}
                  </div>
                </div>
              </section>
              {/* --- BOTÕES --- */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/gestor', { state: { activePage: 'professores' } })}
                  // 4. Estilos do botão secundário
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  // 5. Estilos do botão primário
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Funcionário'}
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