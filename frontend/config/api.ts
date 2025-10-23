// frontend/src/config/api.ts

const env = (import.meta.env as any) || {};

/**
 * URLs para o Microserviço de Chat (Sempre usam as variáveis VITE_ do Render)
 */
export const API_BASE_URL: string = (env.VITE_CHAT_API_URL as string) || 'http://localhost:3000/api/v1';

export const WSS_BASE_URL: string = (env.VITE_SOCKET_URL as string) || 'ws://localhost:3000';

// Note: A lógica de fallback para 'localhost' (se a variável VITE_ estiver vazia)
// é mantida para que o sistema não quebre, mas ela deve ser a URL do Render.