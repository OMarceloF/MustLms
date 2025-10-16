// src/hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react';

export interface UserData {
  id: number;
  nome: string;
  role: string;
  foto_url: string; // sempre string
  cargo: string;    // role capitalizada/mapeada
}

type CheckAuthOkA = { ok: true; user: { id: number; nome?: string; role?: string; foto_url?: string } };
type CheckAuthOkB = { id: number; nome?: string; role?: string; foto_url?: string }; // legado (top-level)
type CheckAuthErr = { ok?: false; error?: string };

const API_URL: string = import.meta.env.VITE_API_URL || '';

const mapCargo = (role?: string): string => {
  const r = (role ?? '').toLowerCase();
  const map: Record<string, string> = {
    gestor: 'Gestor',
    professor: 'Professor',
    aluno: 'Aluno',
    responsavel: 'Responsável',
    financeiro: 'Financeiro',
    admin: 'Admin',
    administrador: 'Administrador',
  };
  return map[r] ?? (r ? r.charAt(0).toUpperCase() + r.slice(1) : '');
};

const initialUser: UserData = {
  id: 0,
  nome: '',
  role: '',
  foto_url: '',
  cargo: '',
};

export const useAuth = () => {
  const [user, setUser] = useState<UserData>(initialUser);
  const [loading, setLoading] = useState<boolean>(true);

  const parseUserFromResponse = (data: CheckAuthOkA | CheckAuthOkB | CheckAuthErr | any): UserData | null => {
    // Formato novo: { ok: true, user: { ... } }
    if (data && data.ok === true && data.user && typeof data.user.id === 'number') {
      const u = data.user;
      return {
        id: u.id,
        nome: String(u.nome ?? ''),
        role: String(u.role ?? ''),
        foto_url: String(u.foto_url ?? ''),
        cargo: mapCargo(u.role),
      };
    }
    // Formato legado: { id, nome, role, foto_url }
    if (data && typeof data.id === 'number') {
      return {
        id: data.id,
        nome: String(data.nome ?? ''),
        role: String(data.role ?? ''),
        foto_url: String(data.foto_url ?? ''),
        cargo: mapCargo(data.role),
      };
    }
    return null;
    };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/check-auth`, {
        method: 'GET',
        headers,
        credentials: 'include', // envia cookie (se houver)
      });

      // 401/403: não autenticado
      if (!res.ok) {
        setUser(initialUser);
        return false;
      }

      const data = await res.json();
      const parsed = parseUserFromResponse(data);
      if (parsed) {
        setUser(parsed);
        return true;
      }

      // Resposta inesperada
      setUser(initialUser);
      return false;
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
      setUser(initialUser);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        const token = localStorage.getItem('token');
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/api/check-auth`, {
          credentials: 'include',
          headers,
          signal: ac.signal,
        });

        if (!res.ok) {
          setUser(initialUser);
          return;
        }

        const data = await res.json();
        const parsed = parseUserFromResponse(data);
        setUser(parsed ?? initialUser);
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          console.error('Erro ao verificar autenticação:', err);
          setUser(initialUser);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // no-op
    } finally {
      localStorage.removeItem('token');
      setUser(initialUser);
    }
  }, []);

  return { user, loading, refresh, logout, API_URL };
};
