// src/components/SidebarGestor.tsx
import React from 'react';
import { MdComputer, MdAttachMoney } from "react-icons/md";
import { PiStudent } from "react-icons/pi";
import { HiOutlineUserGroup } from "react-icons/hi";
import {
  Users,
  BarChart2,
  Calendar,
  Home,
} from 'lucide-react';
import { VscRobot } from "react-icons/vsc";
import { FaRegPenToSquare } from "react-icons/fa6";
import { IoVideocamOutline } from "react-icons/io5";
import NavItem from "../../../components/NavItem";
import { useAuth } from '../../../hooks/useAuth';

interface SidebarGestorProps {
  isMenuOpen: boolean;
  setActivePage: (page: string) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export default function SidebarGestor({
  isMenuOpen,
  setActivePage,
  handleMouseEnter,
  handleMouseLeave
}: SidebarGestorProps) {
  const { user, loading: authLoading } = useAuth();

  // até carregar perfil, não renderiza nada
  if (authLoading) return null;

  const isProfessor = user.role === 'professor';

  return (
    <aside
      className={`fixed top-[44px] left-0 h-[calc(100vh-60px)] bg-white border-r border-gray-200 z-[999]
        transition-all duration-500 ${isMenuOpen ? 'w-[220px]' : 'hidden sm:block w-[60px]'} mt-[20px]`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col pt-4">
        <NavItem
          icon={<Home size={28} />}
          text="Início"
          isExpanded={isMenuOpen}
          onClick={() => setActivePage('home')}
        />
        <NavItem
          icon={<VscRobot size={28} />}
          text="IA"
          isExpanded={isMenuOpen}
          onClick={() => setActivePage('ia')}
        />
        <NavItem
          icon={<MdComputer size={28} />}
          text="Matérias"
          isExpanded={isMenuOpen}
          onClick={() => setActivePage('gestao')}
        />
        {/* sempre visível */}
        <NavItem
          icon={<HiOutlineUserGroup size={28} />}
          text="Turmas"
          isExpanded={isMenuOpen}
          onClick={() => setActivePage('turmas')}
        />
        <NavItem
          icon={<PiStudent size={28} />}
          text="Alunos"
          isExpanded={isMenuOpen}
          onClick={() => setActivePage('alunos')}
        />
        {/* itens apenas para gestores, financeiro e responsáveis */}
        {!isProfessor && (
          <>
            <NavItem
              icon={<Users size={28} />}
              text="Funcionários"
              isExpanded={isMenuOpen}
              onClick={() => setActivePage('professores')}
            />
            <NavItem
              icon={<BarChart2 size={28} />}
              text="Relatórios"
              isExpanded={isMenuOpen}
              onClick={() => setActivePage('relatorios')}
            />
            <NavItem
              icon={<Calendar size={28} />}
              text="Calendário"
              isExpanded={isMenuOpen}
              onClick={() => setActivePage('calendario')}
            />
          </>
        )}



        {/* somente para professores */}
        {isProfessor && (
          <NavItem
            icon={<FaRegPenToSquare size={28} />}
            text="Enviar"
            isExpanded={isMenuOpen}
            onClick={() => setActivePage('envio')}
          />
        )}
      </div>
    </aside>
  );
}
