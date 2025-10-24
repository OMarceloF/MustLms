// frontend/src/hooks/useChat.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth'; 
import { WSS_BASE_URL, API_BASE_URL } from '../../config/api'

// --- Tipos de Dados ---
interface PresenceStatus {
  is_online: boolean;
  last_seen: number | null;
  server_id?: string; // Usado internamente pelo microserviço
}

interface Friend extends PresenceStatus {
  id: string;
  name: string;
  // Outros dados do usuário
}

interface MessagePayload {
  type: 'NEW_MESSAGE';
  from: string;
  content: string;
  timestamp: number;
}

// Novo Tipo para o dado bruto que vem da API /api/usuarios
interface RawUser {
    id: number | string; // O ID vem como number no seu JSON
    nome: string;
    role: string;
    foto_url?: string; // Opcional
}

export interface ChatMessage {
  id: string; // ID da mensagem (usaremos Date.now() ou um mock)
  from: string; // ID do remetente
  to: string; // ID do destinatário (para exibição)
  content: string;
  timestamp: number;
  isMine: boolean; // Indica se fui eu quem enviei (para alinhamento na UI)
}

type PresenceMap = Record<string, PresenceStatus>;

const MONOLITH_API_BASE = import.meta.env.VITE_API_URL;

export function useChat(activeChatId: string | null) {
  const { user } = useAuth(); 
  const myUserId = String(user?.id ?? '42'); // Usaremos '42' como fallback do usuário logado
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Usamos useRef para o WebSocket para evitar que ele mude a cada renderização
  const websocketRef = useRef<WebSocket | null>(null); 

  // Mova a lógica de busca de histórico para o useChat
  const fetchHistory = useCallback(async (recipientId: string) => {
    if (!myUserId || !recipientId) return;

    try {
        // Endpoint REST: /api/v1/history/:recipientId?senderId=...
        const response = await fetch(`${API_BASE_URL}/history/${recipientId}?senderId=${myUserId}`);
        
        if (!response.ok) throw new Error('Falha ao buscar histórico.');
        
        const data = await response.json();
        
        // Mapeia o histórico do MongoDB para o tipo ChatMessage do frontend
        const historyMessages: ChatMessage[] = data.history.map((msg: any) => ({
            id: msg._id.toString(),
            from: msg.sender_id,
            to: (msg.sender_id === myUserId) ? recipientId : myUserId, // O outro participante
            content: msg.content,
            timestamp: new Date(msg.timestamp).getTime(),
            isMine: msg.sender_id === myUserId,
        }));

        setMessages(historyMessages); // Sobrescreve as mensagens com o histórico
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
    }
  }, [myUserId]);
  
  // --- NOVO useEffect: BUSCA DE HISTÓRICO AO MUDAR DE AMIGO ---
  useEffect(() => {
    if (activeChatId) {
        setMessages([]); // Limpa a conversa anterior para mostrar loading
        fetchHistory(activeChatId);
    }
  }, [activeChatId, fetchHistory]); // Dispara quando o amigo ativo muda

  // 1. Defina a função principal de busca (Substitui as duas funções antigas)
  const fetchContactsAndPresence = useCallback(async () => {
    
    // --------------------------------------------------------
    // ETAPA 1: BUSCAR TODOS OS USUÁRIOS REAIS DO MONOLÍTICO
    // --------------------------------------------------------
    let rawUsers: RawUser[] = [];
    try {
        const response = await fetch(`${MONOLITH_API_BASE}/usuarios`); 
        if (!response.ok) throw new Error(`Falha ao buscar usuários: ${response.statusText}`);
        rawUsers = await response.json(); 
    } catch (error) {
        console.error("Erro ao buscar lista de contatos do monolítico:", error);
        return; 
    }
    
    // 1.1 Filtra e mapeia para o tipo Friend (sem status de chat ainda)
    const friendsOnly: Friend[] = rawUsers
        .filter((user: RawUser) => String(user.id) !== myUserId)
        .map((user: RawUser) => ({ 
            id: String(user.id),
            name: user.nome,
            is_online: false, // Default
            last_seen: null, // Default
            // Adicione outras propriedades aqui, como photo: user.foto_url
        }));

    // --------------------------------------------------------
    // ETAPA 2: BUSCAR O STATUS DE PRESENÇA NO MICROSERVIÇO DE CHAT
    // --------------------------------------------------------
    const friendIds = friendsOnly.map(f => f.id).join(',');
    
    try {
        // Endpoint REST do CHAT SERVICE: /api/v1/users/status?ids=...
        const presenceResponse = await fetch(`${API_BASE_URL}/users/status?ids=${friendIds}`);
        const data = await presenceResponse.json(); 
        const presenceMap: PresenceMap = data.results;

        // ETAPA 3: COMBINAR E ATUALIZAR ESTADO
        setFriendsList(
            friendsOnly.map(friend => ({
                ...friend,
                is_online: presenceMap[friend.id]?.is_online ?? false, 
                last_seen: presenceMap[friend.id]?.last_seen ?? null,
            })).sort((a, b) => (b.is_online ? 1 : -1) - (a.is_online ? 1 : -1)) 
        );

    } catch (error) {
        console.error("Erro ao buscar presença do Chat Service:", error);
    }
  }, [myUserId]);


  // --- 2. CONEXÃO WEBSOCKET (WSS_BASE_URL) ---
  useEffect(() => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        return;
    }
    
    const mockJwt = `user-${myUserId}`; 
    const wsUrl = `${WSS_BASE_URL}/ws/v1/chat?token=${mockJwt}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WS: Conectado e autenticado.');
      // Importante: Busca a presença após a conexão WS, garantindo que o servidor nos veja
      fetchContactsAndPresence(); 
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      console.log('WS: Desconectado. Tentando reconexão...');
      // Lógica FUTURA de reconexão
    };

    // Handler para todas as mensagens de tempo real recebidas
    ws.onmessage = (event) => {
        try {
            const data: MessagePayload | any = JSON.parse(event.data);
            
            if (data.type === 'NEW_MESSAGE') {
                console.log(`Mensagem de ${data.from}: ${data.content}`);
                
                // --- CORREÇÃO: Lógica para adicionar a mensagem recebida ao estado ---
                const receivedMessage: ChatMessage = {
                    id: String(data.timestamp), // Usa o timestamp como ID
                    from: data.from,
                    to: myUserId, // O destinatário sou eu
                    content: data.content,
                    timestamp: data.timestamp,
                    isMine: false, // Mensagem recebida não é minha
                };

                // Atualiza o estado das mensagens no React
                setMessages(prev => [...prev, receivedMessage]);
                // --------------------------------------------------------------------
                
            } 
            // FUTURO: Lógica para atualizar PRESENCE_UPDATE
            
        } catch (e) {
            console.error("Erro ao processar mensagem WS:", e);
        }
    };
    
    websocketRef.current = ws; // Armazena a conexão na referência

    // Limpeza
    return () => {
      ws.close();
    };
  }, [myUserId, fetchContactsAndPresence]); // APENAS o ID do usuário (ou [])


  // --- 3. FUNÇÃO DE ENVIO DE MENSAGEM (Comando WSS) ---
  const sendMessage = useCallback((recipientId: string, content: string) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
        console.error("Conexão WebSocket não está aberta.");
        return;
    }

    // Formato do microserviço: SEND_MESSAGE:[ID_DESTINATÁRIO]:[CONTEÚDO]
    const messageCommand = `SEND_MESSAGE:${recipientId}:${content}`;
    
    websocketRef.current.send(messageCommand);
    console.log(`Comando WS enviado: ${messageCommand}`);
    
    // --- ATUALIZAÇÃO LOCAL (FEEDBACK INSTANTÂNEO) ---
    const newMessage: ChatMessage = {
        id: String(Date.now()), // Mock ID
        from: myUserId,
        to: recipientId,
        content: content,
        timestamp: Date.now(),
        isMine: true,
    };

    setMessages(prev => [...prev, newMessage]);
    // -------------------------------------------------
    
  }, [myUserId]);

  return { 
    myUserId,
    friendsList, 
    isConnected,
    messages,
    sendMessage,
    // Outras funções de chat...
  };
}