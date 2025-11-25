'use client';

import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Bell,
  ChevronRight,
  AlertCircle,
  Megaphone,
  Users,
  GraduationCap,
} from 'lucide-react';
import { comunicados } from '../../lib/mock-data';

// -------------------------
// 🔒 TIPOS FORTES CORRIGIDOS
// -------------------------

type Category = 'geral' | 'segmento' | 'professores' | 'alunos';

type CategoryFilter = 'todos' | Category;

// -------------------------
// 🔧 MAPAS COM TYPING CORRETO
// -------------------------

const categoryIcons: Record<Category, any> = {
  geral: Megaphone,
  segmento: AlertCircle,
  professores: Users,
  alunos: GraduationCap,
};

const categoryColors: Record<Category, string> = {
  geral: 'bg-blue-500',
  segmento: 'bg-purple-500',
  professores: 'bg-amber-500',
  alunos: 'bg-green-500',
};

const categoryLabels: Record<Category, string> = {
  geral: 'Geral',
  segmento: 'Segmento',
  professores: 'Professores',
  alunos: 'Alunos',
};

// -------------------------
// COMPONENTE PRINCIPAL
// -------------------------

export function AvisosPanel() {
  const [filter, setFilter] = useState<CategoryFilter>('todos');

  const filteredComunicados =
    filter === 'todos'
      ? comunicados
      : comunicados.filter((c) => c.category === filter);

  const displayedComunicados = filteredComunicados.slice(0, 4);

  const formatDate = (date: Date) => {
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
      {/* Título e Filtros */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#363776] flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5" />
          Avisos e Comunicados
        </h3>

        <div className="flex flex-wrap gap-2">
          {/* Botões de filtro */}
          {(['todos', 'geral', 'segmento', 'professores', 'alunos'] as CategoryFilter[]).map(
            (cat) => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(cat)}
                className={
                  filter === cat ? 'bg-[#363776] hover:bg-[#363776]/90' : ''
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* Lista de Comunicados */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {displayedComunicados.map((comunicado) => {
          const CategoryIcon = categoryIcons[comunicado.category];

          return (
            <div
              key={comunicado.id}
              className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-[#363776]/30 transition-all hover:shadow-lg cursor-pointer group"
            >
              <div className="flex items-start gap-3">

                {/* Ícone da categoria */}
                <div
                  className={`p-2.5 rounded-lg ${categoryColors[comunicado.category]
                    } flex-shrink-0`}
                >
                  <CategoryIcon className="h-4 w-4 text-white" />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${categoryColors[comunicado.category]
                        } text-white font-semibold`}
                    >
                      {categoryLabels[comunicado.category]}
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
        })}
      </div>

      {/* Botão final */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full hover:bg-[#363776] hover:text-white transition-colors font-semibold"
        >
          Ver todos os comunicados ({comunicados.length})
        </Button>
      </div>
    </Card>
  );
}
