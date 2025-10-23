// src/pages/gestor/cursos/CursosPage.tsx

"use client"

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Removido 'Link' que não estava sendo usado

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
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // <<-- ESSA LINHA ESTAVA FALTANDO
    const { user: currentUser } = useAuth();

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // --- VARIÁVEIS DE CONTROLE DE UI ---
    const isGestor = currentUser?.role === 'gestor';
    const isPerfilPrincipal = String(currentUser?.id) === id;
    const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
    const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');
    const showSidebarAluno = currentUser?.role === 'aluno';

    return (
        <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden pl-4 ${showSidebar || showSidebarAluno ? 'md:pl-15' : 'md:pl-0'}`}>
            {/* Agora 'navigate' está definida e pode ser passada como prop */}
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

            <div className="flex-1 px-4 py-6 pt-16 md:pt-20">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
                <div className="min-h-screen bg-background">
                    <div className="mx-auto max-w-7xl p-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">Configurações do Curso</h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Gerencie as informações e parâmetros do programa de pós-graduação
                            </p>
                        </div>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="matriz" className="w-full">
                            <TabsList className="mb-8 grid w-full grid-cols-2 gap-4 bg-transparent md:flex md:w-auto md:gap-2">
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

                            {/* As TabsContent permanecem as mesmas */}
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
                                <PpcTab />
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
