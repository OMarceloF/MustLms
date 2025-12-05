// src/pages/GestaoEscolarPage.tsx (ou DisciplinasPage.tsx)

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, MoreVertical, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useParams } from "react-router-dom"
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./components/ui/dialog"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Textarea } from "./components/ui/textarea"

// Interfaces
interface Turma {
  id: number;
  nome: string;
  ano_letivo?: number;
}

interface Disciplina {
  id: number
  nome: string
  codigo: string
  creditos: number
  carga_horaria: number
  semestre: number
  ementa: string
  turmas?: Turma[]
  breve_descricao: string; // Nome do curso
}

interface DisciplinaFormData {
  id?: number
  nome: string
  codigo: string
  creditos: number
  cargaHoraria: number
  semestre: number
  ementa: string
}

// Componente de Layout
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <main className="flex-1 container mx-auto py-6 px-4">
      {children}
    </main>
  </div>
);

const GestaoEscolarPage: React.FC = () => {
  // Hooks
  const { user, loading } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingDisciplina, setEditingDisciplina] = useState<DisciplinaFormData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { id: cursoId } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');

  // Função utilitária para definir a rota conforme o papel do usuário
  const getDisciplinaRoute = (id: number) => {
    if (user?.role?.toLowerCase() === 'aluno') {
      return `/aluno/disciplinas/${id}`; 
    }
    return `/gestor/materiasgestor/${id}`;
  };

  // Efeito para carregar as disciplinas da API
  useEffect(() => {
    async function carregarDisciplinas() {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        let url = '/api/disciplinas-posgraduacao'; // URL Padrão (Gestor/Admin)
        
        if (user.role?.toLowerCase() === 'aluno') {
            url = `/api/alunos/${user.id}/disciplinas-vinculadas`;
        }

        const response = await axios.get(url);
        const lista: Disciplina[] = Array.isArray(response.data) ? response.data : [];
        
        const ordenada = [...lista].sort((a, b) =>
          a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
        );
        
        setDisciplinas(ordenada);
      } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
        toast.error('Erro ao carregar as disciplinas.');
        setDisciplinas([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (!loading && user?.id) {
      carregarDisciplinas();
    }
  }, [user, loading]);

  // Efeito para fechar o menu de opções ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Identifica os semestres disponíveis nos dados carregados
  const availableSemesters = Array.from(new Set(disciplinas.map(d => d.semestre)))
    .filter(s => s > 0) // Filtra semestre 0 (optativas) para listar apenas numéricos
    .sort((a, b) => a - b);
  
  const hasOptativas = disciplinas.some(d => d.semestre === 0);

  // Filtragem combinada (Busca Texto + Semestre)
  const filteredDisciplinas = disciplinas.filter(disciplina => {
    // 1. Filtro de Texto
    const searchLower = searchTerm.toLowerCase();
    const nomeMatch = disciplina.nome.toLowerCase().includes(searchLower);
    const cursoMatch = disciplina.breve_descricao?.toLowerCase().includes(searchLower) || false;
    const codigoMatch = disciplina.codigo?.toLowerCase().includes(searchLower) || false;
    const textMatch = nomeMatch || cursoMatch || codigoMatch;

    // 2. Filtro de Semestre/Optativa
    let semesterMatch = true;
    if (selectedSemester !== 'all') {
        if (selectedSemester === 'opt') {
            semesterMatch = disciplina.semestre === 0;
        } else {
            semesterMatch = disciplina.semestre === Number(selectedSemester);
        }
    }

    return textMatch && semesterMatch;
  });

  // Função para deletar uma disciplina (Apenas Gestor)
  const handleExcluirDisciplina = async (disciplinaId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;
    try {
      await axios.delete(`/api/cursos/disciplinas/${disciplinaId}`);
      setDisciplinas((prev) => prev.filter((d) => d.id !== disciplinaId));
      toast.success('Disciplina excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir disciplina:', error);
      toast.error('Falha ao excluir a disciplina.');
    } finally {
      setOpenMenuId(null);
    }
  };

  // Função para salvar (criar/editar)
  const handleSave = async () => {
    if (!editingDisciplina) return

    const payload = {
      nome: editingDisciplina.nome,
      codigo: editingDisciplina.codigo,
      creditos: editingDisciplina.creditos,
      carga_horaria: editingDisciplina.cargaHoraria,
      semestre: editingDisciplina.semestre,
      ementa: editingDisciplina.ementa,
    };

    try {
      if (editingDisciplina.id) {
        await axios.put(`/api/cursos/disciplinas/${editingDisciplina.id}`, payload)
        toast.success("Disciplina atualizada com sucesso!")
        setDisciplinas(prev => prev.map(d => d.id === editingDisciplina.id ? { ...d, ...payload } : d));
      } else {
        if(cursoId) {
            await axios.post(`/api/cursos/${cursoId}/disciplinas`, payload)
            toast.success("Disciplina adicionada com sucesso!")
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erro ao salvar disciplina:", error)
      toast.error("Ocorreu um erro ao salvar a disciplina.")
    }
  }

  const handleOpenDialog = (disciplina: Disciplina | null) => {
    if (disciplina) {
      setEditingDisciplina({
        id: disciplina.id,
        nome: disciplina.nome,
        codigo: disciplina.codigo,
        creditos: disciplina.creditos,
        cargaHoraria: disciplina.carga_horaria,
        semestre: disciplina.semestre,
        ementa: disciplina.ementa,
      })
    } else {
      setEditingDisciplina({
        nome: "", codigo: "", creditos: 0, cargaHoraria: 0, semestre: 1, ementa: ""
      })
    }
    setIsDialogOpen(true)
  }

  const handleFormChange = (field: keyof DisciplinaFormData, value: string | number) => {
    if (editingDisciplina) {
      setEditingDisciplina({ ...editingDisciplina, [field]: value });
    }
  };

  if (isLoading) {
    return (
        <Layout>
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Carregando disciplinas...</p>
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Disciplinas</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {user?.role === 'aluno' 
                ? 'Acesse o conteúdo das suas disciplinas matriculadas.'
                : 'Gerencie todas as disciplinas cadastradas no sistema.'}
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Busca Textual */}
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, código ou curso..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
        </div>

        {/* Filtro de Semestre / Optativas */}
        <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white text-gray-700 appearance-none cursor-pointer"
            >
                <option value="all">Todos os Períodos</option>
                {hasOptativas && <option value="opt">Disciplinas Optativas</option>}
                {availableSemesters.map(s => (
                    <option key={s} value={s}>{s}º Período</option>
                ))}
            </select>
            {/* Seta customizada do select para manter estilo limpo */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
      </div>

      {/* Grid de Disciplinas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDisciplinas.length > 0 ? (
          filteredDisciplinas.map((d) => (
            <Link key={d.id} to={getDisciplinaRoute(d.id)}>

              <div
                className="relative transform transition-transform hover:scale-105 border rounded-lg shadow-sm bg-white h-full flex flex-col cursor-pointer group"
              >
                <div className="bg-gradient-to-r from-[#363776] to-[#1e1f45] p-6 text-white flex justify-center items-center rounded-t-lg group-hover:opacity-95 transition-opacity">
                  <Book className="w-12 h-12" />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-lg mb-1 truncate" title={d.nome}>{d.nome}</h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-500">
                    <p>Código: <span className="font-medium text-gray-700">{d.codigo || 'N/A'}</span></p>
                    <p>Curso: <span className="font-medium text-gray-700">{d.breve_descricao}</span></p>
                    <p>
                        {d.semestre === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Optativa
                            </span>
                        ) : (
                            <>Semestre: <span className="font-medium text-gray-700">{d.semestre}º</span></>
                        )}
                    </p>
                  </div>
                </div>

                {/* Botão de Opções (Oculto para Alunos e Professores) */}
                {user?.role !== 'aluno' && user?.role !== 'professor' && (
                    <>
                        <button
                        type="button"
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 text-white z-20"
                        aria-label="Mais opções"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId((prev) => (prev === d.id ? null : d.id));
                        }}
                        >
                        <MoreVertical className="w-5 h-5" />
                        </button>

                        {openMenuId === d.id && (
                        <div
                            className="absolute top-10 right-2 bg-white border rounded-md shadow-lg w-36 z-30 overflow-hidden"
                            ref={containerRef}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                            onClick={(e) => {
                                e.preventDefault();
                                handleOpenDialog(d);
                            }}
                            >
                            Editar
                            </button>
                            <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                            onClick={(e) => {
                                e.preventDefault();
                                handleExcluirDisciplina(d.id);
                            }}
                            >
                            Excluir
                            </button>
                        </div>
                        )}
                    </>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
             <Book className="h-12 w-12 mb-4 opacity-20" />
             <p className="text-lg font-medium">Nenhuma disciplina encontrada.</p>
             {user?.role === 'aluno' && <p className="text-sm mt-1">Verifique seus filtros ou sua matrícula.</p>}
          </div>
        )}
      </div>

      {/* Modal de Edição (Mantido) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>{editingDisciplina?.id ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
            <DialogDescription>Atualize as informações da disciplina abaixo.</DialogDescription>
          </DialogHeader>
          {editingDisciplina && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Disciplina</Label>
                <Input id="nome" value={editingDisciplina.nome} onChange={(e) => handleFormChange('nome', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" value={editingDisciplina.codigo} onChange={(e) => handleFormChange('codigo', e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cargaHoraria">Carga (h)</Label>
                  <Input id="cargaHoraria" type="number" value={editingDisciplina.cargaHoraria?.toString() ?? ''} onChange={(e) => handleFormChange('cargaHoraria', Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditos">Créditos</Label>
                  <Input id="creditos" type="number" value={editingDisciplina.creditos?.toString() ?? ''} onChange={(e) => handleFormChange('creditos', Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input id="semestre" type="number" value={editingDisciplina.semestre?.toString() ?? ''} onChange={(e) => handleFormChange('semestre', Number(e.target.value))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ementa">Ementa</Label>
                <Textarea id="ementa" value={editingDisciplina.ementa} onChange={(e) => handleFormChange('ementa', e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GestaoEscolarPage;