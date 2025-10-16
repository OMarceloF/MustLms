import React from "react";

interface FiltroBuscaProps {
  busca: string;
  setBusca: (busca: string) => void;
}

const FiltroBusca: React.FC<FiltroBuscaProps> = ({ busca, setBusca }) => {
  return (
    <div className="flex flex-row items-center justify-center w-full p-2 gap-4">
      <label className="text-base font-bold text-gray-800">Buscar:</label>
      <input
        type="text"
        placeholder="Buscar por descrição..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full h-9 p-2 text-sm border border-gray-300 rounded-md transition-all duration-300 ease-in-out focus:border-[#759C9D] focus:ring-2 focus:ring-[#759C9D] focus:outline-none placeholder:text-gray-400 placeholder:italic hover:border-gray-500"
      />
    </div>
  );
};

export default FiltroBusca;
