import { Pool } from "mysql2/promise";

export interface Anuncio {
  id?: number;
  titulo: string;
  conteudo: string;
  criado_em?: string;
  autor_id?: number;
  autor_nome?: string;
  data_inicio: string;
  data_fim?: string | null;
}

export const criarAnuncioDB = async (pool: Pool, anuncio: Anuncio) => {
  const [result]: any = await pool.query(
    "INSERT INTO anuncios (titulo, conteudo, criado_em, autor_id, data_inicio, data_fim) VALUES (?, ?, NOW(), ?, ?, ?)",
    [anuncio.titulo, anuncio.conteudo, anuncio.autor_id, anuncio.data_inicio, anuncio.data_fim || null]
  );
  return { ...anuncio, id: result.insertId };
};

export const listarAnunciosDB = async (pool: Pool) => {
  const [rows]: any = await pool.query(
    `SELECT a.id, a.titulo, a.conteudo, a.criado_em, a.visualizacoes, a.data_inicio, a.data_fim, u.nome as autor_nome
     FROM anuncios a
     LEFT JOIN users u ON a.autor_id = u.id
     ORDER BY a.criado_em DESC`
  );
  return rows;
};

export const buscarAnuncioPorIdDB = async (pool: Pool, id: number) => {
  const [rows]: any = await pool.query(
    `SELECT a.id, a.titulo, a.conteudo, a.criado_em, a.visualizacoes, a.data_inicio, a.data_fim, u.nome as autor_nome
     FROM anuncios a
     LEFT JOIN users u ON a.autor_id = u.id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const editarAnuncioDB = async (
  pool: Pool,
  id: number,
  anuncio: Partial<Anuncio>
) => {
  const { titulo, conteudo, data_inicio, data_fim } = anuncio;
  await pool.query(
    `UPDATE anuncios SET titulo = ?, conteudo = ?, data_inicio = ?, data_fim = ? WHERE id = ?`,
    [titulo, conteudo, data_inicio, data_fim || null, id]
  );
  // Retorna o anúncio atualizado
  return buscarAnuncioPorIdDB(pool, id);
};

export const excluirAnuncioDB = async (pool: Pool, id: number) => {
  await pool.query(`DELETE FROM anuncios WHERE id = ?`, [id]);
  return true;
};

export const incrementarVisualizacaoDB = async (pool: Pool, id: number) => {
  await pool.query("UPDATE anuncios SET visualizacoes = visualizacoes + 1 WHERE id = ?", [id]);
};

export const marcarAnuncioComoLidoDB = async (pool: Pool, userId: number, anuncioId: number) => {
  await pool.query(
    "INSERT IGNORE INTO anuncios_lidos (user_id, anuncio_id) VALUES (?, ?)",
    [userId, anuncioId]
  );
};

export const listarAnunciosLidosDB = async (pool: Pool, userId: number) => {
  const [rows]: any = await pool.query(
    "SELECT anuncio_id FROM anuncios_lidos WHERE user_id = ?",
    [userId]
  );
  return rows.map((row: any) => row.anuncio_id);
};