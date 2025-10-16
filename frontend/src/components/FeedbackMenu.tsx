import { forwardRef } from 'react';
import ProfileMenuItem from './ProfileMenu'
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FeedbackMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

interface UserInfo {
  id: number;
  nome: string;
  foto_url: string | null;
  role: string;
}

// const FeedbackMenu = ({ isOpen, onClose, userName, setActivePage, activePage }: NavItemProps) => {
const FeedbackMenu = forwardRef<HTMLDivElement, FeedbackMenuProps>((
  { isOpen, onClose, userName },
  ref
) => {

  const handleLogout = () => void (window.location.href = '/');
  const { user, loading } = useAuth();
  if (loading || !user) return null;  // ou um spinner
  const isRestrictedUser = user?.role === 'aluno' || user?.role === 'responsavel';

  return (
    <div
      ref={ref}
      onMouseDown={(e) => e.stopPropagation()}
      className="
   fixed top-[60px] right-2 sm:right-[10px]
   bg-white text-[#333]
   w-[calc(100vw-1rem)] sm:w-[460px]
   max-w-full sm:max-w-none
   p-3 sm:p-5
   border-l border-gray-200
   shadow-lg z-[1000]
   transition-transform duration-300 ease-in-out
   rounded-lg
 "
    >
      <div className="flex justify-between items-center mb-5">

        <div className="flex items-center">
          {/* <div className="w-10 h-10 bg-[url('/profile.png')] bg-cover bg-center rounded-full mr-2"></div> */}
          <div>
            <h2 className="text-lg text-[#333] m-0">Olá, {userName}!</h2>
            <p className="text-sm text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* <button
            className="bg-gray-100 text-white border-none px-2 py-1 rounded cursor-pointer text-sm hover:bg-[#fefefe]"
            onClick={onClose}
          >
            <PiXThin size={20} color="#000000" />
          </button> */}
          <ProfileMenuItem
            icon={<Settings size={18} />}
            text="Configurações"
            onClick={() => {
              if (user) {
                window.location.href = `/${user.role}/configuracoes`;
              } else {
                window.location.href = '/configuracoes';
              }
            }}
          />
          <ProfileMenuItem
            icon={<LogOut size={18} />}
            text="Sair"
            onClick={() => {
              localStorage.removeItem('alunoSelecionadoId');
              localStorage.removeItem('alunoVisualizadoId');
              handleLogout();
            }} />
        </div>

      </div>
    </div>
  );
}
);

export default FeedbackMenu;
