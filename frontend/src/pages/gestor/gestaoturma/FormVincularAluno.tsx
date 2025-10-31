import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { getSafeImagePath } from './utils'

export function FormVincularAluno({ turmaId }: { turmaId: string }) {
    const [alunosDisponiveis, setAlunosDisponiveis] = useState<any[]>([])
    const [busca, setBusca] = useState('')
    const [selecionados, setSelecionados] = useState<number[]>([])

    useEffect(() => {
        axios.get('/api/turmas/alunos/disponiveis')
            .then(res => setAlunosDisponiveis(res.data))
            .catch(() => toast.error('Erro ao carregar alunos.'))
    }, [])

    const alunosFiltrados = alunosDisponiveis.filter(a =>
        a.nome.toLowerCase().includes(busca.toLowerCase())
    )

    const toggleSelect = (id: number) => {
        setSelecionados(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        )
    }

    const handleVincular = async () => {
        if (selecionados.length === 0) {
            toast.error('Selecione pelo menos um aluno.')
            return
        }
        await axios.post(`/api/turmas/${turmaId}/adicionar-alunos`, { alunos: selecionados })
        toast.success('Alunos vinculados!')
        setSelecionados([])
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4">Vincular Alunos</h2>

            <input
                type="text"
                placeholder="Buscar aluno..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full mb-2 px-3 py-2 border border-indigo-500 rounded-md"
            />

            <div className="max-h-48 overflow-y-auto border border-indigo-300 rounded-md p-2">
                {alunosFiltrados.map(a => (
                    <label
                        key={a.id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer ${selecionados.includes(a.id) ? 'bg-indigo-100' : 'hover:bg-indigo-50'
                            }`}
                        onClick={() => toggleSelect(a.id)}
                    >
                        {getSafeImagePath(a.foto_url) ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL}${a.foto_url}`}
                                alt={a.nome}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center font-bold">
                                {a.nome.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <span>{a.nome}</span>
                    </label>
                ))}
            </div>

            <button
                onClick={handleVincular}
                className="mt-3 bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-900"
            >
                Vincular Selecionados
            </button>
        </div>
    )
}
