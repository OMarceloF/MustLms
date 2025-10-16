import React, { useState, useRef, useEffect } from 'react';
// A importação do 'io' foi removida.
import TopBarGestor from './Navbar';
import { useAuth } from '../../../hooks/useAuth';

// A interface Notification pode ser mantida se você planeja buscar notificações via API REST no futuro.
interface Notification {
  nome: string;
  conteudo: string;
  data: string;
}

export default function TopbarGestorAuto({
  activePage,
  setActivePage,
  isMenuOpen,
  setIsMenuOpen,
}: {
  activePage?: string;
  setActivePage?: (page: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { user, loading } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false);
  
  // O estado 'notificacoes' foi mantido como um array vazio.
  // No futuro, você pode preenchê-lo com uma chamada a uma API REST.
  const [notificacoes, setNotificacoes] = useState<Notification[]>([]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const feedbackMenuRef = useRef<HTMLDivElement>(null);

  // A lógica de conexão do socket e os listeners de eventos foram completamente removidos.

  // A função de logout permanece a mesma.
  const handleLogout = () => {
    fetch(`/api/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      window.location.href = '/';
    });
  };

  // Enquanto a autenticação carrega, não mostra nada.
  if (loading) {
    return null;
  }
  // Se não houver usuário, não mostra nada.
  if (!user) {
    return null;
  }

  return (
    <>
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
        helpModalRef={helpModalRef}
        notificationsMenuRef={notificationsMenuRef}
        feedbackMenuRef={feedbackMenuRef}
        user={user}
        handleLogout={handleLogout}
        activePage={activePage || ''}
        setActivePage={setActivePage || (() => {})}
        usuarioId={user.id}
        notifications={notificacoes} // Continua passando o array (atualmente vazio) de notificações.
      />
    </>
  );
}
