import { Pool } from 'mysql2/promise';

export interface EventoCalendario {
    id?: number;
    calendario_id: number;
    data: string;
    tipo: string;
    nome: string;
    cor: string;
    descricao?: string;
    importancia?: string;
    recorrente?: boolean;
}

export const criarEvento = async (pool: Pool, evento: EventoCalendario) => {
    const query = `
        INSERT INTO eventos_calendario (calendario_id, data, tipo, nome, cor, descricao, importancia, recorrente)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const [result] = await pool.query(query, [
        evento.calendario_id,
        evento.data,
        evento.tipo,
        evento.nome,
        evento.cor,
        evento.descricao,
        evento.importancia,
        evento.recorrente ?? 0
    ]);
    return result;
};

// Listar eventos de um calendário
export const listarEventos = async (pool: Pool, calendario_id: number) => {
    const query = `SELECT * FROM eventos_calendario WHERE calendario_id = ?`;
    const [rows] = await pool.query(query, [calendario_id]);
    return rows;
};

// Remover evento
export const removerEvento = async (pool: Pool, evento_id: number) => {
    const query = `DELETE FROM eventos_calendario WHERE id = ?`;
    const [result] = await pool.query(query, [evento_id]);
    return result;
};

export const atualizarEvento = async (pool: Pool, evento: EventoCalendario) => {
    const query = `UPDATE eventos_calendario
        SET data = ?, tipo = ?, nome = ?, cor = ?, descricao = ?, importancia = ?, recorrente = ?
        WHERE id = ?;`;
    const [result] = await pool.query(query, [
        evento.data,
        evento.tipo,
        evento.nome,
        evento.cor,
        evento.descricao,
        evento.importancia,
        evento.recorrente ?? 0,
        evento.id
    ]);
    return result;
};

export const inserirRolesEvento = async (pool: Pool, evento_id: number, roles: string[]) => {
    if (!roles || !roles.length) return;
    const values = roles.map(role => [evento_id, role]);
    await pool.query(
        "INSERT INTO eventos_roles (evento_id, role) VALUES ?",
        [values]
    );
};

export const removerRolesEvento = async (pool: Pool, evento_id: number) => {
    await pool.query("DELETE FROM eventos_roles WHERE evento_id = ?", [evento_id]);
};

export const obterRolesEventoDB = async (pool: Pool, evento_id: number) => {
    const [rows] = await pool.query("SELECT role FROM eventos_roles WHERE evento_id = ?", [evento_id]);
    // Retorna array de strings
    return (rows as any[]).map(r => r.role);
};

export const inserirUsuariosEvento = async (pool: Pool, evento_id: number, usuarios: number[]) => {
    if (!usuarios || !usuarios.length) return;
    const values = usuarios.map(user_id => [evento_id, user_id]);
    await pool.query(
        "INSERT INTO eventos_usuarios (evento_id, user_id) VALUES ?",
        [values]
    );
};

export const removerUsuariosEvento = async (pool: Pool, evento_id: number) => {
    await pool.query("DELETE FROM eventos_usuarios WHERE evento_id = ?", [evento_id]);
};

export const obterUsuariosEventoDB = async (pool: Pool, evento_id: number) => {
    const [rows] = await pool.query("SELECT user_id FROM eventos_usuarios WHERE evento_id = ?", [evento_id]);
    // Retorna array de ids
    return (rows as any[]).map(r => r.user_id);
};

export const obterEventosDoUsuario = async (pool: Pool, user_id: number, role: string) => {
    const [eventosPorRole] = await pool.query(`SELECT e.* FROM eventos_calendario e INNER JOIN eventos_roles r ON e.id = r.evento_id WHERE r.role = ?`, [role]);
    const [eventosPorUsuario] = await pool.query(`SELECT e.* FROM eventos_calendario e INNER JOIN eventos_usuarios u ON e.id = u.evento_id WHERE u.user_id = ?`, [user_id]);
    return ([...eventosPorRole as any[], ...eventosPorUsuario as any[]].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
};

export const obterEventosEEnviosDoUsuario = async (pool: Pool, user_id: number, role: string) => {
  // Buscar eventos do calendário vinculados ao usuário
  const eventos = await obterEventosDoUsuario(pool, user_id, role);

  let envios: any[] = [];
  if (role === 'professor') {
    const [rows] = await pool.query(
      'SELECT id, tipo, titulo as nome, descricao, data_criacao as data FROM envios WHERE usuario_id = ?',
      [user_id]
    );
    envios = rows as any[];
  } else if (role === 'aluno') {
    const [turmas] = await pool.query('SELECT turma_id FROM alunos_turmas WHERE aluno_id = ?', [user_id]);
    const turmaIds = (turmas as any[]).map(t => t.turma_id);
    if (turmaIds.length > 0) {
      const [rows] = await pool.query(
        `SELECT id, tipo, titulo as nome, descricao, data_criacao as data
         FROM envios
         WHERE destinatario = 'turma' AND turma_id IN (${turmaIds.join(',')})`
      );
      envios = rows as any[];
    }
  }
  return [...eventos, ...envios];
};