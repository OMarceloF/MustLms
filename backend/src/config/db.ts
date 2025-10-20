// src/config/db.ts
import mysql from 'mysql2/promise';
import { config } from './config';

/**
 * Observações importantes:
 * - Prefira '127.0.0.1' a 'localhost' no Windows para evitar issues de resolução/DNS.
 * - Ajuste DB_PORT no config/.env se não for 3306.
 */
const pool = mysql.createPool({
  host: config.db.host || '127.0.0.1',
  port: Number((config as any)?.db?.port ?? process.env.DB_PORT ?? 3306),
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,

  // Robustez
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000, // ⏱️ aumenta tolerância
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // optional: dateStrings: true, timezone: 'Z'
});

export default pool;

export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  const [rows] = await pool.query(query, params);
  return rows as T;
}

/** Ping simples para checar disponibilidade do DB antes de operações pesadas */
export async function pingDB(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch {
    return false;
  }
}
