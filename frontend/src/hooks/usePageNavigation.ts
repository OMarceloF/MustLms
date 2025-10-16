// frontend/src/hooks/usePageNavigation.ts
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const usePageNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();

  // Função de navegação completa e centralizada
  const handleNavigation = (page: string) => {
    const pageToRoute: { [key: string]: string } = {
      home: '/professor', // Rota principal do professor
      ia: '/professor/ia', // Supondo que esta rota exista
      turmas: '/professor/turmas', // Supondo que esta rota exista
      alunos: '/professor/alunos', // Supondo que esta rota exista
      envio: '/professor/envio', // Supondo que esta rota exista
      avaliacoes: '/avaliacoes/home', // Rota para a home de avaliações
    };
    const route = pageToRoute[page];
    if (route) {
      navigate(route);
    }
  };

  // Efeito para definir a página ativa com base na URL
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/avaliacoes')) {
      setActivePage('avaliacoes');
    } else if (path === '/professor') {
      setActivePage('home');
    } // Adicione 'else if' para outras seções
  }, [location.pathname]);

  return {
    isMenuOpen,
    setIsMenuOpen,
    activePage,
    handleNavigation,
  };
};
