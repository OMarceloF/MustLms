import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { producaoAcademicaService, Atividade } from "../../../services/producaoAcademicaService";
import { Button } from "../components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FileViewer } from "./components/viewers/file-viewer";
import { UrlViewer } from "./components/viewers/url-viewer";
import { QuizBuilder } from "./components/viewers/QuizBuilder";
import { SurveyBuilder } from "./components/viewers/SurveyBuilder";

export default function ActivityDetailsPage() {
    const { cursoId, atividadeId } = useParams<{ cursoId: string; atividadeId: string }>();
    const navigate = useNavigate();
    const [activity, setActivity] = useState<Atividade | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            if (!atividadeId) return;
            try {
                setLoading(true);
                const data = await producaoAcademicaService.obter(Number(atividadeId));
                setActivity(data);
            } catch (error) {
                console.error("Erro ao carregar atividade:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [atividadeId]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Atividade não encontrada</h1>
                <Button onClick={() => navigate(-1)}>Voltar</Button>
            </div>
        );
    }

    const renderViewer = () => {
        switch (activity.tipo) {
            case 'arquivo':
                return <FileViewer activity={activity} config={{
                    arquivo: activity.arquivo || activity.url, // Fallback para url se arquivo não existir
                    display_mode: activity.display_mode,
                    mostrar_descricao: true // Default ou vindo do activity
                }} />;
            case 'url':
                return <UrlViewer activity={activity} config={{
                    url: activity.url,
                    display_mode: activity.display_mode,
                    mostrar_descricao: true, // Default ou vindo do activity
                    parametros: activity.parametros
                }} />;
            case 'questionario':
                return <QuizBuilder
                    activity={activity}
                    config={activity.config || {}}
                    estrutura={activity.estrutura || {}}
                    onUpdate={setActivity}
                />;
            case 'pesquisa':
                return <SurveyBuilder
                    activity={activity}
                    config={activity.config || {}}
                    estrutura={activity.estrutura || {}}
                    onUpdate={setActivity}
                />;
            default:
                return <div>Tipo de atividade não suportado: {activity.tipo}</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{activity.nome}</h1>
                        {activity.descricao && (
                            <p className="text-muted-foreground">{activity.descricao}</p>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    {renderViewer()}
                </div>
            </div>
        </div>
    );
}
