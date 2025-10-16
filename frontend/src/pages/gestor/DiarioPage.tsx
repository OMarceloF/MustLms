// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarGestor from '../gestor/components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useParams } from 'react-router-dom';
import axios from 'axios';



const usePlanejamento = (
    turmaId?: string,
    materiaId?: string,
    calendarioId?: number
) => {
    const [aulas, setAulas] = useState<AulaType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!turmaId || !materiaId || !calendarioId) return;

        setIsLoading(true);
        axios
            .get<AulaType[]>(`/api/aulas`, {
                params: { turmaId, materiaId, calendarioId }
            })
            .then(res => {
                // **Usa o status que veio do banco**, sem sobrescrever nada**
                setAulas(res.data);
            })
            .catch(err => console.error('Erro ao buscar aulas:', err))
            .finally(() => setIsLoading(false));
    }, [turmaId, materiaId, calendarioId]);

    return { aulas, setAulas, isLoading };
};



// Hook para gerenciar frequência
const useFrequencia = (aulaId, alunos = []) => {
    const [frequencia, setFrequencia] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const carregarFrequencia = async () => {
            if (!aulaId || alunos.length === 0) return;

            try {
                const res = await axios.get(`/api/presencas/aula/${aulaId}`);
                // Se já houver presenças registradas
                if (res.data.length > 0) {
                    const dados = {};
                    res.data.forEach(p => {
                        dados[p.aluno_id] = {
                            id: p.aluno_id,
                            nome: p.nome,
                            matricula: p.matricula,
                            presente: Boolean(p.presenca)
                        };
                    });
                    setFrequencia(dados);
                } else {
                    // Se ainda não houver registro, preparar estrutura inicial
                    const dadosIniciais = {};
                    alunos.forEach(aluno => {
                        dadosIniciais[aluno.id] = {
                            id: aluno.id,
                            nome: aluno.nome,
                            matricula: aluno.matricula,
                            presente: false
                        };
                    });
                    setFrequencia(dadosIniciais);
                }
            } catch (error) {
                console.error('Erro ao carregar frequência:', error);
            }
        };

        carregarFrequencia();
    }, [aulaId, alunos]);

    const togglePresenca = (alunoId) => {
        setFrequencia(prev => ({
            ...prev,
            [alunoId]: {
                ...prev[alunoId],
                presente: !prev[alunoId].presente
            }
        }));
        setHasChanges(true);
    };

    const salvarFrequencia = async () => {
        if (!aulaId || Object.keys(frequencia).length === 0) return;

        setIsSaving(true);
        const payload = Object.values(frequencia).map(p => ({
            aluno_id: p.id,
            presenca: p.presente ? 1 : 0,
            aula_id: aulaId
        }));

        try {
            await axios.post(`/api/presencas/batch`, payload);
            await atualizarStatusAula(aulaId);
            setHasChanges(false);
        } catch (error) {
            console.error('Erro ao salvar frequência:', error);
            throw error;            // deixa a chamada saber que falhou
        } finally {
            setIsSaving(false);
        }
    };


    const atualizarStatusAula = async (aulaId) => {
        try {
            await axios.put(`/api/aulas/${aulaId}/status`, { status: 'realizada' });

        } catch (error) {
            console.error('Erro ao atualizar status da aula:', error);
        }
    };

    return { frequencia, togglePresenca, salvarFrequencia, isSaving, hasChanges };
};



// Component SwitchTodos
const SwitchTodos = ({ checked, onChange, label }) => {
    return (
        <div className="flex items-center space-x-3 mb-4">
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${checked ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                role="switch"
                aria-checked={checked}
                aria-label={label}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
            <span className="text-sm font-medium text-gray-900">{label}</span>
        </div>
    );
};

// Component DatePicker simples
const DatePicker = ({ value, onChange, className = "" }) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Aula
            </label>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="mt-2 text-xs">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                        <span>Lecionada</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                        <span>Pendente</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                        <span>Futura</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component LinhaAluno
const LinhaAluno = ({ id, nome, matricula, presente, onToggle }) => {
    return (
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition duration-200">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                </div>
                <div>
                    <div className="text-sm text-gray-500">{matricula}</div>
                    <div className="font-medium text-orange-600 hover:text-orange-700 cursor-pointer">
                        {nome}
                    </div>
                </div>
            </div>

            <button
                onClick={() => onToggle(id)}
                className="p-1 rounded transition duration-200 hover:bg-gray-100"
                aria-label={`${presente ? 'Marcar falta' : 'Marcar presença'} para ${nome}`}
            >
                {presente ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </button>
        </div>
    );
};

// Component CardAula
const CardAula = ({ id, data, descricao, status, onChamada, onExcluir }) => {
    const dataObj = new Date(data);
    const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dataFormatada = dataObj.toLocaleDateString('pt-BR');


    const normalize = (s: string) => {
        const v = s.trim().toLowerCase();
        // mapeia "realizada" para "lecionada"
        if (v === 'realizada') return 'lecionada';
        return v;
    };

    const getStatusColor = (raw: string) => {
        switch (normalize(raw)) {
            case 'pendente':
                return 'bg-red-100 text-red-600 border-red-200';
            case 'lecionada':
                return 'bg-green-100 text-green-600 border-green-200';
            case 'futura':
                return 'bg-blue-100 text-blue-600 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getStatusText = (raw: string) => {
        switch (normalize(raw)) {
            case 'pendente':
                return 'Chamada pendente';
            case 'lecionada':
                return 'Chamada realizada';
            case 'futura':
                return 'Aula futura';
            default:
                return raw || '—';
        }
    };

    return (

        <div className="bg-white rounded-2xl shadow-md p-4 mb-4 flex justify-between items-center transition duration-200 hover:shadow-lg">
            <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900 capitalize">
                    {diaSemana}, {dataFormatada}
                </div>
                <div className="text-orange-600 hover:text-orange-700 cursor-pointer mt-1">
                    {descricao}
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                </span>

                {/* {status === 'pendente' && ( */}
                <button
                    onClick={() => onChamada(id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition duration-200"
                    aria-label="Abrir chamada"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
                {/* )} */}

                <button
                    onClick={() => onExcluir(id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition duration-200"
                    aria-label="Excluir aula"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Component Toast
// Depois:
const Toast = ({ message, type, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    const bgColor = type === 'success'
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200';
    const textColor = type === 'success'
        ? 'text-green-800'
        : 'text-red-800';

    return (
        <div className={`
      fixed top-20 right-6      /* empurra pra baixo da navbar */
      ${bgColor} border ${textColor}
      shadow-lg rounded p-4
      z-60                      /* garante que fique acima de tudo */
    `}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
                    {/* ícone de fechar */}
                </button>
            </div>
        </div>
    );
};


// Component principal
const diarioPage = () => {
    const { turmaId = '', materiaId = '' } = useParams<{ turmaId: string; materiaId: string }>();
    const [periodoSelecionadoId, setPeriodoSelecionadoId] = useState<number | null>(null);
    const [periodos, setPeriodos] = useState<{ id: number; label: string }[]>([]);
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('aulas');
    const [filtroAula, setFiltroAula] = useState('todas');
    const [modalCadastroOpen, setModalCadastroOpen] = useState(false);
    const [modalChamadaOpen, setModalChamadaOpen] = useState(false);
    const [aulaAtual, setAulaAtual] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [dadosAula, setDadosAula] = useState({
        data: '',
        bimestre: 1,
        descricao: '',
        status: 'futura',
        periodoId: null as number | null,
    });
    const modalRef = useRef(null);
    const [alunos, setAlunos] = useState([]);
    const { frequencia, togglePresenca, salvarFrequencia, isSaving, hasChanges } = useFrequencia(aulaAtual?.id, alunos);
    const { aulas, setAulas, isLoading } = usePlanejamento(
        turmaId,
        materiaId,
        periodoSelecionadoId
    );


    // Filtrar aulas por status
    const aulasFiltradas = aulas.filter(aula => {
        switch (filtroAula) {
            case 'pendentes': return aula.status === 'pendente';
            case 'lecionadas':
                const s = normalize(aula.status);
                return s === 'lecionada' || s === 'realizada';
            case 'futuras': return aula.status === 'futura';
            default: return true;
        }
    });

    // Contar aulas lecionadas
    const normalize = (s: string) => (s || '').trim().toLowerCase();
    const aulasLecionadas = aulas.filter(aula => { const s = normalize(aula.status); return s === 'lecionada' || s === 'realizada'; }).length;
    const totalAulas = aulas.length;

    // Handlers
    const handleVoltar = () => {
        navigate('/');
    };

    const handleHome = () => {
        navigate('/');
    };

    const handleAbrirChamada = (aulaId) => {
        const aula = aulas.find(a => a.id === aulaId);
        setAulaAtual(aula);
        setModalChamadaOpen(true);
    };

    const handleExcluirAula = async (aulaId) => {
        if (window.confirm('Tem certeza que deseja excluir esta aula?')) {
            try {
                await axios.delete(`/api/aulas/${aulaId}`);
                const aulasAtualizadas = await axios.get(`/api/aulas`, {
                    params: { turmaId, materiaId, calendarioId: periodoSelecionadoId }
                });
                setAulas(aulasAtualizadas.data);
                showToast('Aula excluída com sucesso!', 'success');
            } catch (error) {
                showToast('Erro ao excluir aula.', 'error');
            }
        }
    };


    const handleSalvarAula = () => {
        if (!dadosAula.data || !dadosAula.descricao) {
            showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        const novaAula = {
            ...dadosAula,
            status: 'pendente'
        };

        addAula(novaAula);
        setModalCadastroOpen(false);
        setDadosAula({
            data: '',
            bimestre: 1,
            descricao: '',
            status: 'futura',
            periodoId: null,
        });

        showToast('Aula cadastrada com sucesso!', 'success');
    };

    const handleToggleTodos = (marcarTodos) => {
        Object.keys(frequencia).forEach(alunoId => {
            if (frequencia[alunoId].presente !== marcarTodos) {
                togglePresenca(Number(alunoId));
            }
        });
    };

    const handleSalvarFrequencia = async () => {
        try {
            await salvarFrequencia();
            // atualiza status da aula no front-end
            setAulas(prev =>
                prev.map(a =>
                    a.id === aulaAtual.id ? { ...a, status: 'lecionada' } : a
                )
            );
            showToast('Frequência salva com sucesso!', 'success');
            setModalChamadaOpen(false);
        } catch (error) {
            showToast('Erro ao salvar frequência!', 'error');
        }
    };

    const showToast = (message, type) => {
        setToast({ show: true, message, type });
    };

    const closeToast = () => {
        setToast({ show: false, message: '', type: 'success' });
    };


    // Fechar modal com ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setModalCadastroOpen(false);
                setModalChamadaOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Verificar se todos os alunos estão marcados
    const todosPresentes = Object.values(frequencia).every(aluno => aluno.presente);

    const handleCriarAula = async () => {
        // validação básica
        if (!dadosAula.data || !dadosAula.descricao || !turmaId || !materiaId || !dadosAula.periodoId) {
            showToast('Preencha todos os campos da aula.', 'error');
            return;
        }

        try {
            // calcula status inicial: futura se data > hoje, caso contrário pendente
            const hoje = new Date();
            const dataAula = new Date(dadosAula.data);
            const statusInicial = dataAula > hoje ? 'futura' : 'pendente';

            // envia para o backend
            const res = await axios.post(`/api/aulas`, {
                data: dadosAula.data,
                descricao: dadosAula.descricao,
                status: statusInicial,
                turma_id: turmaId,
                materia_id: materiaId,
                calendario_id: dadosAula.periodoId,
            });

            // monta objeto com o ID retornado e adiciona à lista local
            const nova = {
                id: res.data.id,
                data: dadosAula.data,
                descricao: dadosAula.descricao,
                status: statusInicial,
                turma_id: turmaId,
                materia_id: materiaId,
                calendario_id: dadosAula.periodoId,
            };
            setAulas(prev => [...prev, nova]);

            // limpa e fecha modal
            setDadosAula({
                data: '',
                bimestre: 1,
                descricao: '',
                status: 'futura',
                periodoId: null,
            });
            setModalCadastroOpen(false);

            showToast('Aula cadastrada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar aula:', error);
            showToast('Erro ao criar aula.', 'error');
        }
    };



    useEffect(() => {
        console.log('[fetchAlunos] turmaId =', turmaId);
        const fetchAlunos = async () => {
            if (!turmaId) return;

            try {
                console.log('[fetchAlunos] GET /api/turmas/', turmaId, '/alunos');
                const res = await axios.get(`/api/turmas/${turmaId}/alunos`);
                console.log('[fetchAlunos] resposta:', res.data);
                setAlunos(res.data || []);
            } catch (err) {
                console.error('Erro ao buscar alunos:', err);
            }
        };

        fetchAlunos();
    }, [turmaId]);

    useEffect(() => {
        if (!turmaId || !materiaId) return;

        axios
            .get(
                `/api/turmas/${turmaId}/materias/${materiaId}/calendario_gestor`
            )
            .then((res) => {
                setPeriodos(res.data);
                // pré-seleciona o primeiro período caso ainda não tenha selecionado
                if (res.data.length && periodoSelecionadoId == null) {
                    setPeriodoSelecionadoId(res.data[0].id);
                }
            })
            .catch((err) =>
                console.error("Erro ao buscar períodos:", err)
            );
    }, [turmaId, materiaId, periodoSelecionadoId]);


    // índice dentro de periodos[], ou -1 se não encontrado
    const currentIndex = periodos.findIndex(p => p.id === periodoSelecionadoId);
    // rótulo amigável: "1º Bimestre" ou "2º Trimestre"
    const periodLabel = currentIndex >= 0
        ? (() => {
            const lbl = periodos[currentIndex].label.toLowerCase();
            return lbl.includes('bim')
                ? `${currentIndex + 1}º Bimestre`
                : `${currentIndex + 1}º Trimestre`;
        })()
        : '';

    // conte aulas desse período para o banner
    const realizadasNestePeriodo = aulasLecionadas;
    return (


        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
            <SidebarGestor
                isMenuOpen={sidebarAberta}
                setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
                handleMouseEnter={() => setSidebarAberta(true)}
                handleMouseLeave={() => setSidebarAberta(false)}
            />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarAberta ? 'ml-64' : 'ml-20'}`}>
                <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta}/>

                {/* Conteúdo da página */}
                <main className="pl-4 p-4 md:pl-4 md:p-6">
                    {/* Conteúdo principal */}
                    <div className="pt-20 p-4">

                        {currentView === 'aulas' && (
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                {/* Cabeçalho das aulas */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                                    {/* SELECT de Período */}
                                    <div className="w-full md:w-auto">
                                        <label className="block text-sm font-medium">Período</label>
                                        <select
                                            value={periodoSelecionadoId ?? ''}
                                            onChange={e => setPeriodoSelecionadoId(Number(e.target.value))}
                                            className="…"
                                        >
                                            {periodos.map((p, i) => {
                                                const isBimestre = p.label.toLowerCase().includes('bim');
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {`${i + 1}º ${isBimestre ? 'Bimestre' : 'Trimestre'}`}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setModalCadastroOpen(true)}
                                        className="bg-[#060c1c] text-white rounded-2xl px-6 py-2"
                                    >
                                        + Cadastrar Aula
                                    </button>
                                </div>


                                {/* Banner de aulas lecionadas */}
                                <div className="bg-green-200 rounded-2xl p-4 my-4 flex justify-between items-center">
                                    <span className="font-medium">
                                        Total de aulas lecionadas no {periodLabel}
                                    </span>
                                    <span className="font-bold text-lg">
                                        {realizadasNestePeriodo} de {totalAulas}
                                    </span>
                                </div>


                                {/* Filtros de abas */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {[
                                        { label: 'Todas as Aulas', value: 'todas' },
                                        { label: 'Aulas pendentes', value: 'pendentes' },
                                        { label: 'Aulas lecionadas', value: 'realizadas' },
                                        { label: 'Aulas futuras', value: 'futuras' }
                                    ].map((filtro) => (
                                        <button
                                            key={filtro.value}
                                            onClick={() => setFiltroAula(filtro.value)}
                                            className={`px-4 py-2 rounded border-2 text-sm font-medium transition duration-200 ${filtroAula === filtro.value
                                                ? {
                                                    todas: 'border-gray-700 text-gray-800 bg-gray-100',
                                                    pendentes: 'border-red-500 text-red-600 bg-red-50',
                                                    lecionadas: 'border-orange-500 text-orange-600 bg-orange-50',
                                                    futuras: 'border-blue-500 text-blue-600 bg-blue-50'
                                                }[filtro.value]
                                                : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            {filtro.label}
                                        </button>
                                    ))}
                                </div>


                                {/* Lista de aulas */}
                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-600">Carregando aulas...</p>
                                    </div>
                                ) : aulasFiltradas.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">Nenhuma aula encontrada.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {aulasFiltradas.map(aula => (
                                            <CardAula
                                                key={aula.id}
                                                {...aula}
                                                onChamada={handleAbrirChamada}
                                                onExcluir={handleExcluirAula}
                                            />
                                        ))}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>

                    {/* Modal de Cadastro de Aula */}
                    {modalCadastroOpen && (
                        <div className="fixed inset-0 bg-white bg-opacity-25 flex items-center justify-center z-50"
                            onClick={e => e.target === e.currentTarget && setModalCadastroOpen(false)}>
                            <div ref={modalRef} className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl ring-1 ring-black ring-opacity-10">

                                <h2 className="text-xl font-semibold mb-4">Cadastrar Nova Aula</h2>
                                <DatePicker
                                    value={dadosAula.data}
                                    onChange={data => setDadosAula(prev => ({ ...prev, data }))}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Período
                                    </label>
                                    <select
                                        value={dadosAula.periodoId ?? ''}
                                        onChange={e =>
                                            setDadosAula(prev => ({
                                                ...prev,
                                                periodoId: Number(e.target.value),
                                            }))
                                        }
                                        className="w-full bg-white border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="" disabled>
                                            Selecione…
                                        </option>
                                        {periodos.map((p, i) => {
                                            const isBimestre = p.label.toLowerCase().includes('bim');
                                            return (
                                                <option key={p.id} value={p.id}>
                                                    {`${i + 1}º ${isBimestre ? 'Bimestre' : 'Trimestre'}`}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bimestre</label>

                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                    <textarea
                                        value={dadosAula.descricao}
                                        onChange={e => setDadosAula(prev => ({ ...prev, descricao: e.target.value }))}
                                        className="bg-gray-50 rounded-lg p-2 w-full h-24 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Descreva o conteúdo da aula..."
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button onClick={() => setModalCadastroOpen(false)}
                                        className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button onClick={handleCriarAula}
                                        className="bg-green-600 text-white rounded px-6 py-2 hover:bg-green-700">
                                        Salvar Aula
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Modal de Chamada */}
                    {modalChamadaOpen && aulaAtual && (
                        <div
                            className="fixed inset-0 top-16 bg-white z-40 overflow-y-auto px-4 py-6"
                            style={{ zIndex: 60 }}
                        >
                            <div className="max-w-5xl mx-auto">
                                <div className="mb-6 border-b pb-4">
                                    <h2 id="chamada-title" className="text-2xl font-bold text-gray-800">Chamada do Dia</h2>
                                    <p className="text-gray-600 text-sm">{new Date(aulaAtual.data).toLocaleDateString('pt-BR')} – {aulaAtual.descricao}</p>
                                </div>

                                <SwitchTodos
                                    checked={todosPresentes}
                                    onChange={handleToggleTodos}
                                    label="Todos os alunos"
                                />

                                <div className="space-y-2 max-h-[60vh] overflow-y-auto border rounded-xl p-4 bg-gray-50">
                                    {Object.values(frequencia).map(aluno => (
                                        <LinhaAluno
                                            key={aluno.id}
                                            id={aluno.id}
                                            nome={aluno.nome}
                                            matricula={aluno.matricula}
                                            presente={aluno.presente}
                                            onToggle={togglePresenca}
                                        />
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setModalChamadaOpen(false)}
                                        className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50 transition duration-200"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={handleSalvarFrequencia}
                                        disabled={!hasChanges || isSaving}
                                        className={`px-6 py-2 rounded transition duration-200 ${!hasChanges || isSaving
                                            ? 'bg-gray-400 text-gray-200 opacity-50 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar Chamada'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botão fixo Salvar Frequência */}
                    {modalChamadaOpen && (
                        <>
                            <button
                                onClick={handleSalvarFrequencia}
                                disabled={!hasChanges || isSaving}
                                className={`fixed bottom-4 right-4 px-6 py-2 rounded-2xl shadow-lg transition duration-200 ${!hasChanges || isSaving
                                    ? 'bg-gray-400 text-gray-200 opacity-50 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {isSaving ? 'Salvando...' : 'Salvar Frequência'}
                            </button>

                            {hasChanges && (
                                <div className="fixed bottom-16 right-4 text-orange-600 italic text-sm">
                                    As informações ainda não foram salvas.
                                </div>
                            )}
                        </>
                    )}

                    {/* Toast */}
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        show={toast.show}
                        onClose={closeToast}
                    /> </main>
            </div >
        </div >
    );
};

export default diarioPage;