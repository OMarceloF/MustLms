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

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  login: string;
  role: string;
  cargo?: string;
  departamento?: string;
  foto: string;
  created_at: string;
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

const ProfessoresPage = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<
    Funcionario[]
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Funcionario | null;
    direction: 'ascending' | 'descending';
  }>({ key: null, direction: 'ascending' });
  const [filterCargo, setFilterCargo] = useState<string>('');
  const [filterDepartamento, setFilterDepartamento] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/listar_funcionarios`
        );
        setFuncionarios(response.data);
        setFilteredFuncionarios(response.data);
        setIsLoading(false);
      } catch (err) {
        setError('Erro ao carregar os dados dos funcionários.');
        setIsLoading(false);
        console.error('Erro ao buscar funcionários:', err);
      }
    };

    fetchFuncionarios();
  }, []);

  useEffect(() => {
    // Filter by search term and other filters
    let result = funcionarios;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      result = result.filter((funcionario) => {
        const nome = funcionario.nome?.toLowerCase() ?? '';
        const email = funcionario.email?.toLowerCase() ?? '';
        const cargo = funcionario.cargo?.toLowerCase() ?? '';

        return (
          nome.includes(term) || email.includes(term) || cargo.includes(term)
        );
      });
    }

    if (filterCargo) {
      result = result.filter(
        (funcionario) => funcionario.cargo === filterCargo
      );
    }

    if (filterDepartamento) {
      result = result.filter(
        (funcionario) => funcionario.departamento === filterDepartamento
      );
    }

    // Sort the filtered results
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

    setFilteredFuncionarios(result);
  }, [funcionarios, searchTerm, filterCargo, filterDepartamento, sortConfig]);

  const handleSort = (key: keyof Funcionario) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/professores/${id}`
      );
      setFuncionarios((prevFuncionarios) =>
        prevFuncionarios.filter((funcionario) => funcionario.id !== id)
      );
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);
      setError('Erro ao excluir funcionário.');
    }
  };

  const uniqueCargos = [
    ...new Set(
      funcionarios.map((funcionario) => funcionario.cargo).filter(Boolean)
    ),
  ];
  const uniqueDepartamentos = [
    ...new Set(
      funcionarios
        .map((funcionario) => funcionario.departamento)
        .filter(Boolean)
    ),
  ];

  return (
    //bg-gradient-to-b from-indigo-50 to-white p-6
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto mt-[20px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4 md:mb-0">
            Lista de Funcionários
          </h1>

          <button
            onClick={() => navigate('/gestor/criarProfessor')}
            className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg transition-all shadow-lg"
          >
            <UserPlus size={20} />
            <span>Adicionar Funcionário</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-indigo-300">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search field */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-indigo-700" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar funcionários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full py-2 border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none"
                />
              </div>

              {/* Filter dropdowns */}
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={filterCargo}
                    onChange={(e) => setFilterCargo(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border border-indigo-400 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none"
                  >
                    <option value="">Todos os Cargos</option>
                    {uniqueCargos.map((cargo) => (
                      <option key={cargo} value={cargo}>
                        {cargo}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Filter className="w-4 h-4 text-indigo-700" />
                  </div>
                </div>

                <div className="relative w-full sm:w-auto">
                  <select
                    value={filterDepartamento}
                    onChange={(e) => setFilterDepartamento(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 border border-indigo-400 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none"
                  >
                    <option value="">Todos os Departamentos</option>
                    {uniqueDepartamentos.map((departamento) => (
                      <option key={departamento} value={departamento}>
                        {departamento}
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
              <p className="text-indigo-900">Carregando funcionários...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredFuncionarios.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-indigo-900">Nenhum funcionário encontrado.</p>
            </div>
          ) : (
            <>
              {/* Tabela só para telas extra grandes */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300">
                        Foto
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('nome')}
                      >
                        Nome
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('cargo')}
                      >
                        Cargo
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('departamento')}
                      >
                        Departamento
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider cursor-pointer hover:bg-indigo-300"
                        onClick={() => handleSort('email')}
                      >
                        Email
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-300">
                    {filteredFuncionarios.map((funcionario) => (
                      <tr
                        key={funcionario.id}
                        className="hover:bg-indigo-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-400 flex items-center justify-center">
                            {(() => {
                              const segura = getSafeImagePath(
                                funcionario.foto || ''
                              );
                              return segura ? (
                                <img
                                  src={`${
                                    import.meta.env.VITE_API_URL
                                  }${segura}`}
                                  alt={funcionario.nome}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs text-indigo-900 font-bold">
                                  {funcionario.nome
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                          {funcionario.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {funcionario.cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {funcionario.departamento}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {funcionario.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                            {showDeleteConfirm === funcionario.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDelete(funcionario.id)}
                                  className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                  title="Confirmar"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="p-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                                  title="Cancelar"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/gestor/alunos/${funcionario.id}/visualizaraluno`
                                    )
                                  }
                                  className="p-1 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400"
                                  title="Ver perfil"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/gestor/professores/${funcionario.id}/editar`
                                    )
                                  }
                                  className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                  title="Configurações"
                                >
                                  <Settings size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    setShowDeleteConfirm(funcionario.id)
                                  }
                                  className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                  title="Excluir"
                                >
                                  <Trash size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para mobile, tablet e desktop até 1279px */}
              <div className="xl:hidden flex flex-col gap-3 p-2">
                {filteredFuncionarios.map((funcionario) => (
                  <div
                    key={funcionario.id}
                    className="bg-white rounded-lg shadow p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-400 flex items-center justify-center">
                        {(() => {
                          const segura = getSafeImagePath(
                            funcionario.foto || ''
                          );
                          return segura ? (
                            <img
                              src={`/${segura}`}
                              alt={funcionario.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-indigo-900 font-bold">
                              {funcionario.nome.substring(0, 2).toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {funcionario.nome}
                        </div>
                        <div className="text-xs text-gray-500">
                          {funcionario.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span>
                        <b>Cargo:</b> {funcionario.cargo}
                      </span>
                      <span>
                        <b>Departamento:</b> {funcionario.departamento}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      {showDeleteConfirm === funcionario.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(funcionario.id)}
                            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                            title="Confirmar"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="p-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              navigate(
                                `/gestor/alunos/${funcionario.id}/visualizaraluno`
                              )
                            }
                            className="p-1 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400"
                            title="Ver perfil"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/gestor/professores/${funcionario.id}/editar`
                              )
                            }
                            className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                            title="Configurações"
                          >
                            <Settings size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(funcionario.id)}
                            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                            title="Excluir"
                          >
                            <Trash size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessoresPage;
