// frontend/src/pages/professor/Avaliacoes/HomeAvaliacoes.tsx

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/button';
import { FileText, Database, User, ArrowRight } from 'lucide-react';
// import SidebarProfessor from '../SidebarProfessor';
// import TopbarGestorAuto from '../../gestor/components/TopbarGestorAuto';
import Header from '../components/Header';

const HomeAvaliacoes = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('avaliacoes'); // Define 'avaliacoes' como a página ativa
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (page: string) => {
    const pageToRoute: { [key: string]: string } = {
      home: '/professor/home',
      ia: '/professor/ia',
      turmas: '/professor/turmas',
      alunos: '/professor/alunos',
      envio: '/professor/envio',
      avaliacoes: '/avaliacoes/home',
    };
    const route = pageToRoute[page];
    if (route) {
      navigate(route);
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/avaliacoes')) {
      setActivePage('avaliacoes');
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="min-h-screen bg-background">
        <Header />
        {/* SidebarProfessor agora está aqui
        <SidebarProfessor
        isMenuOpen={isMenuOpen}
        // A prop setActivePage foi removida daqui
        handleMouseEnter={() => setIsMenuOpen(true)}
        handleMouseLeave={() => setIsMenuOpen(false)}
      /> */}

        <div className="flex-1 flex flex-col lg:pl-[60px] transition-all duration-500">
          {/* TopbarGestorAuto também está aqui */}
          {/* <TopbarGestorAuto
            activePage={activePage}
            setActivePage={handleNavigation}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          /> */}

          {/* Conteúdo principal da página */}
          <main className="flex-1 p-4 mt-[60px] overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h1 className="text-5xl font-bold text-text-primary mb-6">
                  Plataforma de Avaliações
                </h1>
                <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
                  Crie, organize e gerencie avaliações escolares de forma simples e profissional.
                </p>
                <Link to="montagem">
                  <Button size="lg" className="bg-primary hover:bg-brand-hover text-primary-foreground">
                    Começar Agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <Link to="montagem" className="text-center p-6 rounded-lg border border-surface-border shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">Montagem de Avaliações</h3>
                  <p className="text-text-secondary">
                    Crie provas personalizadas com questões objetivas e dissertativas de forma intuitiva.
                  </p>
                </Link>

                <Link to="banco-questoes" className="text-center p-6 rounded-lg border border-surface-border shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">Banco de Questões</h3>
                  <p className="text-text-secondary">
                    Acesse um banco organizado de questões por disciplina, série e nível de dificuldade.
                  </p>
                </Link>

                <Link to="perfil" className="text-center p-6 rounded-lg border border-surface-border shadow-soft hover:shadow-medium transition-all">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">Perfil Personalizado</h3>
                  <p className="text-text-secondary">
                    Gerencie suas avaliações, configure preferências e acompanhe seu histórico.
                  </p>
                </Link>
              </div>

              {/* CTA Section */}
              <div className="text-center bg-surface-secondary rounded-2xl p-12">
                <h2 className="text-3xl font-bold text-text-primary mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                  Transforme a criação de avaliações em uma experiência simples e eficiente.
                </p>
                <Link to="montagem">
                  <Button size="lg" className="bg-primary hover:bg-brand-hover text-primary-foreground">
                    Criar Primeira Avaliação
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div></div>
  );
};

export default HomeAvaliacoes;
