import React from 'react';

interface CommunityBoxProps {
  nome: string;
  foco: string;
  participantes: number;
  descricao: string;
  imagemUrl: string;
  onParticipar: () => void;
  onSair: () => void;
}

const CommunityBox: React.FC<CommunityBoxProps> = ({
  nome,
  foco,
  participantes,
  descricao,
  imagemUrl,
  onParticipar,
  onSair,
}) => {
  return (
    <div className="flex bg-white p-5 rounded-xl shadow-[0_12px_16px_rgba(0,0,0,0.5)] mb-10 border border-gray-300">
      <img
        src={imagemUrl}
        alt={`Comunidade ${nome}`}
        className="w-[180px] h-[180px] rounded-xl object-cover mr-6"
      />
      <div className="flex-1">
        <h2 className="text-[1.4rem] font-bold text-[#2c3e50]">{nome}</h2>
        <p className="text-[0.95rem] text-gray-600 mt-1">Foco: {foco}</p>
        <p className="text-[0.95rem] text-gray-600 mt-1">{participantes} participantes</p>
        <p className="text-[1rem] text-gray-700 mt-3">{descricao}</p>
        <div className="flex gap-4 mt-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold"
            onClick={onParticipar}
          >
            Participar
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
            onClick={onSair}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default CommunityBox;
