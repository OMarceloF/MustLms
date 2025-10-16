// src/pages/VisualizarTurmasPage.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import axios from 'axios';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';

interface Aluno {
  id: number;
  nome: string;
  role: string;
  foto_url?: string;
  matricula: string;
}

interface DisciplinaComProfessor {
  materiaId: number;
  nome: string;
  aulasSemana: number;
  professorId: number | null;
  professorNome: string | null;
}

interface Turma {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  ano_letivo: string;
  qtd_alunos: number;
  professor_responsavel?: string;
  alunos?: Aluno[];
}

interface MateriaItem {
  id: number;
  nome: string;
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

function getSafeImagePathOne(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? `/${path}` : null;
}

const VisualizarTurmaPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const isProfessor = user.role === 'professor';

  const [turma, setTurma] = useState<Turma | null>(null);
  const [disciplinas, setDisciplinas] = useState<DisciplinaComProfessor[]>([]);
  const materiasParaSelecao = useMemo(() => {
    if (isProfessor) {
      return disciplinas.filter((d) => d.professorId === user.id);
    }
    return disciplinas;
  }, [disciplinas, isProfessor, user.id]);
  const [professoresPorMateria, setProfessoresPorMateria] = useState<{
    [materiaId: number]: { id: number; nome: string }[];
  }>({});
  const [selecoes, setSelecoes] = useState<{ [materiaId: number]: number }>({});
  const [editingMateriaId, setEditingMateriaId] = useState<number | null>(null);

  // Alunos
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Aluno[]>([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState<number[]>([]);
  const [buscaAluno, setBuscaAluno] = useState('');
  const [selectedMateriaId, setSelectedMateriaId] = useState<number | ''>('');
  const [periodos] = useState<string[]>([
    '1º Bimestre',
    '2º Bimestre',
    '3º Bimestre',
    '4º Bimestre',
  ]);
  // cada array de notas pode conter number ou null
  const [notasMap, setNotasMap] = useState<{
    [alunoId: number]: (number | null)[];
  }>({});
  // cada média pode ser number ou null
  const [mediaMap, setMediaMap] = useState<{
    [alunoId: number]: number | null;
  }>({});

  const alunosParaBoletim = turma?.alunos || [];

  // Adicionar Disciplinas
  const [listaMaterias, setListaMaterias] = useState<MateriaItem[]>([]);
  const [filtroMaterias, setFiltroMaterias] = useState('');
  const [materiasSelecionadas, setMateriasSelecionadas] = useState<number[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // 1) Buscar dados gerais da turma (incluindo alunos)
  useEffect(() => {
    const fetchTurma = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<Turma>(
          `/api/turmas/${id}`
        );
        // Ordenar alunos vinculados por nome
        if (response.data.alunos) {
          response.data.alunos.sort((a, b) => a.nome.localeCompare(b.nome));
        }
        setTurma(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao buscar turma:', err);
        toast.error('Erro ao carregar os dados da turma.');
        setIsLoading(false);
      }
    };
    fetchTurma();
  }, [id]);

  // 2) Buscar disciplinas + professor vinculado para esta turma
  const fetchDisciplinasComProfessor = async () => {
    try {
      const resp = await axios.get<DisciplinaComProfessor[]>(
        `${
          import.meta.env.VITE_API_URL
        }/api/turmas/${id}/disciplinas-com-professor`
      );
      // Ordenar alfabeticamente por nome
      const ordenadas = resp.data
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome));
      setDisciplinas(ordenadas);
    } catch (err) {
      console.error('Erro ao buscar disciplinas com professor:', err);
      setError('Erro ao carregar disciplinas.');
    }
  };

  useEffect(() => {
    if (turma) {
      fetchDisciplinasComProfessor();
    }
  }, [turma]);

  // 3) Buscar alunos disponíveis (não vinculados)
  const atualizarAlunosDisponiveis = async () => {
    try {
      const response = await axios.get<Aluno[]>(
        `/api/turmas/alunos/disponiveis`
      );
      // Ordenar alfabeticamente por nome
      const ordenados = response.data
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome));
      setAlunosDisponiveis(ordenados);
    } catch (err) {
      console.error('Erro ao buscar alunos disponíveis:', err);
      setError('Erro ao carregar os alunos disponíveis.');
    }
  };

  useEffect(() => {
    atualizarAlunosDisponiveis();
  }, []);

  const alunosFiltrados = alunosDisponiveis.filter((aluno) =>
    aluno.nome.toLowerCase().includes(buscaAluno.toLowerCase())
  );

  const handleSelecionarAluno = (alunoId: number) => {
    setAlunosSelecionados((prev) =>
      prev.includes(alunoId)
        ? prev.filter((a) => a !== alunoId)
        : [...prev, alunoId]
    );
  };

  const handleVincularAluno = async () => {
    if (alunosSelecionados.length === 0) {
      toast.error('Por favor, selecione pelo menos um aluno para vincular.');
      return;
    }
    try {
      await axios.post(`/api/turmas/${id}/adicionar-alunos`,
        {
          alunos: alunosSelecionados,
        }
      );
      toast.success('Alunos vinculados com sucesso!');
      setAlunosSelecionados([]);
      // Recarregar turma
      const response = await axios.get<Turma>(
        `/api/turmas/${id}`
      );
      if (response.data.alunos) {
        response.data.alunos.sort((a, b) => a.nome.localeCompare(b.nome));
      }
      setTurma(response.data);
      await atualizarAlunosDisponiveis();
    } catch (err) {
      console.error('Erro ao vincular alunos:', err);
      setError('Erro ao vincular os alunos à turma.');
    }
  };

  const handleRemoverAluno = async (alunoId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da turma?'))
      return;
    try {
      await axios.delete(`/api/turmas/${id}/alunos/${alunoId}`
      );
      // Recarregar turma
      const response = await axios.get<Turma>(
        `/api/turmas/${id}`
      );
      if (response.data.alunos) {
        response.data.alunos.sort((a, b) => a.nome.localeCompare(b.nome));
      }
      setTurma(response.data);
      await atualizarAlunosDisponiveis();
      toast.success('Aluno removido com sucesso!');
    } catch (err) {
      console.error('Erro ao remover aluno:', err);
      toast.error('Erro ao remover aluno da turma.');
    }
  };

  // 4) Carregar lista de professores para cada matéria
  const fetchProfessoresParaMateria = async (materiaId: number) => {
    if (professoresPorMateria[materiaId]) {
      return;
    }
    try {
      const resp = await axios.get<{ id: number; nome: string }[]>(
        `/api/materias/${materiaId}/professores`
      );
      setProfessoresPorMateria((prev) => ({
        ...prev,
        [materiaId]: resp.data,
      }));
    } catch (err) {
      console.error(
        `Erro ao buscar professores para matéria ${materiaId}:`,
        err
      );
    }
  };

  useEffect(() => {
    disciplinas.forEach((disc) => {
      if (!disc.professorNome && !professoresPorMateria[disc.materiaId]) {
        fetchProfessoresParaMateria(disc.materiaId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplinas]);

  const handleChangeSelecaoProfessor = (
    materiaId: number,
    novoProfessorId: number
  ) => {
    setSelecoes((prev) => ({
      ...prev,
      [materiaId]: novoProfessorId,
    }));
  };

  const handleSalvarProfessor = async (materiaId: number) => {
    const professorId = selecoes[materiaId];
    if (!professorId) {
      toast.error('Selecione um professor primeiro.');
      return;
    }
    try {
      await axios.post(`/api/turmas/${id}/professores`,
        {
          materiaId,
          professorId,
        }
      );
      await fetchDisciplinasComProfessor();
      setEditingMateriaId(null);
      toast.success('Professor atribuído/atualizado com sucesso.');
    } catch (err) {
      console.error('Erro ao salvar professor:', err);
      toast.error('Falha ao salvar professor.');
    }
  };

  // 5) Listar todas as matérias para adicionar
  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const resp = await axios.get<MateriaItem[]>(
          `/api/listarMaterias`
        );
        // Ordenar alfabeticamente por nome
        const ordenadas = resp.data
          .slice()
          .sort((a, b) => a.nome.localeCompare(b.nome));
        setListaMaterias(ordenadas);
      } catch (err) {
        console.error('Erro ao buscar lista de matérias:', err);
      }
    };
    fetchMaterias();
  }, []);

  useEffect(() => {
    if (selectedMateriaId && turma?.alunos?.length) {
      const alunos = turma.alunos;
      Promise.all(
        alunos.map((a) =>
          axios.get<{ tipoAvaliacao: string; materias: any[] }>(
            `/api/boletim/${a.id}`
          )
        )
      )
        .then((resps) => {
          const tempNotas: Record<number, (number | null)[]> = {};
          const tempMedia: Record<number, number | null> = {};

          resps.forEach((res, i) => {
            const aluno = alunos[i];
            const mat = res.data.materias.find(
              (m) => m.id === selectedMateriaId
            );
            if (mat) {
              // copia o array de grades (já na ordem dos períodos)
              tempNotas[aluno.id] = mat.grades.map((g: number) =>
                typeof g === 'number' ? Number(g.toFixed(1)) : null
              );
              tempMedia[aluno.id] = mat.finalGrade;
            } else {
              tempNotas[aluno.id] = Array(periodos.length).fill(null);
              tempMedia[aluno.id] = null;
            }
          });

          setNotasMap(tempNotas);
          setMediaMap(tempMedia);
        })
        .catch((err) => {
          console.error('Erro ao buscar boletim por aluno:', err);
          setNotasMap({});
          setMediaMap({});
        });
    } else {
      setNotasMap({});
      setMediaMap({});
    }
  }, [selectedMateriaId, turma]);

  // Calcular matérias disponíveis para vincular: todas menos as já vinculadas
  const materiasDisponiveisParaVinculo = useMemo(() => {
    const vinculadasIds = new Set(disciplinas.map((d) => d.materiaId));
    return listaMaterias.filter((mat) => !vinculadasIds.has(mat.id));
  }, [listaMaterias, disciplinas]);

  // Filtra matérias disponíveis mantendo ordem alfabética
  const materiasFiltradas = materiasDisponiveisParaVinculo.filter((mat) =>
    mat.nome.toLowerCase().includes(filtroMaterias.toLowerCase())
  );

  const toggleSelecionarMateria = (matId: number) => {
    setMateriasSelecionadas((prev) =>
      prev.includes(matId) ? prev.filter((m) => m !== matId) : [...prev, matId]
    );
  };

  const handleVincularMaterias = async () => {
    if (materiasSelecionadas.length === 0) {
      toast.error('Selecione ao menos uma matéria para vincular.');
      return;
    }
    try {
      await axios.post(`/api/turmas/${id}/materias`,
        {
          materias: materiasSelecionadas,
        }
      );
      toast.success('Matérias vinculadas com sucesso!');
      setMateriasSelecionadas([]);
      await fetchDisciplinasComProfessor();
    } catch (err) {
      console.error('Erro ao vincular matérias:', err);
      toast.error('Falha ao vincular matérias.');
    }
  };

  // 6) Remover disciplina da turma
  const handleRemoverDisciplina = async (materiaId: number) => {
    if (!window.confirm('Remover esta disciplina da turma?')) return;
    try {
      await axios.delete(`/api/turmas/${id}/materias/${materiaId}`
      );
      // Recarregar lista de disciplinas
      await fetchDisciplinasComProfessor();
    } catch (err) {
      console.error('Erro ao remover disciplina:', err);
      toast.error('Falha ao remover disciplina.');
    }
  };

  const handleEditar = () => {
    if (isProfessor) {
      navigate(`/professor/turmas/${id}/editar`);
    } else {
      navigate(`/gestor/turmas/${id}/editar`);
    }
  };

  const handleVoltar = () => {
    if (isProfessor) {
      navigate('/professor', { state: { activePage: 'turmas' } });
    } else {
      navigate('/gestor', { state: { activePage: 'turmas' } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row w-full min-w-0 md:flex">
        {/* Sidebar */}
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <TopbarGestorAuto
            isMenuOpen={sidebarAberta}
            setIsMenuOpen={setSidebarAberta}
          />

          {/* Conteúdo */}
          <div className="w-full min-w-0 max-w-7xl mx-auto p-2 sm:p-6 mt-20 my-10">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-indigo-900">Carregando turma...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : turma ? (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 mt-4 md:mt-0 md:ml-16">
                <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-6">
                  <h1 className="text-3xl font-bold text-indigo-900">
                    {turma.nome}
                  </h1>
                  {/* Seletor de Matéria */}
                  <div className="flex items-center gap-2 mb-4">
                    <label className="font-medium">Matéria:</label>
                    <select
                      value={selectedMateriaId}
                      onChange={(e) =>
                        setSelectedMateriaId(Number(e.target.value))
                      }
                      className="px-2 py-1 border rounded focus:ring-indigo-700 focus:outline-none"
                    >
                      <option value={''} disabled>
                        Selecione...
                      </option>
                      {materiasParaSelecao.map((d) => (
                        <option key={d.materiaId} value={d.materiaId}>
                          {d.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Botão navegação */}
                  <button
                    onClick={() =>
                      isProfessor
                        ? navigate(
                            `/professor/turmas/${id}/materias/${selectedMateriaId}/avaliacoes-notas`
                          )
                        : navigate(
                            `/gestor/turmas/${id}/materias/${selectedMateriaId}/avaliacoes-notas`
                          )
                    }
                    disabled={!selectedMateriaId}
                    className="px-4 py-2 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 text-sm disabled:opacity-50"
                  >
                    Avaliações &amp; Notas
                  </button>

                  {/* Diário */}
                  <button
                    onClick={() =>
                      isProfessor
                        ? navigate(
                            `/professor/turmas/${id}/materias/${selectedMateriaId}/diario`
                          )
                        : navigate(
                            `/gestor/turmas/${id}/materias/${selectedMateriaId}/diario`
                          )
                    }
                    disabled={!selectedMateriaId}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg shadow hover:bg-orange-700 transition duration-200 disabled:opacity-50"
                  >
                    Ver Diário
                  </button>
                </div>
                <div className="space-y-4">
                  <p>
                    <strong>Série:</strong> {turma.serie}
                  </p>
                  <p>
                    <strong>Turno:</strong> {turma.turno}
                  </p>
                  <p>
                    <strong>Ano Letivo:</strong> {turma.ano_letivo}
                  </p>
                  <p>
                    <strong>Qtd. de Alunos:</strong> {turma.qtd_alunos}
                  </p>
                  {turma.professor_responsavel && (
                    <p>
                      <strong>Professor Responsável:</strong>{' '}
                      {turma.professor_responsavel}
                    </p>
                  )}
                </div>

                {/* ─── Seção “Alunos” ─────────────────────────────────────────────── */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                    Alunos
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-indigo-400">
                      <thead>
                        <tr className="bg-indigo-50">
                          <th className="border border-indigo-400 p-2 text-left w-12">
                            Foto
                          </th>
                          <th className="border border-indigo-400 p-2 text-left">
                            Nome
                          </th>
                          <th className="border border-indigo-400 p-2 text-left">
                            Matrícula
                          </th>
                          <th className="border border-indigo-400 p-2 text-left">
                            Status
                          </th>
                          <th className="border border-indigo-400 p-2 text-left w-10">
                            Excluir
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {turma.alunos?.map((aluno) => (
                          <tr key={aluno.id} className="hover:bg-indigo-50">
                            <td className="border border-indigo-400 p-2">
                              {(() => {
                                const segura = getSafeImagePath(
                                  aluno.foto_url || ''
                                );
                                return segura ? (
                                  <img
                                    src={`${
                                      import.meta.env.VITE_API_URL
                                    }${segura}`}
                                    alt={aluno.nome}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-300 text-indigo-900 font-bold">
                                    {aluno.nome.substring(0, 2).toUpperCase()}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="border border-indigo-400 p-2">
                              {aluno.nome}
                            </td>
                            <td className="border border-indigo-400 p-2">
                              {aluno.matricula}
                            </td>
                            <td className="border border-indigo-400 p-2">
                              {aluno.role}
                            </td>
                            <td className="border border-indigo-400 p-2 w-10 text-center">
                              <button
                                onClick={() => handleRemoverAluno(aluno.id)}
                                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                title="Excluir"
                              >
                                <Trash size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ─── Seção “Disciplinas” ────────────────────────────────────────── */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                    Disciplinas
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-indigo-400">
                      <thead>
                        <tr className="bg-indigo-50">
                          <th className="border border-indigo-400 p-2 text-left">
                            Disciplina
                          </th>
                          <th className="border border-indigo-400 p-2 text-left">
                            Aulas/semana
                          </th>
                          <th className="border border-indigo-400 p-2 text-left">
                            Professor
                          </th>
                          <th className="border border-indigo-400 p-2 text-center w-24">
                            Editar
                          </th>
                          <th className="border border-indigo-400 p-2 text-center w-10">
                            Excluir
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {disciplinas.map((disc) => (
                          <tr key={disc.materiaId} className="hover:bg-indigo-50">
                            {/* Coluna 1: Nome da matéria */}
                            <td className="border border-indigo-400 p-2">
                              {disc.nome}
                            </td>

                            {/* Coluna 2: Aulas/semana */}
                            <td className="border border-indigo-400 p-2">
                              {disc.aulasSemana}
                            </td>

                            {/* Coluna 3: Professor */}
                            <td className="border border-indigo-400 p-2">
                              {disc.professorNome &&
                              editingMateriaId !== disc.materiaId ? (
                                <span className="text-gray-700">
                                  {disc.professorNome}
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <select
                                    className="border border-indigo-400 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                                    value={selecoes[disc.materiaId] || ''}
                                    onChange={(e) => {
                                      const novoProfId = Number(e.target.value);
                                      handleChangeSelecaoProfessor(
                                        disc.materiaId,
                                        novoProfId
                                      );
                                    }}
                                    onFocus={() => {
                                      fetchProfessoresParaMateria(
                                        disc.materiaId
                                      );
                                    }}
                                  >
                                    <option value="">
                                      Selecionar professor...
                                    </option>
                                    {professoresPorMateria[disc.materiaId]?.map(
                                      (prof) => (
                                        <option key={prof.id} value={prof.id}>
                                          {prof.nome}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </div>
                              )}
                            </td>

                            {/* Coluna 4: Botão Editar / Salvar / Cancelar */}
                            <td className="border border-indigo-400 p-2 text-center">
                              {disc.professorNome &&
                              editingMateriaId !== disc.materiaId ? (
                                <button
                                  onClick={() => {
                                    setEditingMateriaId(disc.materiaId);
                                    if (disc.professorId) {
                                      setSelecoes((prev) => ({
                                        ...prev,
                                        [disc.materiaId]: disc.professorId!,
                                      }));
                                    }
                                    fetchProfessoresParaMateria(disc.materiaId);
                                  }}
                                  className="px-3 py-1 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 text-sm"
                                  title="Editar Professor"
                                >
                                  Editar
                                </button>
                              ) : (
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleSalvarProfessor(disc.materiaId)
                                    }
                                    className="px-3 py-1 bg-indigo-800 text-white rounded-lg hover:bg-indigo-900 text-sm"
                                    title="Salvar Professor"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingMateriaId(null);
                                      setSelecoes((prev) => {
                                        const copia = { ...prev };
                                        delete copia[disc.materiaId];
                                        return copia;
                                      });
                                    }}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                                    title="Cancelar Edição"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Coluna 5: Ícone de Lixeira para Excluir Disciplina */}
                            <td className="border border-indigo-400 p-2 w-10 text-center">
                              <button
                                onClick={() =>
                                  handleRemoverDisciplina(disc.materiaId)
                                }
                                className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                title="Excluir Disciplina"
                              >
                                <Trash size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ─── Seção “Adicionar Disciplinas” ───────────────────────────────── */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                    Adicionar Disciplinas
                  </h2>

                  {/* Campo de busca */}
                  <input
                    type="text"
                    placeholder="Buscar matérias..."
                    className="w-full mb-2 px-3 py-2 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700"
                    value={filtroMaterias}
                    onChange={(e) => setFiltroMaterias(e.target.value)}
                  />

                  {/* Lista rolável, estilo “alunos” */}
                  <div className="max-h-48 overflow-y-auto border border-indigo-400 rounded-md p-1">
                    {materiasFiltradas.length === 0 && (
                      <div className="p-2 text-gray-500">
                        Nenhuma matéria encontrada.
                      </div>
                    )}
                    {materiasFiltradas.map((mat) => (
                      <label
                        key={mat.id}
                        className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg transition-colors
                          ${
                            materiasSelecionadas.includes(mat.id)
                              ? 'bg-indigo-400'
                              : 'hover:bg-indigo-50'
                          }`}
                        onClick={() => toggleSelecionarMateria(mat.id)}
                        style={{ userSelect: 'none' }}
                      >
                        {/* Checkbox escondido */}
                        <input
                          type="checkbox"
                          checked={materiasSelecionadas.includes(mat.id)}
                          onChange={() => toggleSelecionarMateria(mat.id)}
                          className="hidden"
                        />
                        {/* Avatar de duas letras */}
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-300 text-indigo-900 font-bold">
                          {mat.nome.substring(0, 2).toUpperCase()}
                        </span>
                        <span className="text-gray-800">{mat.nome}</span>
                      </label>
                    ))}
                  </div>

                  {/* Botão “Vincular Selecionadas” com espaçamento acima */}
                  <button
                    onClick={handleVincularMaterias}
                    className="mt-3 bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-900"
                  >
                    Vincular Selecionadas
                  </button>
                </div>

                {/* ─── Seção “Vincular Aluno” ─────────────────────────────────────── */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                    Vincular Aluno
                  </h2>
                  <input
                    type="text"
                    placeholder="Buscar aluno..."
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700"
                  />
                  <div className="max-h-48 overflow-y-auto border border-indigo-400 rounded-md p-1">
                    {alunosFiltrados.length === 0 && (
                      <div className="p-2 text-gray-500">
                        Nenhum aluno encontrado.
                      </div>
                    )}
                    {alunosFiltrados.map((aluno) => (
                      <label
                        key={aluno.id}
                        className={`flex items-center gap-3 p-2 cursor-pointer rounded-lg transition-colors
                          ${
                            alunosSelecionados.includes(aluno.id)
                              ? 'bg-indigo-400'
                              : 'hover:bg-indigo-50'
                          }`}
                        onClick={() => handleSelecionarAluno(aluno.id)}
                        style={{ userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={alunosSelecionados.includes(aluno.id)}
                          onChange={() => handleSelecionarAluno(aluno.id)}
                          className="hidden"
                        />
                        {(() => {
                          const safeFoto = getSafeImagePathOne(
                            aluno.foto_url || ''
                          );

                          return safeFoto ? (
                            <img
                              src={safeFoto}
                              alt={aluno.nome}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-300 text-indigo-900 font-bold">
                              {aluno.nome.substring(0, 2).toUpperCase()}
                            </span>
                          );
                        })()}
                        <span>{aluno.nome}</span>

                        <span>{aluno.nome}</span>
                      </label>
                    ))}
                  </div>

                  {/* Botão “Vincular Selecionados” com espaçamento acima */}
                  <button
                    onClick={handleVincularAluno}
                    className="mt-3 bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-900"
                  >
                    Vincular Selecionados
                  </button>
                </div>

                {/* ─── Seção “Boletim da Turma” ────────────────────────────────────────── */}
                <div className="mt-8 bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-semibold text-indigo-900 mb-4">
                    Boletim da Turma
                  </h2>

                  {/* Filtro de Matéria */}
                  <div className="mb-4 flex items-center gap-2">
                    <label htmlFor="filtroMateria" className="font-medium">
                      Filtrar Matéria:
                    </label>
                    <select
                      id="filtroMateria"
                      value={selectedMateriaId}
                      onChange={(e) =>
                        setSelectedMateriaId(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      className="border border-indigo-500 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                    >
                      <option value="">Todas as Matérias</option>
                      {listaMaterias.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tabela de Boletim */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-indigo-400">
                      <thead>
                        <tr className="bg-indigo-50">
                          <th className="border border-indigo-400 p-2 text-left">
                            Aluno
                          </th>
                          {periodos.map((p, i) => (
                            <th
                              key={i}
                              className="border border-indigo-400 p-2 text-center"
                            >
                              {p}
                            </th>
                          ))}
                          <th className="border border-indigo-400 p-2 text-center">
                            Média Geral
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {alunosParaBoletim.map((aluno) => {
                          const notasArr =
                            notasMap[aluno.id] ||
                            Array(periodos.length).fill(null);
                          const media = mediaMap[aluno.id];
                          return (
                            <tr key={aluno.id} className="hover:bg-indigo-50">
                              <td className="border border-indigo-400 p-2">
                                {aluno.nome}
                              </td>
                              {notasArr.map((n, i) => (
                                <td
                                  key={i}
                                  className="border border-indigo-400 p-2 text-center"
                                >
                                  {n != null ? n.toFixed(1) : '—'}
                                </td>
                              ))}
                              <td className="border border-indigo-400 p-2 text-center">
                                {media != null ? media.toFixed(1) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ─── Botões “Editar Turma” / “Voltar” ─────────────────────────────── */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={handleEditar}
                    className="px-6 py-2 bg-indigo-500 text-grey-600 rounded-lg hover:bg-indigo-600"
                  >
                    Editar Turma
                  </button>
                  <button
                    onClick={handleVoltar}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">Turma não encontrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizarTurmaPage;
