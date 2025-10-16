import React, { useEffect, useState } from "react";


interface Anuncio {
  id: number;
  titulo: string;
  conteudo: string;
  data_inicio: string; 
  data_fim?: string | null;
  criado_em?: string;
}

export default function Anuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [anuncioExpandido, setAnuncioExpandido] = useState<number | null>(null);
  const API_URL = `/api`;
  const [lidos, setLidos] = useState<number[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/check-auth`, { credentials: "include" })
      .then(res => {
        if (res.status === 403) {
          setUserId(null);
          setLidos([]);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.id) {
          setUserId(data.id);
          fetch(`${API_URL}/anuncios-lidos?user_id=${data.id}`, { credentials: "include" })
            .then(res => res.json())
            .then(lidosResp => {
              if (Array.isArray(lidosResp)) {
                setLidos(lidosResp.map(Number));
              } else if (lidosResp && Array.isArray(lidosResp.lidos)) {
                setLidos(lidosResp.lidos.map(Number));
              } else {
                setLidos([]);
              }
            })
            .catch(() => setLidos([]));
        }
      });
    fetch(`${API_URL}/anuncios`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setAnuncios(data))
      .catch(() => setAnuncios([]))
      .finally(() => setLoading(false));
  }, []);

  const isVigente = (anuncio: Anuncio) => {
    const hoje = new Date();
    const inicio = new Date(anuncio.data_inicio);
    if (!anuncio.data_fim) {
      return (
        hoje.getFullYear() === inicio.getFullYear() &&
        hoje.getMonth() === inicio.getMonth() &&
        hoje.getDate() === inicio.getDate()
      );
    }
    const fim = new Date(anuncio.data_fim);
    return hoje >= inicio && hoje <= fim;
  };

  const marcarComoLido = (id: number) => {
    if (!lidos.includes(id) && userId) {
      fetch(`/api/anuncios/${id}/lido`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: userId })
      }).then(() => setLidos([...lidos, id]));
    }
    fetch(`${API_URL}/anuncios/${id}/visualizar`, { method: "POST", credentials: "include" });
    setAnuncioExpandido(id);
  };

  const ordenarAnuncios = (a: Anuncio, b: Anuncio) => {
    const dataA = new Date(a.data_inicio).getTime();
    const dataB = new Date(b.data_inicio).getTime();
    if (dataA !== dataB) return dataB - dataA;
    const fimA = a.data_fim ? new Date(a.data_fim).getTime() : Infinity;
    const fimB = b.data_fim ? new Date(b.data_fim).getTime() : Infinity;
    return fimA - fimB;
  };

  let anunciosParaExibir: Anuncio[] = [];
  const vigentes = anuncios.filter(isVigente).sort(ordenarAnuncios);
  if (vigentes.length >= 3) {
    anunciosParaExibir = vigentes.slice(0, 3);
  } else {
    const hoje = new Date();
    const naoVigentes = anuncios
      .filter(a => !isVigente(a))
      .sort((a, b) => {
        const distA = Math.abs(new Date(a.data_inicio).getTime() - hoje.getTime());
        const distB = Math.abs(new Date(b.data_inicio).getTime() - hoje.getTime());
        return distA - distB;
      });
    anunciosParaExibir = [...vigentes, ...naoVigentes].slice(0, 3);
  }

  return (
    <div className="mb-4">
      <h3 className="text-base mb-3 text-gray-800">Últimos Anúncios</h3>
      {loading ? (
        <p>Carregando anúncios...</p>
      ) : anunciosParaExibir.length === 0 ? (
        <p className="text-gray-500">Nenhum anúncio encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {anunciosParaExibir.map((anuncio) => {
            const naoLido = !lidos.includes(anuncio.id);
            const expandido = anuncioExpandido === anuncio.id;
            return (
              <li
                key={anuncio.id}
                className={`border-l-4 p-3 rounded cursor-pointer transition-all duration-200
                  ${expandido ? "bg-white border-indigo-900 shadow" : "bg-gray-100 border-[#303030]"}
                  ${naoLido && !expandido ? "font-bold" : ""}
                `}
                onClick={() => {
                  if (!expandido) marcarComoLido(anuncio.id);
                  else setAnuncioExpandido(null);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {naoLido && !expandido && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2 inline-block"></span>
                    )}
                    <strong className="block mb-1 text-sm text-gray-900">{anuncio.titulo}</strong>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {anuncio.data_inicio ? new Date(anuncio.data_inicio).toLocaleDateString("pt-BR") +
                      (anuncio.data_fim ? " até " + new Date(anuncio.data_fim).toLocaleDateString("pt-BR") : "")
                    : ""}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-tight mt-1">
                  {expandido
                    ? anuncio.conteudo
                    : anuncio.conteudo.length > 60
                      ? anuncio.conteudo.slice(0, 60) + "..."
                      : anuncio.conteudo}
                </p>
                {expandido && (
                  <button
                    className="mt-2 px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
                    onClick={e => {
                      e.stopPropagation();
                      setAnuncioExpandido(null);
                    }}
                  >
                    Fechar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}