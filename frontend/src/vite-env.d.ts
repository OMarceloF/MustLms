// vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Variáveis EXISTENTES:
  readonly VITE_SOCKET_URL: string;
  readonly VITE_LOGO_ESCOLA: string;

  // NOVAS VARIÁVEIS DO CHAT (Adicionadas para o TS parar de reclamar):
  readonly VITE_CHAT_API_URL: string;
  readonly VITE_API_URL: string; // Adicione esta se seu código a usa em algum lugar que o TS precisa verificar
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}