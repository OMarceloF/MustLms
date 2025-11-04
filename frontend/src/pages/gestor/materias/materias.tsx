// frontend/src/pages/gestor/materias/materias.tsx

"use client"

import React, { useState } from "react"; // Adicionado React para o useEffect
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
// Ícones...
import { BarChart3, GraduationCap, FileText, Video, BookOpen, Info, ClipboardList, Bell } from "lucide-react"
// Componentes das abas...
import Relatorios from "./Relatorios"
import NotasAvaliacoes from "./NotasAvaliacoes"
import ProducaoAcademica from "./ProducaoAcademica"
import AulasGravadas from "./AulasGravadas"
import MateriaisDidaticos from "./MateriaisDidaticos"
import InformacoesComplementares from "./InformacoesComplementares"
import PlanoDeEnsino from "./PlanoDeEnsino"
import Avisos from "./Avisos"
// Componentes de layout
import SidebarGestor from '../../gestor/components/Sidebar';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { useAuth } from '../../../hooks/useAuth';

export default function PainelAcademico() {

    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const [activeTab, setActiveTab] = useState("relatorios");

    // --- VARIÁVEIS DE CONTROLE DE UI ---
    const isGestor = currentUser?.role === 'gestor';
    const isPerfilPrincipal = String(currentUser?.id) === id;
    const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
    const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');

    // Efeito para controle de scroll no mobile (boa prática)
    React.useEffect(() => {
        if (sidebarAberta && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [sidebarAberta]);

    return (
        <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden ${showSidebar ? 'md:pl-15' : 'pl-0'}`}>
            {showSidebar && (
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}

            <div className="flex-1 px-2 py-6 pt-16 md:px-4 md:pt-20">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <header className="border-b bg-card shadow-sm">
                        {/* Padding ajustado para mobile */}
                        <div className="container mx-auto px-4 py-6 md:px-6">
                            {/* Layout flexível com quebra de linha para o header em telas pequenas */}
                            <div className="flex flex-wrap items-center justify-between gap-y-2">
                                <div>
                                    {/* Tamanho da fonte ajustado para mobile */}
                                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">Painel Acadêmico</h1>
                                    <p className="text-muted-foreground mt-1 text-sm md:text-base">Unidade Central • Período: 2024.1</p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-8 md:px-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            {/*
                                --- CORREÇÃO PRINCIPAL PARA RESPONSIVIDADE ---
                                - Substituímos 'grid' por 'flex flex-wrap' para permitir que os botões quebrem a linha.
                                - 'lg:flex-nowrap' garante que em telas grandes o layout volte a ser uma linha única.
                                - 'justify-center lg:justify-start' centraliza os botões no mobile para um visual mais agradável e alinha à esquerda no desktop.
                                - 'h-auto' permite que a altura do container cresça conforme os itens quebram a linha.
                            */}
                            <TabsList className="flex h-auto flex-wrap justify-center gap-2 rounded-lg bg-muted/50 p-2 lg:flex-nowrap lg:justify-start">
                                <TabsTrigger value="relatorios" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Relatórios</span>
                                </TabsTrigger>
                                <TabsTrigger value="notas" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <GraduationCap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Notas</span>
                                </TabsTrigger>
                                <TabsTrigger value="producao" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Produção</span>
                                </TabsTrigger>
                                <TabsTrigger value="aulas" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <Video className="h-4 w-4" />
                                    <span className="hidden sm:inline">Aulas</span>
                                </TabsTrigger>
                                <TabsTrigger value="materiais" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Materiais</span>
                                </TabsTrigger>
                                <TabsTrigger value="informacoes" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <Info className="h-4 w-4" />
                                    <span className="hidden sm:inline">Informações</span>
                                </TabsTrigger>
                                <TabsTrigger value="plano" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <ClipboardList className="h-4 w-4" />
                                    <span className="hidden sm:inline">Plano</span>
                                </TabsTrigger>
                                <TabsTrigger value="avisos" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <Bell className="h-4 w-4" />
                                    <span className="hidden sm:inline">Avisos</span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-8">
                                <TabsContent value="relatorios" className="mt-0">
                                    <Relatorios />
                                </TabsContent>
                                <TabsContent value="notas" className="mt-0">
                                    <NotasAvaliacoes />
                                </TabsContent>
                                <TabsContent value="producao" className="mt-0">
                                    <ProducaoAcademica />
                                </TabsContent>
                                <TabsContent value="aulas" className="mt-0">
                                    <AulasGravadas />
                                </TabsContent>
                                <TabsContent value="materiais" className="mt-0">
                                    <MateriaisDidaticos />
                                </TabsContent>
                                <TabsContent value="informacoes" className="mt-0">
                                    <InformacoesComplementares />
                                </TabsContent>
                                <TabsContent value="plano" className="mt-0">
                                    <PlanoDeEnsino />
                                </TabsContent>
                                <TabsContent value="avisos" className="mt-0">
                                    <Avisos />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </main>
                </div>
            </div>
        </div>
    )
}
