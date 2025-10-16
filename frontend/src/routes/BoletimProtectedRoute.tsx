import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import axios from 'axios';

const BoletimProtectedRoute = () => {
  const { user, loading } = useAuth();
  const { id } = useParams(); // ID do aluno na rota
  const [autorizado, setAutorizado] = useState<boolean | null>(null); // null = carregando

  useEffect(() => {
    if (!user || loading) return;

    const verificarPermissao = async () => {
      if (user.role === 'gestor' || user.role === 'professor') {
        setAutorizado(true);
      } else if (user.role === 'aluno') {
        setAutorizado(parseInt(id!) === user.id);
      } else if (user.role === 'responsavel') {
        try {
          const res = await axios.get(`/api/responsaveis/${user.id}/alunos`);
          // supondo que o backend retorne { alunos: [ { alunoId: 42 }, ... ] }
          const payload = res.data;
          // extrai uma lista de IDs de aluno, seja qual for o nome do campo
          let listaIds: number[] = [];
          if (Array.isArray(payload)) {
            listaIds = payload.map(a => a.id ?? a.alunoId);
          } else if (Array.isArray(payload.alunos)) {
            listaIds = payload.alunos.map(a => a.id ?? a.alunoId);
          }
          const permitido = listaIds.includes(Number(id));
          setAutorizado(permitido);
        } catch (err) {
          console.error('Erro ao verificar alunos vinculados:', err);
          setAutorizado(false);
        }
      }
      else {
        setAutorizado(false);
      }
    };

    verificarPermissao();
  }, [user, id, loading]);

  if (loading || autorizado === null) return <div>Verificando permissão...</div>;

  if (!autorizado) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default BoletimProtectedRoute;
