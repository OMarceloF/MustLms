// frontend/src/pages/gestor/Cursos.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, MoreVertical, Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';

interface Curso {
  id: number;
  nome: string;
  objetivos: string;
  duracao_semestres: number;
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <main className="flex-1 container mx-auto py-6 px-4">
      {children}
    </main>
  </div>
);

const CursosPage: React.FC = () => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCursos = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get<Curso[]>('/api/cursos-posgraduacao');
        setCursos(response.data);
      } catch (err) {
        setError("Não foi possível carregar os cursos.");
        toast.error("Falha ao carregar cursos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExcluirCurso = async (cursoId: number) => {
    const cursoParaExcluir = cursos.find(c => c.id === cursoId);
    const nomeCurso = cursoParaExcluir ? cursoParaExcluir.nome : 'O curso';

    if (window.confirm(`Tem certeza que deseja excluir o curso "${nomeCurso}"?`)) {
      try {
        await axios.delete(`/api/cursos/${cursoId}`);
        setCursos((prevCursos) => prevCursos.filter((curso) => curso.id !== cursoId));
        setOpenMenuId(null);
        toast.success(`"${nomeCurso}" foi excluído com sucesso!`);
      } catch (err) {
        if (isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || "Não foi possível excluir o curso.";
          toast.error(errorMessage);
        } else {
          toast.error("Ocorreu um erro inesperado.");
        }
      }
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center items-center py-20"><Loader2 className="h-12 w-12 animate-spin text-indigo-800" /></div>;
    if (error) return <div className="text-center py-20 bg-red-50 p-6 rounded-lg"><AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" /><h3 className="text-xl font-semibold text-red-700">Ocorreu um Erro</h3><p className="text-gray-600 mt-2">{error}</p></div>;
    if (cursos.length === 0) return <div className="text-center py-20 bg-white p-6 rounded-lg shadow-sm"><h3 className="text-2xl font-semibold text-gray-800">Nenhum curso encontrado</h3><p className="text-gray-500 mt-2">Clique em "Adicionar Curso" para começar.</p></div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cursos.map((curso) => (
          <div key={curso.id} className="relative group">
            <div 
              onClick={() => navigate(`/gestaocurso/${curso.id}/matriz-curricular`)} // Redireciona para a matriz curricular
              className="cursor-pointer transform transition-transform group-hover:scale-105 border-2 border-transparent group-hover:border-blue-600 rounded-lg shadow-sm bg-white flex flex-col h-full"
            >
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-400 p-6 text-white flex justify-center items-center rounded-t-lg h-32">
                <Book className="w-12 h-12" />
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg mb-2 truncate" title={curso.nome}>{curso.nome}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 flex-grow">{curso.objetivos}</p>
                <p className="text-gray-800 text-sm mt-4 font-semibold">Duração: {curso.duracao_semestres} semestres</p>
              </div>
            </div>
            <button
              type="button"
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-20"
              aria-label="Mais opções"
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(prev => prev === curso.id ? null : curso.id); }}
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {openMenuId === curso.id && (
              <div ref={menuRef} className="absolute top-10 right-2 bg-white border rounded-md shadow-lg w-32 z-30 overflow-hidden">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => navigate(`/gestaocurso/${curso.id}/configuracoes`)}>Editar</button>
                <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50" onClick={() => handleExcluirCurso(curso.id)}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Cursos Disponíveis</h1>
          <p className="text-gray-600 text-sm sm:text-base">Explore nossa lista de cursos. Clique em um para ver mais detalhes.</p>
        </div>
        <button
          onClick={() => navigate('/adicionar-curso')}
          className="flex items-center justify-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
        >
          <PlusCircle size={20} />
          <span>Adicionar Curso</span>
        </button>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default CursosPage;