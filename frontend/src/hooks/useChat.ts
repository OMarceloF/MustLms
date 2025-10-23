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

export interface ChatMessage {
  id: string; // ID da mensagem (usaremos Date.now() ou um mock)
  from: string; // ID do remetente
  to: string; // ID do destinatário (para exibição)
  content: string;
  timestamp: number;
  isMine: boolean; // Indica se fui eu quem enviei (para alinhamento na UI)
}

type PresenceMap = Record<string, PresenceStatus>;

// Simulação de lista estática de amigos (Em produção, viria da sua API principal)
// Usamos IDs que sabemos que existem no microserviço (42, 99)
const MOCK_FRIENDS: Friend[] = [
  { id: '42', name: 'Usuário Local', is_online: false, last_seen: null },
  { id: '99', name: 'Usuário Maria', is_online: false, last_seen: null },
  { id: '101', name: 'Professor João', is_online: false, last_seen: null },
  { id: '102', name: 'Coordenador Ana', is_online: false, last_seen: null },
];

export function useChat() {
  const { user } = useAuth(); 
  const myUserId = String(user?.id ?? '42'); // Usaremos '42' como fallback do usuário logado
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [friendsList, setFriendsList] = useState<Friend[]>(MOCK_FRIENDS);
  const [isConnected, setIsConnected] = useState(false);
  
  // Usamos useRef para o WebSocket para evitar que ele mude a cada renderização
  const websocketRef = useRef<WebSocket | null>(null); 
  

  // --- 1. FUNÇÃO REST: BUSCAR PRESENÇA INICIAL (API_BASE_URL) ---
  const fetchInitialPresence = useCallback(async () => {
    if (!myUserId || myUserId === '42') return; // Evita chamada se não autenticado (ou mock)

    const friendIds = MOCK_FRIENDS.map(f => f.id).join(',');
    
    try {
      // Endpoint REST: /api/v1/users/status?ids=...
      const response = await fetch(`${API_BASE_URL}/users/status?ids=${friendIds}`);
      
      if (!response.ok) throw new Error('Falha ao buscar presença inicial.');
      
      const data = await response.json(); 
      const presenceMap: PresenceMap = data.results;

      // Atualiza a lista com o status online/offline real
      setFriendsList(prevFriends => 
        prevFriends.map(friend => {
            const status = presenceMap[friend.id];
            return {
                ...friend,
                is_online: status?.is_online ?? false, // Padrão: offline
                last_seen: status?.last_seen ?? null,
            };
        }).sort((a, b) => (b.is_online ? 1 : -1) - (a.is_online ? 1 : -1)) // Online primeiro
      );

    } catch (error) {
      console.error("Erro ao buscar presença inicial:", error);
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
      fetchInitialPresence(); 
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
  }, [myUserId]); // APENAS o ID do usuário (ou [])


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