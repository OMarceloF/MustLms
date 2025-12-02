"use client"

import { Star, ArrowRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import type { ActivityType } from "../../../lib/activity-types"
import { cn } from "../../../lib/utils"

interface ActivityCardProps {
  activity: ActivityType
  isFavorite: boolean
  onToggleFavorite: () => void
  onSelect: () => void
}

export function ActivityCard({ activity, isFavorite, onToggleFavorite, onSelect }: ActivityCardProps) {
  // Get color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "content":
        return "text-blue-600 dark:text-blue-400"
      case "communication":
        return "text-green-600 dark:text-green-400"
      case "assessment":
        return "text-pink-600 dark:text-pink-400"
      case "interoperability":
        return "text-orange-600 dark:text-orange-400"
      default:
        return "text-foreground"
    }
  }

  const getCategoryBg = (category: string) => {
    switch (category) {
      case "content":
        return "bg-blue-50 dark:bg-blue-950/30"
      case "communication":
        return "bg-green-50 dark:bg-green-950/30"
      case "assessment":
        return "bg-pink-50 dark:bg-pink-950/30"
      case "interoperability":
        return "bg-orange-50 dark:bg-orange-950/30"
      default:
        return "bg-card"
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-lg border border-border shadow-sm transition-all duration-200 hover:shadow-md",
        getCategoryBg(activity.category),
      )}
    >
      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {/* Icon and Text */}
        <div className="flex items-start gap-4">
          <div className={cn("rounded-lg p-3", getCategoryBg(activity.category))}>
            <activity.icon className={cn("h-6 w-6", getCategoryColor(activity.category))} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold leading-tight text-foreground">{activity.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {activity.category === "content"
              ? "Conteúdo"
              : activity.category === "communication"
                ? "Comunicação"
                : activity.category === "assessment"
                  ? "Avaliação"
                  : "Interoperabilidade"}
          </span>
          <Button variant="ghost" size="sm" onClick={onSelect} className="gap-2">
            Adicionar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
