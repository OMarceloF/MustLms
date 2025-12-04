// frontend/src/pages/aluno/curso/ppc-tab.tsx

"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../gestor/components/ui/card"
import { Input } from "../../gestor/components/ui/input"
import { Search, FileText, AlertCircle } from "lucide-react"
import { useAuth } from "../../../hooks/useAuth"

export function PpcTab() {
  const [ppcContent, setPpcContent] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { user } = useAuth()
  const usuarioId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);

  useEffect(() => {
    const fetchPPC = async () => {
      if (!usuarioId) return;

      try {
        const apiUrl = 'http://localhost:3001'; 
        const response = await axios.get(`${apiUrl}/api/alunos/${usuarioId}/ppc`)
        
        setPpcContent(response.data.conteudo || "Conteúdo do PPC não encontrado.")
        setError("")
      } catch (err) {
        console.error("Erro ao buscar PPC:", err)
        setError("Não foi possível carregar o Projeto Pedagógico do Curso.")
      } finally {
        setLoading(false)
      }
    }

    fetchPPC()
  }, [usuarioId])

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text

    const parts = text.split(new RegExp(`(${search})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-black rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  // Função simples para formatar Markdown básico vindo do banco
  const formatContent = (content: string) => {
    if (!content) return null;
    
    const lines = content.split("\n")
    return lines.map((line, index) => {
      // Títulos
      if (line.startsWith("# ")) {
        return <h1 key={index} className="mb-4 mt-6 text-3xl font-bold text-slate-800 border-b pb-2">{highlightText(line.substring(2), searchTerm)}</h1>
      }
      if (line.startsWith("## ")) {
        return <h2 key={index} className="mb-3 mt-5 text-2xl font-semibold text-slate-700">{highlightText(line.substring(3), searchTerm)}</h2>
      }
      if (line.startsWith("### ")) {
        return <h3 key={index} className="mb-2 mt-4 text-xl font-semibold text-slate-600">{highlightText(line.substring(4), searchTerm)}</h3>
      }
      
      // Listas
      if (line.trim().startsWith("- ")) {
        return <li key={index} className="ml-6 list-disc text-slate-600 mb-1">{highlightText(line.substring(2), searchTerm)}</li>
      }
      
      // Negrito (básico: **texto**)
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
            <p key={index} className="mb-2 text-slate-600 leading-relaxed">
                {parts.map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-slate-800">{highlightText(part, searchTerm)}</strong> : highlightText(part, searchTerm)
                )}
            </p>
        )
      }

      // Linhas vazias
      if (line.trim() === "") {
        return <br key={index} />
      }

      // Parágrafos normais
      return (
        <p key={index} className="mb-2 leading-relaxed text-slate-600">
          {highlightText(line, searchTerm)}
        </p>
      )
    })
  }

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Carregando documento...</div>
  }

  if (error) {
    return (
        <div className="p-8 text-center flex flex-col items-center gap-2 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p>{error}</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Projeto Pedagógico do Curso (PPC)
                </CardTitle>
                <CardDescription>Documento oficial com as diretrizes do seu curso</CardDescription>
            </div>
            
            <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                type="text"
                placeholder="Pesquisar no documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
                />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="prose prose-sm max-w-none p-6 md:p-8 bg-white min-h-[400px]">
            {formatContent(ppcContent)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}