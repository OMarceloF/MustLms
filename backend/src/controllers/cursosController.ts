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
 * @description Atualiza um curso de pós-graduação existente.
 * @route PUT /api/cursos/:id
 */
export const atualizarCurso = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        nome, tipo, area, cargaHoraria, duracao, modalidade, coordenador,
        viceCoordenador, unidade, objetivos, perfilEgresso, justificativa,
        anoInicio, status, linkDivulgacao,
    } = req.body;

    if (!id) {
        return res.status(400).json({ message: "ID do curso não fornecido." });
    }

    if (!nome || !tipo || !area || !cargaHoraria || !duracao || !modalidade || !coordenador || !unidade || !objetivos || !perfilEgresso || !justificativa || !anoInicio || !status) {
        return res.status(400).json({ message: "Erro de validação: Todos os campos obrigatórios devem ser preenchidos." });
    }

    try {
        const query = `
            UPDATE cursos_posgraduacao SET
                nome = ?, tipo = ?, area_conhecimento = ?, carga_horaria = ?, duracao_semestres = ?,
                modalidade = ?, coordenador_id = ?, vice_coordenador_id = ?, unidade_id = ?,
                objetivos = ?, perfil_egresso = ?, justificativa = ?, ano_inicio = ?,
                status = ?, link_divulgacao = ?
            WHERE id = ?;
        `;
        const values = [
            nome, tipo, area, parseInt(cargaHoraria, 10), parseInt(duracao, 10),
            modalidade, parseInt(coordenador, 10), viceCoordenador ? parseInt(viceCoordenador, 10) : null,
            parseInt(unidade, 10), objetivos, perfilEgresso, justificativa, anoInicio,
            status, linkDivulgacao || null, id
        ];

        const [result] = await pool.query<ResultSetHeader>(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Curso não encontrado para atualização." });
        }

        res.status(200).json({ message: "Curso atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar curso no banco de dados:", error);
        res.status(500).json({ message: "Erro interno do servidor ao tentar atualizar o curso." });
    }
};

/**
 * @description Lista todos os cursos de pós-graduação cadastrados.
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
 * @description Exclui um curso de pós-graduação.
 * @route DELETE /api/cursos/:id
 */
export const excluirCurso = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID do curso não fornecido." });
  }

  try {
    await pool.query('DELETE FROM cursos_disciplinas WHERE curso_id = ?', [id]);
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM cursos_posgraduacao WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso não encontrado." });
    }

    res.status(200).json({ message: "Curso e suas disciplinas foram excluídos com sucesso." });

  } catch (error) {
    console.error("Erro ao excluir curso:", error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const mysqlError = error as { code: string };
      if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ message: "Não é possível excluir este curso, pois ele possui outros dados vinculados." });
      }
    }
    
    res.status(500).json({ message: "Erro interno do servidor ao tentar excluir o curso." });
  }
};

/**
 * @description Obtém os detalhes de um curso específico.
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
// Funções para Outras Abas (Calendário, PPC, etc.)
//==============================================================================

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
