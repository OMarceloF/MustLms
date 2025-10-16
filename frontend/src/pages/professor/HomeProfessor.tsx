// src/pages/ProfessorHomePage.tsx
import React, { useEffect, useState } from 'react'
import { Activity, Users, User } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import MiniCalendar from '../../components/MiniCalendar'
import Anuncios from '../gestor/components/Anuncios'


// aponte para o seu host de API
axios.defaults.baseURL = `/`

interface Stats {
  turmasCount: number
  alunosCount: number
  aulasPendentes: number
  avaliacoesPendentes: number
}

interface Turma {
  id: number
  nome: string
}

export default function ProfessorHomePage({
  setActivePage
}: {
  setActivePage: React.Dispatch<React.SetStateAction<string>>
}) {
  const { user, loading } = useAuth()

  // estados dos cards
  const [pendingCount, setPendingCount] = useState(0)
  const [classesCount, setClassesCount] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)

  // lista de nomes para montar o eixo dos gráficos de frequência
  const [turmaList, setTurmaList] = useState<string[]>([])

  // dados dos gráficos
  const [gradeDistribution, setGradeDistribution] = useState<
    { range: string; count: number }[]
  >([])
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  // Não tente puxar nada até carregar o usuário
  useEffect(() => {
    if (loading || !user) return

    const profId = user.id

    async function loadAll() {
      try {
        // 1) stats consolidadas
        const { data: stats } = await axios.get<Stats>(
          `/api/professores/${profId}/stats`
        )
        setClassesCount(stats.turmasCount)
        setStudentsCount(stats.alunosCount)
        setPendingCount(stats.aulasPendentes + stats.avaliacoesPendentes)

        // 2) nomes das turmas
        const { data: turmas } = await axios.get<Turma[]>(
          `/api/professores/${profId}/turmas`
        )
        const nomes = turmas.map((t) => t.nome)
        setTurmaList(nomes)

        // 3) histograma de notas
        const { data: grades } = await axios.get<number[]>(
          `/api/professores/${profId}/notas`
        )
        const bins = [0, 2, 4, 6, 8, 10]
        setGradeDistribution(
          bins.slice(0, -1).map((start, i) => {
            const end = bins[i + 1]
            const count = grades.filter((g) => g >= start && g < end).length
            return { range: `${start}-${end}`, count }
          })
        )

        // 4) faltas por mês
        const { data: raw } = await axios.get<
          { month: string; turma: string; faltas: number }[]
        >(`/api/professores/${profId}/faltas-mensais`)
        const months = Array.from(new Set(raw.map((r) => r.month))).sort()
        setAttendanceData(
          months.map((month) => {
            const entry: any = { month }
            nomes.forEach((nome) => {
              const rec = raw.find(
                (r) => r.month === month && r.turma === nome
              )
              entry[nome] = rec?.faltas ?? 0
            })
            return entry
          })
        )
      } catch (err: any) {
        console.error('Erro carregando dados do dashboard do professor:', err)
        setError('Não foi possível carregar os dados. Tente novamente.')
      }
    }

    loadAll()
  }, [loading, user])

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }
  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    )
  }

  return (
     <div className="w-full flex flex-col md:flex-row gap-1 md:gap-4 p-4 overflow-x-hidden">
      {/* ─── Left: Cards & Gráficos ──────────────────────────────── */}
      <div className="w-full min-w-0 md:w-2/3 space-y-6 md:space-y-8">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          {[
            {
              icon: <Activity size={36} className="text-indigo-800" />,
              title: 'Atividades Pendentes',
              count: pendingCount,
              page: 'pendentes'
            },
            {
              icon: <Users size={36} className="text-blue-600" />,
              title: 'Turmas',
              count: classesCount,
              page: 'turmas'
            },
            {
              icon: <User size={36} className="text-purple-600" />,
              title: 'Alunos',
              count: studentsCount,
              page: 'alunos'
            }
          ].map(({ icon, title, count, page }) => (
            <button
              key={title}
 className="flex flex-col items-center bg-white shadow rounded-lg p-1 sm:p-2 md:p-4 hover:shadow-md transition"
              onClick={() => setActivePage(page)}
            >
              {icon}
              <span className="mt-2 text-gray-700">{title}</span>
              <span className="mt-1 text-2xl font-semibold">{count}</span>
            </button>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 lg:gap-8">
          {/* Histograma de notas */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Distribuição de Notas</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#dee3df" name="Alunos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Faltas por mês */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium mb-2">Frequência / Presença</h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {turmaList.map((t) => (
                  <Bar
                    key={t}
                    dataKey={t}
                    stackId="a"
                    name={t}
                    fill="var(--color-orange-200)"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Right: Calendário & Anúncios ───────────────────────────── */}
      <div className="w-full min-w-0 md:w-1/3 flex flex-col gap-4 md:gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <MiniCalendar />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Últimos Anúncios</h3>
          <Anuncios />
        </div>
      </div>
    </div>
  )
}
