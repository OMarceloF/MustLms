// frontend/src/pages/Gestor.tsx

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HomeGestor from './gestor/HomeGestor';
import ProfessoresPage from './gestor/ProfessoresPage';
import AlunosPage from './gestor/AlunosPage';
import RelatoriosPage from './gestor/RelatoriosPage';
import PlanoPage from './gestor/PlanoPage';
import CalendarioPage from './gestor/CalendarioPage';
import FinanceiroPage from './gestor/FinanceiroPage';
import HelpModal from '../components/AjudaModal';
import TurmasPage from './gestor/TurmasPage';
import HorariosPage from './gestor/HorariosPage';
import GestaoEscolarPage from './gestor/GestaoEscolarPage';
import SidebarGestor from './gestor/components/Sidebar';
import TopbarGestorAuto from './gestor/components/TopbarGestorAuto';
import SocialMediaPage from './gestor/SocialMediaPage';
import { VscRobot } from 'react-icons/vsc';
import IaPage from './gestor/IaPage';
import EventosPageMenu from './gestor/EventosPageMenu';
import FeedsPageMenu from './gestor/FeedsPageMenu';
import ComunidadesPageMenu from './gestor/ComunidadesPageMenu';
import NoticiasPageMenu from './gestor/NoticiasPageMenu';
import PostPageMenu from './gestor/PostPageMenu';
import FeedPrincipalMenuPage from './gestor/FeedPrincipalMenuPage';
import RelatorioProfessorPage from "./gestor/RelatorioProfessorPage";
import RelatorioAlunoPage from "./gestor/RelatorioAlunoPage";
import Gamification from './gestor/Gamification';
import MeetPage from './gestor/MeetPage';
import ConfiguracoesPage from './gestor/configuracoes/configuracoes-page';
import CursosPage from '../pages/gestor/Cursos';
import ChatBox from '../components/ChatBox';
import { BsChatDots } from 'react-icons/bs';
import ChatSidebar from '../components/ChatSidebar';
import Cadastro from './gestor/cadastro/Cadastro';
import Turma from './gestor/turmas/turmas';


// Chat, Socket e componentes relacionados foram removidos.

export default function GestorDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => setIsMenuOpen(true);
  const handleMouseLeave = () => setIsMenuOpen(false);

  // Lógica para lidar com cliques fora dos menus (mantida)
  useEffect(() => {
    const handleClickOutsideProfileMenu = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleClickOutsideHelpModal = (event: MouseEvent) => {
      if (helpModalRef.current && !helpModalRef.current.contains(event.target as Node)) {
        setIsHelpModalOpen(false);
      }
    };
    const handleClickOutsideNotificationsMenu = (event: MouseEvent) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideProfileMenu);
    document.addEventListener('mousedown', handleClickOutsideHelpModal);
    document.addEventListener('mousedown', handleClickOutsideNotificationsMenu);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideProfileMenu);
      document.removeEventListener('mousedown', handleClickOutsideHelpModal);
      document.removeEventListener('mousedown', handleClickOutsideNotificationsMenu);
    };
  }, []);

  // Lógica para definir a página ativa (mantida)
  useEffect(() => {
    const forcedIa = localStorage.getItem('forceIaPage');
    if (forcedIa === 'true') {
      setActivePage('ia');
      localStorage.removeItem('forceIaPage');
    } else if (location.state && location.state.activePage) {
      setActivePage(location.state.activePage);
    } else {
      setActivePage('home');
    }
  }, [location.state]);

  if (loading) return <p>Carregando...</p>;

  const handleSelectFriend = (userId: string) => {
    setActiveChatId(userId); // Define quem é o alvo
    setIsChatOpen(true);    // Abre a janela de chat
  };

  return (
    <div className="flex h-screen overflow-x-auto max-w-full">
      {/* Sidebar */}
      <SidebarGestor
        isMenuOpen={isMenuOpen}
        setActivePage={setActivePage}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 bg-gray-100 pt-[10px] pl-0 pr-2 md:pl-[60px] transition-all duration-500 overflow-x-auto px-2 md:px-0">
        {/* Top Bar */}
        <TopbarGestorAuto activePage={activePage} setActivePage={setActivePage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        {/* Dynamic Content Area */}
        <main className="p-5 bg-gray-100 flex-1 mt-[80px]">
          {activePage === 'home' && <HomeGestor />}
          {activePage === 'ia' && <IaPage />}
          {activePage === 'gestao' && <GestaoEscolarPage />}
          {activePage === 'turmas' && <TurmasPage />}
          {activePage === 'professores' && <ProfessoresPage />}
          {activePage === 'alunos' && <AlunosPage />}
          {activePage === 'relatorios' && <RelatoriosPage />}
          {activePage === 'plano' && <PlanoPage />}
          {activePage === 'calendario' && <CalendarioPage />}
          {activePage === 'financeiro' && <FinanceiroPage />}
          {activePage === 'horarios' && <HorariosPage />}
          {activePage === 'social' && <SocialMediaPage />}
          {activePage === 'eventos' && <EventosPageMenu />}
          {activePage === 'feeds' && <FeedsPageMenu />}
          {activePage === 'comunidades' && <ComunidadesPageMenu />}
          {activePage === 'feedNoticias' && <NoticiasPageMenu />}
          {activePage === 'post' && <PostPageMenu />}
          {activePage === 'feedPrincipal' && <FeedPrincipalMenuPage />}
          {activePage === 'RelatorioProfessorPage' && <RelatorioProfessorPage />}
          {activePage === 'RelatorioAlunoPage' && <RelatorioAlunoPage />}
          {activePage === 'gamification' && <Gamification />}
          {activePage === 'meet' && <MeetPage />}
          {activePage === 'configuracoesSistema' && <ConfiguracoesPage />}
          {activePage === 'cursos' && <CursosPage />}
          {activePage === 'cadastro' && <Cadastro />}
          {activePage === 'gestaoturmas' && <Turma />}


        </main>
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        ref={helpModalRef}
      />

      {/* Floating Chat Button */}
      <div
        className="fixed bottom-5 right-[90px] bg-indigo-600 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200 z-50"
        onClick={() => setIsChatOpen(!isChatOpen)} // Altera o estado do chat
        title="Abrir Chat"
      >
        <BsChatDots size={32} />
      </div>

      {/* Floating Robot Button */}
      <div
        className="fixed bottom-5 right-7 bg-indigo-900 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200"
        onClick={() => setActivePage('ia')}
        title="Assistente Virtual"
      >
        <VscRobot size={32} />
      </div>
      {/* Renderizar o ChatBox (Adicionar antes da div que fecha o componente) */}
      <ChatSidebar
        isOpen={isChatOpen}
        onSelectFriend={handleSelectFriend}
      />
      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        myUserId={String(user?.id ?? 'TESTE')}
        activeChatId={activeChatId} // <-- PASSE O ESTADO AQUI
      />

      {/* Fechamento da div principal */}
    </div>
  );
}
