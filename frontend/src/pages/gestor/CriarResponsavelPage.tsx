// src/pages/CriarResponsavelPage.tsx
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import HelpModal from '../../components/AjudaModal';
import NotificationsMenu from '../../components/NotificationsMenu';
import { toast } from "sonner";

const formSchema = z.object({
  nome: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  login: z.string().min(3, {
    message: "O login deve ter pelo menos 3 caracteres.",
  }),
  senha: z.string().min(6, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  numero1: z.string().min(8, "O telefone deve ter ao menos 8 dígitos."),
  numero2: z.string().optional(),
  endereco: z.string().min(3, "O endereço deve ter ao menos 3 caracteres."),
  cpf: z.string().min(11, "O CPF deve ter ao menos 11 dígitos."),
  grau_parentesco: z.string().optional(),
  id_aluno1: z.string().min(1, {
    message: "Selecione ao menos 1 aluno.",
  }),
  id_aluno2: z.string().optional(),
  id_aluno3: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const CriarResponsavelPage = () => {
  // Lista de alunos (para sugestão/autocomplete)
  type Aluno = { id: number; nome: string };
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para mensagem de erro de duplicação
  const [error, setError] = useState<string | null>(null);

  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);

  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");
  const [search3, setSearch3] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      login: "",
      senha: "",
      email: "",
      numero1: "",
      numero2: "",
      endereco: "",
      cpf: "",
      grau_parentesco: "",
      id_aluno1: "",
      id_aluno2: "",
      id_aluno3: ""
    }
  });

  const id_aluno1 = watch("id_aluno1");
  const id_aluno2 = watch("id_aluno2");
  const id_aluno3 = watch("id_aluno3");

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const res = await axios.get(`/api/listar_alunos`);
        setAlunos(res.data);
      } catch (err) {
        console.error("Erro ao carregar alunos:", err);
      }
    };
    fetchAlunos();
  }, []);

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  // Função para formatar telefone enquanto digita
  function formatarTelefone(value: string) {
    return value
      .replace(/\D/g, "") // Remove tudo que não é número
      .replace(/^(\d{2})(\d)/g, "($1) $2") // Coloca parênteses no DDD
      .slice(0, 15); // Limita o tamanho
  }

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const form = new FormData();
      for (const key in data) {
        if (data[key as keyof FormValues]) {
          form.append(key, data[key as keyof FormValues] as string);
        }
      }

      form.append("role", "responsavel");
      form.append("created_at", new Date().toISOString());
      if (foto) form.append("foto", foto);

      await axios.post(`/api/responsaveis`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Responsável criado com sucesso!");
      navigate("/gestor", { state: { activePage: "alunos" } });
    } catch (err: any) {
      console.error("Erro ao criar responsável:", err);

      // Se backend retornar 400, capturamos a mensagem específica
      if (err.response && err.response.status === 400) {
        const msg = err.response.data?.message;
        if (msg === "Login já cadastrado." || msg === "Email já cadastrado.") {
          setError(msg);
        } else {
          setError("Erro ao criar responsável. Tente novamente.");
        }
      } else {
        setError("Erro ao criar responsável. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) =>
          navigate('/gestor', { state: { activePage: 'alunos' } })
        }
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />
      <div className="flex-1 flex flex-col pt-20 px-4">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 max-w-3xl mx-auto w-full mt-[20px] mb-[30px]">
          <div className="mb-8 flex justify-center items-center">
            <h1 className="text-2xl font-bold text-black text-center">
              Adicionar Novo Responsável
            </h1>
          </div>

          {/* Exibe erro de duplicação (login/email) acima do formulário */}
          {error && (
            <p className="mb-4 text-red-600 text-center font-medium">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campos básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="nome" className="block text-sm font-medium text-indigo-900">
                  Nome Completo
                </label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Nome do responsável"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.nome ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("nome")}
                />
                {errors.nome && <p className="text-red-500 text-xs">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-indigo-900">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.email ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="login" className="block text-sm font-medium text-indigo-900">
                  Login
                </label>
                <input
                  id="login"
                  type="text"
                  placeholder="Nome de usuário"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.login ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("login")}
                />
                {errors.login && <p className="text-red-500 text-xs">{errors.login.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="senha" className="block text-sm font-medium text-indigo-900">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  placeholder="Senha"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.senha ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("senha")}
                />
                {errors.senha && <p className="text-red-500 text-xs">{errors.senha.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="numero1" className="block text-sm font-medium text-indigo-900">
                  Telefone para contato 1
                </label>
                <input
                  id="numero1"
                  type="tel"
                  placeholder="(99) 999999999"
                  className="w-full px-3 py-2 border rounded-md border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                  {...register("numero1")}
                  value={watch("numero1")}
                  onChange={(e) => setValue("numero1", formatarTelefone(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="numero2" className="block text-sm font-medium text-indigo-900">
                  Telefone para contato 2
                </label>
                <input
                  id="numero2"
                  type="tel"
                  placeholder="(99) 999999999"
                  className="w-full px-3 py-2 border rounded-md border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                  {...register("numero2")}
                  value={watch("numero2")}
                  onChange={(e) => setValue("numero2", formatarTelefone(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="cpf" className="block text-sm font-medium text-indigo-900">
                  CPF do responsável
                </label>
                <input
                  id="cpf"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.cpf ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("cpf")}
                />
                {errors.cpf && <p className="text-red-500 text-xs">{errors.cpf.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="grau_parentesco" className="block text-sm font-medium text-indigo-900">
                  Parentesco (Opcional)
                </label>
                <input
                  id="grau_parentesco"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                  {...register("grau_parentesco")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="endereco" className="block text-sm font-medium text-indigo-900">
                  Endereço
                </label>
                <input
                  id="endereco"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.endereco ? "border-red-500" : "border-indigo-500"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-700`}
                  {...register("endereco")}
                />
                {errors.endereco && <p className="text-red-500 text-xs">{errors.endereco.message}</p>}
              </div>
            </div>

            {/* Alunos vinculados */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-indigo-900">Aluno vinculado #1</label>
              <input
                type="text"
                placeholder="Digite para buscar..."
                className="w-full px-3 py-2 border rounded-md border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                value={search1}
                onChange={(e) => {
                  setSearch1(e.target.value);
                  setValue("id_aluno1", "");
                }}
              />
              {search1 && !id_aluno1 && (
                <ul className="border border-indigo-500 rounded-md mt-1 max-h-40 overflow-y-auto bg-white z-10 relative">
                  {alunos
                    .filter((aluno) => aluno.nome.toLowerCase().includes(search1.toLowerCase()))
                    .map((aluno) => (
                      <li
                        key={aluno.id}
                        onClick={() => {
                          setValue("id_aluno1", String(aluno.id));
                          setSearch1(aluno.nome);
                        }}
                        className="px-3 py-1 hover:bg-indigo-300 cursor-pointer"
                      >
                        {aluno.nome}
                      </li>
                    ))}
                </ul>
              )}
              {errors.id_aluno1 && (
                <p className="text-red-500 text-xs">{errors.id_aluno1.message}</p>
              )}
            </div>

            {id_aluno1 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-indigo-900">Aluno vinculado #2 (opcional)</label>
                <input
                  type="text"
                  placeholder="Digite para buscar..."
                  className="w-full px-3 py-2 border rounded-md border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                  value={search2}
                  onChange={(e) => {
                    setSearch2(e.target.value);
                    setValue("id_aluno2", "");
                  }}
                />
                {search2 && !id_aluno2 && (
                  <ul className="border border-indigo-500 rounded-md mt-1 max-h-40 overflow-y-auto bg-white z-10 relative">
                    {alunos
                      .filter((aluno) => aluno.nome.toLowerCase().includes(search2.toLowerCase()))
                      .map((aluno) => (
                        <li
                          key={aluno.id}
                          onClick={() => {
                            setValue("id_aluno2", String(aluno.id));
                            setSearch2(aluno.nome);
                          }}
                          className="px-3 py-1 hover:bg-indigo-300 cursor-pointer"
                        >
                          {aluno.nome}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {id_aluno2 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-indigo-900">Aluno vinculado #3 (opcional)</label>
                <input
                  type="text"
                  placeholder="Digite para buscar..."
                  className="w-full px-3 py-2 border rounded-md border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                  value={search3}
                  onChange={(e) => {
                    setSearch3(e.target.value);
                    setValue("id_aluno3", "");
                  }}
                />
                {search3 && !id_aluno3 && (
                  <ul className="border border-indigo-500 rounded-md mt-1 max-h-40 overflow-y-auto bg-white z-10 relative">
                    {alunos
                      .filter((aluno) => aluno.nome.toLowerCase().includes(search3.toLowerCase()))
                      .map((aluno) => (
                        <li
                          key={aluno.id}
                          onClick={() => {
                            setValue("id_aluno3", String(aluno.id));
                            setSearch3(aluno.nome);
                          }}
                          className="px-3 py-1 hover:bg-indigo-300 cursor-pointer"
                        >
                          {aluno.nome}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {/* Foto */}
            <div className="space-y-2">
              <label htmlFor="foto" className="block text-sm font-medium text-indigo-900 mb-1">
                Foto do Responsável (opcional)
              </label>
              <div className="relative">
                <input
                  id="foto"
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="peer block w-full px-3 py-2 border border-indigo-500 rounded-md text-sm text-gray-900
                            file:bg-transparent file:border-0 file:text-gray-400
                            focus:outline-none focus:ring-2 focus:ring-indigo-700"
                />
                {previewFoto && (
                  <img
                    src={previewFoto}
                    alt="Prévia da foto"
                    className="mt-2 h-24 w-24 object-cover rounded-md border"
                  />
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={() => navigate("/gestor", { state: { activePage: "alunos" } })}
                className="px-4 py-2 border border-indigo-500 text-indigo-900 rounded-md hover:bg-indigo-50 transition-colors mr-4"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-800 text-white rounded-md hover:bg-indigo-900 transition-colors"
              >
                {isSubmitting ? "Salvando..." : "Salvar Responsável"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CriarResponsavelPage;
