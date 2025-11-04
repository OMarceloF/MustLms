// frontend/src/pages/gestor/cursos/CursosPage.tsx

"use client"

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Importações dos seus componentes
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MatrizCurricularTab } from './matriz-curricular-tab'
import { VinculadosTab } from "./vinculados-tab";
import { RelatoriosTab } from "./relatorios-tab";
import { PpcTab } from "./ppc-tab";
import { CalendarioTab } from "./calendario-tab";
import SidebarGestor from '../../gestor/components/Sidebar';
import SidebarAluno from '../../aluno/components/sidebaraluno';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { useAuth } from '../../../hooks/useAuth';

export default function CursoConfigPage() {
    // --- HOOKS ---
    const { id: cursoId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // --- VARIÁVEIS DE CONTROLE DE UI ---
    const isGestor = currentUser?.role === 'gestor';
    const isPerfilPrincipal = String(currentUser?.id) === cursoId;
    const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
    const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');
    const showSidebarAluno = currentUser?.role === 'aluno';

    // --- AJUSTE RESPONSIVO ---
    // Adiciona uma classe ao body para controlar o scroll quando o menu estiver aberto em mobile
    // Isso evita que a página role por baixo do menu
    React.useEffect(() => {
        if (sidebarAberta && window.innerWidth < 768) { // 768px é o breakpoint 'md' do Tailwind
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        // Cleanup function para garantir que o estilo seja removido ao desmontar o componente
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [sidebarAberta]);


    return (
        // O padding lateral foi ajustado para telas pequenas (pl-0) e médias (md:pl-15)
        <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden ${showSidebar || showSidebarAluno ? 'md:pl-15' : 'pl-0'}`}>
            {showSidebar && (
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}
            {showSidebarAluno && (
                <SidebarAluno
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate(`/aluno/${page}`)}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}

            {/* Padding ajustado para mobile (px-2 ou px-4) e desktop (md:px-4) */}
            <div className="flex-1 px-4 py-6 pt-16 md:px-4 md:pt-20">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
                <div className="min-h-screen bg-background">
                    {/* Padding ajustado para mobile (p-2 ou p-4) e desktop (md:p-8) */}
                    <div className="mx-auto max-w-7xl p-4 md:p-8">
                        {/* Header */}
                        <div className="mb-8">
                            {/* Tamanho da fonte ajustado para mobile (text-3xl) e desktop (md:text-4xl) */}
                            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Configurações do Curso</h1>
                            {/* Tamanho da fonte ajustado para mobile (text-base) e desktop (md:text-lg) */}
                            <p className="mt-2 text-base text-muted-foreground md:text-lg">
                                Gerencie as informações e parâmetros do programa de pós-graduação
                            </p>
                        </div>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="matriz" className="w-full">
                            {/*
                                --- PRINCIPAL MUDANÇA PARA RESPONSIVIDADE ---
                                - Em telas pequenas (mobile), as abas são exibidas em uma única coluna (grid-cols-1).
                                - Em telas 'sm' (a partir de 640px), mudamos para duas colunas (sm:grid-cols-2).
                                - Em telas 'md' (a partir de 768px), voltamos ao layout flexível de desktop (md:flex).
                                - Isso garante que em telas muito estreitas (390px, 430px), as abas não quebrem ou fiquem espremidas.
                            */}
                            <TabsList className="mb-8 flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0 md:flex-nowrap md:w-auto">
                                <TabsTrigger
                                    value="matriz"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Matriz Curricular
                                </TabsTrigger>
                                <TabsTrigger
                                    value="vinculados"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Vinculados
                                </TabsTrigger>
                                <TabsTrigger
                                    value="relatorios"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Relatórios Acadêmicos
                                </TabsTrigger>
                                <TabsTrigger
                                    value="ppc"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    PPC
                                </TabsTrigger>
                                <TabsTrigger
                                    value="calendario"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    Calendário Acadêmico
                                </TabsTrigger>
                            </TabsList>

                            {/* Conteúdo das Abas */}
                            <TabsContent value="matriz" className="mt-0">
                                <MatrizCurricularTab />
                            </TabsContent>
                            <TabsContent value="vinculados" className="mt-0">
                                <VinculadosTab />
                            </TabsContent>
                            <TabsContent value="relatorios" className="mt-0">
                                <RelatoriosTab />
                            </TabsContent>
                            <TabsContent value="ppc" className="mt-0">
                                <PpcTab cursoId={cursoId} />
                            </TabsContent>
                            <TabsContent value="calendario" className="mt-0">
                                <CalendarioTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
