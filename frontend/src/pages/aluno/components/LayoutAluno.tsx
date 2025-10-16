import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarAluno from './sidebaraluno'; // Ajuste o caminho se necessário
import TopBarGestorAuto from '../../gestor/components/TopbarGestorAuto'; // Importação correta

interface LayoutAlunoProps {
    children: React.ReactNode; // Para renderizar o conteúdo da página dentro do layout
}

const LayoutAluno: React.FC<LayoutAlunoProps> = ({ children }) => {
    // O estado que controla o menu se chama 'isMenuOpen' e a função é 'setIsMenuOpen'
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleMouseEnter = () => setIsMenuOpen(true);
    const handleMouseLeave = () => setIsMenuOpen(false);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <SidebarAluno
                isMenuOpen={isMenuOpen}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
            // A prop setActivePage foi removida pois o NavItem agora usa navigate diretamente
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${isMenuOpen ? 'ml-0 sm:ml-56' : 'ml-0 sm:ml-20'}`}>
                {/* 
                  CORREÇÕES APLICADAS AQUI:
                  1. O nome do componente agora é 'TopBarGestorAuto' (B maiúsculo).
                  2. A prop 'isMenuOpen' agora recebe a variável correta 'isMenuOpen'.
                  3. A prop 'setIsMenuOpen' agora recebe a função correta 'setIsMenuOpen'.
                */}
                <TopBarGestorAuto
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                />

                {/* O conteúdo da página específica (ex: Simulados) será renderizado aqui */}
                <main className="flex-1 p-4 pt-20">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LayoutAluno;
