// src/pages/GestaoEscolarPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// <<--- PASSO 1: Importar o ícone de busca --->>
import { Book, MoreVertical, Plus, Search } from 'lucide-react';
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
  breve_descricao: string; // Usado para mostrar o nome do curso
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
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingDisciplina, setEditingDisciplina] = useState<DisciplinaFormData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { id: cursoId } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)

  // <<--- PASSO 2: Adicionar estado para o termo de busca --->>
  const [searchTerm, setSearchTerm] = useState('');

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
        setIsLoading(true); // Inicia o carregamento
        const response = await axios.get('/api/disciplinas-posgraduacao');
        const lista: Disciplina[] = Array.isArray(response.data) ? response.data : [];
        const ordenada = [...lista].sort((a, b) =>
          a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
        );
        setDisciplinas(ordenada);
      } catch (error) {
        console.error('Erro ao buscar disciplinas de pós-graduação:', error);
        toast.error('Erro ao carregar as disciplinas do banco de dados.');
        setDisciplinas([]);
      } finally {
        setIsLoading(false); // Finaliza o carregamento
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

  // <<--- PASSO 3: Criar a lista de disciplinas filtradas --->>
  const filteredDisciplinas = disciplinas.filter(disciplina => {
    const searchLower = searchTerm.toLowerCase();
    const nomeMatch = disciplina.nome.toLowerCase().includes(searchLower);
    // Busca também pelo nome do curso associado
    const cursoMatch = disciplina.breve_descricao.toLowerCase().includes(searchLower);
    return nomeMatch || cursoMatch;
  });

  // Função para deletar uma disciplina
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

  const fetchDisciplinas = async () => {
    if (!cursoId) return
    try {
      setIsLoading(true)
      const response = await axios.get<Disciplina[]>(`/api/cursos/${cursoId}/disciplinas`)

      const disciplinasFormatadas = response.data.map(d => ({
        ...d,
        turmas: d.turmas || []
      }));
      setDisciplinas(disciplinasFormatadas);

    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error)
      toast.error("Não foi possível carregar a matriz curricular.")
    } finally {
      setIsLoading(false)
    }
  }

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
      } else {
        await axios.post(`/api/cursos/${cursoId}/disciplinas`, payload)
        toast.success("Disciplina adicionada com sucesso!")
      }
      setIsDialogOpen(false)
      fetchDisciplinas()
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

  // Exibe mensagem de carregamento
  if (isLoading) { // Alterado de `loading` para `isLoading` para refletir o estado de busca de dados
    return <p>Carregando disciplinas...</p>;
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Disciplinas de Pós-Graduação</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Lista de todas as disciplinas dos cursos de pós-graduação cadastrados no sistema.
          </p>
        </div>
      </div>

      {/* <<--- PASSO 4: Adicionar o campo de busca --->> */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome da disciplina ou curso..."
          className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
        />
      </div>

      {/* <<--- PASSO 5: Usar a lista FILTRADA para renderização --->> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDisciplinas.length > 0 ? (
          filteredDisciplinas.map((d) => (
            <Link to={getDisciplinaRoute(d.id)}>

              <div
                className="relative transform transition-transform hover:scale-105 border rounded-lg shadow-sm bg-white h-full flex flex-col"
              >
                <div className="bg-gradient-to-r from-[#363776] to-[#1e1f45] p-6 text-white flex justify-center items-center rounded-t-lg">
                  <Book className="w-12 h-12" />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-lg mb-1 truncate" title={d.nome}>{d.nome}</h3>
                  <p className="text-sm text-gray-500 mb-2">Código: {d.codigo}</p>
                  <p className="text-gray-600 text-sm">Curso: {d.breve_descricao}</p>
                </div>

                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-20"
                  aria-label="Mais opções"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId((prev) => (prev === d.id ? null : d.id));
                  }}
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {openMenuId === d.id && user.role !== 'Professor' && (
                  <div
                    className="absolute top-10 right-2 bg-white border rounded-md shadow-lg w-36 z-30 overflow-hidden"
                    ref={containerRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-md"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenDialog(d);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md text-red-600"
                      onClick={(e) => {
                        e.preventDefault();
                        handleExcluirDisciplina(d.id);
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">
            {disciplinas.length > 0 ? 'Nenhuma disciplina encontrada com este termo.' : 'Nenhuma disciplina de pós-graduação encontrada.'}
          </p>
        )}
      </div>

      {/* O Dialog para adicionar/editar permanece o mesmo */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle>{editingDisciplina?.id ? "Editar Disciplina" : "Nova Disciplina"}</DialogTitle>
            <DialogDescription>Preencha as informações da disciplina.</DialogDescription>
          </DialogHeader>
          {editingDisciplina && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome da Disciplina</Label>
                <Input id="nome" value={editingDisciplina.nome} onChange={(e) => handleFormChange('nome', e.target.value)} className="bg-background" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" value={editingDisciplina.codigo} onChange={(e) => handleFormChange('codigo', e.target.value)} className="bg-background" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cargaHoraria">Carga Horária (h)</Label>
                  <Input id="cargaHoraria" type="number" value={editingDisciplina.cargaHoraria?.toString() ?? ''} onChange={(e) => handleFormChange('cargaHoraria', Number(e.target.value))} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="creditos">Créditos</Label>
                  <Input id="creditos" type="number" value={editingDisciplina.creditos?.toString() ?? ''} onChange={(e) => handleFormChange('creditos', Number(e.target.value))} className="bg-background" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input id="semestre" type="number" value={editingDisciplina.semestre?.toString() ?? ''} onChange={(e) => handleFormChange('semestre', Number(e.target.value))} className="bg-background" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ementa">Ementa</Label>
                <Textarea id="ementa" value={editingDisciplina.ementa} onChange={(e) => handleFormChange('ementa', e.target.value)} rows={4} className="bg-background" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GestaoEscolarPage;