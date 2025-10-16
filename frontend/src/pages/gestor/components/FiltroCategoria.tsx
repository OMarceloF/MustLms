import React from "react";

interface FiltroCategoriaProps {
  categorias: string[];
  categoriaSelecionada: string;
  setCategoriaSelecionada: (categoria: string) => void;
}

const FiltroCategoria: React.FC<FiltroCategoriaProps> = ({
  categorias,
  categoriaSelecionada,
  setCategoriaSelecionada,
}) => {
  return (
    <div className="flex flex-row items-center justify-center w-full p-2 gap-4">
      <label className="text-base font-bold text-gray-800">Categoria:</label>
      <select
        value={categoriaSelecionada}
        onChange={(e) => setCategoriaSelecionada(e.target.value)}
        className="w-full h-9 p-2 text-sm border border-gray-300 rounded-md transition-all duration-300 ease-in-out focus:border-[#759C9D] focus:ring-2 focus:ring-[#759C9D] focus:outline-none bg-white text-gray-800"
      >
        <option value="">Todas as Categorias</option>
        {categorias.map((categoria) => (
          <option key={categoria} value={categoria}>
            {categoria}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FiltroCategoria;
