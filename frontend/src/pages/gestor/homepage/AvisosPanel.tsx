'use client';

import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, ChevronRight, Megaphone, Users, GraduationCap } from 'lucide-react';

const categoryIcons: any = {
  geral: Megaphone,
  professores: Users,
  alunos: GraduationCap,
};

const categoryColors: any = {
  geral: 'bg-blue-500',
  professores: 'bg-amber-500',
  alunos: 'bg-green-500',
};

// ALTERAÇÃO 1: Atualizado o rótulo de 'Geral' para 'Gestor'
const categoryLabels: any = {
  geral: 'Gestor',
  professores: 'Professores',
  alunos: 'Alunos',
};

interface AvisosPanelProps {
  data: any[];
}

export function AvisosPanel({ data }: AvisosPanelProps) {
  const [filter, setFilter] = useState('todos');

  const safeData = Array.isArray(data) ? data : [];

  const filteredComunicados =
    filter === 'todos'
      ? safeData
      : safeData.filter((c) => c.category === filter);

  const displayedComunicados = filteredComunicados.slice(0, 4);

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="p-5 shadow-lg border-gray-200 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#363776] flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          Avisos e Comunicados
        </h3>

        <div className="flex flex-wrap gap-2">
          {['todos', 'geral', 'professores', 'alunos'].map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'bg-[#363776] hover:bg-[#363776]/90' : ''}
            >
              {/* ALTERAÇÃO 2: Agora usa o mapa de labels para exibir "Gestor" no botão */}
              {cat === 'todos' ? 'Todos' : categoryLabels[cat]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {displayedComunicados.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum aviso encontrado.</p>
        ) : (
            displayedComunicados.map((comunicado) => {
            const CategoryIcon = categoryIcons[comunicado.category] || Megaphone;
            const colorClass = categoryColors[comunicado.category] || 'bg-gray-500';

            return (
                <div
                key={comunicado.id}
                className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-[#363776]/30 transition-all hover:shadow-lg cursor-pointer group"
                >
                <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg ${colorClass} flex-shrink-0`}>
                    <CategoryIcon className="h-4 w-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {/* O Badge já usava categoryLabels, então atualizará automaticamente para "Gestor" */}
                        <span className={`text-xs px-2.5 py-1 rounded-full ${colorClass} text-white font-semibold`}>
                        {categoryLabels[comunicado.category] || 'Gestor'}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                        {formatDate(comunicado.date)}
                        </span>
                    </div>

                    <h4 className="font-bold text-sm text-foreground mb-1 group-hover:text-[#363776] transition-colors">
                        {comunicado.title}
                    </h4>

                    <p className="text-xs text-muted-foreground mb-2">
                        por {comunicado.author}
                    </p>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {comunicado.excerpt}
                    </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#363776] transition-colors flex-shrink-0 mt-1" />
                </div>
                </div>
            );
            })
        )}
      </div>
    </Card>
  );
}