// frontend/src/pages/aluno/curso/professores-tab.tsx

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Button } from "../../gestor/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../gestor/components/ui/tabs"
import { Avatar, AvatarFallback } from "../../gestor/components/ui/avatar"
import { Mail, Users, BookOpen, GraduationCap, AlertCircle } from "lucide-react"
import { useAuth } from "../../../hooks/useAuth"

interface Professor {
  id: string
  nome: string
  disciplina: string
  email: string
  iniciais: string
}

interface Turma {
  id: string
  nome: string
  turno: string
  semestre: string
  orientador: string
  numeroAlunos: number
}

export function ProfessoresTurmasTab() {
  const [professores, setProfessores] = useState<Professor[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { user } = useAuth()
  // Tenta pegar do hook, senão do localStorage
  const usuarioId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);

  useEffect(() => {
    const fetchData = async () => {
      if (!usuarioId) return;

      try {
        // CORREÇÃO: Porta 3001 conforme seus logs do terminal
        const apiUrl = 'http://localhost:3001'; 
        
        const response = await axios.get(`${apiUrl}/api/alunos/${usuarioId}/professores-turmas`)
        
        setProfessores(response.data.professores)
        setTurmas(response.data.turmas)
        setError("")
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        setError("Não foi possível carregar as informações. Verifique sua conexão.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [usuarioId])

  // Função auxiliar para Badge (caso não esteja importada globalmente)
  const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {children}
    </span>
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando informações...</div>
  
  if (error) {
    return (
        <div className="p-8 text-center flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-red-600 font-medium">{error}</p>
        </div>
    )
  }

  return (
    <Tabs defaultValue="professores" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
        <TabsTrigger value="professores" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Meus Professores</TabsTrigger>
        <TabsTrigger value="turmas" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Minhas Turmas Ativas</TabsTrigger>
      </TabsList>

      <TabsContent value="professores" className="mt-6">
        {professores.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                <GraduationCap className="h-10 w-10 mb-2 opacity-20" />
                <p>Nenhum professor vinculado às suas turmas ativas.</p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2">
            {professores.map((professor) => (
                <Card key={professor.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                            {professor.iniciais}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <CardTitle className="text-lg font-bold text-slate-800 truncate" title={professor.nome}>
                            {professor.nome}
                        </CardTitle>
                        <CardDescription className="line-clamp-1 text-slate-600 font-medium" title={professor.disciplina}>
                            {professor.disciplina}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mt-2 flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-500 truncate mr-4">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span className="truncate" title={professor.email}>{professor.email}</span>
                        </div>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="shrink-0 gap-2"
                            onClick={() => window.location.href = `mailto:${professor.email}`}
                        >
                            <Mail className="h-3 w-3" />
                            Contato
                        </Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </TabsContent>

      <TabsContent value="turmas" className="mt-6">
        {turmas.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500">
                <BookOpen className="h-10 w-10 mb-2 opacity-20" />
                <p>Você não está matriculado em nenhuma turma ativa no momento.</p>
            </div>
        ) : (
            <div className="space-y-4">
            {turmas.map((turma) => (
                <Card key={turma.id} className="border-slate-200 hover:border-blue-200 transition-colors group">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-100">
                                {turma.semestre}
                            </Badge>
                            <Badge className="bg-white text-slate-500 border border-slate-200 font-normal">
                                {turma.turno}
                            </Badge>
                        </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {turma.nome}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Professor Responsável</span>
                            <div className="flex items-center gap-2 text-slate-700">
                                <GraduationCap className="h-4 w-4 text-blue-500" />
                                <span className="font-medium truncate">{turma.orientador}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Alunos Matriculados</span>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Users className="h-4 w-4 text-slate-500" />
                                <span className="font-medium">{turma.numeroAlunos}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </TabsContent>
    </Tabs>
  )
}