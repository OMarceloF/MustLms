import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { producaoAcademicaService, Atividade } from "../../../services/producaoAcademicaService";
import { Button } from "../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FileViewer } from "./components/viewers/file-viewer";
import { UrlViewer } from "./components/viewers/url-viewer";
import { QuizBuilder } from "./components/viewers/QuizBuilder";
import { SurveyBuilder } from "./components/viewers/SurveyBuilder";
import SidebarGestor from "../components/Sidebar";
import TopbarGestorAuto from "../components/TopbarGestorAuto";
import { useAuth } from "../../../hooks/useAuth";

export default function ActivityDetailsPage() {
    const { materiaId, atividadeId } = useParams<{ materiaId: string; atividadeId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [activityData, setActivityData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarAberta, setSidebarAberta] = useState(false);

    const showSidebar = !["responsavel", "aluno"].includes(currentUser?.role ?? "");

    useEffect(() => {
        const fetchActivity = async () => {
            if (!atividadeId) return;
            try {
                setLoading(true);
                const data = await producaoAcademicaService.obter(Number(atividadeId));
                setActivityData(data);
            } catch (error) {
                console.error("Erro ao carregar atividade:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [atividadeId]);

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

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activityData || !activityData.atividade) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Atividade não encontrada</h1>
                <Button onClick={() => navigate(-1)}>Voltar</Button>
            </div>
        );
    }

    const { atividade, config, estrutura } = activityData;

    const renderViewer = () => {
        switch (atividade.tipo) {
            case 'arquivo':
                return <FileViewer activity={atividade} config={config} />;
            case 'url':
                return <UrlViewer activity={atividade} config={config} />;
            case 'questionario':
                return <QuizBuilder
                    activity={atividade}
                    config={config || {}}
                    estrutura={estrutura || {}}
                    onUpdate={(updatedData: any) => {
                        // Atualizar estado local se necessário, ou refetch
                        setActivityData((prev: any) => ({
                            ...prev,
                            config: updatedData.config || prev.config,
                            estrutura: updatedData.estrutura || prev.estrutura
                        }));
                    }}
                />;
            case 'pesquisa':
                return <SurveyBuilder
                    activity={atividade}
                    config={config || {}}
                    estrutura={estrutura || {}}
                    onUpdate={(updatedData: any) => {
                        setActivityData((prev: any) => ({
                            ...prev,
                            config: updatedData.config || prev.config,
                            estrutura: updatedData.estrutura || prev.estrutura
                        }));
                    }}
                />;
            default:
                return <div>Tipo de atividade não suportado: {atividade.tipo}</div>;
        }
    };

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
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-6 flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">{atividade.nome}</h1>
                                {atividade.descricao && (
                                    <p className="text-muted-foreground">{atividade.descricao}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            {renderViewer()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
