import React, { useState, useEffect } from 'react';
import { Calendar, Book, MessageSquare, ThumbsUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';


export default function EventosPageMenu() {
  // Hooks de roteamento e controle de sidebar
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Estados principais
  const [eventos, setEventos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [form, setForm] = useState({
    titulo: '',
    data: '',
    tipo: 'palestra',
    descricao: '',
    imagem: ''
  });

  // Popula eventos iniciais
  useEffect(() => {
    const eventosIniciais = [
      {
        id: 1,
        titulo: 'Palestra: Tecnologias do Futuro',
        data: '2024-07-15T14:00',
        tipo: 'palestra',
        descricao: 'Uma visão sobre as principais tendências tecnológicas que moldarão o futuro da educação.',
        imagem: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
        curtidas: 12,
        comentarios: 5,
        curtido: false
      },
      {
        id: 2,
        titulo: 'Encontro de Projetos - Ciências',
        data: '2024-07-18T09:00',
        tipo: 'projeto',
        descricao: 'Apresentação dos projetos desenvolvidos pelos alunos do curso de Ciências.',
        imagem: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop',
        curtidas: 8,
        comentarios: 3,
        curtido: false
      },
      {
        id: 3,
        titulo: 'Reunião de Pais - 2º Trimestre',
        data: '2024-07-20T19:00',
        tipo: 'reuniao',
        descricao: 'Discussão sobre o desenvolvimento acadêmico dos alunos no segundo trimestre.',
        imagem: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=200&fit=crop',
        curtidas: 15,
        comentarios: 7,
        curtido: true
      }
    ];
    setEventos(eventosIniciais);
  }, []);

  // Utilitário para formatar data/hora
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} • ${hora}h${minuto !== '00' ? minuto : ''}`;
  };

  // Curtir/descurtir evento
  const handleCurtir = (id) => {
    setEventos(eventos.map(ev =>
      ev.id === id
        ? { ...ev, curtidas: ev.curtido ? ev.curtidas - 1 : ev.curtidas + 1, curtido: !ev.curtido }
        : ev
    ));
  };

  // Criar novo evento
  const handleCriarEvento = (e) => {
    e.preventDefault();
    if (!form.titulo || !form.data || !form.descricao) return;

    const novoEvento = {
      id: Date.now(),
      ...form,
      imagem: form.imagem || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop',
      curtidas: 0,
      comentarios: 0,
      curtido: false
    };

    setEventos([novoEvento, ...eventos]);
    setForm({ titulo: '', data: '', tipo: 'palestra', descricao: '', imagem: '' });
    setIsModalOpen(false);
  };

  // Filtra antes de renderizar
  const eventosFiltrados = eventos.filter(ev =>
    filtroTipo === 'todos' || ev.tipo === filtroTipo
  );

  const tiposEvento = [
    { value: 'todos', label: 'Todos os Eventos' },
    { value: 'palestra', label: 'Palestras' },
    { value: 'projeto', label: 'Encontros de Projetos' },
    { value: 'reuniao', label: 'Reuniões de Pais' },
    { value: 'workshop', label: 'Workshops' }
  ];

  const getIconePorTipo = (tipo) => {
    switch (tipo) {
      case 'palestra': return '🎓';
      case 'projeto': return '🔬';
      case 'reuniao': return '👥';
      case 'workshop': return '🛠️';
      default: return '📅';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-indigo-100 overflow-x-hidden">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page) => navigate('/gestor', { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div className="flex-1 flex flex-col pt-20 px-4 md:px-6 ml-0 md:ml-[50px]">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        {/* Cabeçalho */}
        <header className="bg-white shadow-sm border-b border-indigo-100">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Eventos
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-md"
            >
              <span className="text-lg">+</span>
              Novo Evento
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-indigo-600" />
              Filtrar por Tipo
            </h2>
            <div className="flex flex-wrap gap-3">
              {tiposEvento.map(tipo => (
                <button
                  key={tipo.value}
                  onClick={() => setFiltroTipo(tipo.value)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${filtroTipo === tipo.value
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de eventos */}
          {eventosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
              {eventosFiltrados.map(ev => (
                <div key={ev.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100">
                  <div className="relative">
                    <img src={ev.imagem} alt={ev.titulo} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                      <span className="text-sm font-medium flex items-center gap-1">
                        {getIconePorTipo(ev.tipo)}
                        {tiposEvento.find(t => t.value === ev.tipo)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{ev.titulo}</h3>
                    <p className="text-indigo-600 font-medium mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatarData(ev.data)}
                    </p>
                    <p className="text-gray-600 mb-4 leading-relaxed">{ev.descricao}</p>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCurtir(ev.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${ev.curtido ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-medium">{ev.curtidas}</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{ev.comentarios}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 inline-block">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum evento encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros ou criar um novo evento.</p>
              </div>
            </div>
          )}
        </main>

        {/* Modal de Criação de Evento */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  Criar Novo Evento
                </h2>
              </div>

              <form onSubmit={handleCriarEvento} className="p-6 space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ex: Palestra sobre Inteligência Artificial"
                    required
                  />
                </div>

                {/* Data e Hora */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data e Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.data}
                    onChange={e => setForm({ ...form, data: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Tipo de Evento */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="palestra">Palestra</option>
                    <option value="projeto">Encontro de Projetos</option>
                    <option value="reuniao">Reunião de Pais</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Descreva brevemente o evento..."
                    required
                  />
                </div>

                {/* URL da Imagem */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={form.imagem}
                    onChange={e => setForm({ ...form, imagem: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-md"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
