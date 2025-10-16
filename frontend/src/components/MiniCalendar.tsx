import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import '../styles/MiniCalendar.css';

type EventoCalendario = {
  data: string;                   // ISO ou 'YYYY-MM-DD'
  tipo: 'feriado' | 'letivo' | 'evento';
  titulo: string;
  descricao?: string;
  nome?: string;
};

const toArray = (v: any, key?: string): any[] => {
  if (Array.isArray(v)) return v;
  if (key && v && Array.isArray(v[key])) return v[key];
  return [];
};

const toISODate = (d: string | Date) => {
  const obj = typeof d === 'string' ? new Date(d) : d;
  return isNaN(obj.getTime()) ? '' : obj.toISOString().split('T')[0];
};

export default function MiniCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [eventosUsuario, setEventosUsuario] = useState<EventoCalendario[]>([]);
  const [feriados, setFeriados] = useState<EventoCalendario[]>([]);
  const [usuario, setUsuario] = useState<{ id?: number; role?: string }>({});

  // 1) Usuário autenticado
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/check-auth');
        if (data?.id && data?.role) setUsuario({ id: data.id, role: data.role });
      } catch {
        setUsuario({});
      }
    })();
  }, []);

  // 2) Eventos do usuário (normaliza 'qualquer coisa' para EventoCalendario)
  useEffect(() => {
    if (!usuario.id || !usuario.role) return;
    (async () => {
      try {
        const { data } = await axios.get(`/evento/usuario/${usuario.id}/${usuario.role}`);
        const lista = toArray(data, 'items'); // trata tanto array direto quanto {items:[]}

        const normalizados: EventoCalendario[] = lista.map((ev: any) => {
          const dataStr =
            typeof ev?.data === 'string' ? ev.data :
            typeof ev?.date === 'string' ? ev.date : '';
          const titulo =
            typeof ev?.titulo === 'string' ? ev.titulo :
            typeof ev?.title === 'string' ? ev.title :
            typeof ev?.nome === 'string' ? ev.nome : 'Evento';
          const descricao =
            typeof ev?.descricao === 'string' ? ev.descricao :
            typeof ev?.description === 'string' ? ev.description : undefined;
          const tipo: EventoCalendario['tipo'] =
            ev?.tipo === 'feriado' || ev?.tipo === 'letivo' || ev?.tipo === 'evento'
              ? ev.tipo
              : 'evento';

          return { data: dataStr, titulo, descricao, tipo, nome: ev?.nome };
        });

        setEventosUsuario(normalizados);
      } catch {
        setEventosUsuario([]);
      }
    })();
  }, [usuario]);

  // 3) Feriados via proxy (ano atual no backend)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/ext/feriados');
        const arr = toArray(data);
        const parsed: EventoCalendario[] = arr.map((f: any) => ({
          data: String(f?.date || ''),     // BrasilAPI → "date"
          tipo: 'feriado',
          titulo: String(f?.name || 'Feriado'),
        }));
        setFeriados(parsed);
      } catch (err) {
        console.error('Erro ao carregar os feriados', err);
        setFeriados([]);
      }
    })();
  }, []);

  const formatDateKey = (date: Date) => toISODate(date);

  const events = selectedDate
    ? eventosUsuario.filter(ev => toISODate(ev.data) === formatDateKey(selectedDate))
    : [];

  const feriadosDia = selectedDate
    ? feriados.filter(f => toISODate(f.data) === formatDateKey(selectedDate))
    : [];

  const allEvents = [...events, ...feriadosDia];

  const tileClassName = ({ date }: { date: Date }) => {
    const key = toISODate(date);
    const temEvento = allEvents.some(ev => toISODate(ev.data) === key);
    const isFeriado = feriados.some(f => toISODate(f.data) === key);

    if (isFeriado) {
      return 'bg-gray-400 text-black relative rounded-lg hover:bg-gray-500 transition-all duration-200 after:content-[""] after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-red-500 after:rounded-full';
    }
    if (temEvento) {
      return 'relative rounded-lg after:content-[""] after:absolute after:bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-red-400 after:rounded-full';
    }
    return '';
  };

  return (
    <div className="w-full font-inter">
      <div className="rounded-lg p-4 font-poppins transition-all duration-300 bg-white shadow-lg">
        <Calendar
          onChange={(value) => {
            if (value instanceof Date) setSelectedDate(value);
          }}
          value={selectedDate}
          tileClassName={tileClassName}
          className="w-full rounded-lg border-0 shadow-none"
        />
      </div>

      <div className="mx-4 mt-4 bg-white rounded-lg p-4 shadow-lg">
        <h3 className="text-base mb-3 text-gray-800">
          Eventos em {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '...'}
        </h3>
        {allEvents.length === 0 && <p className="text-gray-500">Nenhum evento para este dia.</p>}
        {allEvents.map((event, index) => (
          <div key={index} className="border-l-4 border-black p-3 mb-4 bg-[#66F1D3] rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <strong className="text-gray-800">{event.nome || event.titulo}</strong>
            </div>
            {event.descricao && <p className="text-sm text-gray-700 mt-1">{event.descricao}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
