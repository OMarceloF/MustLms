// src/pages/gestor/CalendarioDetalhePage.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from 'sonner';

function getUserAvatar(foto: string | null | undefined, nome: string): string {
  const safeNome = encodeURIComponent(nome || 'User');

  if (
    foto &&
    foto.startsWith('/uploads/') &&
    /^[a-zA-Z0-9_\-\/\.]+\.(jpg|jpeg|png|webp)$/i.test(foto)
  ) {
    return `/${foto}`;
  }

  return `https://ui-avatars.com/api/?name=${safeNome}`;
}

const API_URL = `/api`;

const tiposDeEvento = [
  { tipo: 'feriado', label: 'Feriado', cor: '#2dd4bf', textColor: '#FFFFFF' },
  { tipo: 'evento_especial', label: 'Evento Especial', cor: '#8dcc28', textColor: '#FFFFFF' },
  { tipo: 'recesso', label: 'Recesso', cor: '#64748b', textColor: '#FFFFFF' },
  { tipo: 'letivo', label: 'Letivo', cor: '#aa57a9', textColor: '#FFFFFF' },
  { tipo: 'prova', label: 'Prova', cor: '#f59e42', textColor: '#FFFFFF' },
  { tipo: 'planejamento', label: 'Planejamento', cor: '#f472b6', textColor: '#FFFFFF' },
  { tipo: 'periodo_inicio', label: 'Início do Período', cor: '#0ea5e9', textColor: '#ffffff' },
  { tipo: 'periodo_fim', label: 'Fim do Período', cor: '#0369a1', textColor: '#ffffff' },
];

const rolesDisponiveis = [
  { value: 'aluno', label: 'Alunos' },
  { value: 'responsavel', label: 'Responsáveis' },
  { value: 'professor', label: 'Professores' },
  { value: 'gestor', label: 'Gestores' },
];
const tiposDeImportancia = [
  { tipo: undefined, label: 'Importância' },
  { tipo: 'alta', label: 'Alta' },
  { tipo: 'media', label: 'Média' },
  { tipo: 'baixa', label: 'Baixa' },
];

const CalendarioDetalhePage: React.FC = ( ) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [calendario, setCalendario] = useState<any>(null);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [feriados, setFeriados] = useState<any[]>([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<any[]>([]);
  const [rolesSelecionadas, setRolesSelecionadas] = useState<string[]>([]);
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);
  const [buscaUsuario, setBuscaUsuario] = useState<string>('');
  const [periodosLetivos, setPeriodosLetivos] = useState<any[]>([]);

  // Efeito para buscar os dados principais do calendário letivo
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/calendarioById/${id}`)
      .then((calRes) => {
        if (!calRes.data) {
          throw new Error('Calendário não encontrado');
        }
        const cal = calRes.data;
        setCalendario({
          inicio: cal.inicio || '-',
          fim: cal.fim || '-',
          ano_letivo: cal.ano_letivo || '-',
          tipo: cal.tipo || '-',
        });
      })
      .catch(() => {
        setCalendario(null);
        toast.error("Calendário não encontrado. Redirecionando...");
        navigate('/gestor');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Efeito consolidado para buscar todos os eventos (usuário, feriados, períodos)
  useEffect(() => {
    if (!calendario?.ano_letivo) return;

    const fetchAllEvents = async () => {
      try {
        // 1. Busca eventos do calendário e do usuário
        const eventosCalendarioPromise = axios.get(`${API_URL}/evento/${id}`).then(res => res.data || []);
        const usuarioPromise = axios.get(`/api/check-auth`).then(res => res.data).catch(() => ({}));
        
        const [eventosCalendario, usuario] = await Promise.all([eventosCalendarioPromise, usuarioPromise]);
        
        let eventosUsuario: any[] = [];
        if (usuario.id && usuario.role) {
          eventosUsuario = await axios.get(`${API_URL}/evento/usuario/${usuario.id}/${usuario.role}`).then(res => res.data || []).catch(() => []);
        }

        const todosEventosBase = [...eventosCalendario, ...eventosUsuario];
        const eventosUnicos = Object.values(
          todosEventosBase.reduce((acc, evt) => {
            acc[String(evt.id)] = evt;
            return acc;
          }, {} as Record<string, any>)
        );
        setEventos(eventosUnicos);

        // 2. Busca feriados (nacionais e personalizados)
        const feriadosNacionaisPromise = axios.get(`/api/ext/feriados`).then(res => res.data || []);
        const feriadosPersonalizadosPromise = axios.get(`/api/configuracoes/calendario`).then(res => res.data?.feriados_personalizados || "");

        const [feriadosNac, feriadosPersStr] = await Promise.all([feriadosNacionaisPromise, feriadosPersonalizadosPromise]);
        
        const feriadosNacionaisFormatados = feriadosNac.map((f: any) => ({
          id: `feriado-nac-${f.date}`, nome: f.name, data: f.date, tipo: 'feriado',
        }));

        const feriadosPersonalizadosFormatados = (feriadosPersStr || "")
          .split(',').filter((d: string) => d.trim()).map((d: string) => ({
            id: `feriado-pers-${d.trim()}`, nome: 'Feriado Personalizado', data: d.trim(), tipo: 'feriado',
          }));
        
        setFeriados([...feriadosNacionaisFormatados, ...feriadosPersonalizadosFormatados]);

        // 3. Busca os Períodos Letivos da rota correta
        const periodosRes = await axios.get(`/api/periodos-letivos`);
        const periodos = periodosRes.data || [];
        
        const periodosMapeados = periodos.flatMap((p: any) => [
          { id: `inicio-${p.id}`, nome: `Início do ${p.nome}`, data: p.data_inicio, tipo: 'periodo_inicio' },
          { id: `fim-${p.id}`, nome: `Fim do ${p.nome}`, data: p.data_fim, tipo: 'periodo_fim' },
        ]);
        setPeriodosLetivos(periodosMapeados);

      } catch (err) {
        console.error('Erro ao buscar eventos, feriados ou períodos:', err);
        toast.error("Falha ao carregar todos os dados do calendário.");
      }
    };

    fetchAllEvents();
  }, [id, calendario?.ano_letivo, modalAberto]);

  // Efeito para fechar o modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalAberto(false); setEventoSelecionado(null);
      }
    };
    if (modalAberto) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [modalAberto]);

  // Efeito para buscar usuários quando o modal de evento abre
  useEffect(() => {
    if (modalAberto) {
      axios.get(`${API_URL}/usuarios`).then(res => setUsuariosDisponiveis(res.data || []));
    }
  }, [modalAberto]);

  const handleDateClick = (arg: any) => {
    setRolesSelecionadas([]);
    setUsuariosSelecionados([]);
    const tipoPadrao = 'evento_especial';
    const tipoInfo = tiposDeEvento.find((t) => t.tipo === tipoPadrao);
    setEventoSelecionado({
      id: null, start: arg.dateStr, title: '', tipo: tipoPadrao,
      backgroundColor: tipoInfo?.cor, textColor: tipoInfo?.textColor, importancia: undefined,
    });
    setModalAberto(true);
  };

  const handleEventClick = async (clickInfo: any) => {
    const eventId = String(clickInfo.event.id);
    if (eventId.startsWith('feriado-') || eventId.startsWith('inicio-') || eventId.startsWith('fim-')) return;
    
    const evento = eventos.find((evt) => String(evt.id) === eventId);
    if (evento) {
      try {
        const [rolesRes, usuariosRes] = await Promise.all([
          axios.get(`${API_URL}/evento/${evento.id}/roles`),
          axios.get(`${API_URL}/evento/${evento.id}/usuarios`),
        ]);
        setRolesSelecionadas(rolesRes.data || []);
        setUsuariosSelecionados((usuariosRes.data || []).map(Number));
      } catch {
        setRolesSelecionadas([]); setUsuariosSelecionados([]);
      }
      setEventoSelecionado({ ...evento, start: evento.data, title: evento.nome });
      setModalAberto(true);
    }
  };

  const salvarEvento = async () => {
    if (!eventoSelecionado.title?.trim()) {
      toast.error('O nome do evento não pode estar vazio!'); return;
    }
    setIsSaving(true);
    const tipoInfo = tiposDeEvento.find((t) => t.tipo === eventoSelecionado.tipo);
    const payload = {
      calendario_id: id, data: eventoSelecionado.start, tipo: eventoSelecionado.tipo,
      nome: eventoSelecionado.title, cor: tipoInfo?.cor || '#c56825', descricao: eventoSelecionado.descricao || '',
      importancia: eventoSelecionado.importancia, recorrente: eventoSelecionado.recorrente || false,
      roles: rolesSelecionadas, usuarios: usuariosSelecionados,
    };
    try {
      if (eventoSelecionado.id) {
        await axios.put(`${API_URL}/evento/${eventoSelecionado.id}`, payload);
      } else {
        await axios.post(`${API_URL}/evento`, payload);
      }
      setModalAberto(false); setEventoSelecionado(null);
    } catch (e) {
      toast.error('Erro ao salvar evento.');
    } finally {
      setIsSaving(false);
    }
  };

  const excluirEvento = async () => {
    if (eventoSelecionado.id && window.confirm('Excluir este evento?')) {
      setIsSaving(true);
      try {
        await axios.delete(`${API_URL}/evento/${eventoSelecionado.id}`);
        setModalAberto(false); setEventoSelecionado(null);
      } catch (e) {
        toast.error('Erro ao excluir evento.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <div className={`${modalAberto ? 'hidden' : ''} fixed z-40 md:static md:z-auto`}>
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })}
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />
      </div>

      <div className="flex-1 flex flex-col pt-20 px-2 sm:px-6 md:ml-16 pl-16 min-w-0 transition-all duration-300">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <main className="flex-1 px-0 sm:px-4 py-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 mt-8 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 text-center sm:text-left">
              Calendário {calendario?.tipo} de {calendario?.ano_letivo}
            </h2>
          </div>
          <div className="mb-8">
            {loading ? (
              <p>Carregando calendário...</p>
            ) : (
              <div className="bg-white rounded-xl p-2 sm:p-6 overflow-x-auto border border-indigo-300 shadow-sm w-full">
                <div className="min-w-[500px]">
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={[...eventos, ...feriados, ...periodosLetivos].map(
                      (evt) => {
                        const tipoInfo = tiposDeEvento.find((t) => t.tipo === evt.tipo);
                        return {
                          id: String(evt.id),
                          title: evt.nome || '',
                          start: evt.data.slice(0, 10) || '',
                          backgroundColor: tipoInfo?.cor || '#14b8a6',
                          borderColor: tipoInfo?.cor || '#14b8a6',
                          textColor: tipoInfo?.textColor || '#fff',
                          extendedProps: {
                            tipo: evt.tipo || '', descricao: evt.descricao || '',
                            recorrente: evt.recorrente || 0, importancia: evt.importancia || '',
                          },
                        };
                      }
                    )}
                    locale="pt-br"
                    height="auto"
                    eventContent={(eventInfo) => {
                      const tipo = tiposDeEvento.find((t) => t.tipo === eventInfo.event.extendedProps.tipo);
                      const importancia = eventInfo.event.extendedProps.importancia;
                      return (
                        <div
                          className="rounded-md px-1 py-1 font-semibold text-[0.95em] shadow-sm flex flex-col border-3 cursor-pointer"
                          style={{
                            backgroundColor: tipo?.cor || '#14b8a6', color: tipo?.textColor || '#fff',
                            borderColor: tipo?.cor || '#14b8a6', maxWidth: '100%',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'normal', wordBreak: 'break-word',
                          }}
                        >
                          <span className="text-xs" style={{ color: '#fff' }}>
                            {tipo?.label}
                            {importancia && (<> • <span className="font-bold">{importancia.charAt(0).toUpperCase() + importancia.slice(1)}</span></>)}
                          </span>
                          <span className="truncate block max-w-full" title={eventInfo.event.title}>{eventInfo.event.title}</span>
                          {eventInfo.event.extendedProps.descricao && (
                            <span className="text-xs text-gray-200 truncate block max-w-full" title={eventInfo.event.extendedProps.descricao}>
                              {eventInfo.event.extendedProps.descricao}
                            </span>
                          )}
                        </div>
                      );
                    }}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    validRange={calendario && calendario.inicio && calendario.fim ? { start: calendario.inicio.slice(0, 10), end: calendario.fim.slice(0, 10) } : undefined}
                    visibleRange={calendario && calendario.inicio && calendario.fim ? { start: calendario.inicio.slice(0, 10), end: calendario.fim.slice(0, 10) } : undefined}
                    dayMaxEventRows={2}
                    headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
                    dayCellClassNames={() => 'hover:bg-indigo-50 transition'}
                    dayHeaderClassNames={() => 'bg-indigo-300 text-indigo-900'}
                    contentHeight="auto"
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {modalAberto && eventoSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2" style={{ left: 0, top: 0, width: '100vw', height: '100vh' }}>
            <div ref={modalRef} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl relative max-h-[83vh] overflow-y-auto mt-[85px]">
              <h3 className="text-lg sm:text-xl font-bold text-indigo-900 mb-4">{eventoSelecionado.id ? 'Editar Evento' : 'Adicionar Evento'}</h3>
              <form onSubmit={async (e) => { e.preventDefault(); await salvarEvento(); }}>
                <label className="block text-indigo-900 text-sm mb-1">Data</label>
                <input type="date" disabled readOnly tabIndex={-1} className="block w-full mb-3 border border-indigo-400 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed" value={eventoSelecionado?.start?.slice(0, 10) || ''} />
                <label className="block text-indigo-900 text-sm mb-1">Título</label>
                <input type="text" required className="block w-full mb-3 border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="Título do Evento" value={eventoSelecionado?.title || ''} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, title: e.target.value }))} />
                <label className="block text-indigo-900 text-sm mb-1">Descrição</label>
                <textarea className="block w-full mb-3 border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" placeholder="Descrição do Evento" value={eventoSelecionado?.descricao || ''} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, descricao: e.target.value }))} />
                <label className="block text-indigo-900 text-sm mb-1">Tipo</label>
                <select required className="block w-full mb-3 border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={eventoSelecionado?.tipo || ''}
                  onChange={(e) => {
                    const tipoSelecionado = e.target.value;
                    const tipoInfo = tiposDeEvento.find((t) => t.tipo === tipoSelecionado);
                    setEventoSelecionado((prev: any) => ({ ...prev, tipo: tipoSelecionado, backgroundColor: tipoInfo?.cor, textColor: tipoInfo?.textColor }));
                  }}
                >
                  <option value="">Selecione...</option>
                  {tiposDeEvento.map((tipo) => (<option key={tipo.tipo} value={tipo.tipo}>{tipo.label}</option>))}
                </select>
                <label className="block text-indigo-900 text-sm mb-1">Importância</label>
                <select className="block w-full mb-6 border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 cursor-pointer" value={eventoSelecionado?.importancia || ''} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, importancia: e.target.value }))}>
                  {tiposDeImportancia.map((tipo) => (<option key={tipo.tipo} value={tipo.tipo || ''}>{tipo.label}</option>))}
                </select>
                <label className="flex items-center mb-6 mr-2">
                  <input type="checkbox" className="block mr-1 accent-indigo-800" checked={!!eventoSelecionado?.recorrente} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, recorrente: e.target.checked }))} />
                  <span className="text-indigo-900 text-sm">Evento recorrente</span>
                </label>
                <label className="block text-indigo-900 text-sm mb-1">Notificar Cargos</label>
                <div className="block w-full mb-3 border border-indigo-400 rounded-lg px-3 py-2 bg-white max-h-40 overflow-y-auto">
                  {rolesDisponiveis.map((role) => (
                    <div key={role.value} className={`flex items-center gap-3 pt-1 px-1 cursor-pointer rounded transition select-none ${rolesSelecionadas.includes(role.value) ? 'bg-indigo-300 text-indigo-800 font-semibold' : 'hover:bg-indigo-50'}`}
                      onClick={() => {
                        if (rolesSelecionadas.includes(role.value)) {
                          setRolesSelecionadas((prev) => prev.filter((v) => v !== role.value));
                        } else {
                          setRolesSelecionadas((prev) => [...prev, role.value]);
                        }
                      }}
                    >
                      <span className="text-gray-800">{role.label}</span>
                    </div>
                  ))}
                </div>
                <label className="block text-indigo-900 text-sm mb-1">Notificar Usuários</label>
                <div className="block w-full mb-3 border border-indigo-400 rounded-lg px-3 py-2 bg-white max-h-64 overflow-y-auto">
                  <input type="text" placeholder="Buscar usuário..." className="w-full mb-2 px-2 py-1 border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 text-sm" value={buscaUsuario || ''} onChange={(e) => setBuscaUsuario(e.target.value)} />
                  {usuariosDisponiveis
                    .filter((user) => !buscaUsuario || user.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) || user.email.toLowerCase().includes(buscaUsuario.toLowerCase()))
                    .map((user) => (
                      <div key={user.id} className={`flex items-center gap-3 py-2 px-1 cursor-pointer rounded transition mb-1 select-none ${usuariosSelecionados.includes(user.id) ? 'bg-indigo-300 text-indigo-800 font-semibold' : 'hover:bg-indigo-50'}`}
                        onClick={() => {
                          if (usuariosSelecionados.includes(user.id)) {
                            setUsuariosSelecionados((prev) => prev.filter((id) => id !== user.id));
                          } else {
                            setUsuariosSelecionados((prev) => [...prev, user.id]);
                          }
                        }}
                      >
                        <img src={getUserAvatar(user.foto, user.nome)} alt={user.nome} className="w-8 h-8 rounded-full object-cover border" />
                        <span className="text-gray-800">{user.nome} <span className="text-xs text-gray-500">({user.email})</span></span>
                      </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  {eventoSelecionado?.id && (<button type="button" className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold transition w-full sm:w-auto" onClick={excluirEvento} disabled={isSaving}>Excluir</button>)}
                  <button type="button" className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition w-full sm:w-auto" onClick={() => { setModalAberto(false); setEventoSelecionado(null); }} disabled={isSaving}>Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-900 font-semibold transition w-full sm:w-auto" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarioDetalhePage;
