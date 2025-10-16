import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NavItem from '../components/NavItem';
import ProfileMenuItem from '../components/ProfileMenu';
import NotificationsMenu from '../components/NotificationsMenu';
import {
  Menu,
  Bell,
  HelpCircle,
  User,
  Home,
  MessageCircle,
  LogOut,
  Settings,
  BarChart2,
  Calendar,
  FileText,
  User2Icon,
} from 'lucide-react';
import '../styles/Responsavel.css';
import HomeResponsavel from './responsavel/HomeResponsavel';
import ComunicacaoPage from './responsavel/ComunicacaoPage';
import CalendarioPage from './responsavel/CalendarioPage';
import DesempenhoPage from './responsavel/DesempenhoPage';
import HelpModal from '../components/AjudaModal';
import DadosPessoaisModal from '../components/DadosPessoaisModal';

export default function ResponsavelDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); 
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDadosPessoaisModalOpen, setIsDadosPessoaisModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const userId = user.id ?? 0;
  const navigate = useNavigate();
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const helpModalRef = useRef<HTMLDivElement>(null);
    const dadosPessoaisModalRef = useRef<HTMLDivElement>(null);
    const notificationsMenuRef = useRef<HTMLDivElement>(null);
  
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
  
      const handleClickOutsideDadosPessoaisModal = (event: MouseEvent) => {
        if (dadosPessoaisModalRef.current && !dadosPessoaisModalRef.current.contains(event.target as Node)) {
          setIsDadosPessoaisModalOpen(false);
        }
      };
  
      const handleClickOutsideNotificationsMenu = (event: MouseEvent) => {
        if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
          setIsNotificationsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutsideProfileMenu);
      document.addEventListener('mousedown', handleClickOutsideHelpModal);
      document.addEventListener('mousedown', handleClickOutsideDadosPessoaisModal);
      document.addEventListener('mousedown', handleClickOutsideNotificationsMenu);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideProfileMenu);
        document.removeEventListener('mousedown', handleClickOutsideHelpModal);
        document.removeEventListener('mousedown', handleClickOutsideDadosPessoaisModal);
        document.removeEventListener('mousedown', handleClickOutsideNotificationsMenu);
      };
    }, []);

  if (loading) return <p>Carregando...</p>;

  const handleLogout = async () => {
    try {
      const response = await fetch(`/api/logout`, {
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
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isMenuOpen ? 'expanded' : ''}`}>
        <NavItem icon={<Home size={20} />} text="Início" isExpanded={isMenuOpen} onClick={() => setActivePage('home')} />
        <NavItem icon={<MessageCircle size={20} />} text="Comunicação" isExpanded={isMenuOpen} onClick={() => setActivePage('comunicacao')} />
        <NavItem icon={<BarChart2 size={20} />} text="Desempenho" isExpanded={isMenuOpen} onClick={() => setActivePage('desempenho')} />
        <NavItem icon={<Calendar size={20} />} text="Calendário" isExpanded={isMenuOpen} onClick={() => setActivePage('calendario')} />
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-left">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} title="Menu" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <Menu size={24} color="white" />
            </button>
            <span className="title">Painel do Responsável</span>
          </div>
          <div className="top-right">
            <button className="top-bar-item" title="Ajuda" onClick={() => setIsHelpModalOpen(!isHelpModalOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <HelpCircle size={24} color="white" />
            </button>
            <button className="top-bar-item" title="Notificações" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <Bell size={24} color="white" />
            </button>
            <button className="top-bar-item" title="Meu Perfil" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <User size={24} color="white" />
            </button>
            {isProfileMenuOpen && (
              <div className="profile-menu" ref={profileMenuRef}>
                <div className="profile-photo" style={{ backgroundImage: "url('/profile.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <h1>Olá, {user.nome}!</h1>
                <ProfileMenuItem icon={<User2Icon size={18} />} text="Dados Pessoais" onClick={() => setIsDadosPessoaisModalOpen(true)}/>
                <ProfileMenuItem icon={<Settings size={18} />} text="Configurações" />
                <ProfileMenuItem icon={<LogOut size={18} />} text="Sair" onClick={handleLogout} />
              </div>
            )}
            {isNotificationsOpen && (
              <NotificationsMenu isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} ref={notificationsMenuRef}/>
            )}
          </div>
        </header>

        {/* Dynamic Content Area */}
        <main className="content-area">
          {activePage === 'home' && <HomeResponsavel setActivePage={setActivePage} />}
          {activePage === 'comunicacao' && <ComunicacaoPage />}
          {activePage === 'desempenho' && <DesempenhoPage />}
          {activePage === 'calendario' && <CalendarioPage />}
        </main>
      </div>
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} ref={helpModalRef}/>
      <DadosPessoaisModal isOpen={isDadosPessoaisModalOpen} onClose={() => setIsDadosPessoaisModalOpen(false)} userId={userId} ref={dadosPessoaisModalRef}/>
    </div>
  );
}