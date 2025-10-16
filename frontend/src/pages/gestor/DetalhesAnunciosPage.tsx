import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SidebarGestor from "./components/Sidebar";
import TopbarGestorAuto from "./components/TopbarGestorAuto";
import { toast } from "sonner";


interface Anuncio {
id: number;
titulo: string;
conteudo: string;
data_inicio: string;
data_fim?: string | null;
criado_em: string;
autor_nome?: string;
visualizacoes: number;
}

const DetalhesAnunciosPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarAberta, setSidebarAberta] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const editModalRef = useRef<HTMLDivElement | null>(null);
    const [editTitulo, setEditTitulo] = useState("");
    const [editConteudo, setEditConteudo] = useState("");
    const [editDataInicio, setEditDataInicio] = useState("");
    const [editDataFim, setEditDataFim] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const API_URL = `/api`;

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/anuncios/${id}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            setAnuncio(data);
            setEditTitulo(data.titulo);
            setEditConteudo(data.conteudo);
            setEditDataInicio(data.data_inicio?.slice(0, 10) || "");
            setEditDataFim(data.data_fim?.slice(0, 10) || "");
        })
        .catch(() => setAnuncio(null))
        .finally(() => setLoading(false));
    }, [id]);

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
        const res = await fetch(`${API_URL}/anuncios/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
            titulo: editTitulo,
            conteudo: editConteudo,
            data_inicio: editDataInicio,
            data_fim: editDataFim || null,
            }),
        });
        if (res.ok) {
            const updated = await res.json();
            setAnuncio(updated);
            setEditModalOpen(false);
        }
        } finally {
        setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (editModalOpen && editModalRef.current && !editModalRef.current.contains(event.target as Node)) {
            setEditModalOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editModalOpen]);

    const estatisticasExtras = anuncio ? [
        { label: "Visualizações", value: anuncio.visualizacoes },
        { label: "Dias Vigente", value: anuncio.data_fim
            ? Math.max(1, Math.ceil((new Date(anuncio.data_fim).getTime() - new Date(anuncio.data_inicio).getTime()) / (1000 * 60 * 60 * 24)) + 1)
            : 1
        },
        { label: "Criado em", value: new Date(anuncio.criado_em).toLocaleString("pt-BR") },
        { label: "Autor", value: anuncio.autor_nome || "Desconhecido" },
    ] : [];

    const handleDelete = async () => {
        if (window.confirm("Tem certeza que deseja excluir este anúncio?")) {
            const res = await fetch(`${API_URL}/anuncios/${id}`, { method: "DELETE", credentials: "include" });
            if (res.ok) {
                navigate("/gestor/anuncio");
            } else {
                toast.error("Erro ao excluir anúncio.");
            }
        }
    };
    return (
    <div className="flex min-h-screen bg-gray-50">
        <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) => navigate("/gestor", { state: { activePage: page } })}
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
        />
        <div className="flex-1 flex flex-col">
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
        <div className="flex-1 flex flex-col items-center py-10 mt-15">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-4 sm:p-8">
                <button onClick={() => navigate("/gestor/anuncio")} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-indigo-600 font-medium shadow-sm transition w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            {loading ? (
                <p>Carregando anúncio...</p>
            ) : anuncio ? ( <>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-indigo-900">{anuncio.titulo}</h2>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded bg-indigo-800 text-white hover:bg-indigo-900 transition" onClick={() => setEditModalOpen(true)}>
                            Editar
                        </button>
                        <button className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-700 transition" onClick= {handleDelete}>
                            Deletar
                        </button>
                    </div>
                </div>
                <p className="text-gray-700 mb-4 whitespace-pre-line">{anuncio.conteudo}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                    <span className="block text-xs text-gray-500">Data de início</span>
                    <span className="font-medium">{anuncio.data_inicio ? new Date(anuncio.data_inicio).toLocaleDateString("pt-BR") : "-"}</span>
                    </div>
                    <div>
                    <span className="block text-xs text-gray-500">Data de fim</span>
                    <span className="font-medium">{anuncio.data_fim ? new Date(anuncio.data_fim).toLocaleDateString("pt-BR") : "-"}</span>
                    </div>
                </div>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2 text-indigo-900">Estatísticas do anúncio</h3>
                    <ul className="space-y-1">
                    {estatisticasExtras.map((stat, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                        <span>{stat.label}:</span>
                        <span className="font-medium">{stat.value}</span>
                        </li>
                    ))}
                    </ul>
                </div>
            </> ) : (
                <p className="text-red-500">Anúncio não encontrado.</p>
            )}
            </div>
        </div>
        {/* Modal de edição */}
        {editModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-full sm:max-w-md lg:max-w-lg relative" ref={editModalRef}>
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl" onClick={() => setEditModalOpen(false)} aria-label="Fechar">
                        &times;
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-indigo-900">Editar Anúncio</h3>
                    <form onSubmit={handleEdit}>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Título
                            <input type="text" value={editTitulo} onChange={e => setEditTitulo(e.target.value)} required maxLength={100}
                            className="block w-full mt-1 mb-4 border border-indigo-400 rounded-lg px-3 py-2" 
                            />
                            </label>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Conteúdo
                            <textarea value={editConteudo} onChange={e => setEditConteudo(e.target.value)} required rows={6} maxLength={1000}
                            className="block w-full mt-1 mb-4 border border-indigo-400 rounded-lg px-3 py-2"
                            />
                        </label>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Data de início
                            <input type="date" value={editDataInicio} onChange={e => setEditDataInicio(e.target.value)} required
                            className="block w-full mt-1 mb-4 border border-indigo-400 rounded-lg px-3 py-2"
                            />
                        </label>
                        <label className="block mb-4 text-sm font-medium text-gray-700">
                            Data de fim (opcional)
                            <input type="date" value={editDataFim} onChange={e => setEditDataFim(e.target.value)}
                            className="block w-full mt-1 border border-indigo-400 rounded-lg px-3 py-2"
                            />
                        </label>
                        <div className="flex justify-end gap-3">
                            <button type="button" disabled={isSaving} onClick={() => setEditModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition">
                                Cancelar
                            </button>
                            <button type="submit" disabled={isSaving}
                            className="px-4 py-2 rounded-lg bg-indigo-800 text-white hover:bg-indigo-900 font-semibold transition">
                                {isSaving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </div>
    </div>
    );
};

export default DetalhesAnunciosPage;