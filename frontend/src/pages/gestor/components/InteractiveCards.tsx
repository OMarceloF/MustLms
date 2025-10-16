import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaRegShareSquare } from 'react-icons/fa';

type CurtidaState = {
  ativo: boolean;
  count: number;
};

interface FeedButtonsProps {
  curtidasIniciais: number;
  comentariosIniciais: number;
}

const FeedButtons: React.FC<FeedButtonsProps> = ({ curtidasIniciais, comentariosIniciais }) => {
  const [curtida, setCurtida] = useState<CurtidaState>({
    ativo: false,
    count: curtidasIniciais,
  });

  const toggleCurtida = () => {
    setCurtida(prev => ({
      ativo: !prev.ativo,
      count: prev.ativo ? prev.count - 1 : prev.count + 1,
    }));
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center px-5">
        {/* Grupo 1: Botões à esquerda */}
        <div className="flex gap-3">
          {/* Curtir */}
          <button
            className={`text-xl transition-transform duration-300 ease-in-out ${curtida.ativo
                ? 'scale-125 drop-shadow-[0_0_6px_rgba(255,0,0,0.6)]'
                : 'hover:scale-125 hover:drop-shadow-[0_0_6px_rgba(255,0,0,0.6)]'
              }`}
            onClick={toggleCurtida}
          >
            {curtida.ativo ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-black hover:text-red-500" />
            )}
          </button>

          {/* Comentar */}
          <button className="text-xl text-black-500 hover:text-orange-400 transition duration-300 hover:scale-125 hover:drop-shadow-[0_0_6px_rgba(255,165,0,0.6)]">
            <FaRegComment />
          </button>

          {/* Compartilhar */}
          <button className="text-xl text-black-500 hover:text-cyan-600 transition duration-300 hover:scale-125 hover:drop-shadow-[0_0_6px_rgba(0,255,255,0.6)]">
            <FaRegShareSquare />
          </button>
        </div>

        {/* Grupo 2: Contadores à direita */}
        <div className="flex gap-3">
          <div className="bg-gray-100 border border-red-200 text-red-600 font-semibold text-sm px-4 py-1.5 rounded-full min-w-[80px] text-center transition duration-300 hover:bg-red-500 hover:text-white cursor-pointer">
            {curtida.count} curtidas
          </div>

          <div className="bg-gray-100 border border-orange-200 text-orange-500 font-semibold text-sm px-4 py-1.5 rounded-full min-w-[80px] text-center transition duration-300 hover:bg-orange-400 hover:text-white cursor-pointer">
            {comentariosIniciais} comentários
          </div>
        </div>
      </div>
    </div>
  );

};

export default FeedButtons;
