// frontend/src/components/ChatSidebar.tsx

import React, { useEffect } from 'react';
import { useChat } from '../hooks/useChat'; // Importe o hook

interface ChatSidebarProps {
  isOpen: boolean;
  onSelectFriend: (userId: string) => void;
}

export default function ChatSidebar({ isOpen, onSelectFriend }: ChatSidebarProps) {
  const { friendsList, isConnected } = useChat();

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[250px] bg-white border-l border-gray-300 shadow-xl z-40 pt-20 overflow-y-auto">
      <header className="p-3 border-b bg-gray-50">
        <h3 className="font-bold text-lg text-indigo-900">Contatos Online ({friendsList.filter(f => f.is_online).length})</h3>
        <p className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          Status: {isConnected ? 'Sincronizado' : 'Desconectado'}
        </p>
      </header>
      
      <div className="p-2">
        {friendsList.map(friend => (
          <div
            key={friend.id}
            onClick={() => onSelectFriend(friend.id)}
            className="flex items-center p-2 cursor-pointer hover:bg-gray-100 transition duration-150 rounded-lg"
          >
            <div className={`w-3 h-3 rounded-full mr-3 ${friend.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="flex-1 truncate">{friend.name}</span>
            {friend.is_online && <span className="text-xs text-indigo-600">Online</span>}
          </div>
        ))}
      </div>
    </div>
  );
}