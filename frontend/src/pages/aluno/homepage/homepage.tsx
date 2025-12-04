"use client"

import { useState, useEffect } from "react"
import { Loader2, GraduationCap } from "lucide-react"

import { KpiCardAluno, type KpiAlunoData } from "./kpi-card-aluno"
import { ProximasAtividades } from "./proximas-atividades"
import { NotasDisciplinas } from "./notas-disciplinas"
import { AvisosAluno } from "./avisos-aluno"
import { MiniCalendarAluno } from "./mini-calendar-aluno"

// Mock data para demonstração
const mockKpis: KpiAlunoData[] = [
    { id: 1, title: "Média Geral", value: "78.5", icon: "award", trend: 5, subtitle: "Semestre atual" },
    { id: 2, title: "Frequência", value: "92%", icon: "check-circle", trend: 2, subtitle: "Mês atual" },
    { id: 3, title: "Atividades Pendentes", value: "4", icon: "clock", subtitle: "Esta semana" },
    { id: 4, title: "Disciplinas", value: "6", icon: "book-open", subtitle: "Matriculado" },
]

const mockAtividades = [
    {
        id: 1,
        titulo: "Prova de Matemática",
        disciplina: "Matemática Aplicada",
        dataEntrega: "2025-06-08",
        tipo: "prova" as const,
        status: "pendente" as const,
    },
    {
        id: 2,
        titulo: "Trabalho de Física",
        disciplina: "Física Experimental",
        dataEntrega: "2025-06-10",
        tipo: "trabalho" as const,
        status: "em_andamento" as const,
    },
    {
        id: 3,
        titulo: "Exercícios de Programação",
        disciplina: "Algoritmos",
        dataEntrega: "2025-06-06",
        tipo: "exercicio" as const,
        status: "pendente" as const,
    },
    {
        id: 4,
        titulo: "Projeto Final",
        disciplina: "Eng. de Software",
        dataEntrega: "2025-06-20",
        tipo: "projeto" as const,
        status: "em_andamento" as const,
    },
]

const mockNotas = [
    { disciplina: "Matemática", nota: 85, media: 70 },
    { disciplina: "Física", nota: 72, media: 68 },
    { disciplina: "Programação", nota: 90, media: 75 },
    { disciplina: "Banco de Dados", nota: 65, media: 70 },
    { disciplina: "Eng. Software", nota: 78, media: 72 },
]

const mockFrequencia = [
    { mes: "Jan", frequencia: 95 },
    { mes: "Fev", frequencia: 88 },
    { mes: "Mar", frequencia: 92 },
    { mes: "Abr", frequencia: 90 },
    { mes: "Mai", frequencia: 94 },
    { mes: "Jun", frequencia: 91 },
]

const mockHorarioHoje = [
    {
        id: 1,
        horario: "08:00",
        disciplina: "Matemática Aplicada",
        professor: "Prof. Carlos Silva",
        sala: "Sala 101",
        status: "passada" as const,
    },
    {
        id: 2,
        horario: "10:00",
        disciplina: "Física Experimental",
        professor: "Prof. Ana Costa",
        sala: "Lab. Física",
        status: "atual" as const,
    },
    {
        id: 3,
        horario: "14:00",
        disciplina: "Algoritmos",
        professor: "Prof. João Santos",
        sala: "Lab. Info 2",
        status: "proxima" as const,
    },
    {
        id: 4,
        horario: "16:00",
        disciplina: "Banco de Dados",
        professor: "Prof. Maria Lima",
        sala: "Sala 205",
        status: "proxima" as const,
    },
]

const mockAvisos = [
    {
        id: 1,
        title: "Aula de reposição",
        excerpt: "A aula de Matemática do dia 05/06 será reposta no sábado.",
        author: "Prof. Carlos Silva",
        date: "2025-06-04",
        category: "disciplina",
    },
    {
        id: 2,
        title: "Reunião de turma",
        excerpt: "Haverá reunião com o coordenador na próxima terça-feira.",
        author: "Coordenação",
        date: "2025-06-03",
        category: "turma",
    },
    {
        id: 3,
        title: "Inscrições abertas",
        excerpt: "As inscrições para monitoria estão abertas até dia 15/06.",
        author: "Secretaria",
        date: "2025-06-02",
        category: "geral",
    },
    {
        id: 4,
        title: "Atualização cadastral",
        excerpt: "Por favor, atualize seus dados no portal acadêmico.",
        author: "Sistema",
        date: "2025-06-01",
        category: "pessoal",
    },
]

const mockEventos = [
    { id: "1", title: "Prova de Matemática", date: "2025-06-08", type: "prova" },
    { id: "2", title: "Entrega Trabalho Física", date: "2025-06-10", type: "entrega" },
    { id: "3", title: "Seminário de TCC", date: "2025-06-15", type: "aula" },
]

const mockFeriados = [{ date: "2025-06-12", name: "Corpus Christi" }]

export default function HomeAluno() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simula carregamento de dados
        const timer = setTimeout(() => setLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-[#363776]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header com saudação */}
            {/* <header className="bg-gradient-to-r from-[#363776] to-[#1e1f45] text-white py-6 px-6 lg:px-8">
                <div className="max-w-[1800px] mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/10 rounded-xl">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Olá, João!</h1>
                            <p className="text-white/70 text-sm">Bem-vindo ao seu portal acadêmico</p>
                        </div>
                    </div>
                </div>
            </header> */}

            <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-6">
                {/* 1. KPIs do Aluno */}
                <section className="mb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mockKpis.map((kpi) => (
                            <KpiCardAluno key={kpi.id} data={kpi} />
                        ))}
                    </div>
                </section>

                {/* 2. Avisos e Calendário */}
                <section className="mb-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <AvisosAluno data={mockAvisos} />
                        </div>
                        <div className="lg:col-span-1">
                            <MiniCalendarAluno events={mockEventos} holidays={mockFeriados} />
                        </div>
                    </div>
                </section>

                {/* 3. Notas por Disciplina */}
                <section className="mb-5">
                    <NotasDisciplinas data={mockNotas} />
                </section>

                {/* 5. Próximas Atividades */}
                <section className="mb-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ProximasAtividades data={mockAtividades} />
                    </div>
                </section>
            </main>
        </div>
    )
}