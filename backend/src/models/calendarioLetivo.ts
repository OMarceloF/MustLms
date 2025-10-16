import { Pool } from 'mysql2/promise';

export interface CalendarioLetivo {
    id?: number;
    ano_letivo: number;
    data_inicial: string;
    data_final: string;
    tipo: string;
    valor?: number;
}

export const criarCalendario = async (pool: Pool, calendario: CalendarioLetivo) => {
    const query = `
        INSERT INTO calendario_gestor (ano_letivo, data_inicial, data_final, tipo, valor)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        calendario.ano_letivo,
        calendario.data_inicial,
        calendario.data_final,
        calendario.tipo,
        calendario.valor ?? 0
    ]);
    return result;
};

// Listar calendários por escola
export const listarCalendarios = async (pool: Pool, ano_letivo: number) => {
    let query = 'SELECT * FROM calendario_gestor';
    let params: any[] = [];
    if (ano_letivo) {
        query += ' WHERE ano_letivo = ?';
        params.push(Number(ano_letivo));
    }
    const [rows] = await pool.query(query, params);
    return rows;
};

export const buscarCalendario = async (pool: Pool, ano_letivo: number) => {
    const query = `SELECT * FROM calendario_letivo WHERE ano_letivo = ?`;
    const [rows] = await pool.query(query, [ano_letivo]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

export const criarCalendarioLetivo = async (
    pool: Pool,
    calendario: { escola_id: number, ano_letivo: number, inicio: string, fim: string, tipo: string }
) => {
    const query = `
        INSERT INTO calendario_letivo (escola_id, ano_letivo, inicio, fim, tipo)
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
        calendario.escola_id,
        calendario.ano_letivo,
        calendario.inicio,
        calendario.fim,
        calendario.tipo
    ]);
    return result;
};

export const buscarCalendarioPorId = async (pool: Pool, id: number) => {
    const query = `SELECT * FROM calendario_letivo WHERE id = ?`;
    const [rows] = await pool.query(query, [id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};