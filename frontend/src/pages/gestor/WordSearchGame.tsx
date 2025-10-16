import React, { useEffect, useRef, useState } from 'react';

const gridSize = 10;
const words = ['CERCAR', 'NADAR', 'IRRADIAR', 'SOMAR', 'PERMUTAR', 'MUDAR'];

type Grid = string[][];

interface Cell {
  row: number;
  col: number;
  letter: string;
  key: string;
}

const WordSearchGame: React.FC = () => {
  const [tempoDesafio, setTempoDesafio] = useState<number | null>(null);
  const [clickedLetters, setClickedLetters] = useState<Set<string>>(new Set());
  const [grid, setGrid] = useState<Grid>([]);
  const [foundLetters, setFoundLetters] = useState(new Set<string>());
  const [foundWords, setFoundWords] = useState(new Set<string>());
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (started) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started]);

  useEffect(() => {
    if (started && foundLetters.size > 0) {
      const allCorrect = Array.from(foundLetters).every((pos) =>
        clickedLetters.has(pos)
      );
      if (allCorrect) {
        clearInterval(timerRef.current!);
      }
    }
  }, [clickedLetters, foundLetters, started]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // A lógica das funções createGrid, addWordToGrid, fillGrid, render e handleClick vem na parte 2

  // Cria a grade inicial
  const createGrid = (size: number): Grid => {
    return Array.from({ length: size }, () => Array(size).fill(''));
  };

  // Verifica se a palavra pode ser inserida
  const canPlaceWord = (
    grid: Grid,
    word: string,
    row: number,
    col: number,
    direction: number
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      if (direction === 0) {
        if (col + i >= grid.length || grid[row][col + i] !== '') return false;
      } else {
        if (row + i >= grid.length || grid[row + i][col] !== '') return false;
      }
    }
    return true;
  };

  // Adiciona uma palavra na grade
  const addWordToGrid = (
    grid: Grid,
    word: string,
    foundSet: Set<string>
  ): void => {
    let placed = false;

    while (!placed) {
      const direction = Math.floor(Math.random() * 2);
      let row = 0;
      let col = 0;

      if (direction === 0) {
        row = Math.floor(Math.random() * grid.length);
        col = Math.floor(Math.random() * (grid.length - word.length));
      } else {
        row = Math.floor(Math.random() * (grid.length - word.length));
        col = Math.floor(Math.random() * grid.length);
      }

      if (canPlaceWord(grid, word, row, col, direction)) {
        for (let i = 0; i < word.length; i++) {
          const r = direction === 0 ? row : row + i;
          const c = direction === 0 ? col + i : col;
          grid[r][c] = word[i];
          foundSet.add(`${r}-${c}`);
        }
        placed = true;
      }
    }
  };

  // Preenche o restante da grade com letras aleatórias
  const fillGrid = (grid: Grid): void => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  };

  // Inicia o jogo
  const startGame = () => {
    const newGrid = createGrid(gridSize);
    const newFound = new Set<string>();

    words.forEach((word) => addWordToGrid(newGrid, word, newFound));
    fillGrid(newGrid);

    setGrid(newGrid);
    setFoundLetters(newFound);
    setStarted(true);
    setFoundWords(new Set());
    setTime(0);
  };

  const handleCellClick = (row: number, col: number) => {
    const pos = `${row}-${col}`;

    if (foundLetters.has(pos)) {
      setClickedLetters((prev) => new Set(prev).add(pos));
    }
  };

  const checkWordsProgress = () => {
    words.forEach((word) => {
      if (foundWords.has(word)) return;

      const directions = [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
      ];

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          directions.forEach(({ x, y }) => {
            let match = true;
            const wordPositions: string[] = [];

            for (let i = 0; i < word.length; i++) {
              const r = row + i * y;
              const c = col + i * x;

              if (r >= gridSize || c >= gridSize || grid[r][c] !== word[i]) {
                match = false;
                return;
              }

              wordPositions.push(`${r}-${c}`);
            }

            if (
              match &&
              wordPositions.every((pos) => clickedLetters.has(pos))
            ) {
              setFoundWords((prev) => new Set(prev).add(word));
            }
          });
        }
      }
    });
  };

  useEffect(() => {
    if (!started) return;
    checkWordsProgress();
  }, [clickedLetters]);
  

  return (
    <div className="flex flex-col items-center min-h-screen bg-cover bg-center bg-fixed bg-[url('https://cdnb.artstation.com/p/assets/images/images/062/560/771/large/malvik-patel-bg-005-0009.jpg?1683435524')]">
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Caça-Palavras</h1>
        <div className="text-xl font-bold text-red-500">{formatTime(time)}</div>
      </header>

      <div className="flex flex-col items-center w-full">
        {!started && (
          <div className="relative w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-[url('https://cdnb.artstation.com/p/assets/images/images/062/560/771/large/malvik-patel-bg-005-0009.jpg?1683435524')] bg-cover bg-center bg-no-repeat">
            {/* Overlay escuro com opacidade */}
            <div className="absolute inset-0 bg-black opacity-30 z-0" />

            {/* Conteúdo principal */}
            <div className="relative z-10 bg-white bg-opacity-90 rounded-xl p-8 shadow-2xl flex flex-col items-center gap-6 max-w-xl w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-800">Desafie-se!</h2>

              {/* Tempo-desafio */}
              <div className="flex flex-col items-center">
                <label className="font-semibold mb-1 text-gray-700">
                  Escolha o tempo-desafio (ganhe XP extra!)
                </label>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[20, 30, 40, 50].map((tempo) => (
                    <button
                      key={tempo}
                      onClick={() => setTempoDesafio(tempo)}
                      className={`px-4 py-1 rounded-full text-white text-sm transition cursor-pointer
        ${
          tempoDesafio === tempo
            ? 'bg-green-400'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }
      `}
                    >
                      {tempo === 50 ? '50s+' : `${tempo}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de XP */}
              <div className="text-center text-sm text-gray-700">
                <p className="font-semibold mb-2">🏆 Recompensas por tempo:</p>
                <ul className="space-y-1">
                  <li>
                    🎯 Até 20s:{' '}
                    <span className="text-green-600 font-bold">+100 XP</span>
                  </li>
                  <li>
                    🎯 Até 30s:{' '}
                    <span className="text-blue-600 font-bold">+75 XP</span>
                  </li>
                  <li>
                    🎯 Até 40s:{' '}
                    <span className="text-yellow-600 font-bold">+50 XP</span>
                  </li>
                  <li>
                    🎯 Acima de 50s:{' '}
                    <span className="text-gray-600 font-bold">+25 XP</span>
                  </li>
                </ul>
              </div>

              {/* Botão começar */}
              <button
                onClick={() => startGame()}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-800 text-lg"
              >
                Começar
              </button>
            </div>
          </div>
        )}

        <div
          className={`grid gap-1 mt-4 ${
            started ? 'grid-cols-10 grid-rows-10' : 'hidden'
          }`}
        >
          {grid.map((row, i) =>
            row.map((letter, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-10 h-10 flex items-center justify-center border-2 font-bold cursor-pointer transition-all
                  ${
                    clickedLetters.has(`${i}-${j}`)
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-800'
                  }
                `}
                onClick={() => handleCellClick(i, j)}
              >
                {letter}
              </div>
            ))
          )}
        </div>

        {started && (
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-white font-bold text-lg">
            {words.map((word) => (
              <div
                key={word}
                className={`transition-all ${
                  foundWords.has(word) ? 'line-through text-gray-400' : ''
                }`}
              >
                {word}
              </div>
            ))}
          </div>
        )}

        {/* Tela de conclusão */}
        {started && foundLetters.size === 0 && (
          <div className="mt-10 p-6 bg-white rounded shadow flex flex-col items-center gap-4">
            <p className="text-lg font-bold text-gray-800">
              Você concluiu o caça-palavras em {formatTime(time)}!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-800"
            >
              Começar novamente
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    `Fiz o Caça Palavras em ${formatTime(
                      time
                    )}, venha jogar também! ${window.location.href}`
                  )}`,
                  '_blank'
                )
              }
              className="px-4 py-2 bg-indigo-800 text-white rounded hover:bg-indigo-800"
            >
              Compartilhar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSearchGame;
