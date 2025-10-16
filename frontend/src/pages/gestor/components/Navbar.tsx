import { PiCirclesFourBold } from 'react-icons/pi';
import NotificationsMenu from '../../../components/NotificationsMenu';
import FeedbackMenu from '../../../components/FeedbackMenu';
import HelpModal from '../../../components/AjudaModal';
import {
  HelpCircle,
  Bell,
  Menu,
  PlusCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface UserInfo {
  id: number;
  nome: string;
  foto_url: string | null;
}

interface NotificationItem {
  nome: string;
  conteudo: string;
  data: string;
}

interface TopBarGestorProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
  isProfileMenuOpen: boolean;
  setIsProfileMenuOpen: (v: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (v: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (v: boolean) => void;
  isFeedbackMenuOpen: boolean;
  setIsFeedbackMenuOpen: (v: boolean) => void;
  profileMenuRef: React.RefObject<HTMLDivElement>;
  notificationsMenuRef: React.RefObject<HTMLDivElement>;
  helpModalRef: React.RefObject<HTMLDivElement>;
  feedbackMenuRef: React.RefObject<HTMLDivElement>;

  user: {
    nome?: string | null;
    foto_url?: string | null;
    id: number;
    role: string;
  };

  usuarioId: number;
  notifications: NotificationItem[];

  handleLogout: () => void;
  setActivePage: (p: string) => void;
  activePage: string;
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? `/${path}` : null;
}

export default function TopBarGestor({
  isMenuOpen,
  setIsMenuOpen,
  isProfileMenuOpen,
  setIsProfileMenuOpen,
  isHelpModalOpen,
  setIsHelpModalOpen,
  isNotificationsOpen,
  setIsNotificationsOpen,
  isFeedbackMenuOpen,
  setIsFeedbackMenuOpen,
  profileMenuRef,
  notificationsMenuRef,
  helpModalRef,
  feedbackMenuRef,
  user,
  handleLogout,
  setActivePage,
  activePage,
  usuarioId,
  notifications,
}: TopBarGestorProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [naoVisualizadasCount, setNaoVisualizadasCount] = useState<number>(0);
  const navigate = useNavigate();
  const isRespAluno = ['responsavel', 'aluno'].includes(user.role);

  const { id: paramId } = useParams<{ id?: string }>();
  const isResponsavel = user.role === 'responsavel';
  const profileUserId = isResponsavel && paramId ? Number(paramId) : user.id;

  const feedbackButtonRef = useRef<HTMLButtonElement>(null);

  const alunoVisualizadoId = localStorage.getItem('alunoVisualizadoId');
  const alunoSelecionadoId =
    localStorage.getItem('alunoSelecionadoId') || user.id;
  const alunoIdParaRetornar = alunoSelecionadoId;

  useEffect(() => {
    if (!profileUserId) return;

    const load = async () => {
      try {
        const res = await axios.get<UserInfo>(
          `/api/userinfo/${profileUserId}`
        );
        setUserInfo(res.data);
      } catch (err) {
        console.error('Erro ao buscar info de usuário:', err);
      }
    };
    load();
  }, [profileUserId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileMenuRef.current && !profileMenuRef.current.contains(target))
        setIsProfileMenuOpen(false);

      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(target)
      )
        setIsNotificationsOpen(false);

      if (feedbackMenuRef.current && !feedbackMenuRef.current.contains(target))
        setIsFeedbackMenuOpen(false);

      if (helpModalRef.current && !helpModalRef.current.contains(target))
        setIsHelpModalOpen(false);

      if (
        feedbackMenuRef.current &&
        !feedbackMenuRef.current.contains(target) &&
        feedbackButtonRef.current &&
        !feedbackButtonRef.current.contains(target)
      ) {
        setIsFeedbackMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    isProfileMenuOpen,
    isNotificationsOpen,
    isFeedbackMenuOpen,
    isHelpModalOpen,
  ]);

  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       if (!user?.id) return; // ⚠️ Evita buscar sem id válido
  //       const response = await axios.get(
  //         `http://localhost:3001/userinfo/${user.id}`
  //       );
  //       setUserInfo(response.data);
  //     } catch (error) {
  //       console.error('Erro ao buscar informações do usuário:', error);
  //     }
  //   };

  //   fetchUserInfo();
  // }, [user?.id]); // ← Atualiza quando o ID mudar

  useEffect(() => {
    if (!usuarioId) return;

    const buscarContagemNaoVisualizadas = async () => {
      try {
        const res = await fetch(
          `/api/notificacoes-eventos/${usuarioId}/nao-visualizadas-contagem`
        );
        const data = await res.json();
        setNaoVisualizadasCount(data.total);
      } catch (err) {
        console.error('Erro ao buscar notificações não visualizadas:', err);
      }
    };

    buscarContagemNaoVisualizadas();
  }, [usuarioId, isNotificationsOpen]); // Atualiza ao abrir o menu

  return (
    <header className="fixed top-0 left-0 w-full bg-white text-gray-800 p-4 flex justify-between items-center z-[1000] shadow">
      <div className="flex items-center gap-2">

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Menu"
          className="bg-transparent border-none cursor-pointer p-1"
        >
          <Menu size={24} color="black" />
        </button>

        <span
          onClick={() => setActivePage('home')}
          className="cursor-pointer hidden md:inline"
        >
          <img
            src="https://mustedu.com/wp-content/uploads/2023/07/F1i732qm9AH1A8iIrHdJqwLAGyzkJYr2PXKubO29.png"
            alt="logoMust"
            className="w-[124px] h-auto ml-3 mr-2"
          />
        </span>
      </div>
      <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
        {/* <Link to={`/gestor/alunos/${profileUserId}/visualizaraluno`}> */}
        <a href={`/gestor/alunos/${alunoIdParaRetornar}/visualizaraluno`}>
          <div className="flex items-center gap-2 pr-2 cursor-pointer">
            <span className="hidden md:inline text-[15px] font-medium">
              {userInfo?.nome ?? 'Usuário'}
            </span>
            <div className="w-9 h-9 rounded-full overflow-hidden bg-indigo-200 border border-gray-300 flex items-center justify-center">
              {(() => {
                const safeFoto = getSafeImagePath(userInfo?.foto_url || '');

                return safeFoto ? (
                  <img
                    src={safeFoto}
                    alt={userInfo?.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-indigo-900">
                    {userInfo?.nome?.substring(0, 2).toUpperCase() || 'US'}
                  </span>
                );
              })()}
            </div>
          </div>
        </a>

        <button
          title="Ajuda"
          onClick={() => setIsHelpModalOpen(!isHelpModalOpen)}
          className="bg-transparent border-none cursor-pointer p-2 sm:p-1 rounded-full hover:bg-gray-200"
        >
          <HelpCircle size={24} color="black" />
        </button>

        <button
          title="Criar Anúncio"
          onClick={() => navigate('/gestor/anuncio')}
          className="bg-transparent border-none cursor-pointer p-2 sm:p-1 rounded-full hover:bg-gray-200"
        >
          <PlusCircle size={24} color="black" />
        </button>

        <div className="relative">
          <button
            title="Notificações"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="bg-transparent border-none cursor-pointer p-2 sm:p-1 rounded-full hover:bg-gray-200"
          >
            <Bell size={24} color="black" />
            {naoVisualizadasCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {naoVisualizadasCount}
              </span>
            )}
          </button>
        </div>

        <button
          ref={feedbackButtonRef}
          title="FeedbackMenu"
          onClick={() => setIsFeedbackMenuOpen(!isFeedbackMenuOpen)}
          className="bg-transparent border-none cursor-pointer p-2 sm:p-1 rounded-full hover:bg-gray-200"
        >
          <PiCirclesFourBold size={24} color="black" />
        </button>

        {isFeedbackMenuOpen && (
          <FeedbackMenu
            isOpen={isFeedbackMenuOpen}
            onClose={() => setIsFeedbackMenuOpen(false)}
            ref={feedbackMenuRef}
            userName={user.nome || 'admin'}
          />
        )}

        {isNotificationsOpen && (
          <NotificationsMenu
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            ref={notificationsMenuRef}
            usuarioId={usuarioId}
            notifications={notifications}
          />
        )}

        {isHelpModalOpen && (
          <HelpModal
            isOpen={isHelpModalOpen}
            onClose={() => setIsHelpModalOpen(false)}
            ref={helpModalRef}
          />
        )}
      </div>
    </header>
  );
}
