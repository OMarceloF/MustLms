import { useEffect, useState } from "react";
import axios from "axios";

const UsuariosOnlineCard = () => {
  // O estado agora armazena o número total de usuários, não os online.
  const [totalUsuarios, setTotalUsuarios] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Função para buscar o dado da nossa nova API
    const fetchTotalUsuarios = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/users/total`);
        setTotalUsuarios(response.data.total);
      } catch (error) {
        console.error("Erro ao buscar o total de usuários:", error);
        // Em caso de erro, podemos deixar em 0 ou mostrar uma mensagem.
        setTotalUsuarios(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalUsuarios();

    // Opcional: Se você quiser que o número atualize de vez em quando,
    // pode usar um setInterval aqui, mas para total de usuários,
    // carregar uma vez geralmente é suficiente.

  }, []); // O array de dependências vazio faz com que o useEffect rode apenas uma vez.

  return (
    <div
      className="rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg w-52"
      style={{ backgroundColor: '#283248', color: '#ffffff' }}
    >
      <div className="flex justify-between items-center mb-4">
        <span
          className="px-2 py-1 rounded-full text-xs font-semibold"
          style={{ backgroundColor: '#dee3ef', color: '#283248' }}
        >
          2025
        </span>
      </div>
      <div>
        {/* Mostra um spinner ou '...' enquanto carrega */}
        {isLoading ? (
          <div className="text-3xl font-bold animate-pulse">...</div>
        ) : (
          <h2 className="text-3xl font-bold">{totalUsuarios}</h2>
        )}
        {/* O texto agora reflete o novo dado */}
        <p>Usuários Cadastrados</p>
      </div>
    </div>
  );
};

export default UsuariosOnlineCard;
