import React, { useState, useLayoutEffect, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ArrowLeft } from 'lucide-react';
import { Button } from './components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { toast } from './hooks/use-toast';

interface LetterObject {
  id: number;
  letter: string;
  position: number;
  verticalPosition: number;
  visible: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

const FallingLetter: React.FC<{
  letterObj: LetterObject;
  handleDestroy: (id: number) => void;
  gameOver: boolean;
}> = ({ letterObj, handleDestroy, gameOver }) => {
  const { id, letter, position, verticalPosition, visible } = letterObj;

  if (!visible) return null;

  return (
    <div
      ref={letterObj.ref}
      className={`absolute transition-all duration-500 ${
        gameOver ? 'animate-none' : 'animate-bounce'
      }`}
      style={{
        left: `${position}%`,
        top: `${verticalPosition}%`,
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-game-primary flex items-center justify-center text-white text-4xl font-bold">
          {letter}
        </div>
      </div>
    </div>
  );
};

const JogoLetras = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [letters, setLetters] = useState<LetterObject[]>([]);
  const [nextId, setNextId] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastLetterTimeRef = useRef(Date.now());
  const speedRef = useRef(0.5); // Velocidade inicial reduzida
  const barraRosaRef = useRef<HTMLDivElement>(null);

  const getRandomLetter = (): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  };

  const getRandomPosition = (): number => {
    return 98; // Inicia fora da tela, permitindo tempo de queda
  };

  const getRandomVerticalPosition = (): number => {
    return Math.random() * 80 + 10;
  };

  const addLetter = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const now = Date.now();
    if (now - lastLetterTimeRef.current > 1500) {
      // Intervalo de 1.5 segundos
      const newLetter: LetterObject = {
        id: nextId,
        letter: getRandomLetter(),
        position: getRandomPosition(),
        verticalPosition: getRandomVerticalPosition(),
        visible: true,
        ref: React.createRef(),
      };

      setLetters((prev) => [...prev, newLetter]);
      setNextId((prev) => prev + 1);
      lastLetterTimeRef.current = now;
    }
  }, [isPlaying, gameOver, nextId]);

  const moveLetters = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const now = Date.now();
    const delta = (now - lastUpdateRef.current) / 1000; // em segundos
    lastUpdateRef.current = now;

    setLetters((prev) => {
      let shouldEndGame = false;
      const updatedLetters = prev
        .map((letter) => {
          if (!letter.visible) return letter;

          const speedPerSecond = 20; // 20% da largura da tela por segundo
          const newPosition = letter.position - speedPerSecond * delta;

          if (letter.ref?.current && barraRosaRef.current) {
            const letraRect = letter.ref.current.getBoundingClientRect();
            const barraRect = barraRosaRef.current.getBoundingClientRect();

            if (letraRect.left <= barraRect.right) {
              shouldEndGame = true;
              return { ...letter, position: newPosition, visible: false };
            }
          }

          return { ...letter, position: newPosition };
        })
        .filter((letter) => letter.visible);

      if (shouldEndGame) {
        setGameOver(true);
        setIsPlaying(false);
        toast({
          title: 'Fim de Jogo',
          description: `Você destruiu ${score} letras!`,
          variant: 'destructive',
        });
      }

      return updatedLetters;
    });
  }, [isPlaying, gameOver, score]);

  const gameLoop = useCallback(() => {
    addLetter();
    moveLetters();

    if (isPlaying && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isPlaying, gameOver, addLetter, moveLetters]);

  useLayoutEffect(() => {
    if (isPlaying && !gameOver) {
      lastUpdateRef.current = Date.now(); // Garante que o tempo seja atualizado corretamente
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameOver, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      const key = e.key.toUpperCase();

      setLetters((prev) => {
        let found = false;
        const updated = prev.map((letter) => {
          if (letter.visible && letter.letter === key && !found) {
            found = true;
            return { ...letter, visible: false };
          }
          return letter;
        });

        if (found) {
          setScore((prev) => prev + 1);
          toast({
            title: 'Letra destruída!',
            description: `Você destruiu a letra ${key}`,
          });
        }

        return updated;
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying, gameOver]);

  const lastUpdateRef = useRef(Date.now());

  const togglePlay = () => {
    if (gameOver) {
      setLetters([]);
      setScore(0);
      setGameOver(false);
      speedRef.current = 0.5;
    }

    lastUpdateRef.current = Date.now(); // ADICIONE ESTA LINHA
    setIsPlaying((prev) => !prev);
    setTimeout(() => {
      lastLetterTimeRef.current = Date.now();
    }, 100);
  };

  const handleDestroy = (id: number) => {
    setLetters((prev) =>
      prev.map((letter) =>
        letter.id === id ? { ...letter, visible: false } : letter
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center mb-6">
        <Link to="/gamification" className="mr-4">
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-indigo-100 text-indigo-600 border-indigo-200"
          >
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-indigo-700">Jogo das Letras</h1>
      </div>

      <Card className="mb-6 bg-white border border-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-gray-800">
            <span className="text-lg font-semibold">
              Pontuação: <span className="text-blue-600">{score}</span>
            </span>
            <Button
              onClick={togglePlay}
              variant={isPlaying ? 'destructive' : 'default'}
              className={`transition-all ${
                isPlaying
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2" /> Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2" /> {gameOver ? 'Recomeçar' : 'Iniciar'}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div
            ref={gameAreaRef}
            className="relative w-full h-[500px] rounded-lg overflow-hidden ring-1 ring-indigo-200"
            style={{
              backgroundImage: `url("https://d3kjluh73b9h9o.cloudfront.net/original/4X/6/b/8/6b87907db99d442c42ca057ed72c15582b44a78b.jpeg")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.9,
              position: 'relative',
            }}
          >
            <div
              ref={barraRosaRef}
              className="absolute left-0 top-0 h-full w-2 bg-rose-500 z-20"
            />

            {letters.map((letter) => (
              <FallingLetter
                key={letter.id}
                letterObj={letter}
                handleDestroy={handleDestroy}
                gameOver={gameOver}
              />
            ))}

            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <h2 className="text-4xl font-bold mb-4">Fim de Jogo</h2>
                <p className="text-2xl mb-6">
                  Você destruiu{' '}
                  <span className="text-yellow-400 font-bold">{score}</span>{' '}
                  letras!
                </p>
                <Button
                  onClick={togglePlay}
                  variant="default"
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Play className="mr-2" /> Jogar Novamente
                </Button>
              </div>
            )}

            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="bg-black bg-opacity-60 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-md text-left">
                  <h2 className="text-2xl font-bold mb-4 text-white">
                    Como jogar
                  </h2>
                  <ul className="list-disc space-y-2 pl-5 text-sm text-gray-200">
                    <li>Pressione o botão Play para iniciar o jogo</li>
                    <li>
                      Digite as letras que aparecem na tela para destruí-las
                    </li>
                    <li>Se uma letra chegar ao lado esquerdo, você perde</li>
                    <li>Tente destruir o máximo de letras possível!</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Digite as letras que aparecem para destruí-las antes que alcancem o
            lado esquerdo da tela!
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default JogoLetras;
