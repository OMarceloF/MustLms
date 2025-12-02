// app/producao-academica/ProducaoAcademica.tsx

"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

// Ícones
import { Search, HelpCircle, X, Frown } from "lucide-react"

// Componentes UI (shadcn/ui)
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"

// Componentes locais da página
import { ActivityCard } from "./components/activity-card"
// import { HelpModal } from "./components/help-modal"
import { CreatedActivityItem } from "./components/created-activity-item"
import { ActivityModal } from "./components/ActivityModal"
import { ActivityViewerModal } from "./components/ActivityViewerModal"

// Mocks e Tipos
import { ACTIVITY_TYPES, ActivityType } from "../../lib/activity-types"
import { producaoAcademicaService, Atividade } from "../../../services/producaoAcademicaService"
import { toast } from "sonner"

type SortByType = "used" | "alpha" | "favorites";

export default function ProducaoAcademica() {
  // --- Estados do Componente ---
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const materiaId = Number(id);

  // Estados de UI
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortByType>("used");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [editingActivity, setEditingActivity] = useState<Atividade | null>(null);
  const [viewingActivityId, setViewingActivityId] = useState<number | null>(null);
  const [viewingActivityName, setViewingActivityName] = useState<string>("");

  // Estados de dados
  const [activities, setActivities] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar atividades da matéria
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await producaoAcademicaService.listarPorMateria(materiaId);
        setActivities(data);
      } catch (error) {
        console.error("Erro ao carregar atividades:", error);
      } finally {
        setLoading(false);
      }
    };

    if (materiaId && !isNaN(materiaId)) {
      fetchActivities();
    }
  }, [materiaId]);

  // Handlers
  const toggleFavorite = (activityId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(activityId)) {
        newFavorites.delete(activityId);
      } else {
        newFavorites.add(activityId);
      }
      return newFavorites;
    });
  };

  const handleSelectActivity = (activity: ActivityType) => {
    setSelectedActivity(activity);
  };

  const handleCloseModal = () => {
    setSelectedActivity(null);
    setEditingActivity(null);
  };

  const handleEdit = (activity: Atividade) => {
    const typeMap: Record<string, string> = {
      arquivo: "file",
      url: "url",
      questionario: "quiz",
      pesquisa: "survey",
      tarefa: "task",
      licao: "lesson",
      pagina: "page",
    };

    const frontendType = typeMap[activity.tipo];
    const activityType = ACTIVITY_TYPES.find((t) => t.id === frontendType);

    if (activityType) {
      setEditingActivity(activity);
      setSelectedActivity(activityType);
    } else {
      toast.error(`Tipo de atividade desconhecido: ${activity.tipo}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await producaoAcademicaService.excluir(id);
      toast.success("Atividade excluída com sucesso!");
      // Recarregar lista
      const data = await producaoAcademicaService.listarPorMateria(materiaId);
      setActivities(data);
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
      toast.error("Erro ao excluir atividade.");
    }
  };

  const handleView = (activity: Atividade) => {
    if (activity.id) {
      setViewingActivityId(activity.id);
      setViewingActivityName(activity.nome);
    }
  };

  const handleActivityCreated = async () => {
    // Recarregar lista de atividades
    try {
      const data = await producaoAcademicaService.listarPorMateria(materiaId);
      setActivities(data);
    } catch (error) {
      console.error("Erro ao recarregar atividades:", error);
    }
    handleCloseModal();
  };

  // Filtrar e ordenar atividades (cards de criação)
  const sortedActivities = useMemo(() => {
    let filtered = ACTIVITY_TYPES.filter(
      (activity) =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case "alpha":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "favorites":
        return filtered.sort((a, b) => {
          const aFav = favorites.has(a.id) ? 1 : 0;
          const bFav = favorites.has(b.id) ? 1 : 0;
          return bFav - aFav;
        });
      case "used":
      default:
        return filtered;
    }
  }, [searchQuery, sortBy, favorites]);

  return (
    <div className="w-full">
      {/* Cabeçalho da seção */}
      <div className="mb-6 flex flex-col gap-4 px-4 pt-2 sm:px-6 lg:px-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
            Adicionar Atividade ou Recurso
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Escolha um tipo de atividade ou recurso para criar um novo item no seu curso.
          </p>
        </div>


      </div>

      {/* Seção 1: Cards de tipos de atividades */}
      <div className="bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          {/* Toolbar responsiva de busca + ordenação */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          </div>

          {/* Grid de Cards para Adicionar */}
          {sortedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center sm:p-12">
              <Frown className="mb-4 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                Nenhuma atividade encontrada
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Tente buscar por outro termo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isFavorite={favorites.has(activity.id)}
                  onToggleFavorite={() => toggleFavorite(activity.id)}
                  onSelect={() => handleSelectActivity(activity)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Separador */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Separator className="my-6 sm:my-8" />
      </div>

      {/* Seção 2: Atividades já criadas no curso */}
      <div className="bg-background px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
            Atividades do Curso
          </h2>

          <div className="flex flex-col gap-4">
            {loading ? (
              <p className="text-sm text-muted-foreground sm:text-base">
                Carregando atividades...
              </p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-muted-foreground sm:text-base">
                Nenhuma atividade criada neste curso ainda.
              </p>
            ) : (
              activities.map((activity) => (
                <CreatedActivityItem
                  key={activity.id}
                  activity={{
                    id: String(activity.id),
                    type: activity.tipo,
                    name: activity.nome,
                    description: activity.descricao,
                    date: activity.criado_em
                      ? new Date(activity.criado_em).toLocaleDateString()
                      : "",
                    status: "Publicado", // Backend não retorna status ainda, assumindo publicado
                  }}
                  onEdit={() => handleEdit(activity)}
                  onDelete={() => activity.id && handleDelete(activity.id)}
                  onView={() => handleView(activity)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modais */}

      {selectedActivity && (
        <ActivityModal
          key={editingActivity?.id ?? "new"}
          isOpen={!!selectedActivity}
          onClose={handleCloseModal}
          activityId={editingActivity?.id}
          activityType={selectedActivity.id}
          onSuccess={handleActivityCreated}
          materiaId={materiaId}
        />
      )}

      {viewingActivityId !== null && (
        <ActivityViewerModal
          key={viewingActivityId} // força remount a cada atividade
          isOpen={true} // se está montado, está aberto
          onClose={() => setViewingActivityId(null)}
          activityId={viewingActivityId}
          activityName={viewingActivityName}
        />
      )}
    </div>
  )
}
