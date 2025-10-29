// src/pages/GestaoEscolarPage.tsx

import React, { useState, useRef, useEffect } from 'react';
// Importa o componente Link para navegação
import { Link, useNavigate } from 'react-router-dom'; 
import { Book, MoreVertical, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

// Interface para os dados da disciplina
interface Disciplina {
  id: number;
  nome: string;
  breve_descricao: string; // Usado para mostrar o nome do curso
}

// Componente de Layout para manter a estrutura da página
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

  // Efeito para carregar as disciplinas da API
  useEffect(() => {
    async function carregarDisciplinas() {
      if (!user?.id) return;
      try {
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

  // Exibe mensagem de carregamento
  if (loading) {
    return <p>Carregando...</p>;
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
        {user.role !== 'Professor' && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/gestor/cursos')}
              className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              <Plus size={20} />
              <span>Gerenciar Cursos</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {disciplinas.length > 0 ? (
          disciplinas.map((d) => (
            // Envolve o card com o componente Link para torná-lo navegável
            <Link key={d.id} to={`/gestor/materiasgestor/${d.id}`} className="block">
              <div
                className="relative transform transition-transform hover:scale-105 border rounded-lg shadow-sm bg-white h-full flex flex-col"
              >
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-400 p-6 text-white flex justify-center items-center rounded-t-lg">
                  <Book className="w-12 h-12" />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-lg mb-1 truncate" title={d.nome}>{d.nome}</h3>
                  <p className="text-gray-600 text-sm">Curso: {d.breve_descricao}</p>
                </div>

                {/* Botão de "Mais Opções" */}
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-20"
                  aria-label="Mais opções"
                  onClick={(e) => {
                    e.preventDefault(); // Impede a navegação ao clicar no botão
                    e.stopPropagation();
                    setOpenMenuId((prev) => (prev === d.id ? null : d.id));
                  }}
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {/* Menu de Opções (Editar/Excluir) */}
                {openMenuId === d.id && user.role !== 'Professor' && (
                  <div
                    className="absolute top-10 right-2 bg-white border rounded-md shadow-lg w-36 z-30 overflow-hidden"
                    ref={containerRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-md"
                      onClick={(e) => {
                        e.preventDefault(); // Impede a navegação
                        alert('Para editar, acesse a página do curso e a aba "Matriz Curricular".');
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md text-red-600"
                      onClick={(e) => {
                        e.preventDefault(); // Impede a navegação
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
          <p className="text-gray-500 col-span-full">Nenhuma disciplina de pós-graduação encontrada.</p>
        )}
      </div>
    </Layout>
  );
};

export default GestaoEscolarPage;
