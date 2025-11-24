"use client"

import React, { useState, useEffect } from "react"; // Adicionado useEffect
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Adicionado axios
import { toast } from "sonner"; // Adicionado sonner para feedback de erro

// ... (outros imports)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart3, FileText, Video, BookOpen, Info, ClipboardList, Bell, Users } from "lucide-react";
import Relatorios from "./Relatorios";
import ProducaoAcademica from "./ProducaoAcademica";
import AulasGravadas from "./AulasGravadas";
import MateriaisDidaticos from "./MateriaisDidaticos";
import InformacoesComplementares from "./InformacoesComplementares";
import PlanoDeEnsino from "./PlanoDeEnsino";
import Avisos from "./Avisos";
import { VinculadosTab } from "./Vinculados";
import SidebarGestor from '../../gestor/components/Sidebar';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { useAuth } from '../../../hooks/useAuth';

// Nova interface para o período
interface PeriodoLetivo {
    id: number;
    nome: string;
}

export default function PainelAcademico() {

    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const [activeTab, setActiveTab] = useState("avisos"); // Mudei para 'avisos' para testar
    const [periodoAtual, setPeriodoAtual] = useState<PeriodoLetivo | null>(null); // <-- NOVO ESTADO

    // --- EFEITO PARA BUSCAR O PERÍODO ATUAL ---
    useEffect(() => {
        const fetchPeriodoAtual = async () => {
            try {
                const response = await axios.get('/api/periodos-letivos/atual');
                setPeriodoAtual(response.data);
            } catch (error) {
                console.error("Não foi possível buscar o período letivo atual:", error);
                // Opcional: mostrar um toast se não encontrar
                // toast.info("Nenhum período letivo ativo no momento.");
            }
        };

        fetchPeriodoAtual();
    }, []); // Executa apenas uma vez, quando o componente monta

    // ... (resto do seu componente, como as variáveis de UI e o outro useEffect)
    const isGestor = currentUser?.role === 'gestor';
    const isPerfilPrincipal = String(currentUser?.id) === id;
    const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
    const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');

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
                        <div className="container mx-auto px-4 py-6 md:px-6">
                            <div className="flex flex-wrap items-center justify-between gap-y-2">
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">Painel Acadêmico</h1>
                                    {/* AQUI ESTÁ A MUDANÇA */}
                                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                                        Unidade Central • Período: {periodoAtual ? periodoAtual.nome : 'Não definido'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-8 md:px-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="flex h-auto flex-wrap justify-center gap-2 rounded-lg bg-muted/50 p-2 lg:flex-nowrap lg:justify-start">
                                {/* ... Seus TabsTriggers ... */}
                                <TabsTrigger value="relatorios" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Relatórios</span>
                                </TabsTrigger>
                                <TabsTrigger value="producao" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Atividades</span>
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
                                <TabsTrigger value="vinculados" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <Users className="h-4 w-4" />
                                    <span className="hidden sm:inline">Vinculados</span>
                                </TabsTrigger>
                                <TabsTrigger value="avisos" className="flex flex-1 items-center justify-center gap-2 data-[state=active]:bg-background sm:flex-none">
                                    <Bell className="h-4 w-4" />
                                    <span className="hidden sm:inline">Avisos</span>
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-8">
                                {id ? (
                                    <>
                                        <TabsContent value="relatorios" className="mt-0">
                                            <Relatorios />
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
                                            <InformacoesComplementares disciplinaId={id} />
                                        </TabsContent>
                                        <TabsContent value="plano" className="mt-0">
                                            <PlanoDeEnsino disciplinaId={id} />
                                        </TabsContent>
                                        <TabsContent value="vinculados" className="mt-0">
                                            <VinculadosTab />
                                        </TabsContent>
                                        <TabsContent value="avisos" className="mt-0">
                                            <Avisos disciplinaId={id} />
                                        </TabsContent>
                                    </>
                                ) : (
                                    <div className="text-center p-8 text-muted-foreground">
                                        <p>Selecione uma disciplina para ver os detalhes.</p>
                                    </div>
                                )}
                            </div>
                        </Tabs>
                    </main>
                </div>
            </div>
        </div>
    )
}
