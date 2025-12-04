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
  matricula: 'text-green-600 bg-green-50 border-green-100',
  turma: 'text-blue-600 bg-blue-50 border-blue-100',
  post: 'text-purple-600 bg-purple-50 border-purple-100',
  evento: 'text-amber-600 bg-amber-50 border-amber-100',
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
    // Adicionado h-full e flex flex-col para alinhar altura com o gráfico vizinho
    <Card className="p-6 shadow-lg border-gray-200 h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
            <h3 className="text-lg font-bold text-[#363776] flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades Recentes
            </h3>
            <p className="text-sm text-muted-foreground">Últimas ações no sistema</p>
        </div>
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

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Linha vertical da timeline */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-200" />
        
        <div className="space-y-4 h-full overflow-y-auto pr-2 pb-2 custom-scrollbar">
          {data && data.map((atividade) => {
            const Icon = activityIcons[atividade.type] || Activity;
            const colorClass = activityColors[atividade.type] || 'text-gray-500 bg-gray-100 border-gray-200';

            return (
              <div
                key={atividade.id}
                className="relative flex items-start gap-4 pl-1 group"
              >
                {/* Ícone da atividade */}
                <div className={`relative z-10 p-2 rounded-full ${colorClass} flex-shrink-0 border-2 border-white shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Conteúdo da atividade */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      {atividade.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                      {formatTimestamp(atividade.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {(!data || data.length === 0) && (
             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Activity className="h-8 w-8 mb-2 opacity-50"/>
                <p className="text-sm">Nenhuma atividade recente.</p>
             </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <Button 
          variant="ghost" 
          className="w-full text-[#363776] hover:bg-[#363776]/5 transition-colors font-semibold text-sm h-9"
        >
          Ver histórico completo
        </Button>
      </div>
    </Card>
  );
}