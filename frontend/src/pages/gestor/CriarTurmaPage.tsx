import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarGestor from './components/Sidebar';
import TopBarGestor from './components/Navbar';
import axios from 'axios';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { toast } from 'sonner';


const CriarTurmaPage = () => {
  const navigate = useNavigate();

  // Sidebar e menus
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  // Dados da turma
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState('');
  const [ano, setAno] = useState('');
  const [aulasPorDia, setAulasPorDia] = useState('');
  const [professores, setProfessores] = useState<{ id: number, nome: string }[]>([]);
  const [professorResponsavel, setProfessorResponsavel] = useState<number | ''>('');
  const [filtroProfessor, setFiltroProfessor] = useState('');

  useEffect(() => {
    axios.get(`/api/professores`)
      .then(res => setProfessores(res.data))
      .catch(() => setProfessores([]));
  }, []);

  const handleSalvar = async () => {
    if (!nome || !serie || !turno || !ano || !aulasPorDia) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const serieSemEtapa = serie.split(' ').slice(0, -1).join(' ');
    const etapaEnsino = serie.split(' ').slice(-1)[0];

    const novaTurma = {
      nome,
      serie: serieSemEtapa,
      etapa_ensino: etapaEnsino,
      turno,
      ano_letivo: ano,
      aulas_por_dia: aulasPorDia,
      qtd_alunos: 0,
      professor_responsavel: professorResponsavel || null,
    };

    try {
      await axios.post(`/api/turmas`, novaTurma);
      toast.success('Turma criada com sucesso!');
      navigate('/gestor', { state: { activePage: 'turmas' } });
    } catch (error) {
      console.error('Erro ao criar turma:', error);
      toast.error('Ocorreu um erro ao criar a turma. Tente novamente.');
    }
  };

  const handleCancelar = () => {
    navigate('/gestor', { state: { activePage: 'turmas' } });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) =>
          navigate('/gestor', { state: { activePage: page } })
        }
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

       <div className="flex-1 flex flex-col pt-10 ml-2 md:ml-16 lg:ml-auto mr-2 md:mr-auto my-4 transition-all duration-500">

        {/* Topbar */}
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        {/* Conteúdo */}
        <div className="flex flex-col items-center justify-center min-h-screen">
 <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-full sm:max-w-3xl mb-8 mt-10">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">+ Criar Nova Turma</h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Nome da Turma</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Série</label>
              <select
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">Selecione</option>
                <option value="Maternal 1 EI">Maternal 1</option>
                <option value="Maternal 2 EI">Maternal 2</option>
                <option value="Nível 4 EI">Nível 4</option>
                <option value="Nível 5 EI">Nível 5</option>
                <option value="1º Ano EFAI">1º Ano</option>
                <option value="2º Ano EFAI">2º Ano</option>
                <option value="3º Ano EFAI">3º Ano</option>
                <option value="4º Ano EFAI">4º Ano</option>
                <option value="5º Ano EFAI">5º Ano</option>
                <option value="6º Ano EFAF">6º Ano</option>
                <option value="7º Ano EFAF">7º Ano</option>
                <option value="8º Ano EFAF">8º Ano</option>
                <option value="9º Ano EFAF">9º Ano</option>
                <option value="1ª Ano EM">1ª Série EM</option>
                <option value="2ª Ano EM">2ª Série EM</option>
                <option value="3ª Ano EM">3ª Série EM</option>
                <option value="EJA EFAF">EJA Fundamental</option>
                <option value="EJA EM">EJA Médio</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Turno</label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">Selecione</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Ano Letivo</label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Aulas por Dia</label>
              <input
                type="number"
                value={aulasPorDia}
                onChange={(e) => setAulasPorDia(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Professor Responsável</label>
              <input
                type="text"
                placeholder="Filtrar professor..."
                value={filtroProfessor}
                onChange={e => setFiltroProfessor(e.target.value)}
                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
              <select
                value={professorResponsavel}
                onChange={e => setProfessorResponsavel(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">Selecione</option>
                {professores
                  .filter(p => p.nome.toLowerCase().includes(filtroProfessor.toLowerCase()))
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleCancelar}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="px-6 py-2 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 w-full sm:w-auto"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarTurmaPage;