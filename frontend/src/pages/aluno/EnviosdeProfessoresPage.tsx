import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import FollowButton from '../gestor/components/ui/followButton';
import {
  MessageCircle,
  Star,
  Users,
  Award,
  Book,
  GraduationCap,
} from 'lucide-react';
import SidebarAluno from './components/sidebaraluno';
import SidebarGestor from '../gestor/components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import TopbarGestorAuto from '../gestor/components/TopbarGestorAuto';
import axios from 'axios';
// import ChatSidebar from '../../components/ChatSideBar';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { Badge } from '../../pages/gestor/components/ui/badge';
import { Button } from '../../pages/gestor/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../pages/gestor/components/ui/tabs';
import {
  FileText,
  Image,
  AlertCircle,
  BookOpen,
  Clock,
  Shuffle,
  Eye,
} from 'lucide-react';
import.meta.env.VITE_API_URL;
import { toast } from 'sonner';

// Types e Interfaces para uso dos perfis
interface BaseProfile {
  id: string;
  email: string;
  biography: string;
  unidade: string;
  localizacao: string;
  status?: 'online' | 'busy' | 'available'; // <- aqui
}

interface StudentProfile extends BaseProfile {
  type: 'student';
  name: string;
  registration: string; // matrícula
  series: string; // série / ano escolar
}

interface TeacherProfile extends BaseProfile {
  type: 'teacher';
  name: string;
  registration: string; // registro
  formation: string; // departamento
  instituicao?: string;
  materias?: string;
  turmas?: string;
  total_alunos?: number;
  taxa_aprovacao?: number;
}

type UserProfile = StudentProfile | TeacherProfile;

interface Usuario {
  id: string;
  nome: string;
  foto?: string;
  role: string;
  foto_url?: string;
}

// buscar no getUserInfo.ts em controller as informações do usuário logado no arquivo users
interface UserInfo {
  id: number;
  nome: string;
  foto_url: string | null;
}

interface Responsavel {
  id: number; // necessário para atualizar via PUT
  nome: string;
  id_aluno1: number | null;
  id_aluno2: number | null;
  id_aluno3: number | null;
  numero1: string;
  numero2: string;
  endereco: string;
  email: string;
  cpf: string;
  grau_parentesco: string;
}

// Tipos de dados
interface BaseEnvio {
  id: string;
  titulo: string;
  descricao: string;
  dataEnvio: string;
  arquivo?: string;
}

interface Aviso extends BaseEnvio {
  tipo: 'aviso';
}

interface PDF extends BaseEnvio {
  tipo: 'pdf';
}

interface Imagem extends BaseEnvio {
  tipo: 'imagem';
}

interface ExercicioTradicional extends BaseEnvio {
  tipo: 'exercicio-tradicional';
}

interface Questao {
  id: string;
  tipo: 'multipla-escolha' | 'verdadeiro-falso' | 'aberta' | 'numerica';
  pergunta: string;
  opcoes?: string[];
  respostaCorreta?: string | number | boolean;
}

interface ExercicioOnline extends Omit<BaseEnvio, 'arquivo'> {
  tipo: 'exercicio-online';
  tempoLimite: number; // em minutos
  tentativasPermitidas: number;
  mostrarResultadoImediato: boolean;
  embaralharQuestoes: boolean;
  questoes: Questao[];
}

type Envio = Aviso | PDF | Imagem | ExercicioTradicional | ExercicioOnline;

interface Materia {
  nome: string;
  envios: Envio[];
}

function getSafeFileName(filename: string): string | null {
  const regex = /^[a-zA-Z0-9_\-]+\.(pdf|docx|txt|zip|jpg|png|jpeg)$/i;
  return regex.test(filename) ? filename : null;
}

// Componentes auxiliares reutilizáveis

const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-4 border-b ${className}`}>{children}</div>;

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4">{children}</div>
);

// Dialog (modal) simples
const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

const Dialog = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger = ({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  const { setOpen } = ctx;

  return (
    <div onClick={() => setOpen(true)} className="cursor-pointer">
      {children}
    </div>
  );
};

const DialogContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ctx = React.useContext(DialogContext);
  if (!ctx || !ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`relative z-50 bg-white rounded-lg p-6 max-w-lg w-full shadow-lg ${className}`}
      >
        {children}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={() => ctx.setOpen(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 border-b pb-2">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);

// Main Component
const EnviosdeProfessorPage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const currentUser = user;
  const isOwner = String(currentUser?.id) === userData?.id;
  const isGestor = currentUser?.role === 'gestor';
  const canEdit = isOwner || isGestor;

  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);

  const { id } = useParams<{ id: string }>();
  const [showTeacher, setShowTeacher] = useState(false);
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  const handleMouseEnter = () => setSidebarAberta(true);
  const handleMouseLeave = () => setSidebarAberta(false);

  // só exibe a SidebarAluno quando o usuário for aluno
  const showSidebarAluno = role === 'aluno';
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(id);
  const alunoSelecionadoId = localStorage.getItem('alunoSelecionadoId');
  const isPerfilPrincipal =
    String(currentUser?.id) === selectedUserId ||
    alunoSelecionadoId === selectedUserId;
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [editandoResponsaveis, setEditandoResponsaveis] = useState(false);
  const [responsaveisEditados, setResponsaveisEditados] = useState<
    Responsavel[]
  >([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [materiasVisualizadas, setMateriasVisualizadas] = useState<string[]>(
    []
  );
  const [uploading, setUploading] = useState(false);
  const [enviosEnviados, setEnviosEnviados] = useState<string[]>([]);
  const podeVisualizarInfoPrivada =
    isPerfilPrincipal ||
    currentUser?.role === 'gestor' ||
    currentUser?.role === 'professor';
  const [tentativaAtual, setTentativaAtual] = useState<number>(1);
  const [tentativasPorEnvio, setTentativasPorEnvio] = useState<
    Record<string, number>
  >({});
  const [detalhesPorEnvio, setDetalhesPorEnvio] = useState<Record<string, any>>(
    {}
  );
  const [arquivosEnviados, setArquivosEnviados] = useState<
    Record<string, string>
  >({});

  const [detalhesExercicio, setDetalhesExercicio] = useState<{
    titulo: string;
    tentativasPermitidas: number;
    notaMax: number;
    totalQuestoes: number;
  } | null>(null);
  const [aguardandoCorrecao, setAguardandoCorrecao] = useState(false);

  const buscarDetalhesExercicio = async (enviosId: string) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/exercicios/envio/${enviosId}/detalhes`
      );
      setDetalhesExercicio(res.data);

      const tentativaRes = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/exercicios/${enviosId}/aluno/${selectedUserId}/tentativas`
      );
      setTentativaAtual(tentativaRes.data.tentativaAtual);
    } catch (error) {
      console.error(
        'Erro ao buscar detalhes do exercício ou tentativas:',
        error
      );
      toast.error('Não foi possível carregar os dados.');
    }
  };

  const getIcon = (tipo: string) => {
    switch (normalizarTipo(tipo)) {
      case 'aviso':
        return <AlertCircle className="h-5 w-5" />;
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'imagem':
        return <Image className="h-5 w-5" />;
      case 'exercicio-tradicional':
        return <BookOpen className="h-5 w-5" />;
      case 'exercicio-online':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'Aviso':
        return 'Aviso';
      case 'PDF':
        return 'PDF';
      case 'Imagem':
        return 'Imagem';
      case 'Exercício Tradicional':
        return 'Exercício Tradicional';
      case 'Exercício Online':
        return 'Exercício Online';
      default:
        return 'Conteúdo';
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Aviso':
        return 'bg-yellow-100 text-yellow-800';
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Imagem':
        return 'bg-green-100 text-green-800';
      case 'Exercício Tradicional':
        return 'bg-blue-100 text-blue-800';
      case 'Exercício Online':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // States de carregamento e erro
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [dadosAcademicos, setDadosAcademicos] = useState<{
    turma: string;
    professorRegente?: string;
    disciplinas: string[];
  } | null>(null);

  const normalizarTipo = (tipo: string) =>
    tipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-');

  const deveMostrarBadge = (materiaNome: string): boolean => {
    const materia = materias.find((m) => m.nome === materiaNome);
    if (!materia || !Array.isArray(materia.envios)) return false;

    return (
      materia.envios.length > 0 && !materiasVisualizadas.includes(materiaNome)
    );
  };

  const carregarDetalhesETentativas = async (enviosId: string) => {
    try {
      if (detalhesPorEnvio[enviosId]) return;

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/exercicios/envio/${enviosId}/detalhes`
      );
      const tentativaRes = await axios.get(
        `${import.meta.env.VITE_API_URL
        }/api/exercicios/${enviosId}/aluno/${selectedUserId}/tentativas`
      );

      setDetalhesPorEnvio((prev) => ({ ...prev, [enviosId]: res.data }));
      setTentativasPorEnvio((prev) => ({
        ...prev,
        [enviosId]: tentativaRes.data.tentativaAtual,
      }));
    } catch (error) {
      console.error('Erro ao carregar dados do exercício:', error);
    }
  };

  const BotaoExercicioOnline = ({
    envioId,
    selectedUserId,
  }: {
    envioId: string;
    selectedUserId: string;
  }) => {
    const [tentativaAtual, setTentativaAtual] = useState<number>(0);
    const [detalhesExercicio, setDetalhesExercicio] = useState<{
      titulo: string;
      tentativasPermitidas: number;
      notaMax: number;
      totalQuestoes: number;
    } | null>(null);
    const [melhorNota, setMelhorNota] = useState<number | null>(null);
    const [aguardandoCorrecao, setAguardandoCorrecao] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL
            }/api/exercicios/envio/${envioId}/detalhes`
          );
          const tentativaRes = await axios.get(
            `${import.meta.env.VITE_API_URL
            }/api/exercicios/${envioId}/aluno/${selectedUserId}/tentativas`
          );
          const notaRes = await axios.get(
            `${import.meta.env.VITE_API_URL
            }/api/exercicios/${envioId}/aluno/${selectedUserId}/melhor-nota`
          );

          setDetalhesExercicio(res.data);
          setTentativaAtual(tentativaRes.data.tentativaAtual);

          // Verifica se há questões abertas com status de correção 'pendente' ou 'correcao-manual'
          if (notaRes.data.aguardandoCorrecao || notaRes.data.correcaoManual) {
            setAguardandoCorrecao(true);
            setMelhorNota(null);
          } else {
            setAguardandoCorrecao(false);
            setMelhorNota(notaRes.data.melhorNota);
          }
        } catch (error) {
          console.error('Erro ao carregar detalhes/tentativas/notas:', error);
        }
      };

      fetchData();
    }, [envioId, selectedUserId]);

    if (!detalhesExercicio) return null;

    return (
      <>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mb-2">
              Visualizar Atividade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Exercício</DialogTitle>
            </DialogHeader>
            <div className="text-sm space-y-2">
              <p>
                <strong>Título:</strong> {detalhesExercicio.titulo}
              </p>
              <p>
                <strong>Tentativas Permitidas:</strong>{' '}
                {detalhesExercicio.tentativasPermitidas}
              </p>
              <p>
                <strong>Nota Máxima:</strong> {detalhesExercicio.notaMax}
              </p>
              <p>
                <strong>Total de Questões:</strong>{' '}
                {detalhesExercicio.totalQuestoes}
              </p>
              <p>
                <strong>Você está na {tentativaAtual}ª tentativa</strong>
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {tentativaAtual <= detalhesExercicio.tentativasPermitidas ? (
          <Link to={`/aluno/${selectedUserId}/exercicioonline/${envioId}`}>
            <Button variant="outline" size="sm" className="w-full">
              Iniciar Atividade
            </Button>
          </Link>
        ) : (
          <p className="text-sm text-red-600 text-center font-medium mt-2">
            Limite de tentativas atingido.
          </p>
        )}

        {aguardandoCorrecao ? (
          <p className="mt-[10px] text-sm text-yellow-600 text-center mb-2">
            Aguardando correção do professor
          </p>
        ) : (
          <p className="mt-[10px] text-sm text-gray-700 text-center mb-2">
            Melhor nota obtida:{' '}
            <strong>
              {melhorNota} / {detalhesExercicio.notaMax}
            </strong>
          </p>
        )}
      </>
    );
  };

  useEffect(() => {
    if (id) {
      setSelectedUserId(id);
    }
  }, [id]);

  useEffect(() => {
    setUserData(null);
    setError(null);
  }, [selectedUserId]);

  useEffect(() => {
    if (materias.length > 0) {
      setSelectedMateria(materias[0].nome);
    }
  }, [materias]);

  useEffect(() => {
    const salvas = localStorage.getItem('materiasVisualizadas');
    if (salvas) {
      setMateriasVisualizadas(JSON.parse(salvas));
    }
  }, []);

  useEffect(() => {
    const buscarUsuarios = async () => {
      try {
        const response = await axios.get('/api/usuarios'); // Ajuste a rota se necessário
        const todosUsuarios: Usuario[] = response.data;

        const filtrados = todosUsuarios.filter(
          (u) =>
            (u.role === 'professor' || u.role === 'aluno') &&
            String(u.id) !== selectedUserId
        );

        setUsuarios(filtrados);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    buscarUsuarios();
  }, [selectedUserId]);

  // Fetch dos dados do perfil (dados básicos)
  useEffect(() => {
    if (!selectedUserId) return;
    setIsLoading(true);

    fetch(`/api/users/${selectedUserId}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error('Usuário não encontrado');
        return res.json();
      })
      .then((data: UserProfile) => {
        setUserData(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [selectedUserId]);

  // Fetch de informações adicionais (foto, nome abreviado) via axios
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (!selectedUserId) return;
        const response = await axios.get(`/api/userinfo/${selectedUserId}`
        );
        setUserInfo(response.data);
      } catch (error) {
        console.error('Erro ao buscar informações do usuário:', error);
      }
    };
    fetchUserInfo();
  }, [selectedUserId]);

  useEffect(() => {
    if (
      !selectedUserId ||
      !['gestor', 'professor'].includes(currentUser?.role || '')
    )
      return;

    axios
      .get(
        `/api/alunos/${selectedUserId}/responsaveis`
      )
      .then((res) => {
        setResponsaveis(res.data);
        setResponsaveisEditados(res.data); // <- mantém uma cópia editável dos dados
      })
      .catch((err) => console.error('Erro ao buscar responsáveis:', err));
  }, [selectedUserId, currentUser?.role]);

  useEffect(() => {
    const buscarDadosAcademicos = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL
          }/api/alunos/${selectedUserId}/dados-academicos`
        );
        if (!res.ok) throw new Error('Erro ao carregar dados acadêmicos');
        const dados = await res.json();
        setDadosAcademicos(dados);
      } catch (error) {
        console.error(error);
      }
    };

    if (selectedUserId) {
      buscarDadosAcademicos();
    }
  }, [selectedUserId]);

  useEffect(() => {
    const carregarMateriasComEnvios = async () => {
      if (!selectedUserId) return;

      try {
        // 1. Buscar disciplinas do aluno
        const resDisciplinas = await fetch(
          `${import.meta.env.VITE_API_URL
          }/api/alunos/${selectedUserId}/dados-academicos`
        );
        if (!resDisciplinas.ok) throw new Error('Erro ao buscar disciplinas');
        const dadosAcademicos = await resDisciplinas.json();

        setDadosAcademicos(dadosAcademicos);

        const todasDisciplinas = dadosAcademicos.disciplinas.map(
          (disc: string) => disc.trim()
        );

        // 2. Buscar envios reais
        const resEnvios = await fetch(
          `/api/alunos/${selectedUserId}/envios`
        );
        if (!resEnvios.ok) throw new Error('Erro ao buscar envios');
        const materiasComEnvios: Materia[] = await resEnvios.json();

        // 3. Mapear por nome para facilitar acesso rápido
        const mapaEnvios = new Map<string, Envio[]>();
        materiasComEnvios.forEach((materia) =>
          mapaEnvios.set(materia.nome.trim(), materia.envios)
        );

        // 4. Montar lista final com TODAS as disciplinas
        const materiasCompletas: Materia[] = todasDisciplinas.map(
          (nome: string) => ({
            nome,
            envios: mapaEnvios.get(nome) || [],
          })
        );

        const identificarEnviosComArquivos = async (materias: Materia[]) => {
        try {
          const envioIds: string[] = [];

          for (const materia of materias ?? []) {
            for (const envio of materia.envios ?? []) {
              if (normalizarTipo(envio.tipo) === 'exercicio-tradicional') {
                const url = `/api/envios/${encodeURIComponent(
                  String(envio.id)
                )}/aluno/${encodeURIComponent(String(selectedUserId))}/ultimo-arquivo`;

                const res = await axios.get(url, { withCredentials: true });

                if (res.data?.arquivo) {
                  envioIds.push(String(envio.id));
                  setArquivosEnviados(prev => ({
                    ...prev,
                    [envio.id]: res.data.arquivo,
                  }));
                }
              }
            }
          }


            setEnviosEnviados(envioIds);
          } catch (error) {
            console.error('Erro ao identificar envios com arquivos:', error);
          }
        };

        // 5. Ordenar por nome
        materiasCompletas.sort((a, b) => a.nome.localeCompare(b.nome));
        setMaterias(materiasCompletas);
        identificarEnviosComArquivos(materiasCompletas);
      } catch (error) {
        console.error('Erro ao montar matérias:', error);
      }
    };

    carregarMateriasComEnvios();
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;

    const buscarArquivos = async () => {
      try {
        const promises = enviosEnviados.map(async (envioId) => {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL
            }/api/envios/${envioId}/aluno/${selectedUserId}/ultimo-arquivo`
          );
          return { envioId, arquivo: res.data.arquivo };
        });

        const arquivos = await Promise.all(promises);
        const mapeado = Object.fromEntries(
          arquivos.map(({ envioId, arquivo }) => [envioId, arquivo])
        );
        setArquivosEnviados(mapeado);
      } catch (error) {
        console.error('Erro ao buscar arquivos enviados:', error);
      }
    };

    if (enviosEnviados.length > 0) {
      buscarArquivos();
    }
  }, [enviosEnviados, selectedUserId]);

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton height={30} width={`50%`} />
        <Skeleton count={8} className="mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">Erro: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 text-center text-gray-600">
        Usuário não encontrado.
      </div>
    );
  }

  return (
    <div
      className={`dashboard-container flex min-h-screen w-full overflow-x-hidden ${showSidebar ? 'pl-15' : 'pl-0'
        }`}
    >
      {showSidebar && (
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}

      {/* Sidebar para aluno */}
      {showSidebarAluno && (
        <SidebarAluno
          isMenuOpen={sidebarAberta}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}
      {/* Conteúdo principal com Topbar */}
      <div className={`flex-1 mt-[60px]`}>
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
        />

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Envios do Professor
              </h1>
              <p className="text-gray-600">
                Visualize os conteúdos disponibilizados por matéria
              </p>
            </div>

            <Tabs
              value={selectedMateria}
              onValueChange={(novaMateria: string) => {
                setSelectedMateria(novaMateria);

                // Marcar como visualizada
                if (!materiasVisualizadas.includes(novaMateria)) {
                  const atualizadas = [...materiasVisualizadas, novaMateria];
                  setMateriasVisualizadas(atualizadas);
                  localStorage.setItem(
                    'materiasVisualizadas',
                    JSON.stringify(atualizadas)
                  );
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-10 relative z-10">
                {materias.map((materia) => (
                  <TabsTrigger
                    key={materia.nome}
                    value={materia.nome}
                    className="flex justify-center items-center gap-2"
                  >
                    {materia.nome}
                    {deveMostrarBadge(materia.nome) && (
                      <Badge className="text-xs bg-green-100 text-green-700 border border-green-300">
                        📎
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {materias.map((materia) => (
                <div key={materia.nome} className="mt-15">
                  <TabsContent value={materia.nome} className="space-y-4 pt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {materia.envios.map((envio) => (
                        <Card
                          key={envio.id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getIcon(envio.tipo)}
                                <Badge className={getTypeColor(envio.tipo)}>
                                  {getTypeLabel(envio.tipo)}
                                </Badge>
                                {/* ✔️ Mostra símbolo se foi enviado */}
                                {normalizarTipo(envio.tipo) ===
                                  'exercicio-tradicional' &&
                                  enviosEnviados.includes(String(envio.id)) && (
                                    <span
                                      title="Atividade enviada"
                                      className="text-green-600 text-sm ml-1"
                                    >
                                      ✅ Enviado
                                    </span>
                                  )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(envio.dataEnvio)}
                              </span>
                            </div>
                            <CardTitle>{envio.titulo}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm mb-4">
                              {envio.descricao}
                            </p>

                            {normalizarTipo(envio.tipo) ===
                              'exercicio-online' &&
                              podeVisualizarInfoPrivada &&
                              userData.type === 'student' && (
                                <div className="mt-4">
                                  <BotaoExercicioOnline
                                    envioId={String(envio.id)}
                                    selectedUserId={String(selectedUserId)}
                                  />
                                </div>
                              )}

                            {normalizarTipo(envio.tipo) !==
                              'exercicio-online' &&
                              'arquivo' in envio &&
                              envio.arquivo && (
                                <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                  <FileText className="h-4 w-4" />
                                  <span>Arquivo para Visualizar</span>
                                </div>
                              )}

                            {(('arquivo' in envio && envio.arquivo?.trim()) ||
                              (normalizarTipo(envio.tipo) ===
                                'exercicio-tradicional' &&
                                isPerfilPrincipal)) && (
                                <>
                                  <div className="flex justify-center gap-2 mt-4">
                                    {(() => {
                                      const seguro =
                                        'arquivo' in envio
                                          ? getSafeFileName(envio.arquivo || '')
                                          : null;

                                      return seguro ? (
                                        <a
                                          href={`${import.meta.env.VITE_API_URL
                                            }/uploads/envios_professor/${seguro}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          download
                                        >
                                          <Button variant="outline" size="sm">
                                            Baixar
                                          </Button>
                                        </a>
                                      ) : null;
                                    })()}

                                    {normalizarTipo(envio.tipo) ===
                                      'exercicio-tradicional' &&
                                      isPerfilPrincipal && (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                              Enviar Atividade
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>
                                                Anexar arquivo
                                              </DialogTitle>
                                            </DialogHeader>
                                            <form
                                              onSubmit={async (e) => {
                                                e.preventDefault();
                                                const form =
                                                  e.target as HTMLFormElement;
                                                const fileInput =
                                                  form.elements.namedItem(
                                                    'arquivo'
                                                  ) as HTMLInputElement;
                                                const file = fileInput.files?.[0];
                                                if (!file || !selectedUserId)
                                                  return;

                                                const formData = new FormData();
                                                formData.append('arquivo', file);

                                                try {
                                                  setUploading(true);

                                                  await axios.post(
                                                    `${import.meta.env.VITE_API_URL
                                                    }/api/envios/${envio.id
                                                    }/aluno/${selectedUserId}/enviar`,
                                                    formData,
                                                    {
                                                      headers: {
                                                        'Content-Type':
                                                          'multipart/form-data',
                                                      },
                                                    }
                                                  );

                                                  toast.success(
                                                    'Arquivo enviado com sucesso!'
                                                  );
                                                  const resposta =
                                                    await axios.get(
                                                      `${import.meta.env
                                                        .VITE_API_URL
                                                      }/api/envios/${envio.id
                                                      }/aluno/${selectedUserId}/ultimo-arquivo`
                                                    );

                                                  if (resposta.data.arquivo) {
                                                    setArquivosEnviados(
                                                      (prev) => ({
                                                        ...prev,
                                                        [envio.id]:
                                                          resposta.data.arquivo,
                                                      })
                                                    );
                                                  }

                                                  setEnviosEnviados((prev) => {
                                                    const envioIdStr = String(
                                                      envio.id
                                                    );
                                                    return prev.includes(
                                                      envioIdStr
                                                    )
                                                      ? prev
                                                      : [...prev, envioIdStr];
                                                  });
                                                } catch (error) {
                                                  console.error(
                                                    'Erro ao enviar exercício:',
                                                    error
                                                  );
                                                  toast.error(
                                                    'Erro ao enviar arquivo.'
                                                  );
                                                } finally {
                                                  setUploading(false);
                                                }
                                              }}
                                              className="space-y-4"
                                            >
                                              <input
                                                type="file"
                                                name="arquivo"
                                                accept=".pdf, .jpg, .jpeg, .png"
                                                required
                                                className="block w-full border rounded p-2 text-sm"
                                              />
                                              <Button
                                                type="submit"
                                                disabled={uploading}
                                                className="w-full"
                                              >
                                                {uploading
                                                  ? 'Enviando...'
                                                  : 'Enviar'}
                                              </Button>
                                            </form>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                  </div>
                                  {(() => {
                                    const nomeArquivo =
                                      arquivosEnviados[envio.id];
                                    const seguro = getSafeFileName(
                                      nomeArquivo || ''
                                    );

                                    return seguro ? (
                                      <div className="flex justify-center mt-2">
                                        <a
                                          href={`${import.meta.env.VITE_API_URL
                                            }/uploads/envios_professor/${seguro}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          download
                                        >
                                          <Button variant="outline" size="sm">
                                            📥 Baixar arquivo enviado
                                          </Button>
                                        </a>
                                      </div>
                                    ) : null;
                                  })()}
                                </>
                              )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {materia.envios.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Nenhum conteúdo disponível para esta matéria
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnviosdeProfessorPage;
