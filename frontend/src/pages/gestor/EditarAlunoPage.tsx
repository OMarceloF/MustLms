import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from 'sonner';

// As interfaces antigas não são mais necessárias, pois o Zod cuidará da tipagem.

// As funções de formatação são úteis, vamos mantê-las
const formatCPF = (value: string): string => {
  // 1. Remove tudo que não for dígito
  const numericValue = value.replace(/\D/g, '');

  // 2. Limita a 11 dígitos
  const truncatedValue = numericValue.slice(0, 11);

  // 3. Aplica a máscara
  if (truncatedValue.length > 9) {
    return truncatedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (truncatedValue.length > 6) {
    return truncatedValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (truncatedValue.length > 3) {
    return truncatedValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  return truncatedValue;
};

const formatTelefone = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  const truncatedValue = numericValue.slice(0, 11);

  if (truncatedValue.length > 10) {
    // Celular com 9 dígitos: (XX) XXXXX-XXXX
    return truncatedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (truncatedValue.length > 6) {
    // Telefone fixo ou celular com 8 dígitos: (XX) XXXX-XXXX
    return truncatedValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (truncatedValue.length > 2) {
    return truncatedValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }

  return truncatedValue.replace(/(\d*)/, '($1');
};

const formatCEP = (value: string): string => {
  // 1. Remove tudo que não for dígito
  const numericValue = value.replace(/\D/g, '');

  // 2. Limita a 8 dígitos
  const truncatedValue = numericValue.slice(0, 8);

  // 3. Aplica a máscara
  if (truncatedValue.length > 5) {
    return truncatedValue.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  }

  return truncatedValue;
};

const formSchema = z.object({
  // --- Dados do Aluno ---
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido."),
  matricula: z.string().min(5, "A matrícula deve ter pelo menos 5 caracteres."),
  cpf: z.string().min(14, "CPF inválido."),
  data_nascimento: z.string().min(1, "A data de nascimento é obrigatória."),
  genero: z.string().optional(),

  // --- Informações de Acesso ---
  login: z.string().min(3, "O login deve ter pelo menos 3 caracteres."),
  senha: z.string().optional().refine(val => !val || val.length >= 6, {
    message: "A nova senha deve ter pelo menos 6 caracteres.",
  }),
  // --- Dados do Responsável Principal ---
  responsavel_nome: z.string().min(3, "O nome do responsável é obrigatório."),
  responsavel_cpf: z.string().min(14, "CPF inválido."), // 11.111.111-11
  responsavel_email: z.string().email("Email do responsável inválido."),
  responsavel_telefone: z.string().min(14, "Telefone inválido."), // (11) 91111-1111
  responsavel_parentesco: z.string().min(1, "O parentesco é obrigatório."),

  // --- Endereço ---
  endereco_cep: z.string().min(9, "CEP inválido."), // 11111-111
  endereco_logradouro: z.string().min(1, "O logradouro é obrigatório."),
  endereco_numero: z.string().min(1, "O número é obrigatório."),
  endereco_complemento: z.string().optional(),
  endereco_bairro: z.string().min(1, "O bairro é obrigatório."),
  endereco_cidade: z.string().min(1, "A cidade é obrigatória."),
  endereco_uf: z.string().min(2, "O estado é obrigatório."),
  
  // ADICIONE ESTES CAMPOS DE SAÚDE
  saude_tem_alergia: z.coerce.boolean().optional(), // Usa z.coerce.boolean()
  saude_alergias_descricao: z.string().optional(),
  saude_usa_medicacao: z.coerce.boolean().optional(), // Usa z.coerce.boolean()
  saude_medicacao_descricao: z.string().optional(),
  saude_plano: z.string().optional(),
  saude_plano_numero: z.string().optional(),
  saude_contato_emergencia_nome: z.string().optional(),
  saude_contato_emergencia_telefone: z.string().optional(),
  

  // ADICIONE ESTES CAMPOS FINANCEIROS
  mensalidade_valor: z.string().optional(),
  mensalidade_data_inicial: z.string().optional(),
  hasDesconto: z.coerce.boolean().optional(),
  desconto_percentual: z.string().optional(),
  desconto_descricao: z.string().optional(),
  desconto_data_inicio: z.string().optional(),
  desconto_data_fim: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditarAlunoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. ESTADOS REDUZIDOS: Apenas o que NÃO pertence ao formulário
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // 2. SETUP DO REACT-HOOK-FORM
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Valores padrão para evitar erro de "componente não controlado"
    defaultValues: {
      // Definindo valores padrão para todos os campos
      nome: "",
      email: "",
      matricula: "",
      cpf: "",
      data_nascimento: "",
      genero: "",
      login: "",
      senha: "",
      responsavel_nome: "",
      responsavel_cpf: "",
      responsavel_email: "",
      responsavel_telefone: "",
      responsavel_parentesco: "",
      endereco_cep: "",
      endereco_logradouro: "",
      endereco_numero: "",
      endereco_complemento: "",
      endereco_bairro: "",
      endereco_cidade: "",
      endereco_uf: "",
      saude_tem_alergia: false,
      saude_alergias_descricao: "",
      saude_usa_medicacao: false,
      saude_medicacao_descricao: "",
      saude_plano: "",
      saude_plano_numero: "",
      saude_contato_emergencia_nome: "",
      saude_contato_emergencia_telefone: "",
      mensalidade_valor: "",
      mensalidade_data_inicial: "",
      hasDesconto: false,
      desconto_percentual: "",
      desconto_descricao: "",
      desconto_data_inicio: "",
      desconto_data_fim: "",
    },
  });

  const temAlergia = watch("saude_tem_alergia");
  const usaMedicacao = watch("saude_usa_medicacao");

  // 3. FETCH UNIFICADO DOS DADOS
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Este é o endpoint que precisamos criar no backend
        const response = await axios.get(`/api/alunos/${id}/edit-data`);
        const data = response.data;

        // O `reset` preenche o formulário com os dados da API
        reset(data);

        // Lógica para definir o preview da foto inicial
        if (data.foto_url) {
          setPreviewUrl(`/${data.foto_url}`);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do aluno:', err);
        setError('Não foi possível carregar os dados para edição.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  // 4. FUNÇÃO DE SUBMISSÃO SIMPLIFICADA
  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    setError('');

    const formPayload = new FormData();

    // Adiciona todos os campos do formulário ao payload
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'senha' && !value) return; // Não envia senha se estiver vazia
      if (value) {
        formPayload.append(key, value as string);
      }
    });

    if (fotoFile) {
      formPayload.append('foto', fotoFile);
    }

    try {
      // O endpoint PUT que receberá todos os dados
      await axios.put(`/api/alunos/${id}`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Aluno atualizado com sucesso!');
      navigate('/gestor', { state: { activePage: 'alunos' } });
    } catch (err: any) {
      console.error('Erro ao atualizar aluno:', err);
      setError(err.response?.data?.message || 'Ocorreu um erro ao salvar.');
      toast.error(err);
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return <div className="p-6 text-center">Carregando dados para edição...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }


  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <main className="flex-1 p-4 flex justify-center items-start mt-20">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-8 text-center">Editar Aluno</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">


              {Object.keys(errors).length > 0 && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
                  <p className="font-bold">Erros de Validação nos seguintes campos:</p>
                  <ul className="mt-2 list-disc list-inside">
                    {Object.keys(errors).map(key => (
                      <li key={key}>{key}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* --- SEÇÃO: FOTO --- */}
              <div>
                <label className="block text-sm font-medium text-indigo-900 mb-2">Foto do Aluno</label>
                <div className='flex items-center gap-4'>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Foto do aluno"
                      className="h-24 w-24 object-cover rounded-full border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      Sem Foto
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFotoFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="file-input-style" // Use uma classe de estilo consistente
                  />
                </div>
              </div>

              {/* --- SEÇÃO: DADOS PESSOAIS DO ALUNO --- */}
              <div className="border-t border-indigo-200 pt-6">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">Dados Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="nome" className="block text-sm font-medium text-indigo-900">Nome Completo</label>
                    <input id="nome" type="text" {...register("nome")} className="mt-1 w-full input-style" />
                    {errors.nome && <p className="error-message">{errors.nome.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="data_nascimento" className="block text-sm font-medium text-indigo-900">Data de Nascimento</label>
                    <input id="data_nascimento" type="date" {...register("data_nascimento")} className="mt-1 w-full input-style" />
                    {errors.data_nascimento && <p className="error-message">{errors.data_nascimento.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="genero" className="block text-sm font-medium text-indigo-900">Gênero</label>
                    <select id="genero" {...register("genero")} className="mt-1 w-full input-style">
                      <option value="">Selecione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-indigo-900">Email</label>
                    <input id="email" type="email" {...register("email")} className="mt-1 w-full input-style" />
                    {errors.email && <p className="error-message">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="matricula" className="block text-sm font-medium text-indigo-900">Matrícula</label>
                    <input id="matricula" type="text" {...register("matricula")} className="mt-1 w-full input-style" />
                    {errors.matricula && <p className="error-message">{errors.matricula.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-indigo-900">CPF do Aluno</label>
                    <input id="cpf" type="text" {...register("cpf", { onChange: (e) => e.target.value = formatCPF(e.target.value) })} className="mt-1 w-full input-style" />
                    {errors.cpf && <p className="error-message">{errors.cpf.message}</p>}
                  </div>
                </div>
              </div>

              {/* --- SEÇÃO: DADOS DO RESPONSÁVEL --- */}
              <div className="border-t border-indigo-200 pt-6">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">Dados do Responsável Principal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="responsavel_nome" className="block text-sm font-medium text-indigo-900">Nome Completo do Responsável</label>
                    <input id="responsavel_nome" type="text" {...register("responsavel_nome")} className="mt-1 w-full input-style" />
                    {errors.responsavel_nome && <p className="error-message">{errors.responsavel_nome.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="responsavel_cpf" className="block text-sm font-medium text-indigo-900">CPF</label>
                    <input id="responsavel_cpf" type="text" {...register("responsavel_cpf", { onChange: (e) => e.target.value = formatCPF(e.target.value) })} placeholder="000.000.000-00" className="mt-1 w-full input-style" />
                    {errors.responsavel_cpf && <p className="error-message">{errors.responsavel_cpf.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="responsavel_parentesco" className="block text-sm font-medium text-indigo-900">Parentesco</label>
                    <select id="responsavel_parentesco" {...register("responsavel_parentesco")} className="mt-1 w-full input-style">
                      <option value="">Selecione...</option>
                      <option value="Pai">Pai</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Avô/Avó">Avô/Avó</option>
                      <option value="Tio/Tia">Tio/Tia</option>
                      <option value="Outro">Outro</option>
                    </select>
                    {errors.responsavel_parentesco && <p className="error-message">{errors.responsavel_parentesco.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="responsavel_email" className="block text-sm font-medium text-indigo-900">Email do Responsável</label>
                    <input id="responsavel_email" type="email" {...register("responsavel_email")} className="mt-1 w-full input-style" />
                    {errors.responsavel_email && <p className="error-message">{errors.responsavel_email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="responsavel_telefone" className="block text-sm font-medium text-indigo-900">Telefone do Responsável</label>
                    <input id="responsavel_telefone" type="text" {...register("responsavel_telefone", { onChange: (e) => e.target.value = formatTelefone(e.target.value) })} placeholder="(00) 00000-0000" className="mt-1 w-full input-style" />
                    {errors.responsavel_telefone && <p className="error-message">{errors.responsavel_telefone.message}</p>}
                  </div>
                </div>
              </div>

              {/* --- SEÇÃO: ENDEREÇO --- */}
              <div className="border-t border-indigo-200 pt-6">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">Endereço</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="endereco_cep" className="block text-sm font-medium text-indigo-900">CEP</label>
                    <input id="endereco_cep" type="text" {...register("endereco_cep", { onChange: (e) => e.target.value = formatCEP(e.target.value) })} placeholder="00000-000" className="mt-1 w-full input-style" />
                    {errors.endereco_cep && <p className="error-message">{errors.endereco_cep.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="endereco_logradouro" className="block text-sm font-medium text-indigo-900">Logradouro</label>
                    <input id="endereco_logradouro" type="text" {...register("endereco_logradouro")} className="mt-1 w-full input-style" />
                    {errors.endereco_logradouro && <p className="error-message">{errors.endereco_logradouro.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="endereco_numero" className="block text-sm font-medium text-indigo-900">Número</label>
                    <input id="endereco_numero" type="text" {...register("endereco_numero")} className="mt-1 w-full input-style" />
                    {errors.endereco_numero && <p className="error-message">{errors.endereco_numero.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="endereco_complemento" className="block text-sm font-medium text-indigo-900">Complemento</label>
                    <input id="endereco_complemento" type="text" {...register("endereco_complemento")} className="mt-1 w-full input-style" />
                  </div>
                  <div>
                    <label htmlFor="endereco_bairro" className="block text-sm font-medium text-indigo-900">Bairro</label>
                    <input id="endereco_bairro" type="text" {...register("endereco_bairro")} className="mt-1 w-full input-style" />
                    {errors.endereco_bairro && <p className="error-message">{errors.endereco_bairro.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="endereco_cidade" className="block text-sm font-medium text-indigo-900">Cidade</label>
                    <input id="endereco_cidade" type="text" {...register("endereco_cidade")} className="mt-1 w-full input-style" />
                    {errors.endereco_cidade && <p className="error-message">{errors.endereco_cidade.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="endereco_uf" className="block text-sm font-medium text-indigo-900">Estado (UF)</label>
                    <input id="endereco_uf" type="text" {...register("endereco_uf")} className="mt-1 w-full input-style" />
                    {errors.endereco_uf && <p className="error-message">{errors.endereco_uf.message}</p>}
                  </div>
                </div>
              </div>
              {/* --- SEÇÃO: SAÚDE --- */}
              <div className="border-b border-indigo-300 pb-6">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">Informações de Saúde</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input id="saude_tem_alergia" type="checkbox" {...register("saude_tem_alergia")} className="h-4 w-4 mt-1 checkbox-style" />
                    <div className="ml-3 text-sm">
                      <label htmlFor="saude_tem_alergia" className="font-medium text-indigo-900">Possui alguma alergia?</label>
                      {temAlergia && (
                        <textarea {...register("saude_alergias_descricao")} placeholder="Descreva as alergias..." className="mt-2 w-full input-style" rows={2}></textarea>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start">
                    <input id="saude_usa_medicacao" type="checkbox" {...register("saude_usa_medicacao")} className="h-4 w-4 mt-1 checkbox-style" />
                    <div className="ml-3 text-sm">
                      <label htmlFor="saude_usa_medicacao" className="font-medium text-indigo-900">Usa medicação contínua?</label>
                      {usaMedicacao && (
                        <textarea {...register("saude_medicacao_descricao")} placeholder="Descreva os medicamentos e dosagens..." className="mt-2 w-full input-style" rows={2}></textarea>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label htmlFor="saude_plano" className="block text-sm font-medium text-indigo-900">Plano de Saúde</label>
                      <input id="saude_plano" type="text" {...register("saude_plano")} className="mt-1 w-full input-style" />
                    </div>
                    <div>
                      <label htmlFor="saude_plano_numero" className="block text-sm font-medium text-indigo-900">Número da Carteirinha</label>
                      <input id="saude_plano_numero" type="text" {...register("saude_plano_numero")} className="mt-1 w-full input-style" />
                    </div>
                    <div>
                      <label htmlFor="saude_contato_emergencia_nome" className="block text-sm font-medium text-indigo-900">Contato de Emergência (Nome)</label>
                      <input id="saude_contato_emergencia_nome" type="text" {...register("saude_contato_emergencia_nome")} className="mt-1 w-full input-style" />
                    </div>
                    <div>
                      <label htmlFor="saude_contato_emergencia_telefone" className="block text-sm font-medium text-indigo-900">Contato de Emergência (Telefone)</label>
                      <input id="saude_contato_emergencia_telefone" type="text" {...register("saude_contato_emergencia_telefone")} placeholder="(00) 00000-0000" className="mt-1 w-full input-style" {...register("responsavel_telefone", {
                        onChange: (e) => {
                          e.target.value = formatTelefone(e.target.value);
                        },
                      })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SEÇÃO: INFORMAÇÕES DE ACESSO --- */}
              <div className="border-t border-indigo-200 pt-6">
                <h2 className="text-lg font-semibold text-indigo-900 mb-4">Informações de Acesso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="login" className="block text-sm font-medium text-indigo-900">Login</label>
                    <input id="login" type="text" {...register("login")} className="mt-1 w-full input-style" />
                    {errors.login && <p className="error-message">{errors.login.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="senha" className="block text-sm font-medium text-indigo-900">Nova Senha</label>
                    <input id="senha" type="password" {...register("senha")} className="mt-1 w-full input-style" placeholder="Deixe em branco para não alterar" />
                    {errors.senha && <p className="error-message">{errors.senha.message}</p>}
                  </div>
                </div>
              </div>

              {/* Botão de Salvar */}
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditarAlunoPage;
