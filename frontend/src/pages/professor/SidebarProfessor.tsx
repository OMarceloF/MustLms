// frontend/src/pages/professor/SidebarProfessor.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PiStudent } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { Home } from 'lucide-react';
import { VscRobot } from "react-icons/vsc";
import { FaRegPenToSquare } from "react-icons/fa6";
import { SiTestcafe } from "react-icons/si";
import NavItem from "../../components/NavItem";

interface SidebarProfessorProps {
  isMenuOpen: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function SidebarProfessor({
  isMenuOpen,
  handleMouseEnter,
  handleMouseLeave
}: SidebarProfessorProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Função que verifica se a rota atual começa com o caminho do link
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={`mt-[20px] fixed top-[48px] left-0 h-[calc(100vh-60px)] bg-white border-r border-gray-200 z-[999]
        transition-all duration-500 ${isMenuOpen ? 'w-[220px]' : 'hidden sm:block w-[60px] mt-[20px]'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col pt-4">
        <NavItem
          icon={<Home size={28} />}
          text="Início"
          isExpanded={isMenuOpen}
          onClick={() => navigate('/professor/home')}
          active={location.pathname === '/professor/home'} // Destaque exato
        />
        <NavItem
          icon={<VscRobot size={28} />}
          text="IA"
          isExpanded={isMenuOpen}
          onClick={() => navigate('/professor/ia')}
          active={isActive('/professor/ia')}
        />
        <NavItem
          icon={<HiOutlineUserGroup size={28} />}
          text="Minhas Turmas"
          isExpanded={isMenuOpen}
          onClick={() => navigate('/professor/turmas')}
          active={isActive('/professor/turmas')}
        />
        <NavItem
          icon={<PiStudent size={28} />}
          text="Meus Alunos"
          isExpanded={isMenuOpen}
          onClick={() => navigate('/professor/alunos')}
          active={isActive('/professor/alunos')}
        />
        <NavItem
          icon={<FaRegPenToSquare size={28} />}
          text="Enviar Material"
          isExpanded={isMenuOpen}
          onClick={() => navigate('/professor/envio')}
          active={isActive('/professor/envio')}
        />
        <NavItem
          icon={<SiTestcafe size={28} />}
          text="Avaliações"
          isExpanded={isMenuOpen}
          onClick={() => navigate('/professor/avaliacoes')}
          active={isActive('/professor/avaliacoes')}
        />
      </div>
    </aside>
  );
}
