// app/producao-academica/ProducaoAcademica.tsx
"use client"

import { useState, useMemo } from "react"
// Ícones
import { Search, HelpCircle, X, Frown } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Separator } from "../components/ui/separator"
// Componentes locais
import { ActivityCard } from "./components/activity-card"
import { HelpModal } from "./components/help-modal"
import { CreatedActivityItem } from "./components/created-activity-item"
import { ActivityModal } from "./components/ActivityModal" // 1. Importe o novo modal
// Mocks e Tipos
import { ACTIVITY_TYPES, ActivityType } from "../../lib/activity-types" // Importe também o tipo
import { CREATED_ACTIVITIES_MOCK } from "../../lib/created-activities"

export default function ProducaoAcademica() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"used" | "alpha" | "favorites">("used")
  const [showHelpModal, setShowHelpModal] = useState(false)
  
  // 2. Estado para controlar o modal da atividade
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null)

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("favoriteActivities");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  // ... (lógica de filteredActivities, sortedActivities, toggleFavorite permanece a mesma)
  const filteredActivities = useMemo(() => {
    if (!searchQuery) return ACTIVITY_TYPES;
    const query = searchQuery.toLowerCase().trim();
    return ACTIVITY_TYPES.filter(
      (activity) =>
        activity.name.toLowerCase().includes(query) || activity.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const sortedActivities = useMemo(() => {
    const sorted = [...filteredActivities];
    // ... (sua lógica de ordenação)
    return sorted;
  }, [filteredActivities, sortBy, favorites]);

  const toggleFavorite = (id: string) => {
    // ... (sua lógica de favoritar)
  };

  // 3. Função para abrir o modal
  const handleSelectActivity = (activity: ActivityType) => {
    setSelectedActivity(activity)
  }

  // 4. Função para fechar o modal
  const handleCloseModal = () => {
    setSelectedActivity(null)
  }

  return (
    <>
      {/* Seção 1: Adicionar Atividade ou Recurso (sem alterações) */}
      <div className="border-b border-border bg-card p-6">
        {/* ... seu código JSX existente para o cabeçalho e filtros ... */}
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
              <Button variant="outline" size="icon" onClick={() => setShowHelpModal(true)} title="Ajuda">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => window.history.back()} title="Fechar">
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
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
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
                  // 5. Atualize o onSelect para passar o objeto da atividade completo
                  onSelect={() => handleSelectActivity(activity)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ... Separador e Seção 2 (sem alterações) ... */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Separator className="my-8" />
      </div>
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
      
      {/* 6. Renderize o novo modal de atividade */}
      <ActivityModal
        isOpen={!!selectedActivity}
        onClose={handleCloseModal}
        activity={selectedActivity}
      />
    </>
  )
}
