import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { getSafeImagePath } from './utils'

interface Aluno {
  id: number
  nome: string
  matricula: string
  role: string
  foto_url?: string
}

interface FormVisualizarAlunosProps {
  turmaId: string
}

export function FormVisualizarAlunos({ turmaId }: FormVisualizarAlunosProps) {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)

  // 🔹 Buscar alunos da turma
  const fetchAlunos = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/turmas/${turmaId}`)
      const listaOrdenada = (data.alunos || []).sort((a: Aluno, b: Aluno) =>
        a.nome.localeCompare(b.nome)
      )
      setAlunos(listaOrdenada)
    } catch (err) {
      console.error('Erro ao buscar alunos da turma:', err)
      toast.error('Erro ao carregar alunos da turma.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlunos()
  }, [turmaId])

  // 🔹 Remover aluno da turma
  const handleRemoverAluno = async (alunoId: number) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno da turma?')) return
    try {
      await axios.delete(`/api/turmas/${turmaId}/alunos/${alunoId}`)
      toast.success('Aluno removido com sucesso!')
      fetchAlunos()
    } catch (err) {
      console.error('Erro ao remover aluno:', err)
      toast.error('Erro ao remover aluno da turma.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-indigo-900">Alunos Vinculados</h2>
        <button
          onClick={fetchAlunos}
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-indigo-800">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          Carregando alunos...
        </div>
      ) : alunos.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Nenhum aluno vinculado à turma.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-indigo-300 text-sm">
            <thead>
              <tr className="bg-indigo-50 text-indigo-900">
                <th className="border border-indigo-300 p-2 text-left w-12">Foto</th>
                <th className="border border-indigo-300 p-2 text-left">Nome</th>
                <th className="border border-indigo-300 p-2 text-left">Matrícula</th>
                <th className="border border-indigo-300 p-2 text-left">Status</th>
                <th className="border border-indigo-300 p-2 text-center w-16">Remover</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => {
                const safePath = getSafeImagePath(aluno.foto_url)
                return (
                  <tr
                    key={aluno.id}
                    className="hover:bg-indigo-50 transition-colors"
                  >
                    <td className="border border-indigo-300 p-2">
                      {safePath ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}${safePath}`}
                          alt={aluno.nome}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-900 font-semibold">
                          {aluno.nome.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="border border-indigo-300 p-2">{aluno.nome}</td>
                    <td className="border border-indigo-300 p-2">{aluno.matricula}</td>
                    <td className="border border-indigo-300 p-2">{aluno.role}</td>
                    <td className="border border-indigo-300 p-2 text-center">
                      <button
                        onClick={() => handleRemoverAluno(aluno.id)}
                        className="p-1 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition"
                        title="Remover aluno"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
