import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HelpModal from '../components/AjudaModal';
import HorariosPage from './gestor/HorariosPage';
import SidebarGestor from './aluno/components/sidebaraluno';
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
// import BotaoFlutuante from '../components/ButtonFlutuante';
// import ChatSidebar from "../components/ChatSideBar";
import TopbarGestorAuto from './gestor/components/TopbarGestorAuto';
import HomeAluno from './aluno/HomeAluno';
import EnviosdeProfessoresPage from './aluno/EnviosdeProfessoresPage';
// import ChatBox from "../components/ChatBox";

export default function AlunoDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const [chatAberto, setChatAberto] = useState(false);
  const [chatBoxAberto, setChatBoxAberto] = useState(false);
  const [chatUsuario, setChatUsuario] = useState<null | {
    id: number; nome: string; foto_url?: string; last_seen?: string; role?: string;
  }>(null);
  const [chatConversaId, setChatConversaId] = useState<number | null>(null);

  const API = import.meta.env.VITE_API_URL || '';


  // Selecionar uma conversa/contato
  const handleSelectChat = async (item: {
    id: number; nome: string; foto_url?: string; last_seen?: string; role?: string; conversa_id?: number;
  }) => {
    try {
      let conversaId = item.conversa_id ?? null;

      if (!conversaId && user?.id) {
        const [a, b] = [user.id, item.id].sort((x, y) => x - y);
        const res = await fetch(`${API}/conversas/${a}/${b}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Falha ao obter/gerar conversa');
        const data = await res.json();
        conversaId = Number(data.id);
      }

      if (!conversaId) return;

      setChatUsuario({ id: item.id, nome: item.nome, foto_url: item.foto_url, last_seen: item.last_seen, role: item.role });
      setChatConversaId(conversaId);
      setChatBoxAberto(true);
      setChatAberto(true);
    } catch (e) {
      console.error('Erro ao abrir conversa:', e);
    }
  };

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

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        navigate('/');
      } else {
        console.error('Erro ao realizar logout');
      }
    } catch (error) {
      console.error('Erro na requisição de logout:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-x-auto max-w-full">
      <SidebarGestor
        isMenuOpen={isMenuOpen}
        setActivePage={setActivePage}
        handleMouseEnter={() => setIsMenuOpen(true)}
        handleMouseLeave={() => setIsMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 bg-gray-100 pt-[10px] pl-0 pr-2 md:pl-[60px] transition-all duration-500 overflow-x-auto px-2 md:px-0">
        <TopbarGestorAuto activePage={activePage} setActivePage={setActivePage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="p-5 bg-gray-100 flex-1 mt-[60px]">
          {activePage === 'home' && <HomeAluno />}
          {activePage === 'ia' && <IaPage />}
          {activePage === 'envio' && <EnviosdeProfessoresPage />}
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

        </main>
      </div>

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} ref={helpModalRef} />

      {/* <BotaoFlutuante
        onClick={() => setChatAberto(true)}
        usuarioId={user?.id ?? null}
        isAuthLoaded={!loading}
        onToggleSidebar={() => setChatAberto((v) => !v)}
      />

      <ChatSidebar
        isVisible={chatAberto}
        conversaAberta={chatAberto}
        onClose={() => setChatAberto(false)}
        onSelectChat={handleSelectChat}
        idUsuarioLogado={user?.id ?? null}
      />

      {chatBoxAberto && chatUsuario && chatConversaId && (
        <ChatBox
          usuario={chatUsuario}
          conversaId={chatConversaId}
          idUsuarioLogado={user!.id}
          onClose={() => setChatBoxAberto(false)}
        />
      )} */}

      {/* Floating Robot Button */}
      <div
        className="fixed bottom-5 right-7 bg-orange-700 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200"
        onClick={() => setActivePage('ia')}
        title="Assistente Virtual"
      >
        <VscRobot size={32} />
      </div>
    </div>
  );
}
