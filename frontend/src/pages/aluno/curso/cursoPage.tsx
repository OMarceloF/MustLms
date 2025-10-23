"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

// 1. Importar os componentes de layout
import SidebarAluno from '../../aluno/components/sidebaraluno';
import TopBarGestor from '../../gestor/components/Navbar'; // Reutilizando a Topbar existente

// Importar os componentes das abas
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../gestor/components/ui/tabs";
import { EvolucaoCursoTab } from "./evolucao-tab";
import { MatrizCurricularTab } from "./matriz-tab";
import { ProfessoresTurmasTab } from "./professores-tab";
import { PpcTab } from "./ppc-tab";
import { CalendarioTab } from "./calendario-tab";
import { RelatoriosTab } from "./relatorios-tab";
import { DocumentosTab } from "./documentos-tab";

export function GraduateCoursePage() {
    // 2. Adicionar o estado para controlar o layout (sidebar e navbar)
    const { user } = useAuth();
    const usuarioId = user?.id ?? 0;
    const navigate = useNavigate();

    // Estado para controlar a abertura da sidebar
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const handleMouseEnter = () => setIsMenuOpen(true);
    const handleMouseLeave = () => setIsMenuOpen(false);

    // Estados e refs para a TopBar (copiado de outras páginas do aluno)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isFeedbackMenuOpen, setIsFeedbackMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const notificationsMenuRef = useRef<HTMLDivElement>(null);
    const helpModalRef = useRef<HTMLDivElement>(null);
    const feedbackMenuRef = useRef<HTMLDivElement>(null);

    const [activePage, setActivePage] = useState('curso'); // Define a página ativa

    const handleLogout = async () => {
        // A URL da API deve ser pega de variáveis de ambiente
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
        await fetch(`${apiUrl}/api/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        window.location.href = '/';
    };

    // Carregar notificações (opcional, mas bom para consistência)
    useEffect(() => {
        const fetchNotifications = async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
            try {
                const res = await fetch(`${apiUrl}/api/notificacoes/${usuarioId}`);
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

    // 3. Envolver o conteúdo da página na estrutura de layout
    return (
        <div className="flex min-h-screen w-full overflow-x-hidden">
            {/* Sidebar do Aluno */}
            <SidebarAluno
                isMenuOpen={isMenuOpen}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
                setActivePage={setActivePage} // Passando setActivePage se o componente aceitar
            />

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col">
                {/* Navbar Superior */}
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

                {/* Conteúdo Original da Página */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 bg-background mt-[60px]">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Meu Curso</h1>
                            <p className="text-lg text-muted-foreground">
                                Acompanhe seu desempenho, disciplinas e informações acadêmicas
                            </p>
                        </div>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="evolucao" className="w-full">
                            <TabsList className="mb-8 grid w-full grid-cols-2 gap-2 bg-muted/50 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                                <TabsTrigger value="evolucao" className="text-sm">Evolução</TabsTrigger>
                                <TabsTrigger value="matriz" className="text-sm">Matriz Curricular</TabsTrigger>
                                <TabsTrigger value="professores" className="text-sm">Professores</TabsTrigger>
                                <TabsTrigger value="ppc" className="text-sm">PPC</TabsTrigger>
                                <TabsTrigger value="calendario" className="text-sm">Calendário</TabsTrigger>
                                <TabsTrigger value="relatorios" className="text-sm">Relatórios</TabsTrigger>
                                <TabsTrigger value="documentos" className="text-sm">Documentos</TabsTrigger>
                            </TabsList>

                            {/* Conteúdo das Abas */}
                            <TabsContent value="evolucao" className="mt-6"><EvolucaoCursoTab /></TabsContent>
                            <TabsContent value="matriz" className="mt-6"><MatrizCurricularTab /></TabsContent>
                            <TabsContent value="professores" className="mt-6"><ProfessoresTurmasTab /></TabsContent>
                            <TabsContent value="ppc" className="mt-6"><PpcTab /></TabsContent>
                            <TabsContent value="calendario" className="mt-6"><CalendarioTab /></TabsContent>
                            <TabsContent value="relatorios" className="mt-6"><RelatoriosTab /></TabsContent>
                            <TabsContent value="documentos" className="mt-6"><DocumentosTab /></TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>
        </div>
    );
}
