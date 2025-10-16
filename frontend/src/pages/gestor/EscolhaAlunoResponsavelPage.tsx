import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from 'lucide-react';

interface Aluno {
  id: number;
  nome: string;
  foto: string | null;
}

interface ResponsavelData {
  responsavel: {
    id: number;
    nome: string;
  };
  alunos: Aluno[];
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

const EscolhaAlunoResponsavelPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ResponsavelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchAlunosDoResponsavel = async () => {
      try {
        const response = await fetch(
          `/api/responsaveis/${id}/alunos`,
          {
            credentials: 'include',
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          //   console.log('→ [FRONTEND] resposta /alunos:', responseData.alunos.map((a: any) => a.foto));
          setData(responseData);
        } else {
          setError('Erro ao carregar os alunos');
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlunosDoResponsavel();
    }
  }, [id]);

  //   const handleAlunoClick = (alunoId: number) => {
  //     navigate(`/responsavel/alunos/${alunoId}/visualizaraluno`);
  //   };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">
          {error || 'Dados não encontrados'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141414] via-[#141414]/95 to-[#141414] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-white text-4xl font-medium mb-10">
          Olá, {data.responsavel.nome}!
        </h1>
        <p className="text-xl text-gray-300">
          Selecione o perfil do aluno que deseja acessar
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
        {data.alunos.map((aluno) => {
          // ➋ extrai as duas primeiras letras
          const initials = aluno.nome.slice(0, 2).toUpperCase();
          const failed = imgError[aluno.id];
          return (
            <div
              key={aluno.id}
              onClick={() => {
                localStorage.setItem('alunoSelecionadoId', aluno.id.toString());
                navigate(`/gestor/alunos/${aluno.id}/visualizaraluno`);
              }}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-110 hover:-translate-y-2"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-transparent group-hover:border-indigo-600 shadow-lg">
                    {(() => {
                      const segura = getSafeImagePath(aluno.foto || '');
                      return segura && !failed ? (
                        <img
                          src={`/${segura}`}
                          alt={aluno.nome}
                          className="w-full h-full object-cover"
                          onError={() =>
                            setImgError((prev) => ({
                              ...prev,
                              [aluno.id]: true,
                            }))
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
                          <span className="text-white text-3xl font-bold">
                            {initials}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <h3 className="text-gray-300 text-lg group-hover:text-indigo-500">
                  {aluno.nome}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {data.alunos.length === 0 && (
        <div className="text-center">
          <p className="text-gray-400 text-lg">
            Nenhum aluno associado encontrado
          </p>
        </div>
      )}

      <div className="mt-16">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-400 hover:text-white transition-colors duration-300"
        >
          « VOLTAR AO LOGIN »
        </button>
      </div>
    </div>
  );
};

export default EscolhaAlunoResponsavelPage;
