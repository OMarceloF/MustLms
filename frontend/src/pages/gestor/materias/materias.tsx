"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
    BarChart3,
    FileText,
    Video,
    BookOpen,
    Info,
    ClipboardList,
    Bell,
    Users,
} from "lucide-react"

import Relatorios from "./Relatorios"
import ProducaoAcademica from "./ProducaoAcademica"
import AulasGravadas from "./AulasGravadas"
import MateriaisDidaticos from "./MateriaisDidaticos"
import InformacoesComplementares from "./InformacoesComplementares"
import PlanoDeEnsino from "./PlanoDeEnsino"
import Avisos from "./Avisos"
import { VinculadosTab } from "./Vinculados"
import SidebarGestor from "../../gestor/components/Sidebar"
import TopbarGestorAuto from "../components/TopbarGestorAuto"
import { useAuth } from "../../../hooks/useAuth"

// Interface para o período letivo
interface PeriodoLetivo {
    id: number
    nome: string
}

export default function PainelAcademico() {
    const { id } = useParams<{ id: string }>()
    const { user: currentUser } = useAuth()
    const navigate = useNavigate()

    // --- ESTADOS ---
    const [sidebarAberta, setSidebarAberta] = useState(false)
    const [activeTab, setActiveTab] = useState("avisos")
    const [periodoAtual, setPeriodoAtual] = useState<PeriodoLetivo | null>(null)

    // --- EFEITO PARA BUSCAR O PERÍODO ATUAL ---
    useEffect(() => {
        const fetchPeriodoAtual = async () => {
            try {
                const response = await axios.get("/api/periodos-letivos/atual")
                setPeriodoAtual(response.data)
            } catch (error) {
                console.error("Não foi possível buscar o período letivo atual:", error)
                // Se quiser, pode habilitar feedback:
                // toast.info("Nenhum período letivo ativo no momento.")
            }
        }

        fetchPeriodoAtual()
    }, [])

    // --- LÓGICA DE PERFIL / VISIBILIDADE ---
    const isGestor = currentUser?.role === "gestor"
    const isPerfilPrincipal = String(currentUser?.id) === id
    const podeVisualizarInfoPrivada =
        isPerfilPrincipal || isGestor || currentUser?.role === "professor"
    const showSidebar = !["responsavel", "aluno"].includes(currentUser?.role ?? "")

    // Bloqueio de scroll ao abrir sidebar em telas pequenas
    useEffect(() => {
        if (sidebarAberta && window.innerWidth < 768) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [sidebarAberta])

    return (
        <div className="dashboard-container flex min-h-screen w-full bg-background overflow-x-hidden">
            {/* SIDEBAR (desktop e overlay em mobile, quem controla é o próprio componente) */}
            {showSidebar && (
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate("/gestor", { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <div
                className={`flex min-h-screen flex-1 flex-col pt-16 md:pt-20 ${showSidebar ? "md:pl-15" : "pl-0"
                    }`}
            >
                {/* TOPBAR FIXA NO TOPO (offset com pt-16/pt-20 acima) */}
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

                {/* WRAPPER DO CONTEÚDO */}
                <div className="flex-1">
                    {/* Header */}
                    <header className="border-b bg-card shadow-sm">
                        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
                                        Painel Acadêmico
                                    </h1>
                                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm md:text-base">
                                        Unidade Central • Período:{" "}
                                        <span className="font-medium">
                                            {periodoAtual ? periodoAtual.nome : "Não definido"}
                                        </span>
                                    </p>
                                </div>

                                {/* Espaço reservado para ações futuras (botões, filtros, etc.) */}
                                {/* Exemplo: */}
                                {/* <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline">Exportar</Button>
                </div> */}
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            {/* LISTA DE ABAS - RESPONSIVA */}
                            <TabsList className="flex h-auto flex-wrap justify-center gap-2 rounded-lg bg-muted/50 p-2 lg:flex-nowrap lg:justify-start">
                                <TabsTrigger
                                    value="relatorios"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="hidden sm:inline">Relatórios</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="producao"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Atividades</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="aulas"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <Video className="h-4 w-4" />
                                    <span className="hidden sm:inline">Aulas</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="materiais"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Materiais</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="informacoes"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <Info className="h-4 w-4" />
                                    <span className="hidden sm:inline">Informações</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="plano"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    <span className="hidden sm:inline">Plano</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="vinculados"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <Users className="h-4 w-4" />
                                    <span className="hidden sm:inline">Vinculados</span>
                                </TabsTrigger>

                                <TabsTrigger
                                    value="avisos"
                                    className="flex flex-1 items-center justify-center gap-2 text-xs sm:text-sm data-[state=active]:bg-background sm:flex-none"
                                >
                                    <Bell className="h-4 w-4" />
                                    <span className="hidden sm:inline">Avisos</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* CONTEÚDO DAS ABAS */}
                            <div className="mt-6 sm:mt-8">
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
                                    <div className="rounded-lg border bg-card/40 p-6 text-center text-sm text-muted-foreground sm:p-8 sm:text-base">
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
