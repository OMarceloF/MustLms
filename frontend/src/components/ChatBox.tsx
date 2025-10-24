// frontend/src/components/ChatBox.tsx

import React, { useState, useEffect } from 'react';
import { useChat, ChatMessage } from '../hooks/useChat'; // Importe o hook e o tipo

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  myUserId: string; // Renomeado de 'userId' para 'myUserId' para clareza
  activeChatId: string | null; // O ID do amigo que está conversando
}

export default function ChatBox({ isOpen, onClose, myUserId, activeChatId }: ChatBoxProps) {
  
  // Pega as funções e mensagens do hook de comunicação
  const { messages, sendMessage } = useChat(activeChatId);
  
  const [inputContent, setInputContent] = useState('');
  
  if (!isOpen || !activeChatId) return null;

  // Lógica para filtrar mensagens para a conversa ativa
  const activeConversationMessages = messages.filter(m => 
    (m.from === myUserId && m.to === activeChatId) ||
    (m.from === activeChatId && m.to === myUserId)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    // 1. Chama a função de envio do hook
    sendMessage(activeChatId, inputContent.trim()); 

    // 2. Limpa o input
    setInputContent('');
  };

  return (
    <div className="fixed bottom-0 right-0 h-[450px] w-[350px] bg-white border border-gray-300 shadow-2xl flex flex-col z-50 rounded-tl-lg">
      <header className="bg-indigo-900 text-white p-3 flex justify-between items-center rounded-tl-lg">
        <h2 className="font-bold">Conversa com {activeChatId}</h2> {/* Exibe o ID do amigo */}
        <button onClick={onClose} className="text-xl font-bold leading-none">
          &times;
        </button>
      </header>
      
      {/* Dynamic Content Area (Messages) */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {activeConversationMessages.map(msg => (
            <div key={msg.id} className={`max-w-[80%] ${msg.isMine ? 'ml-auto bg-indigo-200' : 'mr-auto bg-gray-200'} p-2 rounded-lg text-sm`}>
                {msg.content}
                <span className="block text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
            </div>
        ))}
        {activeConversationMessages.length === 0 && <p className="text-gray-500 text-center text-sm mt-5">Inicie uma conversa!</p>}
      </div>
      
      {/* Footer / Input */}
      <footer className="p-3 border-t">
        <form onSubmit={handleSend} className="flex">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className="w-full p-2 border rounded-l" 
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
          />
          <button type="submit" className="bg-indigo-600 text-white p-2 rounded-r hover:bg-indigo-700">
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}