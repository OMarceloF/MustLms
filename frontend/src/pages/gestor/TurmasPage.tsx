import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';


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

const TurmasPage = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filteredTurmas, setFilteredTurmas] = useState<Turma[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();  // ← pega o usuário
  const isProfessor = user.role === 'professor';     // ← flag de professor

  useEffect(() => {
    if (authLoading) return;                // espera perfil carregar
    const fetchTurmas = async () => {
      try {
        setIsLoading(true);
        const url = isProfessor
          ? `/api/professores/${user.id}/turmas`
          : `/api/turmas`;
        const { data } = await axios.get<Turma[]>(url);
        setTurmas(data);
        setFilteredTurmas(data);
      } catch (err) {
        setError('Erro ao carregar as turmas.');
        console.error('Erro ao buscar turmas:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTurmas();
  }, [authLoading, isProfessor, user.nome]);

  useEffect(() => {
    const filtered = turmas.filter((turma) =>
      turma.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTurmas(filtered);
  }, [searchTerm, turmas]);

  const handleCriarTurma = () => {
    navigate('/gestor/criarTurma');
  };

  const handleVisualizar = (id: number) => {
    if (isProfessor) {
      navigate(`/professor/turmas/${id}/visualizar`)
    } else {
      navigate(`/gestor/${id}/visualizar`)
    }
  }

  const handleEditar = (id: number) => {
    navigate(`/gestor/turmas/${id}/editar`);
  };

  const handleExcluir = async (id: number) => {
    // 1ª Confirmação: Pergunta simples e direta.
    const primeiraConfirmacao = window.confirm(
      'Tem certeza que deseja excluir esta turma?'
    );

    // Se o usuário clicar em "Cancelar", a função para aqui.
    if (!primeiraConfirmacao) {
      return;
    }

    // 2ª Confirmação: Aviso forte sobre a irreversibilidade da ação.
    const segundaConfirmacao = window.confirm(
      'AVISO: Esta ação é permanente e apagará TODOS os dados associados a esta turma (vínculos de alunos, notas, presenças, etc.).\n\nEsta ação não pode ser desfeita. Deseja continuar?'
    );

    // Se o usuário clicar em "Cancelar" na segunda vez, a função também para.
    if (!segundaConfirmacao) {
      return;
    }

    // Se o usuário confirmou as duas vezes, a requisição de exclusão é enviada.
    try {
      await axios.delete(`/api/turmas/${id}`);

      // Atualiza o estado local para remover a turma da interface imediatamente.
      setTurmas((prevTurmas) => prevTurmas.filter((turma) => turma.id !== id));

      toast.success('Turma excluída com sucesso!');

    } catch (err: any) {
      console.error('Erro ao excluir turma:', err);

      // Extrai a mensagem de erro principal enviada pelo backend
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao excluir a turma. Tente novamente.';

      // Mostra um alerta simples para o usuário
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto mt-[20px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-black mb-2 md:mb-0">📘 Gerenciamento de Turmas</h1>
          {!isProfessor && (
            <button
              onClick={handleCriarTurma}
              className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg transition-all shadow-lg w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              <span>Criar Nova Turma</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="p-6 border-b border-indigo-300">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-indigo-700" />
              </div>
              <input
                type="text"
                placeholder="Buscar turmas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full py-2 border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-700 outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-indigo-900">Carregando turmas...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredTurmas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-indigo-900">Nenhuma turma encontrada.</p>
            </div>
          ) : (
            <>
              {/* Tabela só para telas extra grandes */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Identificação Turma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Série
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Ano
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Turno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Alunos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Professor
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-300">
                    {filteredTurmas.map((turma) => (
                      <tr key={turma.id} className="hover:bg-indigo-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{turma.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {turma.serie} {turma.etapa_ensino}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{turma.ano_letivo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{turma.turno}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{turma.qtd_alunos}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {turma.professor_responsavel || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => handleVisualizar(turma.id)}
                              className="p-1 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            {!isProfessor && (
                              <button
                                onClick={() => handleEditar(turma.id)}
                                className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>)}
                            {!isProfessor && (
                              <button
                                onClick={() => handleExcluir(turma.id)}
                                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                title="Excluir"
                              >
                                <Trash size={18} />
                              </button>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para mobile, tablet e desktop até 1279px */}
              <div className="xl:hidden flex flex-col gap-3 p-2">
                {filteredTurmas.map((turma) => (
                  <div
                    key={turma.id}
                    className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">{turma.nome}</div>
                        <div className="text-xs text-gray-500">
                          <b>Série:</b> {turma.serie} {turma.etapa_ensino} &nbsp;|&nbsp;
                          <b>Ano:</b> {turma.ano_letivo}
                        </div>
                        <div className="text-xs text-gray-500">
                          <b>Turno:</b> {turma.turno} &nbsp;|&nbsp;
                          <b>Alunos:</b> {turma.qtd_alunos}
                        </div>
                        <div className="text-xs text-gray-500">
                          <b>Professor:</b> {turma.professor_responsavel || '-'}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleVisualizar(turma.id)}
                          className="p-1 bg-indigo-300 text-indigo-800 rounded-full hover:bg-indigo-400"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        {!isProfessor && (
                          <button
                            onClick={() => handleEditar(turma.id)}
                            className="p-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>)}
                        {!isProfessor && (
                          <button
                            onClick={() => handleExcluir(turma.id)}
                            className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                            title="Excluir"
                          >
                            <Trash size={18} />
                          </button>)}
                      </div>
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

export default TurmasPage;