import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';


type EventoCalendario = {
  data: string;
  tipo: 'feriado' | 'letivo' | 'evento';
  titulo: string;
};

export default function MiniCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [eventosUsuario, setEventosUsuario] = useState<any[]>([]);
  const [feriados, setFeriados] = useState<any[]>([]);
  const [usuario, setUsuario] = useState<{ id?: number; role?: string }>({});

  // 1. Fetch usuário autenticado
  useEffect(() => {
    fetch(`/api/check-auth`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && data.id && data.role) {
          setUsuario({ id: data.id, role: data.role });
        }
      });
  }, []);

  // 2. Buscar eventos do usuário
  useEffect(() => {
    if (!usuario.id || !usuario.role) return;

    fetch(`/api/evento/usuario/${usuario.id}/${usuario.role}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEventosUsuario(data))
      .catch(() => setEventosUsuario([]));
  }, [usuario]);

  // 3. Buscar feriados
  useEffect(() => {
    const fetchFeriados = async () => {
      try {
        const { data } = await axios.get(`/ext/feriados`, { withCredentials: false });
        const feriadosNac = data.map((f: any) => ({
          id: `feriado-${f.date}`,
          nome: f.name,
          data: f.date,
          tipo: 'feriado',
          cor: '#2dd4bf',
        }));
        setFeriados(feriadosNac);  // Atualiza o estado de feriados
      } catch (err) {
        console.error("Erro ao carregar os feriados", err);
        setFeriados([]);
      }
    };
    fetchFeriados();
  }, []); // Só carrega uma vez, sem dependências

  // Função para formatar a data no formato 'YYYY-MM-DD'
  const formatDateKey = (date: Date) => date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Filtra os eventos para o dia selecionado
  const events = selectedDate
    ? eventosUsuario.filter(ev => ev.data.slice(0, 10) === formatDateKey(selectedDate))
    : [];

  // Incluindo os feriados para o dia selecionado
  const allEvents = [...events, ...feriados];

  // Função para obter a chave de data no formato 'YYYY-MM-DD'
  const getDateKey = (data: string | Date) => {
    const d = typeof data === 'string' ? new Date(data) : data;
    return d.toISOString().split('T')[0];
  };

  // Define o estilo da célula do calendário (marcando dias com eventos)
  const tileClassName = ({ date }: { date: Date }) => {
    const dateKey = getDateKey(date);
    const temEvento = allEvents.some(ev => getDateKey(ev.data) === dateKey);

    if (temEvento) {
      return 'relative rounded-md after:content-[""] after:absolute after:bottom-[6px] after:left-1/2 after:-translate-x-1/2 after:w-[7px] after:h-[7px] after:bg-red-400 after:rounded-full';
    }

    return '';
  };

  return (
    <div className="w-full font-inter">
      <div className="rounded-2xl p-4 font-poppins transition-all duration-300">
        <Calendar
          onChange={(value) => {
            if (value instanceof Date) {
              setSelectedDate(value);
            }
          }}
          value={selectedDate}
          tileClassName={tileClassName}
          className="w-full border-0"
        />
      </div>

      <div className="mx-4 mt-4 bg-white rounded-xl p-4 shadow">
        <h3 className="text-base mb-3 text-gray-800">
          Eventos em {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '...'}
        </h3>
        {allEvents.length === 0 && <p>Nenhum evento para este dia.</p>}
        {allEvents.map((event, index) => (
          <div key={index} className="border-l-4 border-black p-3 mb-4 bg-[#66F1D3] rounded-lg">
            <div className="flex justify-between items-center">
              <strong>{event.nome || event.titulo || event.title}</strong>
            </div>
            <p className="text-sm text-gray-700 mt-1">{event.descricao || event.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 mx-4">
        <strong>Legenda:</strong>
        <ul className="list-none p-0 mt-2 space-y-1">
          <li>
            <span className="bg-gray-300 px-2 rounded">Feriado</span>
          </li>
          <li>
            <span className="bg-green-100 px-2 rounded">Dia Letivo</span>
          </li>
          <li>
            <span className="bg-orange-200 px-2 rounded">Evento</span>
          </li>
          <li>
            <span className="text-red-400">●</span> Dia com eventos cadastrados
          </li>
        </ul>
      </div>
    </div>
  );
}
// MiniCalendar.tsx