import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

interface GameProps {
  game: {
    id: number;
    title: string;
    description: string;
    image: string;
    progress: number;
    category: string;
    inDevelopment?: boolean;
  };
}

export const GameCard = ({ game }: GameProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg rounded-lg bg-white border border-gray-100">
      <div className="relative h-40 ring-1 ring-indigo-100">
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors">
          {game.category}
        </Badge>
        {game.inDevelopment && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white hover:bg-yellow-600">
            Em desenvolvimento
          </Badge>
        )}
      </div>

      <CardContent className="pt-4">
        <h3 className="font-bold text-indigo-700 mb-1">{game.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {game.description}
        </p>

        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1 text-gray-700">
            <span>Progresso</span>
            <span>{game.progress}%</span>
          </div>
          <Progress
            value={game.progress}
            className={`h-2 transition-all duration-500 rounded-md ${
              game.progress < 30
                ? 'bg-red-100'
                : game.progress < 70
                ? 'bg-yellow-100'
                : 'bg-green-100'
            }`}
          />
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Link
          to={
            game.title === 'Jogo das letras'
              ? '/jogo-letras'
              : game.title === 'Caça-Palavras'
              ? '/caca-palavras'
              : '#'
          }
          className="w-full"
        >
          <button className="w-full py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md hover:scale-[1.02]">
            {game.progress > 0 ? 'Continuar' : 'Começar'}
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};
