import { Request, Response } from "express";
import pool from "../config/db";

/* ============================================================
   CRIAR ATIVIDADE
============================================================ */
export const criarAtividade = async (req: Request, res: Response) => {
  const conn = await pool.getConnection();

  try {
    const { curso_id, materia_id, turma_id, nome, descricao, tipo, config } = req.body;

    // MODIFICAÇÃO: Garantir que IDs sejam números ou null (evita string vazia ou undefined quebrando a query)
    const turmaIdFinal = turma_id ? Number(turma_id) : null;
    const materiaIdFinal = materia_id ? Number(materia_id) : null;

    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO atividades (curso_id, materia_id, turma_id, nome, descricao, tipo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [curso_id, materiaIdFinal, turmaIdFinal, nome, descricao, tipo]
    );

    const atividadeId = (result as any).insertId;

    /* --------------------------------------------------------
       ARQUIVO
    -------------------------------------------------------- */
    if (tipo === "arquivo") {
      await conn.query(
        `INSERT INTO atividade_arquivo (atividade_id, arquivo, display_mode, mostrar_descricao)
         VALUES (?, ?, ?, ?)`,
        [atividadeId, config.url, config.display_mode, config.mostrar_descricao]
      );
    }

    /* --------------------------------------------------------
       URL
    -------------------------------------------------------- */
    if (tipo === "url") {
      await conn.query(
        `INSERT INTO atividade_url (atividade_id, url, display_mode, mostrar_descricao, parametros)
         VALUES (?, ?, ?, ?, ?)`,
        [
          atividadeId,
          config.url,
          config.display_mode,
          config.mostrar_descricao,
          JSON.stringify(config.parametros)
        ]
      );
    }

    /* --------------------------------------------------------
       PESQUISA
    -------------------------------------------------------- */
    if (tipo === "pesquisa") {
      await conn.query(
        `INSERT INTO atividade_pesquisa
         (atividade_id, permitir_de, permitir_ate, gravar_nome, multiplas_submissoes, mostrar_pagina_analise, mensagem_conclusao, proxima_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          atividadeId,
          config.permitir_de,
          config.permitir_ate,
          config.gravar_nome,
          config.multiplas_submissoes,
          config.mostrar_pagina_analise,
          config.mensagem_conclusao,
          config.proxima_url
        ]
      );
    }

    /* --------------------------------------------------------
       QUESTIONÁRIO
    -------------------------------------------------------- */
    if (tipo === "questionario") {
      await conn.query(
        `INSERT INTO atividade_questionario
         (atividade_id, nota_aprovacao, tentativas, metodo_avaliacao, layout_paginacao, metodo_navegacao, opcoes_revisao, feedback_final)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          atividadeId,
          config.nota_aprovacao,
          config.tentativas,
          config.metodo_avaliacao,
          config.layout_paginacao,
          config.metodo_navegacao,
          JSON.stringify(config.opcoes_revisao || {}),
          JSON.stringify(config.feedback_final || {})
        ]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      atividade_id: atividadeId,
    });

  } catch (error: any) {
    await conn.rollback();
    console.error("Erro ao criar atividade:", error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: {
          code: 'ER_NO_REFERENCED_ROW_2',
          message: 'Matéria ou Turma não encontrada. Verifique os IDs informados.'
        }
      });
    }
    return res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

/* ============================================================
   LISTAR POR CURSO
============================================================ */
export const listarAtividadesPorCurso = async (req: Request, res: Response) => {
  try {
    const cursoId = Number(req.params.cursoId);

    const [rows] = await pool.query(
      `SELECT * FROM atividades WHERE curso_id = ? ORDER BY id DESC`,
      [cursoId]
    );

    return res.json(rows);

  } catch (error: any) {
    console.error("Erro ao listar atividades:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   LISTAR POR MATERIA
============================================================ */
export const listarAtividadesPorMateria = async (req: Request, res: Response) => {
  try {
    const materiaId = Number(req.params.materiaId);

    const [rows] = await pool.query(
      `SELECT * FROM atividades WHERE materia_id = ? ORDER BY id DESC`,
      [materiaId]
    );

    return res.json(rows);

  } catch (error: any) {
    console.error("Erro ao listar atividades por matéria:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   OBTER ATIVIDADE COMPLETA
============================================================ */
export const obterAtividade = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const [rows] = await pool.query(
      `SELECT * FROM atividades WHERE id = ?`,
      [id]
    );

    const atividade = (rows as any[])[0];

    if (!atividade) {
      return res.status(404).json({ error: "Atividade não encontrada" });
    }

    let config = null;
    let estrutura = null;

    switch (atividade.tipo) {
      case "arquivo": {
        const [cfg] = await pool.query(
          `SELECT * FROM atividade_arquivo WHERE atividade_id = ?`,
          [id]
        );
        config = (cfg as any[])[0];
        break;
      }

      case "url": {
        const [cfg] = await pool.query(
          `SELECT * FROM atividade_url WHERE atividade_id = ?`,
          [id]
        );
        config = (cfg as any[])[0];

        if (config?.parametros) {
          try { config.parametros = JSON.parse(config.parametros); } catch { }
        }
        break;
      }

      case "pesquisa": {
        const [cfg] = await pool.query(
          `SELECT * FROM atividade_pesquisa WHERE atividade_id = ?`,
          [id]
        );
        config = (cfg as any[])[0];

        const [perguntas] = await pool.query(
          `SELECT * FROM survey_perguntas WHERE atividade_id = ? ORDER BY ordem ASC`,
          [id]
        );

        for (const p of perguntas as any[]) {
          const [opcoes] = await pool.query(
            `SELECT * FROM survey_opcoes WHERE pergunta_id = ?`,
            [p.id]
          );
          p.opcoes = opcoes;
        }

        estrutura = { perguntas };
        break;
      }

      case "questionario": {
        const [cfg] = await pool.query(
          `SELECT * FROM atividade_questionario WHERE atividade_id = ?`,
          [id]
        );
        config = (cfg as any[])[0];

        if (config?.opcoes_revisao) {
          try { config.opcoes_revisao = JSON.parse(config.opcoes_revisao); } catch { }
        }
        if (config?.feedback_final) {
          try { config.feedback_final = JSON.parse(config.feedback_final); } catch { }
        }

        const [perguntas] = await pool.query(
          `SELECT * FROM quiz_perguntas WHERE atividade_id = ? ORDER BY ordem ASC`,
          [id]
        );

        for (const p of perguntas as any[]) {
          const [opcoes] = await pool.query(
            `SELECT * FROM quiz_opcoes WHERE pergunta_id = ?`,
            [p.id]
          );
          p.opcoes = opcoes;
        }

        estrutura = { perguntas };
        break;
      }

      case "tarefa": {
        const [entregas] = await pool.query(
          `SELECT * FROM tarefa_entregas WHERE atividade_id = ?`,
          [id]
        );
        estrutura = { entregas };
        config = {};
        break;
      }
    }

    return res.json({
      atividade,
      config,
      estrutura
    });

  } catch (error: any) {
    console.error("Erro ao obter atividade:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   ATUALIZAR ATIVIDADE
============================================================ */
export const atualizarAtividade = async (req: Request, res: Response) => {
  const conn = await pool.getConnection();

  try {
    const id = Number(req.params.id);
    const { materia_id, turma_id, nome, descricao, tipo, config } = req.body;

    // MODIFICAÇÃO: Sanitização também na atualização
    const turmaIdFinal = turma_id ? Number(turma_id) : null;
    const materiaIdFinal = materia_id ? Number(materia_id) : null;

    await conn.beginTransaction();

    await conn.query(
      `UPDATE atividades SET materia_id=?, turma_id=?, nome=?, descricao=? WHERE id=?`,
      [materiaIdFinal, turmaIdFinal, nome, descricao, id]
    );

    if (tipo === "arquivo") {
      await conn.query(
        `UPDATE atividade_arquivo SET arquivo=?, display_mode=?, mostrar_descricao=? WHERE atividade_id=?`,
        [config.url, config.display_mode, config.mostrar_descricao, id]
      );
    }

    if (tipo === "url") {
      await conn.query(
        `UPDATE atividade_url SET url=?, display_mode=?, mostrar_descricao=?, parametros=? WHERE atividade_id=?`,
        [
          config.url,
          config.display_mode,
          config.mostrar_descricao,
          JSON.stringify(config.parametros),
          id
        ]
      );
    }

    if (tipo === "pesquisa") {
      await conn.query(
        `UPDATE atividade_pesquisa SET permitir_de=?, permitir_ate=?, gravar_nome=?, multiplas_submissoes=?, mostrar_pagina_analise=?, mensagem_conclusao=?, proxima_url=? WHERE atividade_id=?`,
        [
          config.permitir_de,
          config.permitir_ate,
          config.gravar_nome,
          config.multiplas_submissoes,
          config.mostrar_pagina_analise,
          config.mensagem_conclusao,
          config.proxima_url,
          id
        ]
      );
    }

    if (tipo === "questionario") {
      await conn.query(
        `UPDATE atividade_questionario SET 
           nota_aprovacao=?, tentativas=?, metodo_avaliacao=?, layout_paginacao=?, metodo_navegacao=?, opcoes_revisao=?, feedback_final=?
         WHERE atividade_id=?`,
        [
          config.nota_aprovacao,
          config.tentativas,
          config.metodo_avaliacao,
          config.layout_paginacao,
          config.metodo_navegacao,
          JSON.stringify(config.opcoes_revisao || {}),
          JSON.stringify(config.feedback_final || {}),
          id
        ]
      );
    }

    await conn.commit();

    return res.json({ success: true });

  } catch (error: any) {
    await conn.rollback();
    console.error("Erro ao atualizar atividade:", error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        error: {
          code: 'ER_NO_REFERENCED_ROW_2',
          message: 'Matéria ou Turma não encontrada. Verifique os IDs informados.'
        }
      });
    }
    return res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

/* ============================================================
   DELETAR ATIVIDADE
============================================================ */
export const deletarAtividade = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await pool.query(`DELETE FROM atividades WHERE id = ?`, [id]);

    return res.json({ success: true });

  } catch (error: any) {
    console.error("Erro ao excluir atividade:", error);
    return res.status(500).json({ error: error.message });
  }
};