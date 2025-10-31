import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

export function FormBoletim({ turmaId }: { turmaId: string }) {
  const [materias, setMaterias] = useState<any[]>([])
  const [selectedMateria, setSelectedMateria] = useState('')
  const [alunos, setAlunos] = useState<any[]>([])
  const [notasMap, setNotasMap] = useState<{ [alunoId: number]: number[] }>({})

  const periodos = ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre']

  useEffect(() => {
    axios.get(`/api/turmas/${turmaId}`)
      .then(res => setAlunos(res.data.alunos || []))
    axios.get('/api/listarMaterias')
      .then(res => setMaterias(res.data))
  }, [turmaId])

  useEffect(() => {
    if (!selectedMateria) return
    Promise.all(
      alunos.map(a => axios.get(`/api/boletim/${a.id}`))
    ).then(resps => {
      const temp: Record<number, number[]> = {}
      resps.forEach((res, i) => {
        const materia = res.data.materias.find((m: any) => m.id === Number(selectedMateria))
        temp[alunos[i].id] = materia ? materia.grades : Array(4).fill(null)
      })
      setNotasMap(temp)
    }).catch(() => toast.error('Erro ao carregar notas.'))
  }, [selectedMateria, alunos])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold text-indigo-900 mb-4">Boletim</h2>

      <select
        value={selectedMateria}
        onChange={(e) => setSelectedMateria(e.target.value)}
        className="mb-4 px-3 py-2 border rounded-md"
      >
        <option value="">Selecione a Matéria</option>
        {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </select>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-indigo-400">
          <thead>
            <tr className="bg-indigo-50">
              <th className="border p-2 text-left">Aluno</th>
              {periodos.map((p, i) => (
                <th key={i} className="border p-2 text-center">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alunos.map(a => (
              <tr key={a.id}>
                <td className="border p-2">{a.nome}</td>
                {notasMap[a.id]?.map((n, i) => (
                  <td key={i} className="border p-2 text-center">{n ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
