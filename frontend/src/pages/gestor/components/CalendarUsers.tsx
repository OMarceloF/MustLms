import React from 'react';
import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css'; // opcional: pode ser removido se quiser estilizar tudo no Tailwind

interface Feriado {
  date: string;
  name: string;
}

type CalendarValue = Date | Date[] | null;

interface CalendarUsersProps {
  dataSelecionada: Date;
  handleDataChange: (date: Date) => void;
  mesVisivel: Date;
  setMesVisivel: (date: Date) => void;
  feriadosFixos: string[];
  feriadosMesVisivel: Feriado[];
}

const CalendarUsers: React.FC<CalendarUsersProps> = ({
  dataSelecionada,
  handleDataChange,
  mesVisivel,
  setMesVisivel,
  feriadosFixos,
  feriadosMesVisivel,
}) => {
  const handleCalendarChange = (
    value: Date | Date[] | [Date | null, Date | null] | null,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (value instanceof Date) {
      handleDataChange(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      handleDataChange(value[0]);
    } else if (Array.isArray(value) && value[0] === null && value[1] instanceof Date) {
      handleDataChange(value[1]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-2/3">
        <Calendar
          locale="pt-BR"
          onChange={handleCalendarChange}
          value={dataSelecionada}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate) setMesVisivel(activeStartDate);
          }}
          tileClassName={({ date }) => {
            const dataISO = date.toISOString().split('T')[0];
            const isFeriado = feriadosFixos.includes(dataISO);
            const isDomingo = date.getDay() === 0;

            return [
              isFeriado ? 'bg-red-100 text-red-600 font-semibold' : '',
              isDomingo ? 'text-red-500' : '',
            ].join(' ').trim();
          }}
          className="w-full border rounded-lg p-2 shadow"
        />
      </div>

      <div className="w-full md:w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">Feriados deste mês:</h4>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
          {feriadosMesVisivel.length > 0 ? (
            feriadosMesVisivel.map((f, idx) => (
              <li key={idx}>
                <strong>{new Date(f.date).toLocaleDateString('pt-BR')}</strong>: {f.name}
              </li>
            ))
          ) : (
            <li className="text-gray-500">Nenhum feriado neste mês.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CalendarUsers;
