import React, { useState, useEffect } from 'react';
import { toast } from './hooks/use-toast';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// ─── Hook para puxar todos os períodos (bimestre/trimestre) deste turma+matéria ───
function usePeriodos(turmaId: string, materiaId: string) {
  const [periodos, setPeriodos] = useState<
    { id: number; label: string; pontuacao_max: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!turmaId || !materiaId) return;
    setIsLoading(true);
    axios
      .get(`/api/turmas/${turmaId}/materias/${materiaId}/calendario_gestor`)
      .then((res) => setPeriodos(res.data))
      .catch((err) => console.error('Erro ao buscar períodos:', err))
      .finally(() => setIsLoading(false));
  }, [turmaId, materiaId]);

  return { periodos, isLoading };
}

// Busca avaliações filtradas por turma, matéria e bimestre
function useAvaliacoes(
  turmaId: string,
  materiaId: string,
  calendarioId?: number
) {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!turmaId || !materiaId || calendarioId == null) return;
    setIsLoading(true);
    axios
      .get(`/api/turmas/${turmaId}/materias/${materiaId}/avaliacoes`, {
        params: { calendarioId }, // ← camelCase bate com req.query.calendarioId
      })
      .then((res) => setAvaliacoes(res.data))
      .catch((err) => console.error('Erro ao buscar avaliações:', err))
      .finally(() => setIsLoading(false));
  }, [turmaId, materiaId, calendarioId]);

  const adicionarAvaliacao = async (dados: any) => {
    const { data } = await axios.post('/api/avaliacoes', {
      ...dados,
      turma_id: Number(turmaId),
      materia_id: Number(materiaId),
    });
    setAvaliacoes((prev) => [...prev, { id: data.id, ...dados }]);
  };

  const editarAvaliacao = async (id: number, dados: any) => {
    await axios.put(`/api/avaliacoes/${id}`, dados);
    setAvaliacoes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...dados } : a))
    );
  };

  const excluirAvaliacao = async (id: number) => {
    await axios.delete(`/api/avaliacoes/${id}`);
    setAvaliacoes((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    avaliacoes,
    isLoading,
    adicionarAvaliacao,
    editarAvaliacao,
    excluirAvaliacao,
  };
}

// Busca alunos da turma
function useAlunos(turmaId: string) {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!turmaId) return;
    setIsLoading(true);
    axios
      .get(`/api/turmas/${turmaId}/alunos`)
      .then((res) => setAlunos(res.data))
      .catch((err) => console.error('Erro ao buscar alunos:', err))
      .finally(() => setIsLoading(false));
  }, [turmaId]);

  return { alunos, isLoading };
}

function useNotas(calendarioId?: number) {
  const [notas, setNotas] = useState<Record<number, Record<number, number>>>({});
  const [recuperacao, setRecuperacao] = useState<Record<number, Record<number, { feita: boolean; nota: number }>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const setNota = (alunoId: number, avaliacaoId: number, valor: number) => {
    setNotas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [avaliacaoId]: valor,
      },
    }));
  };

  const setRecuperacaoNota = (
    alunoId: number,
    avaliacaoId: number,
    feita: boolean,
    nota: number = 0
  ) => {
    // --- LÓGICA DE CORREÇÃO ADICIONADA ---
    // Garante que, ao interagir com a recuperação, a nota principal seja registrada no estado,
    // mesmo que o usuário não tenha digitado nela.
    setNotas((prevNotas) => {
      // Verifica se já existe uma entrada para este aluno/avaliação
      const notaAtual = prevNotas[alunoId]?.[avaliacaoId];

      // Se não houver nota registrada (nem mesmo 0), inicializa com 0.
      if (notaAtual === undefined) {
        return {
          ...prevNotas,
          [alunoId]: {
            ...prevNotas[alunoId],
            [avaliacaoId]: 0, // Inicializa a nota principal com 0
          },
        };
      }

      // Se já existir, não faz nada e retorna o estado como está.
      return prevNotas;
    });
    // --- FIM DA LÓGICA DE CORREÇÃO ---

    // O resto da função continua como antes, atualizando o estado da recuperação.
    setRecuperacao((prevRecuperacao) => ({
      ...prevRecuperacao,
      [alunoId]: {
        ...prevRecuperacao[alunoId],
        [avaliacaoId]: { feita, nota },
      },
    }));
  };
  
  const salvarNotas = async (avaliacoesDoPeriodo: any[]) => {
    setIsSaving(true);

    // 1. Cria o payload completo com todas as notas e recuperações que estão no estado atual
    const payload = Object.entries(notas).flatMap(([alunoIdStr, avMap]) => {
      const alunoId = Number(alunoIdStr);
      return Object.entries(avMap).map(([avaliacaoIdStr, nota]) => {
        const avaliacaoId = Number(avaliacaoIdStr);
        const rec = recuperacao[alunoId]?.[avaliacaoId];

        return {
          aluno_id: alunoId,
          avaliacao_id: avaliacaoId,
          nota: nota,
          recuperacao: rec?.feita ? 'Sim' : 'Não',
          nota_rec: rec?.nota || 0,
        };
      });
    });

    // 2. Filtra o payload para enviar APENAS as notas que pertencem às avaliações do período atual
    const avaliacaoIdsAtuais = new Set(avaliacoesDoPeriodo.map(a => a.id));
    const payloadFiltrado = payload.filter(p => avaliacaoIdsAtuais.has(p.avaliacao_id));

    if (payloadFiltrado.length === 0) {
      toast({ title: "Aviso", description: "Nenhuma nota foi modificada para salvar neste período." });
      setIsSaving(false);
      return;
    }

    try {
      // 3. Envia o lote filtrado para o backend
      await axios.post('/api/notas/batch', payloadFiltrado);

      // 4. Marca as avaliações do período como "Concluído"
      const avaliacaoIdsParaConcluir = [...avaliacaoIdsAtuais];
      if (avaliacaoIdsParaConcluir.length > 0) {
        await axios.put('/api/avaliacoes/status/batch', { avaliacaoIds: avaliacaoIdsParaConcluir });
      }

      toast({
        title: 'Sucesso!',
        description: 'Notas salvas e avaliações marcadas como concluídas.',
      });
    } catch (err) {
      console.error('Erro ao salvar notas:', err);
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar as notas. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 5. useEffect para buscar as notas do banco de dados
  //    Ele depende APENAS de `calendarioId` para evitar recargas indesejadas.
  useEffect(() => {
    // Se não há um período selecionado, limpa os dados para não mostrar notas antigas
    if (typeof calendarioId !== 'number' || isNaN(calendarioId)) {
      setNotas({});
      setRecuperacao({});
      return;
    }

    // Busca as notas existentes para o período selecionado
    axios
      .get('/api/notas', { params: { calendarioId } })
      .then((res) => {
        const notasInit: Record<number, Record<number, number>> = {};
        const recInit: Record<number, Record<number, { feita: boolean; nota: number }>> = {};

        res.data.forEach((n: any) => {
          const alunoId = Number(n.aluno_id);
          const avaliacaoId = Number(n.avaliacao_id);

          if (!Number.isInteger(alunoId) || !Number.isInteger(avaliacaoId)) return;

          notasInit[alunoId] = notasInit[alunoId] || {};
          notasInit[alunoId][avaliacaoId] = Number(n.nota);

          recInit[alunoId] = recInit[alunoId] || {};
          recInit[alunoId][avaliacaoId] = {
            feita: n.recuperacao === 'Sim',
            nota: Number(n.nota_rec),
          };
        });

        setNotas(notasInit);
        setRecuperacao(recInit);
      })
      .catch(err => {
        console.error("Erro ao buscar notas iniciais:", err);
        // Limpa os estados em caso de erro para evitar dados inconsistentes
        setNotas({});
        setRecuperacao({});
      });
  }, [calendarioId]);

  return {
    notas,
    recuperacao,
    setNota,
    setRecuperacaoNota,
    salvarNotas,
    isSaving,
  };
}

// Components
function CardAvaliacao({
  avaliacao,
  onEdit,
  onExcluir,
}: {
  avaliacao: any;
  onEdit: () => void;
  onExcluir: () => void;
}) {
  const getStatusBadge = () => {
    // Simulando status baseado no ID
    const status = avaliacao.id === 1 ? 'pendente' : 'registrada';

    if (status === 'pendente') {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
          Nota pendente
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
        Nota registrada
      </span>
    );
  };

  return (
    <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-3 cursor-pointer hover:bg-blue-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1" onClick={onEdit}>
          <h3 className="font-medium text-blue-900 underline cursor-pointer hover:text-blue-700">
            {avaliacao.descricao}
          </h3>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              Valor Total:{' '}
              <span className="font-medium">{avaliacao.valor}</span>
            </div>
            <div>Valor: {avaliacao.valor}</div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {getStatusBadge()}
          <button
            onClick={onExcluir}
            className="text-red-500 hover:text-red-700 transition-colors p-1"
            title="Excluir avaliação"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
interface ModalAvaliacaoProps {
  turmaId: string;
  materiaId: string;
  isOpen: boolean;
  onClose(): void;
  avaliacao?: any;
  periodos: { id: number; label: string; pontuacao_max: number }[];
  calendarioId: number;
  setCalendarioId(id: number): void;
  onSave(dados: any): void;
  totalPontosUsados: number;
}
function ModalAvaliacao({
  turmaId,
  materiaId,
  isOpen,
  onClose,
  avaliacao,
  periodos,
  calendarioId,
  setCalendarioId,
  onSave,
  totalPontosUsados,
}: ModalAvaliacaoProps) {
  const pontuacaoMaxima =
    periodos.find((p) => p.id === calendarioId)?.pontuacao_max ?? 0;
  // disponível = máx do período menos o já usado, mais o valor da avaliação (na edição)
  const pontosDisponiveis =
    pontuacaoMaxima - totalPontosUsados + (avaliacao?.valor || 0);

  const [formData, setFormData] = useState<{
    descricao: string;
    valor: number;
    calendario_id?: number;
    data: string;
  }>({
    descricao: '',
    valor: 1,
    calendario_id: calendarioId,
    data: '',
  });

  useEffect(() => {
    if (avaliacao) {
      setFormData({
        descricao: avaliacao.descricao,
        valor: avaliacao.valor,
        calendario_id: avaliacao.calendario_id,
        data: avaliacao.data,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        descricao: '',
        valor: 1,
        data: '',
      }));
    }
  }, [avaliacao]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.valor > pontosDisponiveis) {
      toast({
        title: 'Erro',
        description: `Só há ${pontosDisponiveis} pontos disponí­veis.`,
        variant: 'destructive',
      });
      return;
    }

    onSave({
      descricao: formData.descricao,
      valor: formData.valor,
      calendario_id: formData.calendario_id!,
      turma_id: Number(turmaId), // ou receba via props
      materia_id: Number(materiaId), // ou receba via props
      data: formData.data,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          {avaliacao ? 'Editar Avaliação' : 'Cadastrar Avaliação'}
        </h2>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600">
            Total do período: {pontuacaoMaxima} pontos
          </div>
          <div className="text-sm text-gray-600">
            Pontos disponíveis: {pontosDisponiveis} pontos
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Descrição</label>
            <input
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (máximo {pontosDisponiveis} pontos)
            </label>
            <input
              type="number"
              min="1"
              max={pontosDisponiveis}
              value={formData.valor}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  valor: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              value={formData.calendario_id ?? ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setFormData((f) => ({ ...f, calendario_id: id }));
                setCalendarioId(id);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                — Escolha —
              </option>
              {periodos.map((p, idx) => {
                const isBimestre = p.label.toLowerCase().includes('bim');
                const sufixo = isBimestre ? 'Bimestre' : 'Trimestre';
                return (
                  <option key={p.id} value={p.id}>
                    {`${idx + 1}º ${sufixo}`} ({p.pontuacao_max} pts)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Aplicação
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData({ ...formData, data: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensagem,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">{titulo}</h2>
        <p className="text-gray-600 mb-6">{mensagem}</p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function FormularioNotas({
  alunos,
  avaliacoes,
  notas,
  recuperacao,
  setNota,
  setRecuperacaoNota,
  onSalvar,
  isSaving,
}: {
  alunos: any[];
  avaliacoes: any[];
  notas: Record<number, Record<number, number>>;
  recuperacao: Record<number, Record<number, { feita: boolean; nota: number }>>;
  setNota: (alunoId: number, avaliacaoId: number, valor: number) => void;
  setRecuperacaoNota: (
    alunoId: number,
    avaliacaoId: number,
    feita: boolean,
    nota?: number
  ) => void;
  onSalvar: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="space-y-4">
      {alunos.map((aluno) => (
        <div key={aluno.id} className="bg-white border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="font-medium text-blue-600">{aluno.matricula}</div>
              <div className="text-red-600 font-medium">{aluno.nome}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {avaliacoes.map((avaliacao) => {
              const notaAtual = notas[aluno.id]?.[avaliacao.id] || '';
              const recuperacaoAtual = recuperacao[aluno.id]?.[avaliacao.id];

              return (
                <div
                  key={avaliacao.id}
                  className="border border-gray-200 rounded p-3"
                >
                  <div className="font-medium text-sm mb-2">
                    {avaliacao.descricao}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Nota: (max: {avaliacao.valor})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={avaliacao.valor}
                        step="0.1"
                        value={notaAtual}
                        onChange={(e) => {
                          let valor = parseFloat(e.target.value) || 0;
                          if (valor > avaliacao.valor) valor = avaliacao.valor;
                          if (valor < 0) valor = 0;
                          setNota(aluno.id, avaliacao.id, valor);
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`rec-${aluno.id}-${avaliacao.id}`}
                        checked={recuperacaoAtual?.feita || false}
                        onChange={(e) =>
                          setRecuperacaoNota(
                            aluno.id,
                            avaliacao.id,
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <label
                        htmlFor={`rec-${aluno.id}-${avaliacao.id}`}
                        className="text-xs text-gray-600"
                      >
                        Não realizada
                      </label>
                    </div>

                    {recuperacaoAtual?.feita && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Recuperação Paralela:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={avaliacao.valor}
                          step="0.1"
                          value={recuperacaoAtual.nota}
                          onChange={(e) =>
                            setRecuperacaoNota(
                              aluno.id,
                              avaliacao.id,
                              true,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-right text-sm">
            <span className="text-gray-600">Notas do Aluno: </span>
            <span className="font-medium">
              {avaliacoes
                .reduce((acc, av) => acc + (notas[aluno.id]?.[av.id] || 0), 0)
                .toFixed(1)}
            </span>
          </div>
        </div>
      ))}

      {alunos.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onSalvar}
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Main component
const AvaliacoesNotasPage = () => {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [modalAvaliacao, setModalAvaliacao] = useState<{
    isOpen: boolean;
    avaliacao: any | null;
  }>({ isOpen: false, avaliacao: null });
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    isOpen: boolean;
    avaliacaoId: number | null;
    nomeAvaliacao: string;
  }>({ isOpen: false, avaliacaoId: null, nomeAvaliacao: '' });
  const navigate = useNavigate();

  const { turmaId, materiaId } = useParams<{
    turmaId: string;
    materiaId: string;
  }>();

  // Novo: pegar períodos possíveis
  const { periodos, isLoading: loadingPeriodos } = usePeriodos(
    turmaId!,
    materiaId!
  );
  const [calendarioId, setCalendarioId] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (periodos.length) setCalendarioId(periodos[0].id);
  }, [periodos]);

  const {
    avaliacoes,
    isLoading: loadingAvaliacoes,
    adicionarAvaliacao,
    editarAvaliacao,
    excluirAvaliacao,
  } = useAvaliacoes(turmaId!, materiaId!, calendarioId);

  const { alunos, isLoading: loadingAlunos } = useAlunos(turmaId!);
  const {
    notas,
    recuperacao,
    setNota,
    setRecuperacaoNota,
    salvarNotas,
    isSaving,
  } = useNotas(calendarioId);

  const pontosUsados = avaliacoes.reduce((acc, a) => acc + Number(a.valor || 0), 0);

  const handleEditarAvaliacao = (avaliacao: any) => {
    setModalAvaliacao({ isOpen: true, avaliacao });
  };

  const handleExcluirAvaliacao = (id: number) => {
    const avaliacao = avaliacoes.find((a) => a.id === id);
    setModalConfirmacao({
      isOpen: true,
      avaliacaoId: id,
      nomeAvaliacao: avaliacao?.nome || '',
    });
  };

  const confirmarExclusao = () => {
    if (modalConfirmacao.avaliacaoId) {
      excluirAvaliacao(modalConfirmacao.avaliacaoId);
      toast({
        title: 'Avaliação excluída',
        description: 'A avaliação foi removida com sucesso.',
      });
    }
    setModalConfirmacao({
      isOpen: false,
      avaliacaoId: null,
      nomeAvaliacao: '',
    });
  };

  const handleSalvarAvaliacao = (dados: any) => {
    if (modalAvaliacao.avaliacao) {
      editarAvaliacao(modalAvaliacao.avaliacao.id, dados);
      toast({
        title: 'Avaliação atualizada',
        description: 'As alterações foram salvas com sucesso.',
      });
    } else {
      adicionarAvaliacao(dados);
      toast({
        title: 'Avaliação criada',
        description: 'Nova avaliação cadastrada com sucesso.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${sidebarAberta ? 'md:ml-64' : 'md:ml-20'
            }`}
        >
          <TopbarGestorAuto
            isMenuOpen={sidebarAberta}
            setIsMenuOpen={setSidebarAberta}
          />

          {/* Conteúdo principal */}
          <div className="w-full p-4 mt-20 my-10 pl-4 md:pl-4">
            {/* Cadastrar Avaliação Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() =>
                  setModalAvaliacao({ isOpen: true, avaliacao: null })
                }
                className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>+</span>
                <span>Cadastrar avaliação</span>
              </button>
            </div>

            {/* Seletor de Período */}
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <label className="font-medium">Período:</label>
                {/* Seletor de Período */}
                <select
                  value={calendarioId ?? ''}
                  onChange={(e) => setCalendarioId(Number(e.target.value))}
                  disabled={loadingPeriodos}
                  className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-700"
                >
                  <option value="" disabled>
                    — Escolha —
                  </option>
                  {periodos.map((p, idx) => {
                    const isBimestre = p.label.toLowerCase().includes('bim');
                    const sufixo = isBimestre ? 'Bimestre' : 'Trimestre';
                    return (
                      <option key={p.id} value={p.id}>
                        {`${idx + 1}º ${sufixo}`} ({p.pontuacao_max} pts)
                      </option>
                    );
                  })}
                </select>
              </div>
              {/* Total de pontos agora dinâmico: */}
              <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                <div className="flex justify-between">
                  <span className="font-medium text-green-800">
                    Total usado
                  </span>
                  <span className="font-bold text-green-800">
                    {isNaN(pontosUsados) ? 0 : Math.round(pontosUsados)} /{' '}
                    {periodos.find((p) => p.id === calendarioId)
                      ?.pontuacao_max ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de Avaliações */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {(() => {
                  const idx = periodos.findIndex((p) => p.id === calendarioId);
                  if (idx === -1) return '—';
                  const p = periodos[idx];
                  const isBimestre = p.label.toLowerCase().includes('bim');
                  const sufixo = isBimestre ? 'Bimestre' : 'Trimestre';
                  return `${idx + 1}º ${sufixo}`;
                })()}
              </h2>

              {loadingAvaliacoes ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500">Carregando avaliações...</p>
                </div>
              ) : avaliacoes.length > 0 ? (
                <div className="space-y-3">
                  {avaliacoes.map((avaliacao) => (
                    <CardAvaliacao
                      key={avaliacao.id}
                      avaliacao={avaliacao}
                      onEdit={() => handleEditarAvaliacao(avaliacao)}
                      onExcluir={() => handleExcluirAvaliacao(avaliacao.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-500">
                    Nenhuma avaliação cadastrada para este bimestre.
                  </p>
                </div>
              )}
            </div>

            {/* Formulário de Notas */}
            {avaliacoes.length > 0 && !loadingAlunos && (
              <FormularioNotas
                alunos={alunos}
                avaliacoes={avaliacoes}
                notas={notas}
                recuperacao={recuperacao}
                setNota={setNota}
                setRecuperacaoNota={setRecuperacaoNota}
                onSalvar={() => salvarNotas(avaliacoes)}
                isSaving={isSaving}
              />
            )}
          </div>

          {/* Modals */}
          <ModalAvaliacao
            turmaId={turmaId!}
            materiaId={materiaId!}
            isOpen={modalAvaliacao.isOpen}
            onClose={() =>
              setModalAvaliacao({ isOpen: false, avaliacao: null })
            }
            avaliacao={modalAvaliacao.avaliacao}
            periodos={periodos} // ★
            calendarioId={calendarioId!} // ★
            setCalendarioId={setCalendarioId} // ★
            onSave={handleSalvarAvaliacao}
            totalPontosUsados={pontosUsados}
          />

          <ModalConfirmacao
            isOpen={modalConfirmacao.isOpen}
            onClose={() =>
              setModalConfirmacao({
                isOpen: false,
                avaliacaoId: null,
                nomeAvaliacao: '',
              })
            }
            onConfirm={confirmarExclusao}
            titulo="Confirmar Exclusão"
            mensagem={`Tem certeza que deseja excluir "${modalConfirmacao.nomeAvaliacao}"? Esta ação é irreversível.`}
          />
        </div>
      </div>
    </div>
  );
};

export default AvaliacoesNotasPage;
