import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Star, GraduationCap, Book, Users } from 'lucide-react';
import SidebarGestor from '../gestor/components/Sidebar';
import SidebarAluno from '../aluno/components/sidebaraluno';
import { useAuth } from '../../hooks/useAuth';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import axios from 'axios';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { VscRobot } from 'react-icons/vsc';
import ModalVincularResponsavel from './components/ModalVincularResponsavel';
import { toast } from 'sonner';

// --- INTERFACES UNIFICADAS ---

interface AlunoDashboardData {
  id: string;
  type: 'aluno';
  name: string;
  email: string;
  registration: string;
  series: string;
  turma: string;
  biography: string;
  foto_url: string;
  data_nascimento: string;
  genero: string;
  cpf: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  saude: {
    tem_alergia: boolean;
    alergias_descricao: string;
    usa_medicacao: boolean;
    medicacao_descricao: string;
    plano_saude: string;
    numero_carteirinha: string;
    contato_emergencia: {
      nome: string;
      telefone: string;
    };
  };
  responsaveis: Array<{
    id: number;
    nome: string;
    email: string;
    telefone: string;
    parentesco: string;
    vinculoId: number;
  }>;
}

interface FuncionarioDashboardData {
  id: string;
  type: 'professor' | 'gestor' | 'secretaria';
  name: string;
  email: string;
  foto_url: string;
  biography: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  registration: string;
  departamento: string;
  data_contratacao: string;
  formacao_academica: string;
  especialidades: string;
}

type PerfilDashboardData = AlunoDashboardData | FuncionarioDashboardData;

// --- FUNÇÕES AUXILIARES ---

function getSafeImagePath(path: string | null): string | null {
  if (!path) return null;
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

// --- COMPONENTE PRINCIPAL ---

const VisualizarUsuarioPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // --- ESTADOS PRINCIPAIS ---
  const [dashboardData, setDashboardData] = useState<PerfilDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADOS DE UI (INTERFACE DO USUÁRIO) ---
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isModalVincularAberto, setIsModalVincularAberto] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  // --- LÓGICA DE BUSCA DE DADOS ---
  const fetchDashboardData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await axios.get<PerfilDashboardData>(`/api/usuarios/${id}/perfil`);
      setDashboardData(response.data);
      setBioDraft(response.data.biography || ''); // Inicializa o rascunho da bio
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar dados do perfil:", err);
      setError(err.response?.data?.message || "Falha ao carregar dados do usuário.");
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [id]);

  // --- FUNÇÕES DE AÇÃO ---
  const handleDesvincular = async (vinculoId: number) => {
    if (window.confirm("Tem certeza que deseja desvincular este responsável?")) {
      try {
        await axios.delete(`/api/alunos-responsaveis/${vinculoId}`);
        toast.success("Responsável desvinculado com sucesso.");
        fetchDashboardData(); // Atualiza toda a página
      } catch (error) {
        toast.error("Falha ao desvincular responsável.");
      }
    }
  };

  const handleSaveBio = async () => {
    try {
      await axios.patch(`/api/users/${id}/biography`, { biography: bioDraft });
      setDashboardData(prev => prev ? { ...prev, biography: bioDraft } : null);
      setIsEditingBio(false);
      toast.success("Biografia atualizada com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar biografia.");
    }
  };

  // --- VARIÁVEIS DE CONTROLE DE UI ---
  const isGestor = currentUser?.role === 'gestor';
  const isPerfilPrincipal = String(currentUser?.id) === id;
  const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
  const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');
  const showSidebarAluno = currentUser?.role === 'aluno';

  // --- RENDERIZAÇÃO DE LOADING, ERRO E DADOS NÃO ENCONTRADOS ---
  if (isLoading) {
    return <div className="p-8"><Skeleton count={10} /></div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!dashboardData) {
    return <div className="p-8 text-center text-gray-600">Usuário não encontrado.</div>;
  }

  // --- JSX PRINCIPAL ---
  return (
    <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden pl-4 ${showSidebar || showSidebarAluno ? 'md:pl-15' : 'md:pl-0'}`}>
      {showSidebar && <SidebarGestor isMenuOpen={sidebarAberta} setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })} handleMouseEnter={() => setSidebarAberta(true)} handleMouseLeave={() => setSidebarAberta(false)} />}
      {showSidebarAluno && <SidebarAluno isMenuOpen={sidebarAberta} handleMouseEnter={() => setSidebarAberta(true)} handleMouseLeave={() => setSidebarAberta(false)} setActivePage={(page) => navigate(`/aluno/${page}`)} />}

      <div className="flex-1 px-4 py-6 pt-16 md:pt-20">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="w-full px-4 py-6">
          {/* Seção de Banner e Avatar */}
          <div className="relative w-full h-64 md:h-80 lg:h-96">
            <img src="/couto.png" alt="Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-4">
              <div className="relative group w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white overflow-hidden">
                {getSafeImagePath(dashboardData.foto_url) ? (
                  <img src={`/${getSafeImagePath(dashboardData.foto_url)}`} alt={dashboardData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{dashboardData.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{dashboardData.name}</h1>
              </div>
              {dashboardData.type === 'aluno' && podeVisualizarInfoPrivada && (
                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                  <Link to={`/aluno/${id}/enviosdeprofessores`} className="btn-action bg-orange-500 hover:bg-orange-600"><FaRegPenToSquare className="w-4 h-4 mr-2" /><span>Envios</span></Link>
                  <Link to={`/gestor/alunos/${id}/boletim`} className="btn-action bg-purple-500 hover:bg-purple-600"><Star className="w-4 h-4 mr-2" /><span>Ver Notas</span></Link>
                </div>
              )}
            </div>
          </div>

          {/* Corpo do Perfil */}
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Card: Informações Gerais */}
                <div className="card-style">
                  <h2 className="card-title">Informações Gerais</h2>
                  <div className="space-y-3">
                    <InfoRow label="Nome Completo" value={dashboardData.name} />
                    {podeVisualizarInfoPrivada && <InfoRow label="Email" value={dashboardData.email} />}
                    {podeVisualizarInfoPrivada && <InfoRow label="CPF" value={dashboardData.cpf} />}
                    {podeVisualizarInfoPrivada && <InfoRow label="Data de Nascimento" value={new Date(dashboardData.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />}
                  </div>
                </div>

                {/* Card: Biografia */}
                <div className="card-style">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Biografia</h2>
                    {isGestor && !isEditingBio && <button onClick={() => setIsEditingBio(true)} className="text-blue-600 text-sm font-medium">✏️ Editar</button>}
                  </div>
                  {isEditingBio ? (
                    <>
                      <textarea className="w-full border border-gray-300 rounded p-2 my-2" rows={4} value={bioDraft} onChange={(e) => setBioDraft(e.target.value)} />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditingBio(false)} className="btn-secondary">Cancelar</button>
                        <button onClick={handleSaveBio} className="btn-primary">Salvar</button>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700 text-sm mt-2">{dashboardData.biography || 'Nenhuma biografia informada.'}</p>
                  )}
                </div>

                {/* Cards Específicos para ALUNOS */}
                {dashboardData.type === 'aluno' && (
                  <>
                    <div className="card-style">
                      <h2 className="card-title">Dados Acadêmicos</h2>
                      <div className="space-y-3">
                        <InfoRow label="Matrícula" value={dashboardData.registration} />
                        <InfoRow label="Série" value={dashboardData.series} />
                        <InfoRow label="Turma" value={dashboardData.turma} />
                      </div>
                    </div>
                    {podeVisualizarInfoPrivada && <CardEndereco endereco={dashboardData.endereco} />}
                    {podeVisualizarInfoPrivada && <CardSaude saude={dashboardData.saude} />}
                  </>
                )}

                {/* Cards Específicos para FUNCIONÁRIOS */}
                {dashboardData.type !== 'aluno' && (
                  <>
                    <div className="card-style">
                      <h2 className="card-title">Dados Profissionais</h2>
                      <div className="space-y-3">
                        <InfoRow label="Cargo" value={dashboardData.type.charAt(0).toUpperCase() + dashboardData.type.slice(1)} />
                        <InfoRow label="Departamento" value={(dashboardData as FuncionarioDashboardData).departamento} />
                        <InfoRow label="Data de Contratação" value={new Date((dashboardData as FuncionarioDashboardData).data_contratacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} />
                        <InfoRow label="Formação" value={(dashboardData as FuncionarioDashboardData).formacao_academica || 'Não informada'} />
                        <InfoRow label="Especialidades" value={(dashboardData as FuncionarioDashboardData).especialidades || 'Não informada'} />
                      </div>
                    </div>
                    {podeVisualizarInfoPrivada && <CardEndereco endereco={dashboardData.endereco} />}
                  </>
                )}
              </div>

              {/* Coluna Direita */}
              <div className="space-y-6">
                {dashboardData.type === 'aluno' && podeVisualizarInfoPrivada && (
                  <div className="card-style">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="card-title">Responsáveis</h2>
                      {isGestor && <button onClick={() => setIsModalVincularAberto(true)} className="btn-primary text-sm">+ Vincular</button>}
                    </div>
                    {dashboardData.responsaveis.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.responsaveis.map((resp) => (
                          <div key={resp.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{resp.nome}</p>
                              <p className="text-sm text-gray-600"><strong>Parentesco:</strong> {resp.parentesco}</p>
                              <p className="text-sm text-gray-600"><strong>Email:</strong> {resp.email}</p>
                              <p className="text-sm text-gray-600"><strong>Telefone:</strong> {resp.telefone}</p>
                            </div>
                            {isGestor && <button onClick={() => handleDesvincular(resp.vinculoId)} className="text-red-500 hover:text-red-700 text-xs font-medium p-1" title="Desvincular">Desvincular</button>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Nenhum responsável vinculado.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {dashboardData.type === 'aluno' && isPerfilPrincipal && (
          <div onClick={() => navigate('/aluno/ia')} className="fixed bottom-5 right-6 bg-orange-700 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200 z-50" title="Assistente Virtual">
            <VscRobot size={32} />
          </div>
        )}

        {isModalVincularAberto && (
          <ModalVincularResponsavel alunoId={id!} onClose={() => setIsModalVincularAberto(false)} onSuccess={() => { fetchDashboardData(); setIsModalVincularAberto(false); }} />
        )}
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex flex-col md:flex-row text-sm">
    <span className="text-gray-500 md:w-1/3 font-semibold">{label}:</span>
    <span className="text-gray-800 md:w-2/3">{value || 'Não informado'}</span>
  </div>
);

const CardEndereco = ({ endereco }: { endereco: AlunoDashboardData['endereco'] | FuncionarioDashboardData['endereco'] }) => (
  <div className="card-style">
    <h2 className="card-title">📍 Endereço</h2>
    <div className="space-y-2 text-sm">
      <p><span className="font-semibold">Logradouro:</span> {endereco.logradouro}, {endereco.numero}</p>
      {endereco.complemento && <p><span className="font-semibold">Complemento:</span> {endereco.complemento}</p>}
      <p><span className="font-semibold">Bairro:</span> {endereco.bairro}</p>
      <p><span className="font-semibold">Cidade/UF:</span> {endereco.cidade} - {endereco.uf}</p>
      <p><span className="font-semibold">CEP:</span> {endereco.cep}</p>
    </div>
  </div>
);

const CardSaude = ({ saude }: { saude: AlunoDashboardData['saude'] }) => (
  <div className="card-style">
    <h2 className="card-title">❤️ Saúde e Bem-Estar</h2>
    <div className="space-y-3 text-sm">
      <InfoRow label="Alergias" value={saude.tem_alergia ? saude.alergias_descricao : "Nenhuma alergia registrada."} />
      <InfoRow label="Uso de Medicação Contínua" value={saude.usa_medicacao ? saude.medicacao_descricao : "Nenhum medicamento registrado."} />
      {saude.plano_saude && <InfoRow label="Plano de Saúde" value={`${saude.plano_saude} (Nº: ${saude.numero_carteirinha || 'Não informado'})`} />}
      {saude.contato_emergencia?.nome && (
        <div className="mt-4 pt-3 border-t">
          <p className="font-semibold text-red-600">Contato de Emergência:</p>
          <p className="text-gray-800">{saude.contato_emergencia.nome} - {saude.contato_emergencia.telefone}</p>
        </div>
      )}
    </div>
  </div>
);

export default VisualizarUsuarioPage;