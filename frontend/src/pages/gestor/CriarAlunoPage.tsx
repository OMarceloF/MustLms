import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SidebarGestor from "./components/Sidebar";
import TopbarGestorAuto from "./components/TopbarGestorAuto";
import { toast } from "sonner";

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido."),
  matricula: z.string().min(5, "A matrícula deve ter pelo menos 5 caracteres."),
  cpf: z.string().min(14, "CPF inválido."),
  data_nascimento: z.string().min(1, "A data de nascimento é obrigatória."),
  genero: z.string().optional(),
  login: z.string().min(3, "O login deve ter pelo menos 3 caracteres."),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  responsavel_nome: z.string().min(3, "O nome do responsável é obrigatório."),
  responsavel_cpf: z.string().min(14, "CPF inválido."),
  responsavel_email: z.string().email("Email do responsável inválido."),
  responsavel_telefone: z.string().min(14, "Telefone inválido."),
  responsavel_parentesco: z.string().min(1, "O parentesco é obrigatório."),
  endereco_cep: z.string().min(9, "CEP inválido."),
  endereco_logradouro: z.string().min(1, "O logradouro é obrigatório."),
  endereco_numero: z.string().min(1, "O número é obrigatório."),
  endereco_complemento: z.string().optional(),
  endereco_bairro: z.string().min(1, "O bairro é obrigatório."),
  endereco_cidade: z.string().min(1, "A cidade é obrigatória."),
  endereco_uf: z.string().min(2, "O estado é obrigatório."),
  saude_tem_alergia: z.boolean().optional(),
  saude_alergias_descricao: z.string().optional(),
  saude_usa_medicacao: z.boolean().optional(),
  saude_medicacao_descricao: z.string().optional(),
  saude_plano: z.string().optional(),
  saude_plano_numero: z.string().optional(),
  saude_contato_emergencia_nome: z.string().optional(),
  saude_contato_emergencia_telefone: z.string().optional(),
  serie: z.string().optional(),
  turma: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

const CriarAlunoPage = () => {
  const [isSearchingCpf, setIsSearchingCpf] = useState(false);
  const [responsavelEncontrado, setResponsavelEncontrado] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue, // Usaremos para preencher o endereço
    formState: { errors },
    trigger,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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
      serie: "",
      turma: "",
    },
  });

  const temAlergia = watch("saude_tem_alergia");
  const usaMedicacao = watch("saude_usa_medicacao");
  const cepValue = watch("endereco_cep");
  const cpfResponsavelValue = watch("responsavel_cpf");

  useEffect(() => {
    // Esta função será chamada uma vez quando o componente montar.
    // Ela força o formulário a voltar para os seus valores padrão,
    // limpando qualquer autopreenchimento que o navegador possa ter feito.
    reset();
  }, [reset]);

  useEffect(() => {
    const fetchResponsavelPorCpf = async (cpf: string) => {
      setIsSearchingCpf(true);
      setResponsavelEncontrado(false);
      try {
        // Precisaremos criar esta rota no backend depois
        const response = await axios.get(`/api/responsaveis/cpf/${cpf}`);

        if (response.data) {
          const { nome, email, telefone } = response.data;
          // Preenche os campos do formulário com os dados encontrados
          setValue("responsavel_nome", nome);
          setValue("responsavel_email", email);
          setValue("responsavel_telefone", formatTelefone(telefone)); // Reutilize a função de formatação
          setResponsavelEncontrado(true);
        }
      } catch (error: any) {
        // Se der 404 (não encontrado), limpamos os campos para novo cadastro
        if (error.response && error.response.status === 404) {
          setValue("responsavel_nome", "");
          setValue("responsavel_email", "");
          setValue("responsavel_telefone", "");
          setResponsavelEncontrado(false);
        } else {
          console.error("Erro ao buscar CPF do responsável:", error);
        }
      } finally {
        setIsSearchingCpf(false);
      }
    };

    const cpfLimpo = cpfResponsavelValue ? cpfResponsavelValue.replace(/\D/g, "") : "";
    if (cpfLimpo.length === 11) {
      fetchResponsavelPorCpf(cpfLimpo);
    } else {
      setResponsavelEncontrado(false)
    }
  }, [cpfResponsavelValue, setValue]);

  // Efeito para buscar endereço via CEP
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

  // ETAPA 3: AJUSTAR A FUNÇÃO DE SUBMISSÃO
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const form = new FormData();

      // Adiciona todos os campos do formulário ao FormData
      Object.entries(data).forEach(([key, value]) => {
        // Converte booleano para string para o FormData
        if (typeof value === 'boolean') {
          form.append(key, String(value));
        } else if (value) {
          // Adiciona apenas se o valor não for nulo/vazio
          form.append(key, value);
        }
      });

      // Adiciona campos fixos ou manipulados
      form.append("role", "aluno");
      form.append("created_at", new Date().toISOString());
      if (foto) {
        form.append("foto", foto);
      }

      await axios.post(`/api/alunos`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Aluno criado com sucesso!");
      navigate("/gestor", { state: { activePage: "alunos" } });
    } catch (err: any) {
      console.error("Erro ao criar aluno:", err);
      if (err.response && err.response.status === 400) {
        setError(err.response.data?.message || "Erro de validação do servidor.");
      } else {
        setError("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ETAPA 2: MODIFICAR O FORMULÁRIO (JSX)
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        // Ação para quando um item do menu é clicado
        setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
        // Funções para controlar a abertura/fechamento no hover
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />
      <div className="flex-1 flex flex-col pt-20 px-2 sm:px-6">
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          // Passando a função para que o botão de menu na topbar possa alterar o estado
          setIsMenuOpen={setSidebarAberta}
        />

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 max-w-4xl w-full mx-auto my-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black text-center mb-6">Adicionar Novo Aluno</h1>
          {error && <p className="mb-4 text-red-600 text-center font-medium">{error}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* --- SEÇÃO: DADOS PESSOAIS DO ALUNO --- */}
            <div className="border-b border-indigo-300 pb-6">
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
                  <input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    className="mt-1 w-full input-style"
                    {...register("cpf", {
                      onChange: (e) => {
                        e.target.value = formatCPF(e.target.value);
                      },
                    })}
                  />
                  {errors.cpf && <p className="error-message">{errors.cpf.message}</p>}
                </div>
              </div>
            </div>

            {/* --- SEÇÃO: DADOS DO RESPONSÁVEL --- */}
            <div className="border-b border-indigo-300 pb-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Dados do Responsável</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="responsavel_nome" className="block text-sm font-medium text-indigo-900">Nome Completo do Responsável</label>
                  <input id="responsavel_nome" type="text" {...register("responsavel_nome")} className="mt-1 w-full input-style" disabled={responsavelEncontrado} />
                  {errors.responsavel_nome && <p className="error-message">{errors.responsavel_nome.message}</p>}
                </div>
                <div>
                  <label htmlFor="responsavel_cpf" className="block text-sm font-medium text-indigo-900">CPF do Responsável</label>
                  <div className="relative">
                    <input
                      id="responsavel_cpf"
                      type="text"
                      placeholder="Digite o CPF para buscar"
                      className="mt-1 w-full input-style"
                      {...register("responsavel_cpf", {
                        onChange: (e) => { e.target.value = formatCPF(e.target.value); },
                        onBlur: () => trigger("responsavel_cpf"), // Valida o campo ao sair
                      })}
                    />
                    {isSearchingCpf && <span className="absolute right-2 top-3 text-xs text-gray-500">Buscando...</span>}
                  </div>
                  {errors.responsavel_cpf && <p className="error-message">{errors.responsavel_cpf.message}</p>}
                  {responsavelEncontrado && <p className="text-green-600 text-xs mt-1">Responsável encontrado. Dados preenchidos.</p>}
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
                  <input id="responsavel_telefone" type="text" {...register("responsavel_telefone")} placeholder="(00) 00000-0000" className="mt-1 w-full input-style" disabled={responsavelEncontrado} {...register("responsavel_telefone", {
                    onChange: (e) => {
                      e.target.value = formatTelefone(e.target.value);
                    },
                  })} />
                  {errors.responsavel_telefone && <p className="error-message">{errors.responsavel_telefone.message}</p>}
                </div>
              </div>
            </div>

            {/* --- SEÇÃO: ENDEREÇO --- */}
            <div className="border-b border-indigo-300 pb-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Endereço</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="endereco_cep" className="block text-sm font-medium text-indigo-900">CEP</label>
                  <input id="endereco_cep" type="text" {...register("endereco_cep")} placeholder="00000-000" className="mt-1 w-full input-style" {...register("endereco_cep", {
                    onChange: (e) => {
                      const { value } = e.target;
                      // Atualiza o valor do campo com o valor formatado
                      e.target.value = formatCEP(value);
                    },
                  })} />
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

            {/* --- SEÇÃO: INFORMAÇÕES DE SAÚDE --- */}
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

            {/* --- SEÇÃO: INFORMAÇÕES DE ACESSO E FOTO --- */}
            <div className="border-b border-indigo-300 pb-6">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Acesso e Foto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="login" className="block text-sm font-medium text-indigo-900">Login</label>
                  <input id="login" type="text" {...register("login")} className="mt-1 w-full input-style" autoComplete="off" />
                  {errors.login && <p className="error-message">{errors.login.message}</p>}
                </div>
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-indigo-900">Senha</label>
                  <input id="senha" type="password" {...register("senha")} className="mt-1 w-full input-style" autoComplete="off" />
                  {errors.senha && <p className="error-message">{errors.senha.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="foto" className="block text-sm font-medium text-indigo-900">Foto do Aluno</label>
                  <input id="foto" type="file" accept="image/*" onChange={handleFotoChange} className="mt-1 w-full file-input-style" />
                  {previewFoto && <img src={previewFoto} alt="Prévia" className="mt-2 h-24 w-24 object-cover rounded-md border" />}
                </div>
              </div>
            </div>

            {/* ----- Botões de Envio ----- */}
            <div className="flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
              <button
                type="button"
                onClick={() =>
                  navigate("/gestor", { state: { activePage: "alunos" } })
                }
                className="px-4 py-2 border border-indigo-500 text-indigo-900 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-900 transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {isSubmitting ? "Salvando..." : "Salvar Aluno"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CriarAlunoPage;

