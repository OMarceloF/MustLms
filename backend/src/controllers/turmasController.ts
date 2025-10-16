import { Request, Response } from 'express';
import pool from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2';

/**
 * Cria uma nova turma.
 */
export const criarTurma = async (req: Request, res: Response) => {
  const {
    nome,
    serie,
    turno,
    ano_letivo,
    aulas_por_dia,
    etapa_ensino,
    qtd_alunos = 0,
    professor_responsavel,
  } = req.body;

  try {
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO turmas 
         (nome, serie, turno, ano_letivo, aulas_por_dia, etapa_ensino, qtd_alunos, professor_responsavel) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome,
        serie,
        turno,
        ano_letivo,
        aulas_por_dia,
        etapa_ensino,
        qtd_alunos,
        professor_responsavel,
      ]
    );

    const turmaId = result.insertId;
    return res.status(201).json({
      id: turmaId,
      nome,
      serie,
      turno,
      ano_letivo,
      aulas_por_dia,
      etapa_ensino,
      qtd_alunos,
      professor_responsavel,
    });
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Retorna todas as turmas (sem detalhes de alunos/disciplinas).
 */
export const getTurmas = async (req: Request, res: Response) => {
  try {
    const [turmasRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         t.id AS turma_id, 
         t.nome AS turma_nome, 
         t.serie, 
         t.turno, 
         t.ano_letivo, 
         t.aulas_por_dia, 
         t.etapa_ensino, 
         t.qtd_alunos,
         u.nome AS professor_responsavel
       FROM turmas t
       LEFT JOIN users u ON t.professor_responsavel = u.id`
    );

    const turmas = turmasRows.map((row) => ({
      id: row.turma_id,
      nome: row.turma_nome,
      serie: row.serie,
      turno: row.turno,
      ano_letivo: row.ano_letivo,
      aulas_por_dia: row.aulas_por_dia,
      etapa_ensino: row.etapa_ensino,
      qtd_alunos: row.qtd_alunos,
      professor_responsavel: row.professor_responsavel,
    }));

    return res.status(200).json(turmas);
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Deleta uma turma pelo seu ID.
 * Graças à regra ON DELETE CASCADE configurada no banco de dados, ao deletar
 * uma turma, todos os registros associados em outras tabelas (como alunos_turmas,
 * notas, presenças, etc.) serão automaticamente removidos.
 */
export const deleteTurma = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query<OkPacket>(
      'DELETE FROM turmas WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }

    return res
      .status(200)
      .json({
        message: 'Turma e todos os seus dados foram deletados com sucesso.',
      });
  } catch (error) {
    // Log detalhado apenas no console do servidor (bom para manutenção)
    console.error('Erro ao deletar turma:', error);

    // Mensagem genérica para o frontend
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor ao tentar deletar a turma.' });
  }
};

/**
 * Adiciona vários alunos a uma turma (tabela alunos_turmas) e atualiza qtd_alunos.
 */
export const adicionarAlunosTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params;
  const { alunos } = req.body;

  try {
    const values = alunos.map((alunoId: number) => [alunoId, turmaId]);
    await pool.query(
      'INSERT INTO alunos_turmas (aluno_id, turma_id) VALUES ?',
      [values]
    );

    // Atualiza qtd_alunos
    await pool.query(
      `
      UPDATE turmas
      SET qtd_alunos = (
        SELECT COUNT(*) 
        FROM alunos_turmas 
        WHERE turma_id = ?
      )
      WHERE id = ?
      `,
      [turmaId, turmaId]
    );

    // Atualiza campo turma e série nos alunos
    const [turmaDadosRows] = await pool.query<RowDataPacket[]>(
      'SELECT nome, serie FROM turmas WHERE id = ?',
      [turmaId]
    );
    const nomeTurma = (turmaDadosRows[0] as any).nome;
    const serieTurma = (turmaDadosRows[0] as any).serie;
    for (const alunoId of alunos) {
      await pool.query('UPDATE alunos SET turma = ?, serie = ? WHERE id = ?', [
        nomeTurma,
        serieTurma,
        alunoId,
      ]);
    }

    return res
      .status(201)
      .json({ message: 'Alunos adicionados à turma com sucesso' });
  } catch (error) {
    console.error('Erro ao adicionar alunos à turma:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Retorna todos os alunos que ainda não estão em nenhuma turma.
 */
export const getAlunosDisponiveis = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.id, u.nome, u.foto_url, u.role 
       FROM users u
       LEFT JOIN alunos_turmas a_t ON u.id = a_t.aluno_id
       WHERE u.role = 'aluno' AND a_t.aluno_id IS NULL`
    );

    const alunos = rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      foto_url: row.foto_url,
      role: row.role,
    }));

    return res.status(200).json(alunos); // <-- sempre retorna 200, mesmo se vazio
  } catch (error) {
    console.error('Erro ao buscar alunos disponíveis:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao buscar alunos disponíveis' });
  }
};

/**
 * Retorna todos os alunos já associados a uma dada turma.
 */
export const getAlunosTurma = async (req: Request, res: Response) => {
  const { turmaId } = req.params;
  try {
    const [alunosRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.id, 
        u.nome,
        u.foto_url, 
        u.role,
        a.matricula       /* Agora pegamos de 'alunos' */
      FROM alunos_turmas a_t
      JOIN users u 
        ON a_t.aluno_id = u.id
      JOIN alunos a 
        ON u.id = a.id    /* ou 'ON u.id = a.aluno_id', dependendo do seu schema */
      WHERE a_t.turma_id = ?
      `,
      [turmaId]
    );

    const alunos = alunosRows.map((row) => ({
      id: row.id,
      nome: row.nome,
      foto_url: row.foto_url,
      role: row.role,
      matricula: row.matricula, // agora existe
    }));

    return res.status(200).json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos da turma:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Busca uma turma pelo ID, retornando dados básicos + lista de alunos.
 */
export const getTurmaById = async (req: Request, res: Response) => {
  const { turmaId } = req.params;
  try {
    // 1) Busca dados gerais da turma
    const [turmaRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        t.id, 
        t.nome, 
        t.serie, 
        t.turno, 
        t.ano_letivo, 
        t.aulas_por_dia, 
        t.etapa_ensino, 
        t.qtd_alunos,
        u.nome AS professor_responsavel
      FROM turmas t
      LEFT JOIN users u ON t.professor_responsavel = u.id
      WHERE t.id = ?
      `,
      [turmaId]
    );
    if (turmaRows.length === 0) {
      return res.status(404).json({ message: 'Turma não encontrada' });
    }

    const turma = turmaRows[0];

    // 2) Busca todos os alunos da turma, incluindo matricula via JOIN em "alunos"
    const [alunosRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        u.id, 
        u.nome,
        u.foto_url, 
        u.role,
        a.matricula
      FROM alunos_turmas a_t
      JOIN users u ON a_t.aluno_id = u.id
      JOIN alunos a ON u.id = a.id         /* ou 'a.aluno_id', conforme seu schema */
      WHERE a_t.turma_id = ?
      `,
      [turmaId]
    );

    const alunos = alunosRows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      foto_url: row.foto_url,
      role: row.role,
      matricula: row.matricula,
    }));

    return res.status(200).json({
      id: turma.id,
      nome: turma.nome,
      serie: turma.serie,
      turno: turma.turno,
      ano_letivo: turma.ano_letivo,
      aulas_por_dia: turma.aulas_por_dia,
      etapa_ensino: turma.etapa_ensino,
      qtd_alunos: turma.qtd_alunos,
      professor_responsavel: turma.professor_responsavel,
      alunos, // agora cada aluno tem também "matricula"
    });
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Remove (desvincula) um aluno de uma turma, atualiza qtd_alunos e limpa campos do aluno.
 */
export const removerAlunoDaTurma = async (req: Request, res: Response) => {
  const { turmaId, alunoId } = req.params;

  try {
    const [result] = await pool.query<OkPacket>(
      'DELETE FROM alunos_turmas WHERE turma_id = ? AND aluno_id = ?',
      [turmaId, alunoId]
    );

    if (result.affectedRows > 0) {
      // Atualiza qtd_alunos
      await pool.query(
        'UPDATE turmas SET qtd_alunos = qtd_alunos - 1 WHERE id = ?',
        [turmaId]
      );
      await pool.query(
        `
        UPDATE turmas
        SET qtd_alunos = (
          SELECT COUNT(*) 
          FROM alunos_turmas 
          WHERE turma_id = ?
        )
        WHERE id = ?
        `,
        [turmaId, turmaId]
      );

      // Limpar campos turma/serie do aluno
      await pool.query(
        'UPDATE alunos SET serie = NULL, turma = NULL WHERE id = ?',
        [alunoId]
      );

      return res
        .status(200)
        .json({ message: 'Aluno removido da turma com sucesso' });
    } else {
      return res
        .status(404)
        .json({ message: 'Aluno ou turma não encontrados' });
    }
  } catch (error) {
    console.error('Erro ao remover aluno da turma:', error);
    return res.status(500).json({ message: 'Erro ao remover aluno da turma' });
  }
};

/**
 * Edita os dados principais de uma turma (exceto alunos/disciplinas).
 */
export const editarTurma = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nome,
    serie,
    turno,
    ano_letivo,
    aulas_por_dia,
    etapa_ensino,
    professor_responsavel,
  } = req.body;

  try {
    const [result] = await pool.query<OkPacket>(
      `UPDATE turmas 
       SET 
         nome = ?, 
         serie = ?, 
         turno = ?, 
         ano_letivo = ?, 
         aulas_por_dia = ?, 
         etapa_ensino = ?, 
         professor_responsavel = ?
       WHERE id = ?`,
      [
        nome,
        serie,
        turno,
        ano_letivo,
        aulas_por_dia,
        etapa_ensino,
        professor_responsavel,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: 'Turma atualizada com sucesso!' });
    } else {
      return res.status(404).json({ message: 'Turma não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao editar turma:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

/**
 * Retorna todas as disciplinas (materias) de uma turma
 * + carrega, se existir, o professor vinculado para aquela matéria.
 */
export const getDisciplinasComProfessorPorTurma = async (
  req: Request,
  res: Response
) => {
  const { turmaId } = req.params;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        m.id            AS materia_id,
        m.nome          AS materia_nome,
        m.aulas_semanais,
        pt.professor_id,
        u.nome          AS professor_nome
      FROM turmas_materias tm
      JOIN materias m ON tm.materia_id = m.id
      LEFT JOIN professores_turmas pt
        ON pt.turma_id   = tm.turma_id
       AND pt.materia_id = m.id
      LEFT JOIN users u
        ON pt.professor_id = u.id
      WHERE tm.turma_id = ?
      `,
      [turmaId]
    );

    const disciplinas = rows.map((row) => ({
      materiaId: row.materia_id,
      nome: row.materia_nome,
      aulasSemana: row.aulas_semanais,
      professorId: row.professor_id as number | null,
      professorNome: row.professor_nome as string | null,
    }));

    return res.status(200).json(disciplinas);
  } catch (error: any) {
    console.error(
      'Erro ao buscar disciplinas com professor por turma:',
      error.sqlMessage ?? error.message ?? error
    );
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Retorna TODOS os professores (da tabela "funcionarios") cujo departamento seja
 * exatamente o nome da matéria indicada por materiaId.
 *
 * Fluxo:
 *  1) Buscar, em "materias", o nome (campo `nome`) da matéria cujo id = materiaId.
 *  2) Fazer SELECT em "funcionarios" onde departamento = esse nome.
 */
export const getProfessoresPorMateria = async (req: Request, res: Response) => {
  const { materiaId } = req.params;

  try {
    // 1) Pegar o nome da matéria
    const [matRows] = await pool.query<RowDataPacket[]>(
      'SELECT nome FROM materias WHERE id = ?',
      [materiaId]
    );
    if (matRows.length === 0) {
      return res.status(404).json({ message: 'Matéria não encontrada' });
    }
    const nomeMateria = (matRows[0] as any).nome;

    // 2) Buscar todos os funcionários cujo departamento = nomeMateria
    const [funcRows] = await pool.query<RowDataPacket[]>(
      `SELECT 
    f.id AS professor_id,
      f.nome 
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    LOWER(f.departamento) = LOWER(?) AND u.status = 'ativo';
    `,
    [nomeMateria.trim()]
    );

// Monta array de objetos { id, nome } para o frontend
const professores = funcRows.map((row) => ({
  id: row.professor_id,
  nome: row.nome,
}));

return res.status(200).json(professores);
  } catch (error: any) {
  console.error(
    'Erro ao buscar professores por matéria (filtrando por departamento):',
    error.sqlMessage ?? error.message ?? error
  );
  return res.status(500).json({ message: 'Erro interno do servidor' });
}
};

export const atribuirProfessorPorMateriaTurma = async (
  req: Request,
  res: Response
) => {
  const { turmaId } = req.params;
  const { materiaId, professorId } = req.body;

  try {
    // 1) Tenta primeiro fazer um UPDATE na linha já existente
    const [updateResult] = await pool.query<OkPacket>(
      `
      UPDATE professores_turmas
      SET professor_id = ?
      WHERE turma_id = ? AND materia_id = ?
      `,
      [professorId, turmaId, materiaId]
    );

    if (updateResult.affectedRows === 0) {
      // 2) Se não atualizou nada, significa que ainda não havia registro → Insere um novo
      await pool.query<OkPacket>(
        `
        INSERT INTO professores_turmas (turma_id, materia_id, professor_id)
        VALUES (?, ?, ?)
        `,
        [turmaId, materiaId, professorId]
      );
    }

    return res
      .status(200)
      .json({ message: 'Professor atribuído/atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atribuir/atualizar professor na turma:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// src/controllers/turmasController.ts
export const atribuirMateriasParaTurma = async (
  req: Request,
  res: Response
) => {
  const { turmaId } = req.params;
  const { materias } = req.body; // array de IDs de matéria

  if (!Array.isArray(materias)) {
    return res.status(400).json({ error: 'Formato inválido para matérias' });
  }
  try {
    const valores = materias.map((matId: number) => [turmaId, matId]);
    if (valores.length > 0) {
      await pool.query(
        'INSERT INTO turmas_materias (turma_id, materia_id) VALUES ?',
        [valores]
      );
    }
    return res.status(200).json({ message: 'Matérias vinculadas com sucesso' });
  } catch (error) {
    console.error('Erro ao vincular matérias à turma:', error);
    return res.status(500).json({ error: 'Erro interno ao vincular matérias' });
  }
};

export const removerMateriaDaTurma = async (req: Request, res: Response) => {
  const { turmaId, materiaId } = req.params;

  // Garantir que os IDs sejam números válidos
  const tId = parseInt(turmaId, 10);
  const mId = parseInt(materiaId, 10);
  if (isNaN(tId) || isNaN(mId)) {
    return res.status(400).json({ error: 'ID de turma ou matéria inválido' });
  }

  try {
    // Deleta a linha de turmas_materias
    const [result] = await pool.query(
      `DELETE FROM turmas_materias WHERE turma_id = ? AND materia_id = ?`,
      [tId, mId]
    );

    // Se nenhuma linha foi afetada, ou seja, essa matéria não estava vinculada
    if ((result as any).affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Relação turma-matéria não encontrada' });
    }

    return res
      .status(200)
      .json({ message: 'Matéria removida da turma com sucesso' });
  } catch (error) {
    console.error('Erro ao remover matéria da turma:', error);
    return res
      .status(500)
      .json({ error: 'Erro interno ao remover matéria da turma' });
  }
};
