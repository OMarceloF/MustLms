// frontend/src/pages/professor/Avaliacoes/BancoQuestoes.tsx

// --- 1. Importações ---
// Hooks do React e React Router
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ícones e componentes de UI
import { Button } from '../components/button';
import { Input } from '../components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card';
import { Badge } from '../components/badge';
import { Search, Filter, Plus } from 'lucide-react';

// Componentes de Layout que serão integrados
import SidebarProfessor from '../SidebarProfessor';
import TopbarGestorAuto from '../../gestor/components/TopbarGestorAuto';
import Header from '../components/Header';

// --- 2. Componente Principal ---
const BancoQuestoes = () => {
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
      {/* Sidebar à esquerda */}
      {/* <SidebarProfessor
        isMenuOpen={isMenuOpen}
        // A prop setActivePage foi removida daqui
        handleMouseEnter={() => setIsMenuOpen(true)}
        handleMouseLeave={() => setIsMenuOpen(false)}
      /> */}

      {/* Container principal para o conteúdo à direita */}
      <div className="relative flex-1 flex flex-col lg:pl-[60px] transition-all duration-500">

        {/* Container Fixo para as "Topbars Duplas" */}
        {/* <div className="sticky top-0 z-20">
          {/* <div className="flex flex-col">
            <TopbarGestorAuto
              activePage={activePage}
              setActivePage={handleNavigation}
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
            />
            <Header />
          </div> 
        </div> */}

        {/* Área de Conteúdo com Rolagem Independente */}
        <main className="flex-1 overflow-y-auto pt-32">
          <div className="container mx-auto px-4 py-8">
            {/* Título Principal */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Banco de Questões</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore e gerencie questões organizadas por disciplina, série e nível de dificuldade.
              </p>
            </div>

            {/* Filtros */}
            <Card className="shadow-soft mb-8">
              <CardHeader>
                <CardTitle className="text-text-primary">Filtrar Questões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por palavras-chave..."
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matematica">Matemática</SelectItem>
                      <SelectItem value="portugues">Português</SelectItem>
                      <SelectItem value="historia">História</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Série" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6ano">6º Ano</SelectItem>
                      <SelectItem value="7ano">7º Ano</SelectItem>
                      <SelectItem value="8ano">8º Ano</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facil">Fácil</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="dificil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Filter className="mr-2 h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                  <Button className="bg-primary hover:bg-brand-hover text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Questão
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Questões (Exemplo) */}
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="shadow-soft hover:shadow-medium transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex space-x-2">
                        <Badge variant="outline">Matemática</Badge>
                        <Badge variant="secondary">9º Ano</Badge>
                        <Badge variant="outline">Médio</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                        Usar Questão
                      </Button>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      Questão sobre Equações do Segundo Grau
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Resolva a equação x² - 5x + 6 = 0 e determine as raízes reais da equação...
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Criada em: 15/01/2025</span>
                      <span>Usada 12 vezes</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BancoQuestoes;
