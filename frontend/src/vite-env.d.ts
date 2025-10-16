/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET_URL: string;
  // adicione outras variáveis aqui se necessário
  readonly VITE_LOGO_ESCOLA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
