// src/pages/gestor/CalendarioDetalhePage.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import { EventContentArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast } from 'sonner';
import {
  AlertTriangle, Award, BookOpen, Mic, PartyPopper, Pencil, Plane, Star, Sunset, Loader2
} from 'lucide-react';

import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';

function getUserAvatar(foto: string | null | undefined, nome: string): string {
  const safeNome = encodeURIComponent(nome || 'User');
  if (foto && foto.startsWith('/uploads/') && /^[a-zA-Z0-9_\-\/\.]+\.(jpg|jpeg|png|webp)$/i.test(foto)) {
    return `/${foto}`;
  }
  return `https://ui-avatars.com/api/?name=${safeNome}`;
}

const API_URL = `/api`;

const tiposDeEvento = [
  { tipo: 'feriado', label: 'Feriado', cor: '#10b981', Icon: Plane },
  { tipo: 'evento_especial', label: 'Evento Especial', cor: '#ef4444', Icon: PartyPopper },
  { tipo: 'recesso', label: 'Recesso', cor: '#64748b', Icon: Sunset },
  { tipo: 'letivo', label: 'Dia Letivo', cor: '#3b82f6', Icon: BookOpen },
  { tipo: 'prova', label: 'Avaliação', cor: '#f97316', Icon: Pencil },
  { tipo: 'planejamento', label: 'Planejamento', cor: '#8b5cf6', Icon: Mic },
  { tipo: 'periodo_inicio', label: 'Início de Período', cor: '#0ea5e9', Icon: Star },
  { tipo: 'periodo_fim', label: 'Fim de Período', cor: '#0369a1', Icon: Award },
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

type ImportanciaKey = 'alta' | 'media' | 'baixa';

const CalendarioDetalhePage: React.FC = ( ) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [calendario, setCalendario] = useState<any>(null);
  const [eventos, setEventos] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
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
  const [primeiroDiaSemana, setPrimeiroDiaSemana] = useState<number>(0);

  useEffect(() => {
    axios.get(`${API_URL}/calendarioById/${id}`)
      .then((calRes) => {
        if (!calRes.data) throw new Error('Calendário não encontrado');
        setCalendario(calRes.data);
      })
      .catch(() => {
        toast.error("Calendário não encontrado. Redirecionando...");
        navigate('/gestor');
      });
  }, [id, navigate]);

  useEffect(() => {
    if (!calendario?.ano_letivo) return;

    const fetchAllData = async () => {
      setLoadingConfig(true);
      try {
        const [eventosCalendarioRes, usuarioRes, feriadosNacRes, configRes, periodosRes] = await Promise.all([
          axios.get(`${API_URL}/evento/${id}`),
          axios.get(`/api/check-auth`),
          axios.get(`/api/ext/feriados`),
          axios.get(`/api/configuracoes/calendario`),
          axios.get(`/api/periodos-letivos`),
        ]);

        const eventosCalendario = eventosCalendarioRes.data || [];
        const usuario = usuarioRes.data || {};
        let eventosUsuario: any[] = [];
        if (usuario.id && usuario.role) {
          const eventosUsuarioRes = await axios.get(`${API_URL}/evento/usuario/${usuario.id}/${usuario.role}`);
          eventosUsuario = eventosUsuarioRes.data || [];
        }
        const todosEventosBase = [...eventosCalendario, ...eventosUsuario];
        const eventosUnicos = Object.values(todosEventosBase.reduce((acc, evt) => {
          acc[String(evt.id)] = evt;
          return acc;
        }, {} as Record<string, any>));
        setEventos(eventosUnicos);

        const feriadosNac = feriadosNacRes.data || [];
        const feriadosPersStr = configRes.data?.feriados_personalizados || "";
        const feriadosNacionaisFormatados = feriadosNac.map((f: any) => ({ id: `feriado-nac-${f.date}`, nome: f.name, data: f.date, tipo: 'feriado' }));
        const feriadosPersonalizadosFormatados = feriadosPersStr.split(',').filter((d: string) => d.trim()).map((d: string) => ({ id: `feriado-pers-${d.trim()}`, nome: 'Feriado Personalizado', data: d.trim(), tipo: 'feriado' }));
        setFeriados([...feriadosNacionaisFormatados, ...feriadosPersonalizadosFormatados]);

        const periodos = periodosRes.data || [];
        const periodosMapeados = periodos.flatMap((p: any) => [
          { id: `inicio-${p.id}`, nome: `Início do ${p.nome}`, data: p.data_inicio, tipo: 'periodo_inicio' },
          { id: `fim-${p.id}`, nome: `Fim do ${p.nome}`, data: p.data_fim, tipo: 'periodo_fim' },
        ]);
        setPeriodosLetivos(periodosMapeados);
        
        const primeiroDiaConfig = configRes.data?.primeiro_dia_semana || 'domingo';
        setPrimeiroDiaSemana(primeiroDiaConfig === 'segunda' ? 1 : 0);

      } catch (err) {
        console.error('Erro ao buscar todos os dados do calendário:', err);
        toast.error("Falha ao carregar dados do calendário.");
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchAllData();
  }, [id, calendario?.ano_letivo, modalAberto]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalAberto(false); setEventoSelecionado(null);
      }
    };
    if (modalAberto) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalAberto]);

  useEffect(() => {
    if (modalAberto) axios.get(`${API_URL}/usuarios`).then(res => setUsuariosDisponiveis(res.data || []));
  }, [modalAberto]);

  const handleDateClick = (arg: any) => {
    setRolesSelecionadas([]);
    setUsuariosSelecionados([]);
    const tipoPadrao = 'evento_especial';
    setEventoSelecionado({
      id: null,
      start: arg.dateStr,
      title: '',
      tipo: tipoPadrao,
      importancia: 'media',
      descricao: '',
      recorrente: false,
    });
    setModalAberto(true);
  };

  const handleEventClick = async (clickInfo: any) => {
    const eventId = String(clickInfo.event.id);
    const allCalendarEvents = [...eventos, ...feriados, ...periodosLetivos];
    const eventoClicado = allCalendarEvents.find(e => String(e.id) === eventId);

    if (!eventoClicado) return;

    if (eventId.startsWith('inicio-') || eventId.startsWith('fim-')) {
      toast.info(`Isto é um marcador de período: ${eventoClicado.nome}`);
      return;
    }

    if (!eventId.startsWith('feriado-')) {
      const eventoReal = eventos.find(e => String(e.id) === eventId);
      if (eventoReal) {
        try {
          const [rolesRes, usuariosRes] = await Promise.all([
            axios.get(`${API_URL}/evento/${eventoReal.id}/roles`),
            axios.get(`${API_URL}/evento/${eventoReal.id}/usuarios`),
          ]);
          setRolesSelecionadas(rolesRes.data || []);
          setUsuariosSelecionados((usuariosRes.data || []).map(Number));
        } catch {
          setRolesSelecionadas([]); setUsuariosSelecionados([]);
        }
        setEventoSelecionado({ ...eventoReal, start: eventoReal.data, title: eventoReal.nome });
        setModalAberto(true);
      }
      return;
    }

    if (eventId.startsWith('feriado-')) {
      const eventoExistente = eventos.find(e => e.data.slice(0, 10) === eventoClicado.data.slice(0, 10));
      if (eventoExistente) {
        toast.info("Já existe um evento customizado para este dia. Edite o evento existente.");
        handleEventClick({ event: { id: eventoExistente.id } });
        return;
      }

      setRolesSelecionadas([]);
      setUsuariosSelecionados([]);
      setEventoSelecionado({
        id: null,
        start: eventoClicado.data,
        title: eventoClicado.nome,
        tipo: 'feriado',
        importancia: 'alta',
        descricao: `Feriado: ${eventoClicado.nome}`,
        recorrente: false,
      });
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
        toast.success("Evento atualizado com sucesso!");
      } else {
        await axios.post(`${API_URL}/evento`, payload);
        toast.success("Evento criado com sucesso!");
      }
      setModalAberto(false); setEventoSelecionado(null);
    } catch (e) {
      toast.error('Erro ao salvar evento.');
    } finally {
      setIsSaving(false);
    }
  };

  const excluirEvento = async () => {
    if (eventoSelecionado.id && window.confirm('Tem a certeza que deseja excluir este evento?')) {
      setIsSaving(true);
      try {
        await axios.delete(`${API_URL}/evento/${eventoSelecionado.id}`);
        toast.success("Evento excluído com sucesso!");
        setModalAberto(false); setEventoSelecionado(null);
      } catch (e) {
        toast.error('Erro ao excluir evento.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const tipoConfig = tiposDeEvento.find((t) => t.tipo === eventInfo.event.extendedProps.tipo);
    const importancia = eventInfo.event.extendedProps.importancia as ImportanciaKey;
    const importanciaClassMap: Record<ImportanciaKey, string> = { alta: 'event-importancia-alta', media: 'event-importancia-media', baixa: 'event-importancia-baixa' };
    const importanciaClass = importanciaClassMap[importancia] || '';

    return (
      <div className={`fc-event-custom ${importanciaClass}`} style={{ '--event-color': tipoConfig?.cor || '#64748b' } as React.CSSProperties} title={eventInfo.event.title}>
        <div className="fc-event-icon-wrapper">{tipoConfig?.Icon && <tipoConfig.Icon className="fc-event-icon" />}</div>
        <div className="fc-event-title-wrapper"><span className="fc-event-title">{eventInfo.event.title}</span></div>
        {importancia === 'alta' && (<div className="fc-event-importancia-icon"><AlertTriangle size={12} /></div>)}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <div className={`${modalAberto ? 'hidden' : ''} fixed z-40 md:static md:z-auto`}>
        <SidebarGestor isMenuOpen={sidebarAberta} setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })} handleMouseEnter={() => setSidebarAberta(true)} handleMouseLeave={() => setSidebarAberta(false)} />
      </div>

      <div className="flex-1 flex flex-col pt-20 px-2 sm:px-6 md:ml-16 pl-16 min-w-0 transition-all duration-300">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <main className="flex-1 px-0 sm:px-4 py-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 mt-8 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
              Calendário {calendario?.tipo} de {calendario?.ano_letivo}
            </h2>
          </div>
          <div className="mb-8">
            {loadingConfig ? (
              <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-4 text-gray-600">A carregar configurações do calendário...</span>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-2 sm:p-6 border border-gray-200 shadow-sm w-full calendar-container">
                <FullCalendar
                  key={primeiroDiaSemana}
                  firstDay={primeiroDiaSemana}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={[...eventos, ...feriados, ...periodosLetivos].map(
                    (evt) => ({
                      id: String(evt.id), title: evt.nome || '', start: evt.data.slice(0, 10) || '',
                      extendedProps: { tipo: evt.tipo || '', descricao: evt.descricao || '', importancia: evt.importancia || '' },
                    })
                  )}
                  locale="pt-br" height="auto"
                  headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
                  buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana' }}
                  dayMaxEventRows={3}
                  eventContent={renderEventContent}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  validRange={calendario && calendario.inicio && calendario.fim ? { start: calendario.inicio.slice(0, 10), end: calendario.fim.slice(0, 10) } : undefined}
                />
              </div>
            )}
          </div>
        </main>

        {modalAberto && eventoSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2">
            <div ref={modalRef} className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">{eventoSelecionado.id ? 'Editar Evento' : 'Adicionar Evento'}</h3>
              <form onSubmit={async (e) => { e.preventDefault(); await salvarEvento(); }}>
                <label className="block text-gray-700 text-sm font-bold mb-2">Data</label>
                <input type="date" disabled readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 cursor-not-allowed mb-4" value={eventoSelecionado?.start?.slice(0, 10) || ''} />

                <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
                <input type="text" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder="Título do Evento" value={eventoSelecionado?.title || ''} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, title: e.target.value }))} />

                <label className="block text-gray-700 text-sm font-bold mb-2">Descrição</label>
                <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4" placeholder="Descrição do Evento" value={eventoSelecionado?.descricao || ''} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, descricao: e.target.value }))} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tipo</label>
                    <select required className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={eventoSelecionado?.tipo || ''}
                      onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, tipo: e.target.value }))}>
                      <option value="">Selecione...</option>
                      {tiposDeEvento.map((tipo) => (<option key={tipo.tipo} value={tipo.tipo}>{tipo.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Importância</label>
                    <select className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={eventoSelecionado?.importancia || ''} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, importancia: e.target.value }))}>
                      {tiposDeImportancia.map((tipo) => (<option key={tipo.tipo} value={tipo.tipo || ''}>{tipo.label}</option>))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center mb-6">
                  <input type="checkbox" className="mr-2 leading-tight" checked={!!eventoSelecionado?.recorrente} onChange={(e) => setEventoSelecionado((prev: any) => ({ ...prev, recorrente: e.target.checked }))} />
                  <span className="text-sm text-gray-700">Evento recorrente</span>
                </label>

                <label className="block text-gray-700 text-sm font-bold mb-2">Notificar Cargos</label>
                <div className="border rounded p-2 mb-4 max-h-40 overflow-y-auto">
                  {rolesDisponiveis.map((role) => (
                    <div key={role.value} className={`p-1 cursor-pointer rounded ${rolesSelecionadas.includes(role.value) ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setRolesSelecionadas(prev => prev.includes(role.value) ? prev.filter(v => v !== role.value) : [...prev, role.value]);
                      }}>
                      {role.label}
                    </div>
                  ))}
                </div>

                <label className="block text-gray-700 text-sm font-bold mb-2">Notificar Usuários Específicos</label>
                <div className="border rounded p-2 max-h-60 overflow-y-auto">
                  <input type="text" placeholder="Buscar usuário..." className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2" value={buscaUsuario} onChange={(e) => setBuscaUsuario(e.target.value)} />
                  {usuariosDisponiveis.filter(user => !buscaUsuario || user.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) || user.email.toLowerCase().includes(buscaUsuario.toLowerCase())).map((user) => (
                    <div key={user.id} className={`flex items-center p-2 cursor-pointer rounded ${usuariosSelecionados.includes(user.id) ? 'bg-blue-200' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        setUsuariosSelecionados(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]);
                      }}>
                      <img src={getUserAvatar(user.foto, user.nome)} alt={user.nome} className="w-8 h-8 rounded-full mr-3" />
                      <div>
                        <div className="font-bold">{user.nome}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div>
                    {eventoSelecionado?.id && (<button type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={excluirEvento} disabled={isSaving}>Excluir</button>)}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={() => { setModalAberto(false); setEventoSelecionado(null); }} disabled={isSaving}>Cancelar</button>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .calendar-container .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
        .calendar-container .fc-button-primary { background-color: #f1f5f9; border-color: #e2e8f0; color: #334155; font-weight: 500; transition: all 0.2s; }
        .calendar-container .fc-button-primary:hover { background-color: #e2e8f0; border-color: #cbd5e1; }
        .calendar-container .fc-button-primary:active, .fc-button-primary:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important; }
        .calendar-container .fc-daygrid-day-number { color: #475569; font-size: 0.8rem; }
        .calendar-container .fc-day-today { background-color: rgba(59, 130, 246, 0.05); }
        .calendar-container .fc-day-today .fc-daygrid-day-number { font-weight: 700; color: #2563eb; }
        .fc-event-custom { display: flex; align-items: center; padding: 2px 4px; border-radius: 4px; cursor: pointer; overflow: hidden; border: 1px solid transparent; border-left: 3px solid var(--event-color, #64748b); background-color: #f8fafc; transition: all 0.2s; margin-bottom: 3px; }
        .fc-event-custom:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); background-color: #f1f5f9; }
        .fc-event-icon-wrapper { margin-right: 5px; display: flex; align-items: center; }
        .fc-event-icon { width: 12px; height: 12px; color: var(--event-color, #64748b); }
        .fc-event-title-wrapper { flex-grow: 1; overflow: hidden; white-space: nowrap; }
        .fc-event-title { font-size: 0.75rem; font-weight: 500; color: #334155; text-overflow: ellipsis; overflow: hidden; display: block; }
        .fc-event-importancia-icon { margin-left: 4px; color: #f97316; }
        .fc-event-custom.event-importancia-alta { background-color: #fff1f2; border-left-width: 4px; }
        .fc-daygrid-event, .fc-h-event { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default CalendarioDetalhePage;
