// components/created-activity-item.tsx

import { File, Link, BarChart3, Award, MessageSquare, CheckSquare, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

// Mapeia o tipo de atividade para um ícone
const activityIconMap: { [key: string]: React.ReactNode } = {
  'arquivo': <File className="h-5 w-5 text-purple-500" />,
  'url': <Link className="h-5 w-5 text-blue-500" />,
  'questionario': <BarChart3 className="h-5 w-5 text-green-500" />,
  'pesquisa': <Award className="h-5 w-5 text-orange-500" />,
  'tarefa': <CheckSquare className="h-5 w-5 text-blue-500" />,
  'forum': <MessageSquare className="h-5 w-5 text-orange-500" />,
};

// Mapeia o tipo de atividade para nome em português
const activityNameMap: { [key: string]: string } = {
  'arquivo': 'Arquivo',
  'url': 'URL',
  'questionario': 'Questionário',
  'pesquisa': 'Pesquisa',
  'tarefa': 'Tarefa',
  'forum': 'Fórum',
};

interface Activity {
  id: string;
  type: string;
  name: string;
  description?: string;
  date: string;
  status: string;
}

interface CreatedActivityItemProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onDelete?: (id: string) => void;
  onView?: (activity: Activity) => void;
}

export function CreatedActivityItem({ activity, onEdit, onDelete, onView }: CreatedActivityItemProps) {
  const icon = activityIconMap[activity.type] || <File className="h-5 w-5 text-gray-500" />;
  const typeName = activityNameMap[activity.type] || activity.type;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="flex-shrink-0">{icon}</div>

      <div className="flex-grow">
        <p className="font-semibold text-foreground">{activity.name}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{typeName}</span>
          {activity.date && (
            <>
              <span className="text-gray-300">|</span>
              <span>Criado em: {activity.date}</span>
            </>
          )}
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-4">
        <Badge variant={activity.status === "publicado" ? "default" : "secondary"}>
          {activity.status === "publicado" ? "Publicado" : activity.status}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(activity)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(activity)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta atividade?')) {
                    onDelete(activity.id);
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
