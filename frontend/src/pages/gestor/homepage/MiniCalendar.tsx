'use client';

import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { eventos } from '../../lib/mock-data';

const eventTypeColors = {
  prova: 'bg-red-500',
  evento: 'bg-blue-500',
  'aula-especial': 'bg-purple-500',
  entrega: 'bg-amber-500',
};

const eventTypeLabels = {
  prova: 'Prova',
  evento: 'Evento',
  'aula-especial': 'Aula Especial',
  entrega: 'Entrega',
};

export function MiniCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const now = new Date();
  const proximosEventos = eventos
    .filter(evento => evento.date >= now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const hasEvent = (day: number) => {
    return eventos.some(
      evento =>
        evento.date.getDate() === day &&
        evento.date.getMonth() === currentMonth.getMonth() &&
        evento.date.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <Card className="p-4 shadow-lg border-gray-200 h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-base font-bold text-[#363776] flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendário
        </h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-foreground">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h4>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="h-6 w-6"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-6 w-6"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((day, index) => (
            <div key={index} className="text-center text-[9px] font-bold text-muted-foreground py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const isSelected =
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth.getMonth() &&
              selectedDate.getFullYear() === currentMonth.getFullYear();
            const hasEventOnDay = hasEvent(day);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-[10px] font-semibold
                  transition-all relative
                  ${isSelected 
                    ? 'bg-[#363776] text-white shadow-md scale-105' 
                    : 'hover:bg-gray-100 text-foreground'
                  }
                `}
              >
                {day}
                {hasEventOnDay && !isSelected && (
                  <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                    <div className="w-1 h-1 rounded-full bg-[#9dba32]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-200">
        <h4 className="text-xs font-bold mb-2.5 flex items-center gap-1.5 text-[#363776]">
          <Clock className="h-3.5 w-3.5" />
          Próximos Eventos
        </h4>
        
        <div className="space-y-2">
          {proximosEventos.length > 0 ? (
            proximosEventos.map(evento => (
              <div
                key={evento.id}
                className="p-2.5 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-[#363776]/30 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-2">
                  <div className={`w-1 h-full ${eventTypeColors[evento.type]} rounded-full flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${eventTypeColors[evento.type]} text-white font-bold uppercase tracking-wide`}>
                        {eventTypeLabels[evento.type]}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        {evento.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-[11px] text-foreground line-clamp-1">{evento.title}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-3">
              Nenhum evento próximo
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
