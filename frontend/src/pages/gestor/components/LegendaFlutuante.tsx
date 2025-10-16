import React, { useEffect, useRef, useState } from 'react';

const coresDisciplinas: { [key: string]: string } = {
  Matemática: 'rgb(58, 128, 209)',
  Geografia: 'rgb(0, 0, 0)',
  Inglês: 'rgb(0, 116, 15)',
  Redação: 'rgb(134, 86, 128)',
  Portugues: 'rgb(255, 230, 0)',
  EducaçãoFisica: 'rgb(0, 231, 77)',
  Física: 'rgb(13, 0, 255)',
  História: 'rgb(255, 0, 0)',
  Artes: 'rgb(255, 136, 0)',
  Filosofia: 'rgb(183, 0, 255)',
  Biologia: 'rgb(122, 253, 122)',
  Química: 'rgb(135, 190, 248)',
};

export default function LegendaFlutuante({
  mostrarCompleto,
}: {
  mostrarCompleto: boolean;
}) {
  const legendaRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: window.innerHeight - 180 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setPos({ x: e.clientX - 60, y: e.clientY - 20 });
    };

    const stopDrag = () => setDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [dragging]);

  return (
    <div
      className="fixed z-50 bg-white p-3 rounded-xl shadow-lg transition-opacity duration-300"
      ref={legendaRef}
      style={{
        left: pos.x,
        top: pos.y,
        opacity: mostrarCompleto ? 1 : 0.2,
        pointerEvents: 'auto',
        width: '220px',
      }}
    >
      <div
        className="text-center text-xl cursor-grab mb-2 text-gray-600"
        onMouseDown={() => setDragging(true)}
        title="Segure para mover"
      >
        ⠿
      </div>
      {Object.entries(coresDisciplinas).map(([disciplina, cor]) => (
        <div className="flex items-center mb-1" key={disciplina}>
          <span
            className="w-4 h-4 rounded-sm mr-2"
            style={{ backgroundColor: cor }}
          ></span>
          <span className="text-sm text-gray-800">{disciplina}</span>
        </div>
      ))}
    </div>
  );
}
