import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HomeProfessor from './professor/HomeProfessor';
import AlunosPage from './gestor/AlunosPage';
import HelpModal from '../components/AjudaModal';
import TurmasPage from './gestor/TurmasPage';
import GestaoEscolarPage from './gestor/GestaoEscolarPage';
import SidebarProfessor from './professor/SidebarProfessor';
import TopbarGestorAuto from './gestor/components/TopbarGestorAuto';
import { VscRobot } from 'react-icons/vsc';
import IaPage from './gestor/IaPage';

import ProfessorEnvios from './professor/EnvioProfessor';
import Avaliacoes from './professor/avaliacoes/Avaliacoes';

export default function ProfessorDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
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

  // Esta função decidirá se deve mudar o estado local ou navegar para uma rota externa.
  const handleNavigation = (page: string) => {
    // Lista de páginas que são rotas externas (gerenciadas pelo App.tsx)
    const externalRoutes = ['avaliacoes'];

    if (externalRoutes.includes(page)) {
      // Se for uma rota externa, use o navigate
      navigate(`/${page}/home`); // Navega para /avaliacoes/home
    } else {
      // Se for uma página interna, apenas mude o estado
      setActivePage(page);
    }
  };

  useEffect(() => {
    // Este useEffect continua útil para definir a página ativa ao carregar
    if (location.state && location.state.activePage) {
      setActivePage(location.state.activePage);
    } else {
      // Define 'home' como padrão se nenhuma página estiver ativa
      const path = location.pathname;
      if (path === '/professor') {
        setActivePage('home');
      }
      // Adicione outras lógicas se necessário para sincronizar a URL com o activePage
    }
  }, [location.state, location.pathname]);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="flex h-screen overflow-x-auto max-w-full">
      {/* <SidebarProfessor
        isMenuOpen={isMenuOpen}
        // A prop setActivePage foi removida daqui
        handleMouseEnter={() => setIsMenuOpen(true)}
        handleMouseLeave={() => setIsMenuOpen(false)}
      /> */}

      <div className="flex flex-col flex-1 bg-gray-100 pt-4 px-4 lg:pl-[60px] transition-all duration-500 overflow-x-hidden">
        {/* <TopbarGestorAuto activePage={activePage} setActivePage={setActivePage} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} /> */}

        <main className="p-2 bg-gray-100 flex-1 mt-[60px]">
          {/* As páginas internas continuam sendo renderizadas aqui */}
          {activePage === 'home' && <HomeProfessor setActivePage={setActivePage} />}
          {activePage === 'ia' && <IaPage />}
          {activePage === 'gestao' && <GestaoEscolarPage />}
          {activePage === 'turmas' && <TurmasPage />}
          {activePage === 'alunos' && <AlunosPage />}
          {activePage === 'envio' && <ProfessorEnvios />}
          {activePage === 'avaliacoes' && <Avaliacoes />}
        </main>
      </div>

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} ref={helpModalRef} />


      {/* Floating Robot Button */}
      <div
        className="fixed bottom-5 right-7 bg-orange-700 text-white rounded-full p-3 cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200"
        onClick={() => handleNavigation('ia')} // Use a nova função aqui também
        title="Assistente Virtual"
      >
        <VscRobot size={32} />
      </div>
    </div>
  );
}
