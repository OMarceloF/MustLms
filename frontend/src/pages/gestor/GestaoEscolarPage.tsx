import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';


interface Materia {
  id: number;
  nome: string;
  breve_descricao: string;
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <main className="flex-1 container mx-auto py-6 px-4">
      {children}
    </main>
  </div>
);

const GestaoEscolarPage: React.FC = () => {
  // Hooks sempre no topo
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carrega matérias após autenticação
  // helper para normalizar a resposta em um array de Materia
function toMateriaArray(payload: unknown): Materia[] {
  if (Array.isArray(payload)) return payload as Materia[];
  const p = payload as any;
  if (Array.isArray(p?.materias)) return p.materias as Materia[];
  if (Array.isArray(p?.data)) return p.data as Materia[];
  if (Array.isArray(p?.rows)) return p.rows as Materia[];
  // última cartada: se veio objeto com ids, transforma em array dos valores
  if (p && typeof p === 'object') {
    const vals = Object.values(p);
    if (vals.length && vals.every(v => typeof v === 'object')) {
      return vals as Materia[];
    }
  }
  return [];
}

// Carrega matérias após autenticação
useEffect(() => {
  async function carregarMaterias() {
    if (!user.id) return;
    const baseUrl = '/api';

    try {
      let resp;
      if (user.cargo === 'Professor') {
        resp = await axios.get(`${baseUrl}/professores/${user.id}/materias`);
      } else {
        resp = await axios.get(`${baseUrl}/listarMateriasPage`);
      }

      const lista = toMateriaArray(resp.data);
      if (!Array.isArray(lista)) {
        console.warn('[materias] resposta inesperada:', resp.data);
        setMaterias([]); // não derruba a UI
        return;
      }

      const ordenada = [...lista].sort((a, b) =>
        String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' })
      );

      setMaterias(ordenada);
    } catch (error) {
      console.error('Erro ao buscar matérias:', error);
      toast.error('Erro ao carregar matérias do banco de dados.');
      setMaterias([]); // evita quebrar o .map
    }
  }
  carregarMaterias();
}, [user]);


  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Se ainda carregando, mostrar indicador
  if (loading) {
    return <p>Carregando perfil...</p>;
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Matérias</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            {user.cargo === 'Professor'
              ? 'Suas matérias vinculadas. Clique para ver detalhes.'
              : 'Lista completa de todas as matérias disponíveis. Clique em uma matéria para ver detalhes.'}
          </p>
        </div>

        {user.cargo !== 'Professor' && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => navigate('/gestor/criarMateria')}
              className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              <Book size={20} />
              <span>Adicionar Matéria</span>
            </button>
            <button
              onClick={() => navigate('/gestor/materiaisDisponiveis')}
              className="flex items-center gap-2 bg-indigo-800 hover:bg-indigo-900 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
            >
              <Book size={20} />
              <span>Materiais Disponíveis</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {materias.map((m) => (
          <div
            key={m.id}
            className="relative transform transition-transform hover:scale-105 border-2 border-transparent hover:border-blue-600 rounded-lg shadow-sm"
          >
            <Link to={`/gestor/materias/${m.id}`}>
              <div className="bg-gradient-to-r from-indigo-900 to-indigo-400 p-6 text-white flex justify-center items-center rounded-t-lg">
                <Book className="w-12 h-12" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{m.nome}</h3>
                <p className="text-gray-600 text-sm">{m.breve_descricao}</p>
              </div>
            </Link>

            <button
              type="button"
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-20"
              aria-label="Mais opções"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenMenuId((prev) => (prev === m.id ? null : m.id));
              }}
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {openMenuId === m.id && user.cargo !== 'Professor' && (
              <div
                className="absolute top-10 right-2 bg-white border rounded-md shadow-lg w-32 z-30 overflow-hidden"
                ref={containerRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-md"
                  onClick={() => navigate(`/gestor/editarMateria/${m.id}`)}
                >
                  Editar
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-md"
                  onClick={async () => {
                    if (!confirm('Tem certeza que deseja excluir esta matéria?')) return;
                    await axios.delete(`/api/materias/${m.id}`);
                    setMaterias((prev) => prev.filter((x) => x.id !== m.id));
                    setOpenMenuId(null);
                  }}
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

export default GestaoEscolarPage;