// src/components/sidebaraluno.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, BookOpen, BookMarked } from 'lucide-react';
import { VscRobot } from 'react-icons/vsc';
import { FaRegPenToSquare } from 'react-icons/fa6';
import NavItem from '../../../components/NavItem';
import { useAuth } from '../../../hooks/useAuth';
import { SiTestcafe } from "react-icons/si";


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
    const navigate = useNavigate();
    const location = useLocation();

    if (authLoading || !user) return null;
    const studentId = user.id;
    const basePath = `/aluno/${studentId}`;

    // Retorna true se a rota atual corresponder exatamente ou for descendente de `path`
    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + '/');


    // até carregar perfil, não renderiza nada
    if (authLoading) return null;

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
                    onClick={() => navigate(`/aluno`)}
                    active={isActive(`/HomeAluno`)}
                />
                <NavItem
                    icon={<VscRobot size={28} />}
                    text="IA"
                    isExpanded={isMenuOpen}
                    onClick={() => navigate(`/aluno/ia`)}
                    active={isActive(`/aluno/ia`)}
                />

                <NavItem
                    icon={<BookOpen size={28} />}
                    text="Curso"
                    isExpanded={isMenuOpen}
                    onClick={() => navigate('/aluno/curso')}
                    active={isActive('/aluno/curso')}
                />

                <NavItem
                    icon={<BookMarked size={28} />}
                    text="Matérias"
                    isExpanded={isMenuOpen}
                    // Exemplo de navegação para a primeira matéria (id=1)
                    onClick={() => navigate('/aluno/materias/1')}
                    active={isActive('/aluno/materias')}
                />

                <NavItem
                    icon={<FaRegPenToSquare size={28} />}
                    text="Envios"
                    isExpanded={isMenuOpen}
                    onClick={() => navigate(`${basePath}/enviosdeprofessores`)}
                    active={isActive(`${basePath}/enviosdeprofessores`)}
                />
                <NavItem
                    icon={<SiTestcafe size={28} />}
                    text="Simulados"
                    isExpanded={isMenuOpen}
                    // CORREÇÃO: Adicionada a barra "/" no início para navegação absoluta.
                    onClick={() => navigate('/aluno/simulados')}
                    // CORREÇÃO: Adicionada a barra "/" para a verificação de rota ativa.
                    active={isActive('/aluno/simulados')}
                />
            </div>
        </aside>
    );
}
