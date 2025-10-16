import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const rolePaths: Record<string, string> = {
  gestor: '/gestor',
  professor: '/professor',
  aluno: '/aluno',
  responsavel: '/responsavel',
  financeiro: '/financeiro'
};

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>; // Aguarda a verificação antes de redirecionar
  }

  if (!user.role) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={rolePaths[user.role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
