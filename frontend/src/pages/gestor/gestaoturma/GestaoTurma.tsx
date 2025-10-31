import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SidebarGestor from '../components/Sidebar'
import TopbarGestorAuto from '../components/TopbarGestorAuto'
import { FormVincularAluno } from './FormVincularAluno'
import { FormVisualizarAlunos } from './FormVisualizarAlunos'
import { FormBoletim } from './FormBoletim'
import axios from 'axios'
import { toast } from 'sonner'
import { useAuth } from '../../../hooks/useAuth' // 🔹 garante acesso ao papel do usuário

interface Turma {
    id: number
    nome: string
    ano_letivo: string
    qtd_alunos: number
    professor_responsavel?: string
}

export default function GestorTurma() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [turma, setTurma] = useState<Turma | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [disciplinas, setDisciplinas] = useState<any[]>([])
    const [selectedMateriaId, setSelectedMateriaId] = useState<number | ''>('')
    const [sidebarAberta, setSidebarAberta] = useState(false);


    const isProfessor = user?.role === 'professor'

    // 🔹 Buscar turma
    useEffect(() => {
        const fetchTurma = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(`/api/turmas/${id}`)
                setTurma(data)
            } catch (err) {
                console.error('Erro ao carregar turma:', err)
                setErro('Erro ao carregar informações da turma.')
                toast.error('Erro ao carregar informações da turma.')
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchTurma()
    }, [id])

    // 🔹 Buscar matérias vinculadas à turma
    useEffect(() => {
        const fetchDisciplinas = async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/turmas/${id}/disciplinas-com-professor`
                )
                setDisciplinas(data)
            } catch {
                console.warn('Erro ao carregar disciplinas.')
            }
        }

        if (id) fetchDisciplinas()
    }, [id])

    // 🔹 Estados de carregamento e erro
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-indigo-900 font-medium">Carregando turma...</p>
                </div>
            </div>
        )
    }

    if (erro) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-red-600 text-lg font-semibold">{erro}</p>
            </div>
        )
    }

    if (!turma) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <p className="text-gray-600 text-lg">Turma não encontrada.</p>
            </div>
        )
    }

    // 🔹 Funções de navegação
    const handleNotas = () => {
        if (!selectedMateriaId) {
            toast.error('Selecione uma matéria primeiro.')
            return
        }
        const base = isProfessor ? '/professor' : '/gestor'
        navigate(`${base}/turmas/${id}/materias/${selectedMateriaId}/avaliacoes-notas`)
    }

    const handleDiario = () => {
        if (!selectedMateriaId) {
            toast.error('Selecione uma matéria primeiro.')
            return
        }
        const base = isProfessor ? '/professor' : '/gestor'
        navigate(`${base}/turmas/${id}/materias/${selectedMateriaId}/diario`)
    }

    // 🔹 Renderização
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

            <div className="flex-1 min-w-0 flex flex-col">
                {/* Topbar */}
                <TopbarGestorAuto
                    isMenuOpen={sidebarAberta}
                    setIsMenuOpen={setSidebarAberta}
                />

                <div className="p-6 mt-20 max-w-6xl mx-auto w-full space-y-10">
                    {/* Cabeçalho */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-indigo-900 mb-2">
                                    {turma.nome}
                                </h1>
                                <p className="text-gray-700">
                                    <strong>Ano Letivo:</strong> {turma.ano_letivo}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Qtd. de Alunos:</strong> {turma.qtd_alunos}
                                </p>
                                {turma.professor_responsavel && (
                                    <p className="text-gray-700">
                                        <strong>Professor Responsável:</strong> {turma.professor_responsavel}
                                    </p>
                                )}
                            </div>

                            {/* Seletor de matéria e botões */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <select
                                    value={selectedMateriaId}
                                    onChange={(e) => setSelectedMateriaId(Number(e.target.value))}
                                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-700"
                                >
                                    <option value="">Selecione uma matéria...</option>
                                    {disciplinas.map((d) => (
                                        <option key={d.materiaId} value={d.materiaId}>
                                            {d.nome}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleNotas}
                                    disabled={!selectedMateriaId}
                                    className="px-4 py-2 bg-indigo-700 text-white rounded-lg hover:bg-indigo-800 transition disabled:opacity-50"
                                >
                                    Avaliações & Notas
                                </button>

                                <button
                                    onClick={handleDiario}
                                    disabled={!selectedMateriaId}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                                >
                                    Ver Diário
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Forms principais */}
                    <FormVisualizarAlunos turmaId={id!} />
                    <FormVincularAluno turmaId={id!} />
                    <FormBoletim turmaId={id!} />
                    
                    {/* Botão voltar */}
                    <div className="flex justify-end mt-10">
                        <button
                            onClick={() =>
                                navigate('/gestor', { state: { activePage: 'turmas' } })
                            }
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
