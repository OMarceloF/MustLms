import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const obterDetalhesMateria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const materiaId = parseInt(id, 10);

  if (isNaN(materiaId)) {
    return res.status(400).json({ error: 'ID da matéria inválido' });
  }

  try {
    // 1) Obter os dados básicos da matéria
    const [materiaRows] = await pool.query<RowDataPacket[]>(`
      SELECT id, nome, breve_descricao, sobre_a_materia, aulas_semanais, qtd_turmas_vinculadas
      FROM materias
      WHERE id = ?
    `, [materiaId]);

    if (!materiaRows.length) {
      return res.status(404).json({ error: 'Matéria não encontrada' });
    }
    const materia = materiaRows[0];

    // 2) Buscar todos os funcionários cujo departamento = materia.nome
    const [profRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
    f.id, 
    f.nome, 
    f.email, 
    f.foto, 
    f.registro
FROM 
    funcionarios AS f
JOIN 
    materias AS m ON f.departamento = m.nome
JOIN 
    users AS u ON f.id = u.id  -- << ADICIONE ESTA LINHA
WHERE 
    m.id = ? AND u.status = 'ativo';

    `, [materiaId]);

    const professores = profRows.map(p => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      foto: p.foto || '',
      registro: p.registro,
    }));

    // 3) Manter busca de materiais da matéria (não muda)
    const [matRows] = await pool.query<RowDataPacket[]>(`
      SELECT m.id, m.nome, m.autor, m.capa_url, m.conteudo_url
      FROM materias_materiais mm
      JOIN materiais m ON m.id = mm.material_id
      WHERE mm.materia_id = ?
    `, [materiaId]);

    const materiais = matRows.map(m => ({
      id: m.id,
      nome: m.nome,
      autor: m.autor,
      capa_url: m.capa_url,
      conteudo_url: m.conteudo_url
    }));

    // 4) Buscar turmas vinculadas (não muda)
    const [turmaRows] = await pool.query<RowDataPacket[]>(`
      SELECT t.id, t.nome FROM turmas_materias tm
      JOIN turmas t ON t.id = tm.turma_id
      WHERE tm.materia_id = ?
    `, [materiaId]);

    const turmas = turmaRows.map(t => ({ id: t.id, nome: t.nome }));

    // 5) Contagem de alunos da matéria (não muda)
    const [alunoRows] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT at.aluno_id) as total_alunos
      FROM turmas_materias tm
      JOIN alunos_turmas at ON at.turma_id = tm.turma_id
      WHERE tm.materia_id = ?
    `, [materiaId]);

    res.json({
      id: materia.id,
      nome: materia.nome,
      breve_descricao: materia.breve_descricao,
      sobre_a_materia: materia.sobre_a_materia,
      aulas_semanais: materia.aulas_semanais,
      professores,             // agora vem da tabela funcionarios pelo departamento
      materiais,
      turmas,
      totalAlunos: alunoRows[0]?.total_alunos || 0,
    });
  } catch (error) {
    console.error('Erro ao obter detalhes da matéria:', error);
    res.status(500).json({ error: 'Erro interno ao obter detalhes da matéria' });
  }
};

export const getMateriaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query(
      `SELECT nome, breve_descricao, aulas_semanais, qtd_turmas_vinculadas, sobre_a_materia FROM materias WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Matéria não encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar matéria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }

};

export const getTurmasDaMateria = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query(`
      SELECT t.id, t.nome, t.qtd_alunos
      FROM turmas_materias tm
      JOIN turmas t ON tm.turma_id = t.id
      WHERE tm.materia_id = ?
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar turmas da matéria:", error);
    res.status(500).json({ message: 'Erro interno' });
  }
};

export const getProfessorPorTurma = async (req: Request, res: Response) => {
  const turmaId = parseInt(req.params.turmaId, 10);
  if (isNaN(turmaId)) {
    return res.status(400).json({ error: 'ID de turma inválido' });
  }

  try {
    // Tabela “professores_turmas” relaciona turma_id → professor_id
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
    f.id, 
    f.nome
FROM 
    professores_turmas AS pt
JOIN 
    funcionarios AS f ON f.id = pt.professor_id
JOIN 
    users AS u ON f.id = u.id  -- << ADICIONE ESTA LINHA
WHERE 
    pt.turma_id = ? AND u.status = 'ativo'
LIMIT 1;

    `, [turmaId]);

    if (!rows.length) {
      // Nenhum professor vinculado àquela turma
      return res.json({ nome: null });
    }

    return res.json({ nome: rows[0].nome });
  } catch (error) {
    console.error('Erro ao obter professor por turma:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar professor' });
  }
};

export const listarMaterias = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nome FROM materias ORDER BY nome'
    );
    // rows será um array de objetos { id: number, nome: string }
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar matérias:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar matérias' });
  }
};

export interface ProfessorTurmaRegistro extends RowDataPacket {
  professor_id: number;
  turma_id: number;
  materia_id: number;
  // aqui não precisa mapear os campos exatos de todas as colunas, apenas os que vamos usar
}

export const getProfessorResponsavel = async (req: Request, res: Response) => {
  const { materiaId, turmaId } = req.params;
  const matId = parseInt(materiaId, 10);
  const turId = parseInt(turmaId, 10);

  if (isNaN(matId) || isNaN(turId)) {
    return res.status(400).json({ error: 'materiaId ou turmaId inválido.' });
  }

  try {
    // 1) buscar primeiro registro em professores_turmas onde materia_id = ? e turma_id = ?
    const [rows] = await pool.query<ProfessorTurmaRegistro[]>(`
      SELECT pt.professor_id
      FROM professores_turmas pt
      WHERE pt.materia_id = ? AND pt.turma_id = ?
      LIMIT 1
    `, [matId, turId]);

    if (rows.length === 0) {
      // não há professor vinculado para essa matéria+turma
      return res.json({ professor: null });
    }

    const profId = rows[0].professor_id;

    // 2) buscar dados completos do professor na tabela funcionarios
    const [profRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
    f.id, 
    f.nome, 
    f.email, 
    f.foto, 
    f.registro
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    f.id = ? AND u.status = 'ativo'
LIMIT 1;

    `, [profId]);

    if (profRows.length === 0) {
      // não encontrou o professor mesmo assim (inconsistência)
      return res.json({ professor: null });
    }

    // Mapear para um objeto com as quatro propriedades
    const prof = profRows[0] as {
      id: number;
      nome: string;
      email: string;
      foto: string | null;
      registro: string;
    };

    return res.json({
      professor: {
        id: prof.id,
        nome: prof.nome,
        email: prof.email,
        foto: prof.foto || '',
        registro: prof.registro,
      }
    });
  } catch (error) {
    console.error('Erro ao buscar professor responsável:', error);
    return res.status(500).json({ error: 'Erro interno ao obter professor responsável' });
  }
};