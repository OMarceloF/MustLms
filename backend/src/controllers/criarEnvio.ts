import { Request, Response } from 'express';
import pool from '../config/db';
import { notificarEnvioParaTurma } from './notificacoesEventosController';


// GET /api/envios/professor/:id
export const listarEnviosPorProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        e.id, 
        e.tipo, 
        e.titulo, 
        e.descricao, 
        e.arquivo_url, 
        e.usuario_id,
        e.turma_id,  
        e.materia_id,        
        t.nome AS nome_turma,
        m.nome AS nome_materia,
        e.data_criacao
      FROM envios e
      LEFT JOIN turmas t ON e.turma_id = t.id
      LEFT JOIN materias m ON e.materia_id = m.id
      WHERE e.usuario_id = ?
      ORDER BY e.data_criacao DESC
      `,
      [id]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    res.status(500).json({ error: 'Erro ao buscar os envios.' });
  }
};

// DELETE /api/envios/:id
export const excluirEnvio = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM envios WHERE id = ?`, [id]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir envio:', error);
    res.status(500).json({ error: 'Erro ao excluir envio.' });
  }
};

// PUT /api/envios/:id
export const editarEnvio = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, descricao, tipo, materia_id, turma_id } = req.body;
  const arquivo = req.file?.filename || null;

  try {
    // Atualiza com ou sem novo arquivo
    if (arquivo) {
      await pool.query(
        `UPDATE envios SET titulo = ?, descricao = ?, tipo = ?, materia_id = ?, turma_id = ?, arquivo_url = ? WHERE id = ?`,
        [titulo, descricao, tipo, materia_id, turma_id, arquivo, id]
      );
    } else {
      await pool.query(
        `UPDATE envios SET titulo = ?, descricao = ?, tipo = ?, materia_id = ?, turma_id = ? WHERE id = ?`,
        [titulo, descricao, tipo, materia_id, turma_id, id]
      );
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao editar envio:', error);
    res.status(500).json({ error: 'Erro ao editar envio.' });
  }
};

// export const criarEnvio = async (req: Request, res: Response) => {
//   try {
//     const { tipo, titulo, descricao, usuario_id, materia_id, turma_id } = req.body;
//     const arquivo = req.file?.filename || null; // multer lida com isso

//     if (!tipo || !titulo || !usuario_id || !materia_id || !turma_id) {
//       return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
//     }

//     const [result] = await pool.query(
//       `INSERT INTO envios (tipo, titulo, descricao, arquivo_url, usuario_id, materia_id, turma_id, data_criacao)
//        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
//       [tipo, titulo, descricao || '', arquivo, usuario_id, materia_id, turma_id]
//     );

//     return res.status(201).json({ success: true, envio_id: (result as any).insertId });
//   } catch (error) {
//     console.error('Erro ao criar envio:', error);
//     return res.status(500).json({ error: 'Erro ao criar envio no banco de dados.' });
//   }
// };

export const criarEnvio = async (req: Request, res: Response) => {
  try {
    const {
      tipo,
      titulo,
      descricao,
      usuario_id,
      materia_id,
      turma_id,
      tentativasPermitidas,
      tempoLimite,
      mostrarResultadoImediato,
      embaralharQuestoes,
      questoes,
      nota_max
    } = req.body;

    const arquivo = req.file?.filename || null;

    // Converte os tipos recebidos via multipart/form-data
    const tentativas = parseInt(tentativasPermitidas) || 1;
    const tempo = parseInt(tempoLimite) || 0;
    const mostrarResultado = mostrarResultadoImediato === '1' || mostrarResultadoImediato === 'true';
    const embaralhar = embaralharQuestoes === '1' || embaralharQuestoes === 'true';

    console.log('mostrarResultadoImediato:', mostrarResultadoImediato);
    console.log('embaralharQuestoes:', embaralharQuestoes);
    console.log('nota_max:', nota_max);


    let questoesParsed: any[] = [];
    try {
      questoesParsed = JSON.parse(questoes || '[]');
    } catch (e) {
      console.error('Erro ao converter questões:', e);
    }

    if (!tipo || !titulo || !usuario_id || !materia_id || !turma_id) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }
    // Inserir na tabela 'envios'
    const [result] = await pool.query(
      `INSERT INTO envios (tipo, titulo, descricao, arquivo_url, usuario_id, materia_id, turma_id, data_criacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [tipo, titulo, descricao || '', arquivo, usuario_id, materia_id, turma_id]
    );
    const envioId = (result as any).insertId;

    await notificarEnvioParaTurma(turma_id);


    
    // Verificar se o tipo é 'Exercício Online' e inserir na tabela 'exercicios'
    // if (tipo === 'Exercício Online') {
    //   // const notaMax = calcularNotaMax(questoesParsed);
    //   const notaMax = parseFloat(nota_max) || 0;
    //   await pool.query(
    //     `INSERT INTO exercicios 
    //     (envios_id, professor_id, materia_id, turma_id, titulo, descricao, tentativas_permitidas, tempo_limite, mostrar_resultado, embaralhar_questoes, nota_max)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    //     [envioId, usuario_id, materia_id, turma_id, titulo, descricao, tentativas, tempo, mostrarResultado, embaralhar, notaMax]
    //   );
    // }

    if (tipo === 'Exercício Online') {
      const notaMax = parseFloat(nota_max) || 0;
      await pool.query(
        `INSERT INTO exercicios 
        (envios_id, professor_id, materia_id, turma_id, titulo, descricao, tentativas_permitidas, tempo_limite, mostrar_resultado, embaralhar_questoes, nota_max)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [envioId, usuario_id, materia_id, turma_id, titulo, descricao, tentativas, tempo, mostrarResultado, embaralhar, notaMax]
      );

      // 🔽 Adicione este trecho aqui
      const [exercicioRow] = await pool.query(
        'SELECT id FROM exercicios WHERE envios_id = ?',
        [envioId]
      );
      const exercicioId = (exercicioRow as any)[0]?.id;

      for (const questao of questoesParsed) {
        const {
          tipo,
          enunciado,
          valor,
          explicacao = '',
          alternativas = [],
          respostaCorreta
        } = questao;

        let alt_1 = '', alt_2 = '', alt_3 = '', alt_4 = '';
        let alt_certa = null;
        let resp_modelo = null;
        let resp_numerica = null;

        if (tipo === 'multipla_escolha' || tipo === 'verdadeiro_falso') {
          alt_1 = alternativas[0]?.texto || '';
          alt_2 = alternativas[1]?.texto || '';
          alt_3 = alternativas[2]?.texto || '';
          alt_4 = alternativas[3]?.texto || '';

          const corretaIndex = alternativas.findIndex((alt: { texto: string; correta: boolean }) => alt.correta);
          if (corretaIndex !== -1) alt_certa = corretaIndex + 1;
        }

        if (tipo === 'aberta') {
          resp_modelo = respostaCorreta || null;
        }

        if (tipo === 'numerica') {
          resp_numerica = parseFloat(respostaCorreta) || null;
        }

        await pool.query(
          `INSERT INTO exercicios_questoes 
          (exercicio_id, envios_id, enunciado, tipo, valor_questao, explicacao, alt_1, alt_2, alt_3, alt_4, alt_certa, resp_modelo, resp_numerica)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            exercicioId,
            envioId,
            enunciado,
            tipo,
            valor,
            explicacao,
            alt_1,
            alt_2,
            alt_3,
            alt_4,
            alt_certa,
            resp_modelo,
            resp_numerica
          ]
        );
      }
    }

    return res.status(201).json({ success: true, envio_id: (result as any).insertId });
    // return res.status(201).json({ success: true, envio_id: envioId });

  } catch (error) {
    console.error('Erro ao criar envio:', error);
    return res.status(500).json({ error: 'Erro ao criar envio no banco de dados.' });
  }
};

// GET /api/questoes-abertas/professor/:id
export const listarQuestoesAbertas = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        ea.id AS resposta_id,
        eq.id AS questao_id,
        eq.enunciado,
        eq.explicacao,
        eq.valor_questao,
        ea.resp_texto,
        ea.nota_obtida,
        ea.status_correcao,
        a.nome AS nome_aluno,
        t.nome AS nome_turma,
        m.nome AS nome_materia
      FROM exercicios_alunos ea
      INNER JOIN exercicios_questoes eq ON ea.exercicios_questoes_id = eq.id
      INNER JOIN alunos a ON ea.aluno_id = a.id
      INNER JOIN exercicios e ON eq.exercicio_id = e.id
      LEFT JOIN turmas t ON e.turma_id = t.id
      LEFT JOIN materias m ON e.materia_id = m.id
      WHERE eq.tipo = 'aberta' AND e.professor_id = ? AND ea.status_correcao != 'corrigido_manual'
      ORDER BY ea.id DESC
    `, [id]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar questões abertas:', error);
    res.status(500).json({ error: 'Erro ao buscar questões abertas.' });
  }
};

// PUT /api/questoes-abertas/:respostaId
export const corrigirQuestaoAberta = async (req: Request, res: Response) => {
  const { respostaId } = req.params;
  const { nota_obtida } = req.body;

  try {
    await pool.query(`
      UPDATE exercicios_alunos
      SET nota_obtida = ?, status_correcao = 'corrigido_manual'
      WHERE id = ?
    `, [nota_obtida, respostaId]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao corrigir questão:', error);
    res.status(500).json({ error: 'Erro ao corrigir questão.' });
  }
};

