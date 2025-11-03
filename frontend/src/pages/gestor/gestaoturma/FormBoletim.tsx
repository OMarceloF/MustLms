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
      .catch(() => toast.error('Erro ao carregar alunos.'))

    axios.get('/api/listarMaterias')
      .then(res => setMaterias(res.data))
      .catch(() => toast.error('Erro ao carregar matérias.'))
  }, [turmaId])

  useEffect(() => {
    if (!selectedMateria) return
    Promise.all(alunos.map(a => axios.get(`/api/boletim/${a.id}`)))
      .then(resps => {
        const temp: Record<number, number[]> = {}
        resps.forEach((res, i) => {
          const materia = res.data.materias.find((m: any) => m.id === Number(selectedMateria))
          temp[alunos[i].id] = materia ? materia.grades : Array(4).fill(null)
        })
        setNotasMap(temp)
      })
      .catch(() => toast.error('Erro ao carregar notas.'))
  }, [selectedMateria, alunos])

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Boletim da Turma
      </h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-muted/20">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/40 text-foreground">
              <th className="border border-border p-3 text-left font-semibold">Aluno</th>
              {periodos.map((p, i) => (
                <th
                  key={i}
                  className="border border-border p-3 text-center font-semibold"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alunos.map(a => (
              <tr
                key={a.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="border border-border p-3 text-foreground font-medium">
                  {a.nome}
                </td>
                {notasMap[a.id]?.map((n, i) => (
                  <td
                    key={i}
                    className="border border-border p-3 text-center text-muted-foreground"
                  >
                    {n ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
