import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../gestor/components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../gestor/components/ui/tabs';
import { Badge } from '../gestor/components/ui/badge';
import { Star, Trophy, Award, BookCheck } from 'lucide-react';
import { UserProgressBar } from '../gestor/components/ProgressBar';
import { AchievementCard } from '../gestor/components/AchievementCard';
import { GameCard } from '../gestor/components/GameCard';

const Gamification = () => {
  const [userLevel, setUserLevel] = useState(4);
  const [userExp, setUserExp] = useState(650);
  const [nextLevelExp, setNextLevelExp] = useState(1000);

  // Sample achievements data
  const achievements = [
    {
      id: 1,
      name: 'Leitor Ávido',
      description: 'Complete 5 lições de leitura em sequência',
      icon: <BookCheck className="text-game-primary" />,
      progress: 100,
      completed: true,
    },
    {
      id: 2,
      name: 'Mestre da Gramática',
      description: 'Obtenha 100% em 3 testes de gramática',
      icon: <Star className="text-game-warning" />,
      progress: 67,
      completed: false,
    },
    {
      id: 3,
      name: 'Poeta Iniciante',
      description: 'Complete todos os módulos de poesia',
      icon: <Award className="text-game-secondary" />,
      progress: 40,
      completed: false,
    },
    {
      id: 4,
      name: 'Sequência Perfeita',
      description: 'Conecte-se por 10 dias consecutivos',
      icon: <Trophy className="text-game-warning" />,
      progress: 80,
      completed: false,
    },
  ];

  // Portuguese language games data
  const games = [
    {
      id: 1,
      title: 'Jogo das letras',
      description: 'Aprenda o alfabeto e forma palavras de forma interativa',
      image: 'https://d3kjluh73b9h9o.cloudfront.net/original/4X/6/b/8/6b87907db99d442c42ca057ed72c15582b44a78b.jpeg',
      progress: 10,
      category: 'Alfabetização',
      inDevelopment: false,
    },
    {
      id: 2,
      title: 'Caça-Palavras',
      description: 'Encontre palavras escondidas e expanda seu vocabulário',
      image: 'https://www.gov.br/dnit/pt-br/assuntos/portais-tematicos/br-319-am-ro/material-ludico-e-educativo/atividades/16.jpg/@@images/image.jpeg',
      progress: 32,
      category: 'Vocabulário',
      inDevelopment: false,
    },
    {
      id: 3,
      title: 'Conjugação Verbal',
      description: 'Pratique a conjugação de verbos em diferentes tempos',
      image: 'https://resizer.myboardmaker.com/thumbnails/E5B32A6D5C58657E81932C323E85E222.jpg?h=393&w=491',
      progress: 78,
      category: 'Gramática',
    },
    {
      id: 4,
      title: 'Acentuação',
      description: 'Aprenda as regras de acentuação da língua portuguesa',
      image: 'https://screens.cdn.wordwall.net/400/682502e51a43445da48ffa539a98f54a_0',
      progress: 15,
      category: 'Gramática',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold text-center mb-6 text-indigo-700">
        Aprendizado Gamificado
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Stats Card */}
        <Card className="shadow-md bg-white border border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-indigo-600">
              Seu Perfil
            </CardTitle>
            <CardDescription className="text-gray-500">
              Acompanhe seu progresso de aprendizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-inner">
                  {userLevel}
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800">Nível {userLevel}</p>
                  <p className="text-sm text-gray-500">
                    {userExp}/{nextLevelExp} XP
                  </p>
                </div>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-300">
                Estudante
              </Badge>
            </div>

            <UserProgressBar progress={(userExp / nextLevelExp) * 100} />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-600">12</p>
                <p className="text-sm text-gray-600">Jogos Completados</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-50">
                <p className="text-2xl font-bold text-emerald-600">5</p>
                <p className="text-sm text-gray-600">Conquistas</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50">
                <p className="text-2xl font-bold text-yellow-600">350</p>
                <p className="text-sm text-gray-600">Pontos Totais</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-rose-50">
                <p className="text-2xl font-bold text-rose-600">8</p>
                <p className="text-sm text-gray-600">Dias Conectados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card className="shadow-md col-span-1 lg:col-span-2 border border-gray-100 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-amber-600">
              Conquistas Recentes
            </CardTitle>
            <CardDescription className="text-gray-500">
              Veja seu progresso em várias conquistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games Section */}
      <Tabs defaultValue="all" className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Jogos de Língua Portuguesa
          </h2>
          <TabsList className="bg-gray-100 rounded-md shadow-sm ring-1 ring-gray-200">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger
              value="alfabetizacao"
              className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
            >
              Alfabetização
            </TabsTrigger>
            <TabsTrigger
              value="vocabulario"
              className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
            >
              Vocabulário
            </TabsTrigger>
            <TabsTrigger
              value="gramatica"
              className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-800"
            >
              Gramática
            </TabsTrigger>
          </TabsList>
        </div>

        {['all', 'alfabetizacao', 'vocabulario', 'gramatica'].map(
          (categoria) => (
            <TabsContent value={categoria} className="mt-0" key={categoria}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {games
                  .filter(
                    (game) =>
                      categoria === 'all' ||
                      game.category.toLowerCase() === categoria
                  )
                  .map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
              </div>
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
};

export default Gamification;
