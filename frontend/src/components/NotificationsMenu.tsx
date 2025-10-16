import React, { forwardRef, useEffect, useState } from "react";
import { X } from "lucide-react";

type NotificacaoEvento = {
  id: number;
  tipo: string;
  titulo: string;
  conteudo: string;
  data: string;
  usuario_id: number;
  lida: number;
  visualizada: number;
};

const NotificationsMenu = forwardRef<HTMLDivElement, {
  isOpen: boolean;
  onClose: () => void;
  usuarioId: number;
}>(({ isOpen, onClose, usuarioId }, ref) => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoEvento[]>([]);

  console.log("📥 [NotificationsMenu] Render - isOpen:", isOpen);
  console.log("👤 [NotificationsMenu] usuarioId recebido:", usuarioId);

  useEffect(() => {
    const fetchNotificacoesEventos = async () => {
      if (!usuarioId || !isOpen) {
        console.log("⚠️ [fetchNotificacoesEventos] Bloqueado: usuarioId ou isOpen inválido");
        return;
      }

      console.log("📡 [fetchNotificacoesEventos] Buscando notificações para:", usuarioId);

      try {
        const res = await fetch(`/api/notificacoes-eventos/${usuarioId}`);
        const data = await res.json();
        console.log("✅ [fetchNotificacoesEventos] Dados recebidos:", data);

        setNotificacoes(data);
      } catch (err) {
        console.error("❌ [fetchNotificacoesEventos] Erro ao buscar notificações:", err);
      }
    };

    fetchNotificacoesEventos();
  }, [isOpen, usuarioId]);

  const marcarVisualizada = async (id: number) => {
    console.log(`🟢 [marcarVisualizada] Tentando marcar como visualizada: ID ${id}`);
    try {
      await fetch(`/api/notificacoes-eventos/${id}/visualizada`, { method: "PUT" });
      console.log("✅ [marcarVisualizada] Sucesso");
      setNotificacoes((prev) =>
        prev.map((not) => (not.id === id ? { ...not, visualizada: 1 } : not))
      );
    } catch (err) {
      console.error("❌ [marcarVisualizada] Erro:", err);
    }
  };

 const marcarLida = async (id: number) => {
  try {
    // Apaga do banco
    await fetch(`/api/notificacoes-eventos/${id}`, {
      method: "DELETE",
    });

    // Remove do estado
    setNotificacoes((prev) => prev.filter((not) => not.id !== id));
    console.log("🗑️ Notificação apagada:", id);
  } catch (err) {
    console.error("Erro ao apagar notificação:", err);
  }
};

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "mensagem": return "💬";
      case "nota_lancada": return "📝";
      case "envio_material": return "📎";
      case "aula_pendente": return "📚";
      case "avaliacao_pendente": return "🧪";
      case "calendario": return "📅";
      default: return "🔔";
    }
  };

  if (!isOpen) {
    console.log("🔒 [NotificationsMenu] isOpen está false — componente não será exibido.");
    return null;
  }

  return (
    <div
      ref={ref}
      className="
        absolute top-[60px] right-2 sm:right-4
        bg-white rounded-2xl shadow-xl
        w-full sm:w-[400px] max-w-[95vw]
        max-h-[80vh] overflow-y-auto
        z-[1001]
        p-2 sm:p-6
      "
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-zinc-800">Notificações</h2>
        <button onClick={onClose} className="text-[#a671e2] hover:text-[#7b4fb8]">
          <X size={28} />
        </button>
      </div>

      <ul className="space-y-6">
        {notificacoes.length === 0 && (
          <li className="text-sm text-gray-500 italic">
            ⚠️ Nenhuma notificação encontrada
          </li>
        )}

        {notificacoes.map((not, index) => {
          console.log(`🔔 [Render] Notificação ${index + 1}:`, not);
          return (
            <li
              key={not.id}
              className={`flex gap-3 items-start ${!not.visualizada ? "bg-purple-50 border-l-4 border-purple-400 px-2 py-1 rounded-md" : ""
                }`}
            >
              <div className="bg-[#f3e8ff] rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-2xl">{getIcon(not.tipo)}</span>
              </div>

              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-1">
                  {new Date(not.data).toLocaleString()}
                </p>
                <p className="font-semibold text-sm text-zinc-800 mb-0.5">{not.titulo}</p>
                <p className="text-sm text-zinc-700">{not.conteudo}</p>
                <div className="flex gap-2 mt-2">
                  {!not.lida && (
                    <button onClick={() => marcarLida(not.id)} className="text-xs text-blue-500">
                      Marcar como lida
                    </button>
                  )}
                  {!not.visualizada && (
                    <button
                      onClick={() => marcarVisualizada(not.id)}
                      className="text-xs text-green-500"
                    >
                      Marcar como visualizada
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default NotificationsMenu;
