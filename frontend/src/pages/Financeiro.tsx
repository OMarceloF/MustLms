import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarFinanceiro from './financeiro/SidebarFinanceiro';
import TopBarGestor from './gestor/components/Navbar';
import HelpModal from '../components/AjudaModal';
import { useAuth } from '../hooks/useAuth';
import IaPage from './gestor/IaPage';
import DespesasPage from './financeiro/DespesasPage';
import GestaoPage from './financeiro/GestaoPage';
import HomePage from './financeiro/HomePage';
import ReceitasPage from './financeiro/ReceitasPage';
import RelatorioPage from './financeiro/RelatorioPage';
import EventosPageMenu from './gestor/EventosPageMenu';
import FeedsPageMenu from './gestor/FeedsPageMenu'; // Importando o componente de eventos
import ComunidadesPageMenu from './gestor/ComunidadesPageMenu';
import NoticiasPageMenu from './gestor/NoticiasPageMenu';
import PostPageMenu from './gestor/PostPageMenu';
import SocialMediaPage from './gestor/SocialMediaPage';
import { VscRobot } from 'react-icons/vsc';
import GerarBoletoPage from './financeiro/GerarBoletoPage';
import PagamentosPage from './financeiro/PagamentoPage';

const Financeiro = () => {
  const [activePage, setActivePage] = useState('home');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const feedbackMenuRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  console.log("Funcionando")

  return (
    <div className="dashboard-container">
      <SidebarFinanceiro
        isMenuOpen={sidebarAberta}
        setActivePage={setActivePage}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="main-content">
        <TopBarGestor
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
          isProfileMenuOpen={isProfileMenuOpen}
          setIsProfileMenuOpen={setIsProfileMenuOpen}
          isHelpModalOpen={isHelpModalOpen}
          setIsHelpModalOpen={setIsHelpModalOpen}
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          profileMenuRef={profileMenuRef}
          notificationsMenuRef={notificationsMenuRef}
          user={{
            nome: user?.nome ?? 'Usuário',
            id: user?.id ?? 0,
            role: user?.role ?? 'user',
            foto_url: user?.foto_url ?? null
          }}
          handleLogout={() => navigate('/')}
          activePage="financeiro"
          setActivePage={() => { } } isFeedbackMenuOpen={false} setIsFeedbackMenuOpen={function (v: boolean): void {
          } } 
          helpModalRef={helpModalRef} 
          feedbackMenuRef={feedbackMenuRef} 
          usuarioId={0} 
          notifications={[]}        />

        {/* Dynamic Content Area */}
        <main className="content-area">
          {activePage === 'home' && <HomePage />}
          {activePage === 'ia' && <IaPage />}
          {activePage === 'gestao' && <GestaoPage />}
          {activePage === 'relatorio' && <RelatorioPage />}
          {activePage === 'despesas' && <DespesasPage />}
          {activePage === 'pagamentos' && <PagamentosPage />}
          {activePage === 'boleto' && <GerarBoletoPage />}
          {activePage === 'receita' && <ReceitasPage />}
          {activePage === 'social' && <SocialMediaPage />}
          {activePage === 'eventos' && <EventosPageMenu />}{' '}
          {/* Página de eventos */}
          {activePage === 'feeds' && <FeedsPageMenu />} {/* Página de feeds */}
          {activePage === 'comunidades' && <ComunidadesPageMenu />}{' '}

          {/* Página de comunidades */}

          {/* Página de amigos */}

          {activePage === 'feedNoticias' && <NoticiasPageMenu />}{' '}
          {/* Página de noticias */}
          {activePage === 'post' && <PostPageMenu />} {/* Página de noticias */}
        </main>

        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          ref={helpModalRef}
        />

        {/* {isNotificationsOpen && (
          <NotificationsMenu
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            ref={notificationsMenuRef}
          />
        )} */}

        {/* Botão flutuante com ícone de robô */}
        <div
          className="robot-button"
          onClick={() => setActivePage('ia')}
          title="Assistente Virtual"
        >
          <VscRobot size={32} />
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
