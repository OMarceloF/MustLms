import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Filter,
  Eye,
  Settings,
  Trash,
  UserPlus,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Turma {
  id: number;
  nome: string;
  serie: string;
  ano_letivo: string;
  turno: string;
  qtd_alunos: number;
  etapa_ensino: string;
  professor_responsavel?: string;
}

interface Aluno {
  id: string;
  nome: string;
  email: string;
  login: string;
  role: string;
  turma?: string;
  serie?: string;
  matricula?: string;
  foto: string;
  created_at: string;
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

const AlunosPage = () => {
  const [mostrarModalUpload, setMostrarModalUpload] = useState(false);
  const [arquivoCSV, setArquivoCSV] = useState<File | null>(null);
  const [mensagemUpload, setMensagemUpload] = useState('');
  const [carregandoUpload, setCarregandoUpload] = useState(false);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Aluno | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  const [filterSerie, setFilterSerie] = useState<string>('');
  const [filterTurma, setFilterTurma] = useState<string>('');

  const getNomeDaTurma = (turmaId: string | number | undefined): string => {
    const turma = turmas.find((t) => Number(t.id) === Number(turmaId));
    return turma?.nome || '—';
  };

  const getNomeDaSerie = (serieId: string | number | undefined): string => {
    const serie = turmas.find((t) => Number(t.id) === Number());
    return serie?.nome || '—';
  };
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isProfessor = user.role === 'professor';

  useEffect(() => {
    // Só executa depois que o perfil tiver carregado
    if (authLoading) return;
    setIsLoading(true);
    const baseUrl = `/api`;
    const url =
      user.cargo === 'Professor'
        ? `${baseUrl}/professores/${user.id}/alunos`
        : `${baseUrl}/listar_alunos`;
    axios
      .get<Aluno[]>(url)
      .then(({ data }) => {
        setAlunos(data);
        setFilteredAlunos(data);
      })
      .catch((err) => {
        console.error('Erro ao buscar alunos:', err);
        setError('Erro ao carregar os dados dos alunos.');
      })
      .finally(() => setIsLoading(false));
  }, [user, authLoading]);

  useEffect(() => {
    let result = [...alunos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((aluno) => {
        const nome = aluno.nome?.toLowerCase() ?? '';
        const email = aluno.email?.toLowerCase() ?? '';
        const matricula = aluno.matricula?.toLowerCase() ?? '';
        const serie = aluno.serie?.toLowerCase() ?? '';
        const turma = aluno.turma?.toLowerCase() ?? '';

        return (
          nome.includes(term) ||
          email.includes(term) ||
          matricula.includes(term) ||
          serie.includes(term) ||
          turma.includes(term)
        );
      });
    }

    if (filterSerie) {
      result = result.filter((aluno) => aluno.serie === filterSerie);
    }

    if (filterTurma) {
      result = result.filter((aluno) => aluno.turma === filterTurma);
    }

    if (sortConfig.key && sortConfig.key !== 'foto') {
      const key = sortConfig.key;

      result.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        // Se algum valor for null ou undefined, substitui por string vazia
        const aStr =
          aValue !== null && aValue !== undefined ? String(aValue) : '';
        const bStr =
          bValue !== null && bValue !== undefined ? String(bValue) : '';

        return sortConfig.direction === 'ascending'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    setFilteredAlunos(result);
  }, [alunos, searchTerm, filterSerie, filterTurma, sortConfig]);

  const handleSort = (key: keyof Aluno) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/alunos/${id}`);
      setAlunos((prevAlunos) => prevAlunos.filter((aluno) => aluno.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir aluno:', err);
      setError('Erro ao excluir aluno.');
    }
  };

  const uniqueSeries = [
    ...new Set(alunos.map((aluno) => aluno.serie).filter(Boolean)),
  ];
  const uniqueTurmas = [
    ...new Set(alunos.map((aluno) => aluno.turma).filter(Boolean)),
  ];
  if (authLoading) return <p>Carregando perfil...</p>;
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 mt-[20px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mt-2">
            Lista de Alunos
          </h1>
          {!isProfessor && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
              <button
                onClick={() => navigate('/gestor/criarAluno')}
                className="flex items-center justify-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-3 py-2 rounded-lg transition-all shadow-lg w-full md:w-auto"
              >
                <UserPlus size={18} />
                <span className="text-sm">Adicionar Aluno</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-4 sm:p-6 border-b border-indigo-300">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search field */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-indigo-700" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar alunos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full py-2 border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none text-sm"
                />
              </div>

              {/* Filter dropdowns */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <div className="relative min-w-[120px]">
                  <select
                    value={filterSerie}
                    onChange={(e) => setFilterSerie(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border border-indigo-400 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none text-sm"
                  >
                    <option value="">Todas as Séries</option>
                    {uniqueSeries.map((serie) => (
                      <option key={serie} value={serie}>
                        {serie}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Filter className="w-4 h-4 text-indigo-700" />
                  </div>
                </div>

                <div className="relative min-w-[120px]">
                  <select
                    value={filterTurma}
                    onChange={(e) => setFilterTurma(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border border-indigo-400 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none text-sm"
                  >
                    <option value="">Todas as Turmas</option>
                    {uniqueTurmas.map((turma) => (
                      <option key={turma} value={turma}>
                        {turma}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Filter className="w-4 h-4 text-indigo-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-indigo-900">Carregando alunos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-indigo-900">Nenhum aluno encontrado.</p>
            </div>
          ) : (
            <>
              {/* Tabela para telas grandes */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[600px] text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="px-3 sm:px-6 py-3 text-left font-semibold text-indigo-900 uppercase tracking-wider">
                        Foto
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 text-left font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('nome')}
                      >
                        Nome
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 text-left font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('matricula')}
                      >
                        Matrícula
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 text-left font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('serie')}
                      >
                        Série
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 text-left font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('turma')}
                      >
                        Nome da turma
                      </th>
                      <th
                        className="px-3 sm:px-6 py-3 text-left font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('email')}
                      >
                        Email
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right font-semibold text-indigo-900 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-300">
                    {filteredAlunos.map((aluno) => {
                      const identificadorTurma = aluno.turma || '—';
                      return (
                        <tr
                          key={aluno.id}
                          className="hover:bg-indigo-50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-indigo-400 flex items-center justify-center">
                              {aluno.foto &&
                              aluno.foto.startsWith('/uploads') ? (
                                <img
                                  src={`${
                                    import.meta.env.VITE_API_URL
                                  }${encodeURI(aluno.foto)}`}
                                  alt={aluno.nome}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-indigo-900 font-bold">
                                  {aluno.nome?.substring(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                            {aluno.nome}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600">
                            {aluno.matricula}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600">
                            {aluno.serie}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600">
                            {identificadorTurma}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600">
                            {aluno.email}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2 sm:gap-3">
                              {showDeleteConfirm === aluno.id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDelete(aluno.id)}
                                    className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                    title="Confirmar"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="p-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                                    title="Cancelar"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() =>
                                      isProfessor
                                        ? navigate(
                                            `/professor/alunos/${aluno.id}/visualizaraluno`,
                                            {
                                              state: {
                                                aluno,
                                                todosAlunos: alunos,
                                              },
                                            }
                                          )
                                        : navigate(
                                            `/gestor/alunos/${aluno.id}/visualizaraluno`,
                                            {
                                              state: {
                                                aluno,
                                                todosAlunos: alunos,
                                              },
                                            }
                                          )
                                    }
                                    className="p-1 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400"
                                    title="Ver perfil"
                                  >
                                    <Eye size={16} />
                                  </button>
                                  {!isProfessor && (
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/aluno/${aluno.id}/configurar`
                                        )
                                      }
                                      className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                      title="Configurações"
                                    >
                                      <Settings size={16} />
                                    </button>
                                  )}
                                  {!isProfessor && (
                                    <button
                                      onClick={() =>
                                        setShowDeleteConfirm(aluno.id)
                                      }
                                      className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                      title="Excluir"
                                    >
                                      <Trash size={16} />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards para telas pequenas e medias */}
              <div className="lg:hidden flex flex-col gap-3 p-2">
                {filteredAlunos.map((aluno) => {
                  const identificadorTurma = aluno.turma || '—';
                  return (
                    <div
                      key={aluno.id}
                      className="bg-white rounded-lg shadow p-3 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-400 flex items-center justify-center">
                          {(() => {
                            const segura = getSafeImagePath(aluno.foto || '');

                            return segura ? (
                              <img
                                src={`/${segura}`}
                                alt={aluno.nome}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-indigo-900 font-bold">
                                {aluno.nome.substring(0, 2).toUpperCase()}
                              </span>
                            );
                          })()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            {aluno.nome}
                          </div>
                          <div className="text-xs text-gray-500">
                            {aluno.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span>
                          <b>Matrícula:</b> {aluno.matricula}
                        </span>
                        <span>
                          <b>Série:</b> {aluno.serie}
                        </span>
                        <span>
                          <b>Turma:</b> {identificadorTurma}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {showDeleteConfirm === aluno.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(aluno.id)}
                              className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                              title="Confirmar"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="p-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                              title="Cancelar"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                isProfessor
                                  ? navigate(
                                      `/aluno/${aluno.id}/visualizaraluno`,
                                      {
                                        state: { aluno, todosAlunos: alunos },
                                      }
                                    )
                                  : navigate(
                                      `/gestor/alunos/${aluno.id}/visualizaraluno`,
                                      {
                                        state: { aluno, todosAlunos: alunos },
                                      }
                                    )
                              }
                              className="p-1 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400"
                              title="Ver perfil"
                            >
                              <Eye size={16} />
                            </button>
                            {!isProfessor && (
                              <button
                                onClick={() =>
                                  navigate(`/aluno/${aluno.id}/configurar`)
                                }
                                className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                title="Configurações"
                              >
                                <Settings size={16} />
                              </button>
                            )}
                            {!isProfessor && (
                              <button
                                onClick={() => setShowDeleteConfirm(aluno.id)}
                                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                title="Excluir"
                              >
                                <Trash size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      {mostrarModalUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-bold mb-4 text-indigo-900">
              Importar Alunos em Lote (.CSV)
            </h2>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setArquivoCSV(e.target.files?.[0] || null)}
              className="mb-4 w-full"
            />

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setMostrarModalUpload(false);
                  setArquivoCSV(null);
                  setMensagemUpload('');
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-indigo-800 text-white rounded hover:bg-indigo-900 disabled:opacity-50"
                disabled={!arquivoCSV || carregandoUpload}
                onClick={async () => {
                  if (!arquivoCSV) return;
                  setCarregandoUpload(true);
                  setMensagemUpload('');

                  const formData = new FormData();
                  formData.append('arquivo', arquivoCSV);

                  try {
                    await axios.post(
                      'http://52.67.126.32/api/alunos/adicionar-lote',
                      formData,
                      {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      }
                    );

                    setMensagemUpload('✅ Alunos importados com sucesso!');
                  } catch (error) {
                    console.error(error);
                    setMensagemUpload('❌ Erro ao importar o arquivo.');
                  } finally {
                    setCarregandoUpload(false);
                  }
                }}
              >
                {carregandoUpload ? 'Enviando...' : 'Enviar CSV'}
              </button>
            </div>

            {mensagemUpload && (
              <p className="mt-3 text-sm text-center text-indigo-900">
                {mensagemUpload}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlunosPage;
