// app/producao-academica/ProducaoAcademica.tsx

"use client"

import { useState, useMemo, useEffect } from "react"
// Ícones
import { Search, HelpCircle, X, Frown } from "lucide-react"
// Componentes UI (shadcn/ui)
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
// Componentes locais da página
import { ActivityCard } from "./components/activity-card"
import { HelpModal } from "./components/help-modal"
import { CreatedActivityItem } from "./components/created-activity-item"
import { ActivityModal } from "./components/ActivityModal"
// Mocks e Tipos
import { ACTIVITY_TYPES, ActivityType } from "../../lib/activity-types"
import { CREATED_ACTIVITIES_MOCK } from "../../lib/created-activities"

type SortByType = "used" | "alpha" | "favorites";

export default function ProducaoAcademica() {
  // --- Estados do Componente ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortByType>("used");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  
  // Estado para gerenciar os favoritos, inicializado a partir do localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("favoriteActivities");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  // Efeito para salvar os favoritos no localStorage sempre que eles mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("favoriteActivities", JSON.stringify(Array.from(favorites)));
    }
  }, [favorites]);

  // --- Lógica de Manipulação de Dados ---

  // Filtra as atividades com base na busca do usuário
  const filteredActivities = useMemo(() => {
    if (!searchQuery) return ACTIVITY_TYPES;
    const query = searchQuery.toLowerCase().trim();
    return ACTIVITY_TYPES.filter(
      (activity) =>
        activity.name.toLowerCase().includes(query) || activity.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Ordena as atividades filtradas com base no critério selecionado
  const sortedActivities = useMemo(() => {
    const sorted = [...filteredActivities];
    switch (sortBy) {
      case "alpha":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "favorites":
        return sorted.sort((a, b) => {
          const aIsFav = favorites.has(a.id);
          const bIsFav = favorites.has(b.id);
          if (aIsFav === bIsFav) return 0;
          return aIsFav ? -1 : 1;
        });
      case "used": // "Mais usados" (ordem padrão do mock)
      default:
        return sorted;
    }
  }, [filteredActivities, sortBy, favorites]);

  // Adiciona ou remove uma atividade dos favoritos
  const toggleFavorite = (id: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // --- Funções de Controle do Modal ---

  // Abre o modal com a atividade selecionada
  const handleSelectActivity = (activity: ActivityType) => {
    setSelectedActivity(activity);
  };

  // Fecha o modal
  const handleCloseModal = () => {
    setSelectedActivity(null);
  };

  // --- Renderização do Componente ---
  return (
    <>
      {/* Seção 1: Adicionar Atividade ou Recurso */}
      <div className="border-b border-border bg-card p-6">
        <div className="mx-auto max-w-7xl">
          {/* Cabeçalho da seção */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">Adicionar Atividade ou Recurso</h1>
              <p className="mt-2 text-base text-muted-foreground">
                Escolha um tipo de atividade ou recurso para criar um novo item no seu curso.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setShowHelpModal(true)} aria-label="Ajuda">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.history.back()} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar atividade ou recurso…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: SortByType) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="used">Mais usados</SelectItem>
                <SelectItem value="alpha">Ordem alfabética</SelectItem>
                <SelectItem value="favorites">Favoritos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid de Cards para Adicionar */}
      <div className="bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {sortedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
              <Frown className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Nenhuma atividade encontrada</h2>
              <p className="mt-2 text-muted-foreground">Tente buscar por outro termo.</p>
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
        <Separator className="my-8" />
      </div>

      {/* Seção 2: Atividades já criadas no curso */}
      <div className="bg-background px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Atividades do Curso</h2>
          <div className="flex flex-col gap-4">
            {CREATED_ACTIVITIES_MOCK.map((activity) => (
              <CreatedActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>

      {/* Modais */}
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      
      <ActivityModal
        isOpen={!!selectedActivity}
        onClose={handleCloseModal}
        activity={selectedActivity}
      />
    </>
  )
}
