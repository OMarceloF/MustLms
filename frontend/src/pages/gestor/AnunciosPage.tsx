import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarGestor from "./components/Sidebar";
import TopbarGestorAuto from "./components/TopbarGestorAuto";


interface Anuncio {
  id: number;
  titulo: string;
  conteudo: string;
  criado_em: string;
  autor_nome?: string;
}

const AnunciosPage: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const navigate = useNavigate();
  const API_URL = `/api`;

  useEffect(() => {
    fetch(`${API_URL}/anuncios`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAnuncios(data))
      .catch(() => setAnuncios([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarGestor 
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />
      <div className="flex-1 flex flex-col ml-0 lg:ml-auto mr-2 md:mr-auto my-4">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <div className="flex flex-col items-center py-8 mt-8 flex-1">
          <div className="w-full max-w-full sm:max-w-2xl lg:max-w-3xl bg-white rounded-xl shadow-xl p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2">
              <h2 className="text-2xl font-bold text-indigo-900">Anúncios</h2>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-900 font-semibold transition cursor-pointer w-full sm:w-auto mt-4 sm:mt-0"
                onClick={() => navigate("/gestor/anuncio/novo")}
              >
                Criar Anúncio
              </button>
            </div>
            {loading ? (
              <p>Carregando anúncios...</p>
            ) : anuncios.length === 0 ? (
              <p className="text-gray-500">Nenhum anúncio cadastrado.</p>
            ) : (
              <ul className="space-y-4">
                {anuncios.map((anuncio) => (
                  <li
                    key={anuncio.id}
                    className="border-l-4 border-indigo-700 bg-indigo-50 p-4 rounded cursor-pointer hover:bg-indigo-300 transition"
                    onClick={() => navigate(`/gestor/anuncio/${anuncio.id}/visualizar`)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <h3 className="text-lg font-semibold text-indigo-800">{anuncio.titulo}</h3>
                      <span className="text-xs text-gray-500 mt-2 sm:mt-0">
                        {new Date(anuncio.criado_em).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">{anuncio.conteudo}</p>
                    {anuncio.autor_nome && (
                      <span className="text-xs text-gray-500">Por: {anuncio.autor_nome}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnunciosPage;