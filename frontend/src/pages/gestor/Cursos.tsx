// frontend/src/pages/gestor/Cursos.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

// Interface para definir a estrutura de um Curso
interface Curso {
  id: number;
  nome: string;
  breve_descricao: string;
  duracao: string; // Ex: "8 semestres"
}

// Mock de dados dos cursos
const mockCursos: Curso[] = [
  { id: 1, nome: 'Análise e Desenvolvimento de Sistemas', breve_descricao: 'Formação de profissionais para o mercado de tecnologia, com foco em software.', duracao: '5 semestres' },
  { id: 2, nome: 'Engenharia de Software', breve_descricao: 'Curso aprofundado sobre o ciclo de vida do desenvolvimento de software.', duracao: '10 semestres' },
  { id: 3, nome: 'Ciência da Computação', breve_descricao: 'Base teórica e prática sólida para resolver problemas computacionais complexos.', duracao: '8 semestres' },
  { id: 4, nome: 'Design Gráfico', breve_descricao: 'Explore a criatividade e as ferramentas visuais para comunicação e marketing.', duracao: '6 semestres' },
  { id: 5, nome: 'Administração', breve_descricao: 'Desenvolva habilidades de gestão para liderar organizações e negócios.', duracao: '8 semestres' },
  { id: 6, nome: 'Direito', breve_descricao: 'Formação completa para atuar nas diversas áreas jurídicas do mercado.', duracao: '10 semestres' },
];

// Componente de Layout (mantido como no original)
const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <main className="flex-1 container mx-auto py-6 px-4">
      {children}
    </main>
  </div>
);

// Página principal de Cursos
const CursosPage: React.FC = () => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [cursos, setCursos] = useState<Curso[]>(mockCursos);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efeito para fechar o menu de opções ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função para lidar com a exclusão de um curso (apenas no estado local)
  const handleExcluirCurso = (cursoId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      setCursos((prevCursos) => prevCursos.filter((curso) => curso.id !== cursoId));
      setOpenMenuId(null);
      toast.success('Curso excluído com sucesso!');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Cursos Disponíveis</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Explore nossa lista de cursos. Clique em um para ver mais detalhes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/gestor/curso/criar')}
            className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
          >
            <Book size={20} />
            <span>Adicionar Curso</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="relative transform transition-transform hover:scale-105 border-2 border-transparent hover:border-blue-600 rounded-lg shadow-sm bg-white"
          >
            <Link to={`/gestaocurso`}> {/* Rota hipotética */}
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-400 p-6 text-white flex justify-center items-center rounded-t-lg">
                <Book className="w-12 h-12" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{curso.nome}</h3>
                <p className="text-gray-600 text-sm">{curso.breve_descricao}</p>
                <p className="text-gray-800 text-sm mt-2 font-semibold">Duração: {curso.duracao}</p>
              </div>
            </Link>

            <button
              type="button"
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-20"
              aria-label="Mais opções"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenMenuId((prev) => (prev === curso.id ? null : curso.id));
              }}
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {openMenuId === curso.id && (
              <div
                className="absolute top-10 right-2 bg-white border rounded-md shadow-lg w-32 z-30 overflow-hidden"
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-md"
                  onClick={() => navigate(`/cursos/editar/${curso.id}`)} // Rota hipotética
                >
                  Editar
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md"
                  onClick={() => handleExcluirCurso(curso.id)}
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default CursosPage;
