
// src/pages/VisualizarProfessorPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, FileText, Briefcase, Download, Loader2, RefreshCw, Mail, Phone, MapPin, Calendar, Lock, UserCheck } from 'lucide-react';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import SidebarGestor from "./components/Sidebar";

// --- Interfaces Adaptadas para Funcionário ---
interface FuncionarioDetalhes {
  id: number;
  nome: string;
  cpf: string;
  login: string;
  email: string;
  foto: string | null;
  biografia: string | null;
  telefone: string | null;
  endereco: { logradouro: string; numero: string; bairro: string; cidade: string; uf: string; cep: string; } | null;
  data_nascimento: string;
  genero: string;
  status: string;
  cargo: string | null;
  departamento: string | null;
  role: string;
  data_admissao: string;
}

interface Documento {
  id: number;
  tipo_documento: string;
  caminho_arquivo: string;
  nome_original: string;
  data_upload: string;
}

interface Contrato {
  id: number;
  nome_contrato: string;
  tipo: string;
  situacao_contrato: string;
  contrato_url: string | null;
  criado_em: string;
}

interface FuncionarioCompleto {
  funcionario: FuncionarioDetalhes;
  documentos: Documento[];
  contratos: Contrato[];
}

// --- DADOS MOCKADOS ---
const mockFuncionarioCompleto: FuncionarioCompleto = {
  funcionario: {
    id: 6,
    nome: "Dr. Carlos Andrade",
    cpf: "123.456.789-00",
    login: "carlos.andrade",
    email: "carlos.andrade@faculdade.edu.br",
    foto: null, // ou um link para uma imagem de placeholder
    biografia: "Doutor em Ciência da Computação pela Universidade de São Paulo (USP), com mais de 15 anos de experiência em ensino e pesquisa. Especialista em Inteligência Artificial e Desenvolvimento de Software.",
    telefone: "(11) 98765-4321",
    endereco: {
      logradouro: "Avenida Paulista",
      numero: "1500",
      bairro: "Bela Vista",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01310-200",
    },
    data_nascimento: "1980-05-20T00:00:00.000Z",
    genero: "Masculino",
    status: "Ativo",
    cargo: "Professor Titular",
    departamento: "Ciência da Computação",
    role: "Professor",
    data_admissao: "2010-02-15T00:00:00.000Z",
  },
  documentos: [
    {
      id: 1,
      tipo_documento: "Diploma de Doutorado",
      caminho_arquivo: "#",
      nome_original: "diploma_doutorado_carlos.pdf",
      data_upload: "2010-02-10T00:00:00.000Z",
    },
    {
      id: 2,
      tipo_documento: "Documento de Identidade (RG)",
      caminho_arquivo: "#",
      nome_original: "rg_carlos_andrade.pdf",
      data_upload: "2010-02-10T00:00:00.000Z",
    },
  ],
  contratos: [
    {
      id: 1,
      nome_contrato: "Contrato de Trabalho - CLT",
      tipo: "Tempo Integral",
      situacao_contrato: "Ativo",
      contrato_url: "#",
      criado_em: "2010-02-15T00:00:00.000Z",
    },
  ],
};

const VisualizarProfessorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [funcionarioCompleto, setFuncionarioCompleto] = useState<FuncionarioCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'geral' | 'documentos' | 'contratos'
  >('geral');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchFuncionarioData = async () => {
    if (!id) return;
    setIsLoading(true);

    // Simulação de chamada API com mock
    console.log(`Buscando dados mockados para o funcionário com ID: ${id}`);
    setTimeout(() => {
      setFuncionarioCompleto(mockFuncionarioCompleto);
      setIsLoading(false);
      toast.info("Dados mockados carregados para visualização.");
    }, 1000); // Simula um delay de 1 segundo
  };

  useEffect(() => {
    fetchFuncionarioData();
  }, [id]);

  const handleUpdateDocument = async (documentoId: number, file: File) => {
    if (!file) {
      toast.info("Nenhum arquivo selecionado.");
      return;
    }
    toast.info(`(Mock) Atualizando documento ${documentoId} com o arquivo ${file.name}.`);
    // Em um cenário real, aqui iria a lógica de upload
  };

  const triggerFileInput = (documentoId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleUpdateDocument(documentoId, target.files[0]);
      }
    };
    input.click();
  };

  const renderEndereco = (endereco: FuncionarioDetalhes['endereco']) => {
    if (!endereco) return "Não informado";
    return `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}, CEP: ${endereco.cep}`;
  };

  const TabButton = ({ tabName, label, icon: Icon }: { tabName: typeof activeTab, label: string, icon: React.ElementType }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${activeTab === tabName
        ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}>
      <Icon size={18} />
      {label}
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!funcionarioCompleto) {
    return (
      <div className="text-center mt-10 p-4">
        <p className="text-red-500">Dados do funcionário não encontrados.</p>
      </div>
    );
  }

  const { funcionario, documentos, contratos } = funcionarioCompleto;

  return (
    <div className="min-h-screen bg-gray-100 w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row w-full min-w-0 md:flex">
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })}
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopbarGestorAuto
            isMenuOpen={sidebarAberta}
            setIsMenuOpen={setSidebarAberta}
          />
          <main className={`flex-1 transition-all duration-500 pt-20 ${isMenuOpen ? 'sm:ml-[220px]' : 'sm:ml-[60px]'}`}>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                {/* --- Cabeçalho do Funcionário --- */}
                <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                  <img
                    src={funcionario.foto ? `${import.meta.env.VITE_API_URL}${funcionario.foto}` : `https://ui-avatars.com/api/?name=${funcionario.nome.replace(' ', '+')}&background=e0e7ff&color=4f46e5`}
                    alt={`Foto de ${funcionario.nome}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{funcionario.nome}</h1>
                    <p className="text-md text-gray-500">Cargo: {funcionario.cargo || "Não informado"}</p>
                    <p className="text-md text-indigo-600 font-semibold">Departamento: {funcionario.departamento || "Não vinculado"}</p>
                  </div>
                </div>

                {/* --- Abas de Navegação --- */}
                <div className="border-b border-gray-200 px-6">
                  <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tabName="geral" label="Dados Gerais" icon={User} />
                    <TabButton tabName="documentos" label="Documentos" icon={FileText} />
                    <TabButton tabName="contratos" label="Contratos" icon={Briefcase} />
                  </nav>
                </div>

                {/* --- Conteúdo das Abas --- */}
                <div className="p-6">
                  {activeTab === 'geral' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Informações Pessoais e Funcionais</h3>
                        <p className="flex items-center gap-2"><Lock size={16} className="text-gray-500" /><strong>Login:</strong> {funcionario.login}</p>
                        <p className="flex items-center gap-2"><UserCheck size={16} className="text-gray-500" /><strong>Nível de Acesso (Role):</strong> {funcionario.role}</p>
                        <p className="flex items-center gap-2"><Calendar size={16} className="text-gray-500" /><strong>Data de Admissão:</strong> {new Date(funcionario.data_admissao).toLocaleDateString('pt-BR')}</p>
                        <p className="flex items-center gap-2"><Mail size={16} className="text-gray-500" /><strong>Email:</strong> {funcionario.email}</p>
                        <p className="flex items-center gap-2"><Phone size={16} className="text-gray-500" /><strong>Telefone:</strong> {funcionario.telefone || "Não informado"}</p>
                        <p><strong>CPF:</strong> {funcionario.cpf}</p>
                        <p><strong>Data de Nascimento:</strong> {new Date(funcionario.data_nascimento).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Gênero:</strong> {funcionario.genero}</p>
                        <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${funcionario.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{funcionario.status}</span></p>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Endereço e Biografia</h3>
                        <p className="flex items-start gap-2"><MapPin size={16} className="text-gray-500 mt-1" /><strong>Endereço:</strong> {renderEndereco(funcionario.endereco)}</p>
                        <p><strong>Biografia/Notas:</strong> {funcionario.biografia || "Não informado"}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documentos' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Documentos do Funcionário</h3>
                      {documentos.length === 0 ? (
                        <p className="text-gray-500">Nenhum documento cadastrado.</p>
                      ) : (
                        <div className="space-y-3">
                          {documentos.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-center gap-3">
                                <FileText size={20} className="text-indigo-500" />
                                <div>
                                  <p className="font-medium">{doc.tipo_documento}</p>
                                  <p className="text-xs text-gray-500">{doc.nome_original} - Upload: {new Date(doc.data_upload).toLocaleDateString('pt-BR')}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a href={doc.caminho_arquivo} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors"><Download size={20} /></a>
                                <button onClick={() => triggerFileInput(doc.id)} className="text-gray-600 hover:text-gray-800 transition-colors"><RefreshCw size={20} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'contratos' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Contratos de Trabalho</h3>
                      {contratos.length === 0 ? (
                        <p className="text-gray-500">Nenhum contrato cadastrado.</p>
                      ) : (
                        <div className="space-y-3">
                          {contratos.map((contrato) => (
                            <div key={contrato.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                              <div className="flex items-center gap-3">
                                <Briefcase size={20} className="text-green-500" />
                                <div>
                                  <p className="font-medium">{contrato.nome_contrato} ({contrato.tipo})</p>
                                  <p className="text-xs text-gray-500">Situação: {contrato.situacao_contrato} - Criado em: {new Date(contrato.criado_em).toLocaleDateString('pt-BR')}</p>
                                </div>
                              </div>
                              {contrato.contrato_url && (
                                <a href={contrato.contrato_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors"><Download size={20} /></a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default VisualizarProfessorPage;
