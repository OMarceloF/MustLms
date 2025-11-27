'use client';

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Activity, UserPlus, Users, MessageSquare, CalendarCheck, Download } from 'lucide-react';

const activityIcons: any = {
  matricula: UserPlus,
  turma: Users,
  post: MessageSquare,
  evento: CalendarCheck,
};

const activityColors: any = {
  matricula: 'text-green-600 bg-green-50',
  turma: 'text-blue-600 bg-blue-50',
  post: 'text-purple-600 bg-purple-50',
  evento: 'text-amber-600 bg-amber-50',
};

interface AtividadesRecentesProps {
  data: any[];
}

export function AtividadesRecentes({ data }: AtividadesRecentesProps) {
  
  const formatTimestamp = (dateInput: string) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Agora há pouco';
    if (hours < 24) return `há ${hours}h`;
    if (days === 1) return 'há 1 dia';
    return `há ${days} dias`;
  };

  const handleExportLogs = () => {
    console.log('Exportando logs...');
  };

  return (
    <Card className="p-5 shadow-lg border-gray-200">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#363776] flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportLogs}
          className="gap-2 hover:bg-[#363776] hover:text-white transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar
        </Button>
      </div>

      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#363776] via-gray-300 to-transparent" />
        
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
          {data && data.map((atividade) => {
            const Icon = activityIcons[atividade.type] || Activity;
            const colorClass = activityColors[atividade.type] || 'text-gray-500 bg-gray-100';

            return (
              <div
                key={atividade.id}
                className="relative flex items-start gap-3 pl-1"
              >
                {/* Ícone da atividade */}
                <div className={`relative z-10 p-1.5 rounded-full ${colorClass} flex-shrink-0 border-2 border-white shadow-sm`}>
                  <Icon className="h-3 w-3" />
                </div>
                
                {/* Conteúdo da atividade */}
                <div className="flex-1 min-w-0 pb-3">
                  <div className="bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-100 hover:border-[#363776]/20 transition-all hover:shadow-sm">
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {atividade.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold">
                      {formatTimestamp(atividade.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {(!data || data.length === 0) && (
             <p className="text-xs text-center text-gray-500 py-4 ml-4">Nenhuma atividade recente.</p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full hover:bg-[#363776] hover:text-white transition-colors font-semibold text-xs"
        >
          Ver histórico completo
        </Button>
      </div>
    </Card>
  );
}