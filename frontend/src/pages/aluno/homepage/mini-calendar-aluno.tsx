"use client"

import { useState, useMemo } from "react"
import { Card } from "../../gestor/components/ui/card"
import { Button } from "../../gestor/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Clock, Sparkles } from "lucide-react"

const eventStyles: Record<string, { bg: string; text: string; dot: string }> = {
  prova: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  trabalho: { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
  aula: { bg: "bg-purple-100", text: "text-purple-600", dot: "bg-purple-500" },
  entrega: { bg: "bg-amber-100", text: "text-amber-600", dot: "bg-amber-500" },
  feriado: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-600" },
  default: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
}

const eventTypeLabels: Record<string, string> = {
  prova: "Prova",
  trabalho: "Trabalho",
  aula: "Aula Esp.",
  entrega: "Entrega",
  feriado: "Feriado",
  default: "Evento",
}

interface Evento {
  id: string
  title: string
  date: string
  type: string
}

interface MiniCalendarAlunoProps {
  events: Evento[]
  holidays?: { date: string; name: string }[]
}

export function MiniCalendarAluno({ events = [], holidays = [] }: MiniCalendarAlunoProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const parseLocalDate = (dateString: string): Date => {
    if (!dateString) return new Date()
    const cleanDate = dateString.split("T")[0]
    const [year, month, day] = cleanDate.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const allEvents = useMemo(() => {
    const formattedHolidays = holidays.map((h) => ({
      id: `feriado-${h.date}`,
      title: h.name,
      date: h.date,
      type: "feriado",
    }))
    return [...events, ...formattedHolidays]
  }, [events, holidays])

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const days = ["D", "S", "T", "Q", "Q", "S", "S"]

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  const proximosEventos = allEvents
    .map((e) => ({ ...e, dateObj: parseLocalDate(e.date) }))
    .filter((evento) => evento.dateObj >= now)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .slice(0, 4)

  const getEventsForDay = (day: number) => {
    return allEvents.filter((evento) => {
      const evtDate = parseLocalDate(evento.date)
      return (
        evtDate.getDate() === day &&
        evtDate.getMonth() === currentMonth.getMonth() &&
        evtDate.getFullYear() === currentMonth.getFullYear()
      )
    })
  }

  return (
    <Card className="p-5 shadow-lg border-gray-200 h-full flex flex-col bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#363776] flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Meu Calendário
        </h3>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-bold text-gray-800 capitalize">
            {monthNames[currentMonth.getMonth()]}{" "}
            <span className="text-gray-400 font-normal">{currentMonth.getFullYear()}</span>
          </h4>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="h-7 w-7 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 hover:bg-gray-100 rounded-full">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day, index) => (
            <div key={index} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const isSelected =
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth.getMonth() &&
              selectedDate.getFullYear() === currentMonth.getFullYear()

            const today = isToday(day)
            const dayEvents = getEventsForDay(day)
            const hasEvent = dayEvents.length > 0
            const isHoliday = dayEvents.some((e) => e.type === "feriado")

            const titleTooltip = dayEvents.map((e) => `• ${e.title}`).join("\n")

            let bgClass = "hover:bg-gray-50 text-gray-700 hover:text-[#363776]"
            let borderClass = "border border-transparent"

            if (isSelected) {
              bgClass = "bg-[#363776] text-white shadow-md"
            } else if (isHoliday) {
              bgClass = "bg-emerald-50 text-emerald-800 font-semibold"
              borderClass = "border border-emerald-200"
            } else if (hasEvent) {
              bgClass = "bg-slate-50 text-slate-900"
            }

            const todayStyle =
              today && !isSelected ? "ring-1 ring-[#363776] ring-offset-1 font-bold text-[#363776]" : ""

            return (
              <button
                key={day}
                title={hasEvent ? titleTooltip : today ? "Hoje" : ""}
                onClick={() => setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-xl text-xs
                  transition-all duration-200 relative group 
                  ${bgClass} ${borderClass} ${todayStyle}
                `}
              >
                <span className="z-10">{day}</span>

                {hasEvent && (
                  <div className="flex gap-0.5 mt-1 h-1.5 justify-center w-full px-1">
                    {dayEvents.slice(0, 3).map((evt, i) => {
                      const style = eventStyles[evt.type] || eventStyles.default
                      return (
                        <div
                          key={i}
                          className={`
                            w-1.5 h-1.5 rounded-full ring-1 
                            ${style.dot} 
                            ${isSelected ? "ring-[#363776] border border-white" : "ring-white"}
                          `}
                        />
                      )
                    })}
                    {dayEvents.length > 3 && <div className="w-1 h-1 rounded-full bg-gray-400" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-gray-500 uppercase tracking-wider">
          <Clock className="h-3 w-3" />
          Próximos Eventos
        </h4>

        <div className="space-y-2.5">
          {proximosEventos.length > 0 ? (
            proximosEventos.map((evento) => {
              const style = eventStyles[evento.type] || eventStyles.default
              const label = eventTypeLabels[evento.type] || eventTypeLabels.default
              const isHoliday = evento.type === "feriado"

              return (
                <div
                  key={evento.id}
                  className={`group flex items-center gap-3 p-2.5 rounded-lg transition-colors border 
                    ${
                      isHoliday
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 shadow-sm"
                    }
                  `}
                >
                  <div
                    className={`
                    flex flex-col items-center justify-center w-10 h-10 rounded-lg 
                    ${style.bg} ${style.text} flex-shrink-0
                  `}
                  >
                    {isHoliday ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      <>
                        <span className="text-[10px] font-bold">{evento.dateObj.getDate()}</span>
                        <span className="text-[8px] uppercase font-bold opacity-80">
                          {evento.dateObj.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold leading-tight truncate ${isHoliday ? "text-emerald-900" : "text-gray-800"}`}
                    >
                      {evento.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`
                        text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider
                        ${style.bg} ${style.text}
                      `}
                      >
                        {label}
                      </span>
                      {isHoliday && (
                        <span className="text-[9px] text-emerald-600 font-medium">
                          {evento.dateObj.toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Nenhum evento próximo</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
