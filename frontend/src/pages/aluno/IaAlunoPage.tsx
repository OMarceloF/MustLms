// src/pages/aluno/IaAlunoPage.tsx

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TopBarGestor from '../gestor/components/Navbar';
import SidebarGestor from '../gestor/components/Sidebar';
import SidebarAluno from './components/sidebaraluno';
import IaPage from '../gestor/IaPage';

export default function IaAlunoPage() {
  const { user } = useAuth();
  const usuarioId = user?.id ?? 0;
  const navigate = useNavigate();

  // definir qual sidebar exibir
  const role = user?.role ?? '';
  const showSidebarGestor = !['responsavel', 'aluno'].includes(role);
  const showSidebarAluno = role === 'aluno';

  // estado e handlers para abrir/fechar sidebar no hover
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleMouseEnter = () => setIsMenuOpen(true);
  const handleMouseLeave = () => setIsMenuOpen(false);

  // estados da TopBar
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const feedbackMenuRef = useRef<HTMLDivElement>(null);

  const [activePage, setActivePage] = useState('ia');

  const handleLogout = async () => {
    await fetch('http://52.67.126.32/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/';
  };

  // carregar notificações
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `http://52.67.126.32//api/notificacoes/${usuarioId}`
        );
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
      }
    };
    if (usuarioId) fetchNotifications();
  }, [usuarioId]);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar para gestor/professor */}
      {showSidebarGestor && (
        <SidebarGestor
          isMenuOpen={isMenuOpen}
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
          isMenuOpen={isMenuOpen}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 mt-[60px]">
        <TopBarGestor
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          isProfileMenuOpen={isProfileMenuOpen}
          setIsProfileMenuOpen={setIsProfileMenuOpen}
          isHelpModalOpen={isHelpModalOpen}
          setIsHelpModalOpen={setIsHelpModalOpen}
          isNotificationsOpen={isNotificationsOpen}
          setIsNotificationsOpen={setIsNotificationsOpen}
          isFeedbackMenuOpen={isFeedbackMenuOpen}
          setIsFeedbackMenuOpen={setIsFeedbackMenuOpen}
          profileMenuRef={profileMenuRef}
          notificationsMenuRef={notificationsMenuRef}
          helpModalRef={helpModalRef}
          feedbackMenuRef={feedbackMenuRef}
          user={user}
          usuarioId={usuarioId}
          notifications={notifications}
          handleLogout={handleLogout}
          setActivePage={setActivePage}
          activePage={activePage}
        />

        <main className="px-4 pb-10">
          <IaPage />
        </main>
      </div>
    </div>
  );
}
