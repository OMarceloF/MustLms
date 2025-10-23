// src/controllers/cursosController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

//==============================================================================
// CRUD para Cursos de Pós-Graduação (Tabela: cursos_posgraduacao)
//==============================================================================

/**
 * @description Cria um novo curso de pós-graduação no banco de dados.
 * @route POST /api/cursos/adicionar
 */
export const adicionarCurso = async (req: Request, res: Response) => {
  const {
    nome, tipo, area, cargaHoraria, duracao, modalidade, coordenador,
    viceCoordenador, unidade, objetivos, perfilEgresso, justificativa,
    anoInicio, status, linkDivulgacao,
  } = req.body;

  // Validação de campos obrigatórios
  if (!nome || !tipo || !area || !cargaHoraria || !duracao || !modalidade || !coordenador || !unidade || !objetivos || !perfilEgresso || !justificativa || !anoInicio || !status) {
    return res.status(400).json({ message: "Erro de validação: Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    const query = `
      INSERT INTO cursos_posgraduacao (
        nome, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
        coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
        justificativa, ano_inicio, status, link_divulgacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      nome, tipo, area, parseInt(cargaHoraria, 10), parseInt(duracao, 10),
      modalidade, parseInt(coordenador, 10), viceCoordenador ? parseInt(viceCoordenador, 10) : null,
      parseInt(unidade, 10), objetivos, perfilEgresso, justificativa, anoInicio,
      status, linkDivulgacao || null,
    ];

    const [result] = await pool.query<ResultSetHeader>(query, values);

    if (result.affectedRows > 0) {
      res.status(201).json({ message: "Curso cadastrado com sucesso!", cursoId: result.insertId });
    } else {
      throw new Error("A inserção no banco de dados falhou.");
    }
  } catch (error) {
    console.error("Erro ao salvar curso no banco de dados:", error);
    res.status(500).json({ message: "Erro interno do servidor ao tentar salvar o curso." });
  }
};

/**
 * @description Lista todos os cursos de pós-graduação cadastrados para a página principal.
 * @route GET /api/cursos-posgraduacao
 */
export const listarCursosPosGraduacao = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        c.id, c.nome, c.objetivos, c.duracao_semestres
      FROM cursos_posgraduacao AS c
      ORDER BY c.nome ASC;
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar cursos de pós-graduação:", error);
    res.status(500).json({ message: "Erro interno ao buscar os cursos." });
  }
};

/**
 * @description Exclui um curso de pós-graduação do banco de dados.
 * @route DELETE /api/cursos/:id
 */
export const excluirCurso = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID do curso não fornecido." });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM cursos_posgraduacao WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso não encontrado." });
    }

    res.status(200).json({ message: "Curso excluído com sucesso." });

  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    
    // CORREÇÃO: Verifica o tipo do erro antes de acessar suas propriedades
    if (error && typeof error === 'object' && 'code' in error) {
      const mysqlError = error as { code: string };
      if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: "Não é possível excluir este curso, pois ele possui dados vinculados (disciplinas, alunos, etc.)." });
      }
    }
    
    res.status(500).json({ message: "Erro interno do servidor ao tentar excluir o curso." });
  }
};


//==============================================================================
// Funções Relacionadas à Estrutura Antiga/Simplificada (Tabela: cursos)
//==============================================================================

/**
 * @description Lista todos os cursos da tabela `cursos`.
 * @route GET /api/cursos
 */
export const listarCursos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cursos ORDER BY nome ASC");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar cursos:", error);
    res.status(500).json({ message: "Erro interno ao buscar os cursos." });
  }
};

/**
 * @description Cria um novo curso na tabela `cursos`.
 * @route POST /api/cursos
 */
export const criarCurso = async (req: Request, res: Response) => {
  const { nome, coordenador, descricao } = req.body;
  if (!nome) {
    return res.status(400).json({ message: "O nome do curso é obrigatório." });
  }
  try {
    const query = "INSERT INTO cursos (nome, coordenador, descricao) VALUES (?, ?, ?)";
    const [result] = await pool.query<ResultSetHeader>(query, [nome, coordenador, descricao]);
    res.status(201).json({ id: result.insertId, nome, coordenador, descricao });
  } catch (error) {
    console.error("Erro ao criar curso:", error);
    res.status(500).json({ message: "Erro interno ao criar o curso." });
  }
};

/**
 * @description Obtém os detalhes de um curso específico da tabela `cursos_posgraduacao`.
 * @route GET /api/cursos/:id
 */
export const obterDetalhesCurso = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM cursos_posgraduacao WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Curso não encontrado." });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao obter detalhes do curso:", error);
    res.status(500).json({ message: "Erro interno ao buscar o curso." });
  }
};


//==============================================================================
// Funções para Sub-recursos de Cursos (Disciplinas, Calendário, PPC, etc.)
//==============================================================================

/**
 * @description Lista as disciplinas de um curso específico.
 * @route GET /api/cursos/:cursoId/disciplinas
 */
export const listarDisciplinasCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM cursos_disciplinas WHERE curso_id = ? ORDER BY semestre, nome", [cursoId]);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
    res.status(500).json({ message: "Erro interno ao buscar as disciplinas." });
  }
};

/**
 * @description Adiciona uma nova disciplina a um curso.
 * @route POST /api/cursos/:cursoId/disciplinas
 */
export const adicionarDisciplinaCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  const { nome, carga_horaria, creditos, semestre, professor, ementa } = req.body;

  if (!nome || !carga_horaria || !creditos || !semestre) {
      return res.status(400).json({ message: "Campos obrigatórios não foram preenchidos." });
  }

  try {
      const query = `INSERT INTO cursos_disciplinas (curso_id, nome, carga_horaria, creditos, semestre, professor, ementa) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const [result] = await pool.query<ResultSetHeader>(query, [cursoId, nome, carga_horaria, creditos, semestre, professor, ementa]);
      res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
      console.error("Erro ao adicionar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao adicionar a disciplina." });
  }
};

/**
 * @description Atualiza uma disciplina existente.
 * @route PUT /api/cursos/disciplinas/:disciplinaId
 */
export const atualizarDisciplinaCurso = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  const { nome, carga_horaria, creditos, semestre, professor, ementa } = req.body;

  if (!nome || !carga_horaria || !creditos || !semestre) {
      return res.status(400).json({ message: "Campos obrigatórios não foram preenchidos." });
  }

  try {
      const query = `UPDATE cursos_disciplinas SET nome = ?, carga_horaria = ?, creditos = ?, semestre = ?, professor = ?, ementa = ? WHERE id = ?`;
      const [result] = await pool.query<ResultSetHeader>(query, [nome, carga_horaria, creditos, semestre, professor, ementa, disciplinaId]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Disciplina não encontrada." });
      }
      res.status(200).json({ message: "Disciplina atualizada com sucesso." });
  } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao atualizar a disciplina." });
  }
};

/**
 * @description Deleta uma disciplina de um curso.
 * @route DELETE /api/cursos/disciplinas/:disciplinaId
 */
export const deletarDisciplinaCurso = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  try {
      const [result] = await pool.query<ResultSetHeader>("DELETE FROM cursos_disciplinas WHERE id = ?", [disciplinaId]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Disciplina não encontrada." });
      }
      res.status(200).json({ message: "Disciplina deletada com sucesso." });
  } catch (error) {
      console.error("Erro ao deletar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao deletar a disciplina." });
  }
};

/**
 * @description Lista os eventos do calendário de um curso.
 * @route GET /api/cursos/:cursoId/calendario
 */
export const listarEventosCalendario = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  try {
      const [rows] = await pool.query("SELECT * FROM cursos_eventos WHERE curso_id = ? ORDER BY data_inicio ASC", [cursoId]);
      res.json(rows);
  } catch (error) {
      console.error("Erro ao listar eventos do calendário:", error);
      res.status(500).json({ message: "Erro interno ao buscar os eventos." });
  }
};

/**
 * @description Adiciona um novo evento ao calendário de um curso.
 * @route POST /api/cursos/:cursoId/calendario
 */
export const adicionarEventoCalendario = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  const { titulo, descricao, data_inicio, data_fim, tipo } = req.body;

  if (!titulo || !data_inicio || !data_fim || !tipo) {
      return res.status(400).json({ message: "Campos obrigatórios não foram preenchidos." });
  }

  try {
      const query = "INSERT INTO cursos_eventos (curso_id, titulo, descricao, data_inicio, data_fim, tipo) VALUES (?, ?, ?, ?, ?, ?)";
      const [result] = await pool.query<ResultSetHeader>(query, [cursoId, titulo, descricao, data_inicio, data_fim, tipo]);
      res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
      console.error("Erro ao adicionar evento:", error);
      res.status(500).json({ message: "Erro interno ao adicionar o evento." });
  }
};

/**
 * @description Obtém o conteúdo do PPC de um curso.
 * @route GET /api/cursos/:cursoId/ppc
 */
export const obterPPC = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT conteudo FROM cursos_ppc WHERE curso_id = ?", [cursoId]);
      res.json(rows.length > 0 ? rows[0] : { conteudo: "" });
  } catch (error) {
      console.error("Erro ao obter PPC:", error);
      res.status(500).json({ message: "Erro interno ao buscar o PPC." });
  }
};

/**
 * @description Salva ou atualiza o conteúdo do PPC de um curso.
 * @route POST /api/cursos/:cursoId/ppc
 */
export const salvarPPC = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  const { conteudo } = req.body;
  try {
      const query = `INSERT INTO cursos_ppc (curso_id, conteudo) VALUES (?, ?) ON DUPLICATE KEY UPDATE conteudo = VALUES(conteudo)`;
      await pool.query(query, [cursoId, conteudo]);
      res.status(200).json({ message: "PPC salvo com sucesso." });
  } catch (error) {
      console.error("Erro ao salvar PPC:", error);
      res.status(500).json({ message: "Erro interno ao salvar o PPC." });
  }
};

/**
 * @description Obtém os usuários (alunos e professores) vinculados a um curso.
 * @route GET /api/cursos/:cursoId/vinculados
 */
export const obterVinculadosCurso = async (req: Request, res: Response) => {
  try {
      // Mock de dados, substitua pela sua lógica real de consulta
      const mockAlunos = [{ id: 101, nome: "Ana Beatriz", tipo: "aluno" }];
      const mockProfessores = [{ id: 201, nome: "Dr. Ricardo Neves", tipo: "professor" }];
      res.json({ alunos: mockAlunos, professores: mockProfessores });
  } catch (error) {
      console.error("Erro ao obter vinculados do curso:", error);
      res.status(500).json({ message: "Erro interno ao buscar os vinculados." });
  }
};