import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SidebarGestor from './components/Sidebar';
import TopBarGestor from './components/Navbar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useRef } from 'react';
import { toast } from 'sonner';

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

const EditarTurmaPage = () => {
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState('');
  const [ano, setAno] = useState('');
  const [aulasPorDia, setAulasPorDia] = useState('');
  const [etapaEnsino, setEtapaEnsino] = useState('');
  const [professores, setProfessores] = useState<
    { id: number; nome: string; foto_url?: string }[]
  >([]);
  const [professorResponsavel, setProfessorResponsavel] = useState<number | ''>(
    ''
  );
  const [filtroProfessor, setFiltroProfessor] = useState('');

  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/professores`)
      .then((res) => setProfessores(res.data))
      .catch(() => setProfessores([]));
  }, []);

  useEffect(() => {
    const fetchTurma = async () => {
      try {
        const response = await axios.get(`/api/turmas/${id}`
        );
        const turma = response.data;
        setNome(turma.nome);
        setSerie(turma.serie);
        setTurno(turma.turno);
        setAno(turma.ano_letivo);
        setAulasPorDia(turma.aulas_por_dia);
        setEtapaEnsino(turma.etapa_ensino);
        setProfessorResponsavel(turma.professor_responsavel || '');
      } catch (error) {
        console.error('Erro ao buscar turma:', error);
        toast.error('Erro ao carregar os dados da turma.');
      }
    };

    fetchTurma();
  }, [id]);

  const handleSalvar = async () => {
    if (!nome || !serie || !turno || !ano || !aulasPorDia || !etapaEnsino) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (
      (etapaEnsino === 'EI' || etapaEnsino === 'EFAI') &&
      !professorResponsavel
    ) {
      toast.error(
        'O campo "Professor Responsável" é obrigatório para Educação Infantil (EI) e Ensino Fundamental Anos Iniciais (EFAI).'
      );
      return;
    }

    const turmaAtualizada = {
      nome,
      serie,
      turno,
      ano_letivo: ano,
      aulas_por_dia: aulasPorDia,
      etapa_ensino: etapaEnsino,
      professor_responsavel: professorResponsavel || null,
    };

    try {
      await axios.put(`/api/turmas/${id}`,
        turmaAtualizada
      );
      toast.success('Turma atualizada com sucesso!');
      navigate('/gestor', { state: { activePage: 'turmas' } });
    } catch (error) {
      console.error('Erro ao atualizar turma:', error);
      toast.success('Erro ao atualizar a turma. Tente novamente.');
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

      <div className="flex-1 flex flex-col ml-16 lg:ml-auto mr-4 lg:mr-auto mt-10">
        {/* Topbar */}
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
        />

        {/* Conteúdo */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="bg-white shadow-md rounded-lg p-4 sm:p-8 w-full max-w-full sm:max-w-3xl mb-8 mt-10">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">
              ✏️ Editar Turma
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Nome da Turma
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Série
              </label>
              <select
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">Selecione</option>
                <option value="Maternal">Maternal</option>
                <option value="Nível 4">Nível 4</option>
                <option value="Nível 5">Nível 5</option>
                <option value="1º Ano">1º Ano</option>
                <option value="2º Ano">2º Ano</option>
                <option value="3º Ano">3º Ano</option>
                <option value="4º Ano">4º Ano</option>
                <option value="5º Ano">5º Ano</option>
                <option value="6º Ano">6º Ano</option>
                <option value="7º Ano">7º Ano</option>
                <option value="8º Ano">8º Ano</option>
                <option value="9º Ano">9º Ano</option>
                <option value="1ª Série EM">1ª Série EM</option>
                <option value="2ª Série EM">2ª Série EM</option>
                <option value="3ª Série EM">3ª Série EM</option>
                <option value="EJA">EJA</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Turno
              </label>
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
              <label className="block text-gray-700 font-medium mb-2">
                Ano Letivo
              </label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Aulas por Dia
              </label>
              <input
                type="number"
                value={aulasPorDia}
                onChange={(e) => setAulasPorDia(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Etapa de Ensino
              </label>
              <select
                value={etapaEnsino}
                onChange={(e) => setEtapaEnsino(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                <option value="">Selecione</option>
                <option value="EI">Educação Infantil (EI)</option>
                <option value="EFAI">
                  Ensino Fundamental Anos Iniciais (EFAI)
                </option>
                <option value="EFAF">
                  Ensino Fundamental Anos Finais (EFAF)
                </option>
                <option value="EM">Ensino Médio (EM)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Professor Responsável
              </label>
              <input
                type="text"
                placeholder="Filtrar professor..."
                value={filtroProfessor}
                onChange={(e) => setFiltroProfessor(e.target.value)}
                className="w-full px-4 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
              <div className="max-h-48 overflow-y-auto border border-indigo-400 rounded-lg bg-white">
                {professores
                  .filter((p) =>
                    p.nome.toLowerCase().includes(filtroProfessor.toLowerCase())
                  )
                  .map((p) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg transition-colors
                        ${
                          professorResponsavel === p.id
                            ? 'bg-indigo-400'
                            : 'hover:bg-indigo-50'
                        }`}
                      onClick={() => setProfessorResponsavel(p.id)}
                      style={{ userSelect: 'none' }}
                    >
                      {(() => {
                        const segura = getSafeImagePath(p.foto_url || '');
                        return segura ? (
                          <img
                            src={`/${segura}`}
                            alt={p.nome}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-300 text-indigo-900 font-bold">
                            {p.nome.substring(0, 2).toUpperCase()}
                          </span>
                        );
                      })()}

                      <span>{p.nome}</span>
                      {professorResponsavel === p.id && (
                        <span className="ml-auto text-indigo-900 font-bold">
                          Selecionado
                        </span>
                      )}
                    </div>
                  ))}
                {professores.filter((p) =>
                  p.nome.toLowerCase().includes(filtroProfessor.toLowerCase())
                ).length === 0 && (
                  <div className="p-2 text-gray-500">
                    Nenhum professor encontrado.
                  </div>
                )}
              </div>
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

export default EditarTurmaPage;
