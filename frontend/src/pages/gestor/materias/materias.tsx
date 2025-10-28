// frontend/src/pages/gestor/materias/materias.tsx

"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { BarChart3, GraduationCap, FileText, Video, BookOpen, Info, ClipboardList, Bell } from "lucide-react"
import Relatorios from "./Relatorios"
import NotasAvaliacoes from "./NotasAvaliacoes"
import ProducaoAcademica from "./ProducaoAcademica"
import AulasGravadas from "./AulasGravadas"
import MateriaisDidaticos from "./MateriaisDidaticos"
import InformacoesComplementares from "./InformacoesComplementares"
import PlanoDeEnsino from "./PlanoDeEnsino"
import Avisos from "./Avisos"
import SidebarGestor from '../../gestor/components/Sidebar';
import TopbarGestorAuto from '../components/TopbarGestorAuto';
import { useAuth } from '../../../hooks/useAuth';

export default function PainelAcademico() {

    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuth();

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // --- VARIÁVEIS DE CONTROLE DE UI ---
    const isGestor = currentUser?.role === 'gestor';
    const isPerfilPrincipal = String(currentUser?.id) === id;
    const podeVisualizarInfoPrivada = isPerfilPrincipal || isGestor || currentUser?.role === 'professor';
    const showSidebar = !['responsavel', 'aluno'].includes(currentUser?.role ?? '');
            const navigate = useNavigate();
    

    const [activeTab, setActiveTab] = useState("relatorios")

    return (
        <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden pl-4 ${showSidebar ? 'md:pl-15' : 'md:pl-0'}`}>
            {/* Agora 'navigate' está definida e pode ser passada como prop */}
            {showSidebar && (
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}

            <div className="flex-1 px-4 py-6 pt-16 md:pt-20">
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
                <div className="min-h-screen bg-background">
                    {/* Header */}
                    <header className="border-b bg-card shadow-sm">
                        <div className="container mx-auto px-6 py-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">Painel Acadêmico – Gestor e Professor</h1>
                                    <p className="text-muted-foreground mt-1">Unidade Central • Período: 2024.1</p>
                                </div>
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src="/placeholder.svg?height=48&width=48" />
                                    <AvatarFallback>GP</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="container mx-auto px-6 py-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2 h-auto p-2 bg-muted/50 rounded-2xl">
                                <TabsTrigger value="relatorios" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Relatórios</span>
                                </TabsTrigger>
                                <TabsTrigger value="notas" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <GraduationCap className="h-4 w-4" />
                                    <span className="hidden sm:inline">Notas</span>
                                </TabsTrigger>
                                <TabsTrigger value="producao" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Produção</span>
                                </TabsTrigger>
                                <TabsTrigger value="aulas" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <Video className="h-4 w-4" />
                                    <span className="hidden sm:inline">Aulas</span>
                                </TabsTrigger>
                                <TabsTrigger value="materiais" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Materiais</span>
                                </TabsTrigger>
                                <TabsTrigger value="informacoes" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <Info className="h-4 w-4" />
                                    <span className="hidden sm:inline">Informações</span>
                                </TabsTrigger>
                                <TabsTrigger value="plano" className="flex items-center gap-2 data-[state=active]:bg-background">
                                    <ClipboardList className="h-4 w-4" />
                                    <span className="hidden sm:inline">Plano</span>
                                </TabsTrigger>
                                <TabsTrigger value="avisos" className="flex items-center gap-2 data-[state=active]:bg-background">
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
