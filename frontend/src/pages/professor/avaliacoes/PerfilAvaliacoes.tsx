// frontend/src/pages/professor/Avaliacoes/PerfilAvaliacoes.tsx

// --- 1. Importações ---
// Hooks do React e React Router
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ícones e componentes de UI
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Label } from '../components/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/badge';
import { User, Mail, School, Calendar, FileText, BarChart3 } from 'lucide-react';

// Componentes de Layout que serão integrados
// import SidebarProfessor from '../SidebarProfessor';
// import TopbarGestorAuto from '../../gestor/components/TopbarGestorAuto';
import Header from '../components/Header';

// --- 2. Componente Principal ---
const PerfilAvaliacoes = () => {
  // --- 3. Lógica de Estado e Navegação (Trazida para dentro do componente) ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('avaliacoes');
  const navigate = useNavigate();
  const location = useLocation();

  // Função de navegação que a Sidebar e a Topbar usarão
  const handleNavigation = (page: string) => {
    const pageToRoute: { [key: string]: string } = {
      home: '/professor/home',
      avaliacoes: '/avaliacoes/home',
      // Adicione outras rotas da sidebar aqui se precisar
    };
    const route = pageToRoute[page];
    if (route) {
      navigate(route);
    }
  };

  // Efeito para garantir que o menu 'avaliacoes' na sidebar fique ativo
  useEffect(() => {
    if (location.pathname.startsWith('/avaliacoes')) {
      setActivePage('avaliacoes');
    }
  }, [location.pathname]);

  // --- 4. Estrutura JSX Completa (Layout e Conteúdo no mesmo arquivo) ---
  return (
    <div className="flex h-screen bg-gray-100">
   
      {/* Container principal para o conteúdo à direita */}
      <div className="relative flex-1 flex flex-col lg:pl-[60px] transition-all duration-500">

        {/* Container Fixo para as "Topbars Duplas" */}
        <div className="sticky top-0 z-20">
          
        </div>

        {/* Área de Conteúdo com Rolagem Independente */}
        <main className="flex-1 overflow-y-auto pt-32">
          <div className="container mx-auto px-4 py-8">
            {/* Título Principal */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Meu Perfil</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Gerencie suas informações pessoais e acompanhe seu progresso na plataforma.
              </p>
            </div>

            {/* Conteúdo da Página de Perfil */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Informações Pessoais */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-soft bg-white">
                  <CardHeader>
                    <CardTitle className="text-text-primary">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome" className="text-text-primary">Nome Completo</Label>
                        <Input id="nome" defaultValue="Professor Silva" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-text-primary">E-mail</Label>
                        <Input id="email" type="email" defaultValue="professor@escola.edu.br" className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instituicao" className="text-text-primary">Instituição</Label>
                        <Input id="instituicao" defaultValue="Colégio Exemplo" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cargo" className="text-text-primary">Cargo</Label>
                        <Input id="cargo" defaultValue="Professor de Matemática" className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="disciplinas" className="text-text-primary">Disciplinas que leciona</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Matemática</Badge>
                        <Badge variant="secondary">Física</Badge>
                        <Badge variant="outline" className="cursor-pointer">+ Adicionar</Badge>
                      </div>
                    </div>
                    <Button className="bg-primary hover:bg-brand-hover text-primary-foreground">
                      Salvar Alterações
                    </Button>
                  </CardContent>
                </Card>

                {/* Histórico de Atividades */}
                <Card className="shadow-soft bg-white">
                  <CardHeader>
                    <CardTitle className="text-text-primary">Atividades Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { acao: 'Criou avaliação', item: 'Prova de Equações - 9º Ano', data: '2 horas atrás' },
                        { acao: 'Adicionou questão', item: 'Questão de Geometria', data: '1 dia atrás' },
                        { acao: 'Gerou gabarito', item: 'Avaliação de Álgebra', data: '3 dias atrás' }
                      ].map((atividade, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-text-primary font-medium">
                              {atividade.acao}: <span className="font-normal">{atividade.item}</span>
                            </p>
                            <p className="text-gray-500 text-sm">{atividade.data}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas */}
              <div className="space-y-6">
                <Card className="shadow-soft bg-white">
                  <CardHeader>
                    <CardTitle className="text-text-primary">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-text-primary">24</h3>
                      <p className="text-text-secondary">Avaliações Criadas</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-primary">156</h4>
                        <p className="text-xs text-text-secondary">Questões Criadas</p>
                      </div>
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-primary">89</h4>
                        <p className="text-xs text-text-secondary">Questões Usadas</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-text-secondary text-sm">Membro desde</span>
                      </div>
                      <p className="text-text-primary font-medium">Janeiro 2025</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações Rápidas */}
                <Card className="shadow-soft bg-white">
                  <CardHeader>
                    <CardTitle className="text-text-primary">Preferências</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Notificações</span>
                      <Button variant="outline" size="sm">Configurar</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Modelo de Prova</span>
                      <Button variant="outline" size="sm">Personalizar</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Backup de Dados</span>
                      <Button variant="outline" size="sm">Exportar</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Renomeando para seguir o padrão do nome do arquivo
export default PerfilAvaliacoes;
