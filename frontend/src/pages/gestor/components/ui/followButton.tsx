import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';

interface FollowButtonProps {
  targetId: number;
}

const FollowButton: React.FC<FollowButtonProps> = ({ targetId }) => {
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('📡 useEffect → buscando status de follow para:', targetId);

    const fetchStatus = async () => {
      try {
        console.log('⏳ Iniciando requisição GET /status');
        const { data } = await axios.get<{ isFollowing: boolean }>(
          `/api/follow/status/${targetId}`,
          { withCredentials: true }
        );
        console.log('✅ Resposta da API /status:', data);
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error('❌ Erro ao buscar status de follow:', error);
      } finally {
        console.log('🟢 Finalizou busca de status');
        setLoading(false);
      }
    };

    fetchStatus();
  }, [targetId]);

  const handleFollowClick = async () => {
    if (loading) return;

    console.log('👉 Botão clicado para alterar follow');
    setLoading(true);

    try {
      console.log('⏳ Enviando POST para /toggle');
      const { data } = await axios.post<{ followed: boolean }>(
        `/api/follow/toggle/${targetId}`,
        {},
        { withCredentials: true }
      );
      console.log('✅ Resposta da API /toggle:', data);
      setIsFollowing(data.followed);
    } catch (error) {
      console.error('❌ Erro ao alternar follow:', error);
    } finally {
      console.log('🟢 Finalizou toggle follow');
      setLoading(false);
    }
  };

  if (loading) {
    console.log('⏳ Componente ainda está carregando...');
    return (
      <button
        disabled
        className="inline-flex items-center bg-gray-300 text-white px-4 py-2 rounded-full transition-all cursor-not-allowed"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        Carregando
      </button>
    );
  }

  const label = isFollowing ? 'Seguindo' : 'Seguir';

  console.log('🎯 Componente renderizado. Status atual:', isFollowing);

  return (
    <button
      onClick={handleFollowClick}
      disabled={loading}
      className={`${isFollowing ? 'bg-blue-700' : 'bg-blue-500'} hover:bg-blue-600 text-white px-4 py-2 rounded-full inline-flex items-center transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <UserPlus className="w-4 h-4 mr-2" />
      {label}
    </button>
  );
};

export default FollowButton;
