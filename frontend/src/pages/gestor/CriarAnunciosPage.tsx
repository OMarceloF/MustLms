import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SidebarGestor from "./components/Sidebar";
import TopbarGestorAuto from "./components/TopbarGestorAuto";


const CriarAnunciosPage: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const navigate = useNavigate();
  const API_URL = `/api`;

  useEffect(() => {
    fetch(`/api/check-auth`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setUsuarioId(data.id);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`${API_URL}/anuncios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          titulo,
          conteudo,
          autor_id: usuarioId,
          data_inicio: dataInicio,
          data_fim: dataFim || null
        }),
      });

      if (res.ok) {
        toast.success("Anúncio criado com sucesso!");
        navigate("/gestor/anuncio");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao criar anúncio.");
      }
    } catch {
      toast.error("Erro ao criar anúncio.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />
      <div className="flex-1 flex flex-col pt-20 px-4 sm:px-4 lg:px-8 py-4 my-0 lg:my-4 ml-0 md:ml-2 lg:ml-2">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-full sm:max-w-lg mt-10">
            <button
              onClick={() => navigate("/gestor/anuncio")}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-indigo-600 font-medium shadow-sm transition w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <h2 className="text-2xl font-bold mb-6 text-indigo-900">Criar Anúncio</h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Título
                <input
                  type="text"
                  className="block w-full mt-1 mb-4 border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  required
                  maxLength={100}
                />
              </label>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Conteúdo
                <textarea
                  className="block w-full mt-1 mb-4 border border-indigo-400 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={conteudo}
                  onChange={e => setConteudo(e.target.value)}
                  required
                  rows={6}
                  maxLength={1000}
                />
              </label>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Data de início
                <input
                  type="date"
                  className="block w-full mt-1 mb-4 border border-indigo-400 rounded-lg px-3 py-2"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  required
                />
              </label>
              <label className="block mb-4 text-sm font-medium text-gray-700">
                Data de fim (opcional)
                <input
                  type="date"
                  className="block w-full mt-1 border border-indigo-400 rounded-lg px-3 py-2"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                />
              </label>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition w-full sm:w-auto"
                  onClick={() => navigate("/gestor/anuncio")}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-900 font-semibold transition w-full sm:w-auto"
                  disabled={isSaving || !usuarioId}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarAnunciosPage;