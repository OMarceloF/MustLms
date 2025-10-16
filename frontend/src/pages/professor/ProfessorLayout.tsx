// frontend/src/layouts/ProfessorLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom'; // 👈 O mais importante!
import SidebarProfessor from '../../pages/professor/SidebarProfessor';
import TopbarGestorAuto from '../../pages/gestor/components/TopbarGestorAuto';
import Header from './components/Header'; // Importe se precisar

export default function ProfessorLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // A lógica de 'activePage' não é mais necessária aqui,
    // pois a Sidebar cuidará da navegação e do estado ativo.

    return (
        <div className="flex h-screen bg-gray-100">
            <SidebarProfessor
                isMenuOpen={isMenuOpen}
                handleMouseEnter={() => setIsMenuOpen(true)}
                handleMouseLeave={() => setIsMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col lg:pl-[60px] transition-all duration-500">
                <div className="sticky top-0 z-20">
                    <div className="flex flex-col">
                        <TopbarGestorAuto
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
                        // As props 'activePage' e 'setActivePage' podem ser removidas se a Topbar não as usar para navegação
                        />
                        {/* Você pode adicionar lógica para mostrar o Header aqui se necessário */}
                        {/* Ex: {location.pathname.startsWith('/professor/avaliacoes') && <Header />} */}
                    </div>
                </div>
                <main className="flex-1 overflow-y-auto">
                    {/* O Outlet é o espaço onde as páginas filhas (Home, Avaliações, etc.) serão renderizadas */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
