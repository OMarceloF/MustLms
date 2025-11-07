// components/created-activity-item.tsx

import { File, MessageSquare, CheckSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { CreatedActivity } from "../../../lib/created-activities"; // Ajuste o caminho se necessário

// Mapeia o tipo de atividade para um ícone
const activityIconMap: { [key: string]: React.ReactNode } = {
  Tarefa: <CheckSquare className="h-5 w-5 text-blue-500" />,
  Questionário: <CheckSquare className="h-5 w-5 text-green-500" />,
  Fórum: <MessageSquare className="h-5 w-5 text-orange-500" />,
  Arquivo: <File className="h-5 w-5 text-purple-500" />,
};

interface CreatedActivityItemProps {
  activity: CreatedActivity;
}

export function CreatedActivityItem({ activity }: CreatedActivityItemProps) {
  const icon = activityIconMap[activity.type] || <File className="h-5 w-5 text-gray-500" />;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex-shrink-0">{icon}</div>
      
      <div className="flex-grow">
        <p className="font-semibold text-foreground">{activity.title}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{activity.type}</span>
          {activity.dueDate && (
            <>
              <span className="text-gray-300">|</span>
              <span>Entrega: {activity.dueDate}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-4">
        {activity.submissions !== undefined && (
          <div className="text-center">
            <p className="font-bold text-lg">{activity.submissions}</p>
            <p className="text-xs text-muted-foreground">Envios</p>
          </div>
        )}
        
        <Badge variant={activity.status === "Publicado" ? "default" : "secondary"}>
          {activity.status}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
