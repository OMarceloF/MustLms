"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ActivityForm } from "./components/ActivityForm";
import { producaoAcademicaService, Atividade } from "../../../services/producaoAcademicaService";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { ACTIVITY_TYPES } from "../../lib/activity-types";
import SidebarGestor from "../components/Sidebar";
import TopbarGestorAuto from "../components/TopbarGestorAuto";
import { useAuth } from "../../../hooks/useAuth";

export default function ActivityEditorPage() {
    const { materiaId, atividadeId } = useParams<{ materiaId: string; atividadeId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [activityData, setActivityData] = useState<Atividade | null>(null);
    const [activityType, setActivityType] = useState<string | null>(null);
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // Se for criação, o tipo vem pela URL (query param ?type=...)
    // Se for edição, o tipo vem do backend
    const typeFromQuery = searchParams.get("type");

    const showSidebar = !["responsavel", "aluno"].includes(currentUser?.role ?? "");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                if (atividadeId) {
                    // Edição: carregar dados da atividade
                    const data = await producaoAcademicaService.obter(Number(atividadeId));

                    // O backend retorna { atividade: {...}, config: {...}, estrutura: {...} }
                    // Precisamos combinar isso para o ActivityForm que espera um objeto plano (ou quase)
                    const combinedData = {
                        ...data.atividade,
                        config: data.config,
                        estrutura: data.estrutura
                    };

                    setActivityData(combinedData);

                    // Mapear tipo do backend para o tipo do frontend
                    const typeMap: Record<string, string> = {
                        arquivo: "file",
                        url: "url",
                        questionario: "quiz",
                        pesquisa: "survey",
                        tarefa: "task",
                        licao: "lesson",
                        pagina: "page",
                    };
                    // data.atividade.tipo
                    const backendType = data.atividade?.tipo || data.tipo;
                    setActivityType(typeMap[backendType] || backendType);

                } else if (typeFromQuery) {
                    // Criação: usar tipo da query
                    setActivityType(typeFromQuery);
                } else {
                    // Erro: nem ID nem tipo
                    console.error("Tipo de atividade não especificado para criação.");
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [atividadeId, typeFromQuery]);

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

    const handleSuccess = () => {
        navigate(-1); // Voltar para a lista
    };

    const handleCancel = () => {
        navigate(-1); // Voltar para a lista
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activityType) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Tipo de atividade inválido ou não encontrado.</h1>
                <Button onClick={() => navigate(-1)}>Voltar</Button>
            </div>
        );
    }

    const activityTitle = ACTIVITY_TYPES.find(t => t.id === activityType)?.name || "Atividade";

    return (
        <div className="dashboard-container flex min-h-screen w-full bg-background overflow-x-hidden">
            {/* SIDEBAR */}
            {showSidebar && (
                <SidebarGestor
                    isMenuOpen={sidebarAberta}
                    setActivePage={(page) => navigate("/gestor", { state: { activePage: page } })}
                    handleMouseEnter={() => setSidebarAberta(true)}
                    handleMouseLeave={() => setSidebarAberta(false)}
                />
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <div className={`flex min-h-screen flex-1 flex-col pt-16 md:pt-20 ${showSidebar ? "md:pl-15" : "pl-0"}`}>
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

                <div className="flex-1 p-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-6 flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={handleCancel}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {atividadeId ? `Editar ${activityTitle}` : `Adicionar ${activityTitle}`}
                                </h1>
                                <p className="text-muted-foreground">
                                    {atividadeId ? "Atualize os detalhes da atividade." : "Preencha os dados para criar uma nova atividade."}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <ActivityForm
                                activityType={activityType}
                                initialData={activityData}
                                materiaId={Number(materiaId)}
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
