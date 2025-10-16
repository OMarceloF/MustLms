// import { Request, Response } from 'express';
// import pool from '../config/db';
// import path from 'path';
// import { RowDataPacket } from 'mysql2';

// // GET /api/alunos/:id/envios
// export const getEnviosPorAluno = async (req: Request, res: Response) => {
//   const alunoId = req.params.id;

//   try {
//     // 1. Buscar turma e disciplinas do aluno
//     const [dados] = await pool.query(
//       `SELECT at.turma_id, m.id AS materia_id, m.nome AS materia_nome
//        FROM alunos_turmas at
//        JOIN materias m ON m.id IN (
//          SELECT materia_id FROM professores_turmas WHERE turma_id = at.turma_id
//        )
//        WHERE at.aluno_id = ?`,
//       [alunoId]
//     );

//     if (!Array.isArray(dados) || dados.length === 0) {
//       return res.status(404).json({ message: 'Nenhuma disciplina encontrada.' });
//     }

//     // 2. Para cada disciplina, buscar os envios
//     const materiasComEnvios = await Promise.all(
//       dados.map(async (disciplina: any) => {
//         const [envios] = await pool.query(
//           `SELECT id, tipo, titulo, descricao, arquivo_url AS arquivo, data_criacao AS dataEnvio
//            FROM envios
//            WHERE materia_id = ? AND turma_id = ?`,
//           [disciplina.materia_id, disciplina.turma_id]
//         );

//         return {
//           nome: disciplina.materia_nome,
//           envios: envios,
//         };
//       })
//     );

//     res.json(materiasComEnvios);
//   } catch (error) {
//     console.error('Erro ao buscar envios:', error);
//     res.status(500).json({ message: 'Erro interno ao buscar envios.' });
//   }
// };

// // POST /api/envios/:envioId/aluno/:alunoId/enviar
// export const enviarExercicioTradicionalAluno = async (req: Request, res: Response) => {
//   const { envioId, alunoId } = req.params;
//   const arquivo = req.file;

//   try {
//     if (!arquivo) {
//       return res.status(400).json({ message: 'Arquivo não enviado.' });
//     }

//     const [rows] = await pool.query(
//       `SELECT turma_id FROM alunos_turmas WHERE aluno_id = ? LIMIT 1`,
//       [alunoId]
//     );

//     const dados = rows as RowDataPacket[];

//     if (!Array.isArray(dados) || dados.length === 0) {
//       return res.status(404).json({ message: 'Turma do aluno não encontrada.' });
//     }

//     const turmaId = dados[0].turma_id;

//     // 🔢 Buscar número de tentativas já realizadas para esse envio
//     const [tentativasRows] = await pool.query(
//       `SELECT COUNT(*) as total FROM exercicios_alunos WHERE aluno_id = ? AND envios_id = ?`,
//       [alunoId, envioId]
//     );

//     const tentativaAtual = (tentativasRows as RowDataPacket[])[0].total + 1;

//     await pool.query(
//       `INSERT INTO exercicios_alunos (envios_id, aluno_id, turma_id, data_envio, status_correcao, arquivo_url, tentativa)
//        VALUES (?, ?, ?, NOW(), 'pendente', ?, ?)`,
//       [envioId, alunoId, turmaId, arquivo.filename, tentativaAtual]
//     );

//     res.status(201).json({ message: 'Exercício enviado com sucesso.', tentativa: tentativaAtual });
//   } catch (error) {
//     console.error('Erro ao enviar exercício tradicional:', error);
//     res.status(500).json({ message: 'Erro interno ao enviar exercício.' });
//   }
// };


// // GET /api/alunos/:alunoId/exercicios-enviados
// export const getExerciciosEnviados = async (req: Request, res: Response) => {
//   const { alunoId } = req.params;

//   try {
//     const [rows] = await pool.query(
//       `SELECT envios_id FROM exercicios_alunos WHERE aluno_id = ?`,
//       [alunoId]
//     );

//     const enviados = (rows as RowDataPacket[]).map((r) => String(r.envios_id));
//     res.json(enviados);
//   } catch (error) {
//     console.error('Erro ao buscar exercícios enviados:', error);
//     res.status(500).json({ message: 'Erro interno.' });
//   }
// };

// // GET /api/alunos/:alunoId/exercicios-online
// export const getExerciciosOnlinePorAluno = async (req: Request, res: Response) => {
//   const { alunoId } = req.params;

//   try {
//     // 1. Buscar turma e matérias do aluno
//     const [dados] = await pool.query(
//       `SELECT at.turma_id, pt.materia_id
//        FROM alunos_turmas at
//        JOIN professores_turmas pt ON pt.turma_id = at.turma_id
//        WHERE at.aluno_id = ?`,
//       [alunoId]
//     );

//     if (!Array.isArray(dados) || dados.length === 0) {
//       return res.status(404).json({ message: 'Turma e matérias não encontradas para o aluno.' });
//     }

//     const turmaMateriaPairs = (dados as RowDataPacket[]).map((item) => [item.turma_id, item.materia_id]);

//     // 2. Buscar os exercícios com base nas tuplas (turma_id, materia_id)
//     const placeholders = turmaMateriaPairs.map(() => '(?, ?)').join(', ');
//     const values = turmaMateriaPairs.flat();

//     const [exercicios] = await pool.query(
//       `SELECT id, professor_id, materia_id, turma_id, envios_id, titulo, tentativas_permitidas, 
//               tempo_limite, mostrar_resultado, embaralhar_questoes, nota_max
//        FROM exercicios
//        WHERE (turma_id, materia_id) IN (${placeholders})`,
//       values
//     );

//     res.json(exercicios);
//   } catch (error) {
//     console.error('Erro ao buscar exercícios online:', error);
//     res.status(500).json({ message: 'Erro interno ao buscar exercícios online.' });
//   }
// };

// // GET /api/exercicios/envios/:enviosId/questoes
// export const getQuestoesPorEnvioId = async (req: Request, res: Response) => {
//   const { enviosId } = req.params;

//   try {
//     const [rows] = await pool.query(
//       `SELECT 
//          id,
//          envios_id,
//          exercicio_id,
//          enunciado,
//          tipo,
//          valor_questao,
//          explicacao,
//          alt_1,
//          alt_2,
//          alt_3,
//          alt_4,
//          alt_certa,
//          resp_modelo,
//          resp_numerica
//        FROM exercicios_questoes
//        WHERE envios_id = ?`,
//       [enviosId]
//     );

//     res.json(rows);
//   } catch (error) {
//     console.error('Erro ao buscar questões do exercício:', error);
//     res.status(500).json({ message: 'Erro interno ao buscar questões.' });
//   }
// };

// // GET /api/exercicios/envio/:enviosId/detalhes
// export const getDetalhesExercicio = async (req: Request, res: Response) => {
//   const { enviosId } = req.params;

//   try {
//     // 1. Buscar dados do exercício
//     const [exercicioRows] = await pool.query(
//       `SELECT id, titulo, tentativas_permitidas, nota_max
//        FROM exercicios
//        WHERE envios_id = ?
//        LIMIT 1`,
//       [enviosId]
//     );

//     if (!Array.isArray(exercicioRows) || exercicioRows.length === 0) {
//       return res.status(404).json({ message: 'Exercício não encontrado.' });
//     }

//     const exercicio = exercicioRows[0] as RowDataPacket;

//     // 2. Contar número de questões
//     const [questoesRows] = await pool.query(
//       `SELECT COUNT(*) AS total_questoes
//        FROM exercicios_questoes
//        WHERE exercicio_id = ?`,
//       [exercicio.id]
//     );

//     const totalQuestoes = (questoesRows as RowDataPacket[])[0]?.total_questoes || 0;

//     res.json({
//       titulo: exercicio.titulo,
//       tentativasPermitidas: exercicio.tentativas_permitidas,
//       notaMax: exercicio.nota_max,
//       totalQuestoes
//     });
//   } catch (error) {
//     console.error('Erro ao buscar detalhes do exercício:', error);
//     res.status(500).json({ message: 'Erro interno ao buscar detalhes do exercício.' });
//   }
// };


// // Salvar respostas de exercício online
// export const salvarRespostasExercicioOnline = async (req: Request, res: Response) => {
//   const { envioId, alunoId } = req.params;
//   const respostas = req.body.respostas as {
//     [questaoId: string]: string;
//   };

//   try {
//     // 1. Buscar turma e exercicio_id
//     const [turmaRows] = await pool.query(
//       `SELECT at.turma_id, e.id AS exercicio_id
//        FROM alunos_turmas at
//        JOIN exercicios e ON e.envios_id = ?
//        WHERE at.aluno_id = ?
//        LIMIT 1`,
//       [envioId, alunoId]
//     );

//     const turmaRow = (turmaRows as RowDataPacket[])[0];
//     if (!turmaRow) {
//       return res.status(404).json({ message: 'Turma ou exercício não encontrado.' });
//     }

//     const turmaId = turmaRow.turma_id;
//     const exercicioId = turmaRow.exercicio_id;

//     // 2. Buscar número de tentativas anteriores
//     const [tentativasRows] = await pool.query(
//       `SELECT COUNT(DISTINCT tentativa) AS total FROM exercicios_alunos
//       WHERE aluno_id = ? AND envios_id = ?`,
//       [alunoId, envioId]
//     );

//     const tentativaAtual = ((tentativasRows as RowDataPacket[])[0]?.total || 0) + 1;

//     let respostasSalvas = [];

//     // 3. Buscar questões do exercício
//     const [questoesRows] = await pool.query(
//       `SELECT * FROM exercicios_questoes WHERE exercicio_id = ?`,
//       [exercicioId]
//     );

//     const questoes = questoesRows as RowDataPacket[];

//     for (const questao of questoes) {
//       const respostaBruta = respostas[questao.id];
//       let alt_selecionada = null;
//       let resp_num = null;
//       let resp_texto = null;
//       let nota = 0;

//       // Avaliação conforme tipo da questão
//       switch (questao.tipo) {
//         case 'multipla_escolha':
//         case 'verdadeiro_falso': {
//           const alternativas = [questao.alt_1, questao.alt_2, questao.alt_3, questao.alt_4];
//           const index = alternativas.findIndex((alt) => alt === respostaBruta);
//           alt_selecionada = index + 1;
//           if (alt_selecionada === questao.alt_certa) {
//             nota = questao.valor_questao;
//           }
//           break;
//         }

//         case 'numerica': {
//           const respostaNum = parseFloat(respostaBruta);
//           resp_num = respostaNum;
//           const esperado = parseFloat(questao.resp_numerica);
//           if (Math.abs(respostaNum - esperado) < 0.01) {
//             nota = questao.valor_questao;
//           }
//           break;
//         }

//         case 'aberta': {
//           resp_texto = respostaBruta;
//           // Nota será atribuída posteriormente (correção manual)
//           nota = 0;
//           break;
//         }
//       }

//       // 4. Inserir tentativa no banco
//       await pool.query(
//         `INSERT INTO exercicios_alunos 
//           (envios_id, exercicios_questoes_id, aluno_id, turma_id, exercicio_id, data_envio, tentativa, nota_obtida, alt_selecionada, resp_num, resp_texto)
//          VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
//         [
//           envioId,
//           questao.id,
//           alunoId,
//           turmaId,
//           exercicioId,
//           tentativaAtual,
//           nota,
//           alt_selecionada,
//           resp_num,
//           resp_texto
//         ]
//       );

//       respostasSalvas.push({ questaoId: questao.id, nota });
//     }

//     res.status(201).json({
//       message: 'Respostas salvas com sucesso.',
//       tentativa: tentativaAtual,
//       respostasSalvas
//     });

//   } catch (error) {
//     console.error('Erro ao salvar respostas:', error);
//     res.status(500).json({ message: 'Erro interno ao salvar respostas.' });
//   }
// };

// // GET /api/exercicios/:envioId/aluno/:alunoId/tentativas
// export const getNumeroTentativas = async (req: Request, res: Response) => {
//   const { envioId, alunoId } = req.params;

//   try {
//     const [rows] = await pool.query(
//       `SELECT COUNT(DISTINCT tentativa) AS total FROM exercicios_alunos
//        WHERE aluno_id = ? AND envios_id = ?`,
//       [alunoId, envioId]
//     );

//     const tentativaAtual = ((rows as RowDataPacket[])[0]?.total || 0) + 1;
//     res.json({ tentativaAtual });
//   } catch (error) {
//     console.error('Erro ao contar tentativas:', error);
//     res.status(500).json({ message: 'Erro ao contar tentativas.' });
//   }
// };

// // GET /api/exercicios/:envioId/aluno/:alunoId/melhor-nota
// export const getMelhorNotaExercicio = async (req: Request, res: Response) => {
//   const { envioId, alunoId } = req.params;

//   try {
//     // Verificar o tipo de todas as questões do exercício
//     const [questoesRows] = await pool.query(
//       `SELECT tipo, id FROM exercicios_questoes 
//        WHERE exercicio_id = (SELECT id FROM exercicios WHERE envios_id = ? LIMIT 1)`,
//       [envioId]
//     );

//     const questoes = questoesRows as RowDataPacket[];
//     // Verificar se existe questão do tipo 'aberta'
//     const questaoAberta = questoes.find(q => q.tipo === 'aberta');

//     if (questaoAberta) {
//       // Verificar se o status_correcao para as questões abertas está 'pendente'
//       const [statusRows] = await pool.query(
//         `SELECT status_correcao 
//          FROM exercicios_alunos 
//          WHERE aluno_id = ? AND envios_id = ? AND exercicios_questoes_id = ?`,
//         [alunoId, envioId, questaoAberta.id]
//       );

//       const status = statusRows as RowDataPacket[];
//       const aguardandoCorrecao = status.some(s => s.status_correcao === 'pendente');

//       // Se o status for 'pendente', retornar aguardando correção
//       if (aguardandoCorrecao) {
//         return res.json({ aguardandoCorrecao: true });
//       }
//     }

//     // Caso não tenha questões pendentes ou não seja 'aberta', calcular a melhor nota
//     const [notasRows] = await pool.query(
//       `SELECT tentativa, SUM(nota_obtida) AS notaTotal
//        FROM exercicios_alunos
//        WHERE aluno_id = ? AND envios_id = ?
//        GROUP BY tentativa`,
//       [alunoId, envioId]
//     );

//     const melhoresNotas = (notasRows as RowDataPacket[]).map(r => r.notaTotal);
//     const melhorNota = Math.max(...melhoresNotas, 0);

//     res.json({ aguardandoCorrecao: false, melhorNota });
//   } catch (error) {
//     console.error('Erro ao buscar melhor nota:', error);
//     res.status(500).json({ message: 'Erro ao buscar melhor nota.' });
//   }
// };






// // GET /api/envios/:envioId/aluno/:alunoId/ultimo-arquivo
// export const getUltimoArquivoEnviado = async (req: Request, res: Response) => {
//   const { envioId, alunoId } = req.params;

//   try {
//     const [rows] = await pool.query(
//       `SELECT arquivo_url FROM exercicios_alunos 
//        WHERE aluno_id = ? AND envios_id = ?
//        ORDER BY data_envio DESC, tentativa DESC
//        LIMIT 1`,
//       [alunoId, envioId]
//     );

//     if (!Array.isArray(rows) || rows.length === 0) {
//       return res.status(404).json({ message: 'Nenhum envio encontrado.' });
//     }

//     const row = rows[0] as RowDataPacket & { arquivo_url: string };
//     const { arquivo_url } = row;
//     res.json({ arquivo: arquivo_url });
//   } catch (error) {
//     console.error('Erro ao buscar último arquivo enviado:', error);
//     res.status(500).json({ message: 'Erro interno ao buscar arquivo.' });
//   }
// };

import { Request, Response } from 'express';
import pool from '../config/db';
import path from 'path';
import { RowDataPacket } from 'mysql2';

// GET /api/alunos/:id/envios
export const getEnviosPorAluno = async (req: Request, res: Response) => {
  const alunoId = req.params.id;

  try {
    // 1. Buscar turma e disciplinas do aluno
    const [dados] = await pool.query(
      `SELECT at.turma_id, m.id AS materia_id, m.nome AS materia_nome
       FROM alunos_turmas at
       JOIN materias m ON m.id IN (
         SELECT materia_id FROM professores_turmas WHERE turma_id = at.turma_id
       )
       WHERE at.aluno_id = ?`,
      [alunoId]
    );

    if (!Array.isArray(dados) || dados.length === 0) {
      return res.status(404).json({ message: 'Nenhuma disciplina encontrada.' });
    }

    // 2. Para cada disciplina, buscar os envios
    const materiasComEnvios = await Promise.all(
      dados.map(async (disciplina: any) => {
        const [envios] = await pool.query(
          `SELECT id, tipo, titulo, descricao, arquivo_url AS arquivo, data_criacao AS dataEnvio
           FROM envios
           WHERE materia_id = ? AND turma_id = ?`,
          [disciplina.materia_id, disciplina.turma_id]
        );

        return {
          nome: disciplina.materia_nome,
          envios: envios,
        };
      })
    );

    res.json(materiasComEnvios);
  } catch (error) {
    console.error('Erro ao buscar envios:', error);
    res.status(500).json({ message: 'Erro interno ao buscar envios.' });
  }
};

// POST /api/envios/:envioId/aluno/:alunoId/enviar
export const enviarExercicioTradicionalAluno = async (req: Request, res: Response) => {
  const { envioId, alunoId } = req.params;
  const arquivo = req.file;

  try {
    if (!arquivo) {
      return res.status(400).json({ message: 'Arquivo não enviado.' });
    }

    const [rows] = await pool.query(
      `SELECT turma_id FROM alunos_turmas WHERE aluno_id = ? LIMIT 1`,
      [alunoId]
    );

    const dados = rows as RowDataPacket[];

    if (!Array.isArray(dados) || dados.length === 0) {
      return res.status(404).json({ message: 'Turma do aluno não encontrada.' });
    }

    const turmaId = dados[0].turma_id;

    // 🔢 Buscar número de tentativas já realizadas para esse envio
    const [tentativasRows] = await pool.query(
      `SELECT COUNT(*) as total FROM exercicios_alunos WHERE aluno_id = ? AND envios_id = ?`,
      [alunoId, envioId]
    );

    const tentativaAtual = (tentativasRows as RowDataPacket[])[0].total + 1;

    await pool.query(
      `INSERT INTO exercicios_alunos (envios_id, aluno_id, turma_id, data_envio, status_correcao, arquivo_url, tentativa)
       VALUES (?, ?, ?, NOW(), 'pendente', ?, ?)`,
      [envioId, alunoId, turmaId, arquivo.filename, tentativaAtual]
    );

    res.status(201).json({ message: 'Exercício enviado com sucesso.', tentativa: tentativaAtual });
  } catch (error) {
    console.error('Erro ao enviar exercício tradicional:', error);
    res.status(500).json({ message: 'Erro interno ao enviar exercício.' });
  }
};


// GET /api/alunos/:alunoId/exercicios-enviados
export const getExerciciosEnviados = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT envios_id FROM exercicios_alunos WHERE aluno_id = ?`,
      [alunoId]
    );

    const enviados = (rows as RowDataPacket[]).map((r) => String(r.envios_id));
    res.json(enviados);
  } catch (error) {
    console.error('Erro ao buscar exercícios enviados:', error);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// GET /api/alunos/:alunoId/exercicios-online
export const getExerciciosOnlinePorAluno = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  try {
    // 1. Buscar turma e matérias do aluno
    const [dados] = await pool.query(
      `SELECT at.turma_id, pt.materia_id
       FROM alunos_turmas at
       JOIN professores_turmas pt ON pt.turma_id = at.turma_id
       WHERE at.aluno_id = ?`,
      [alunoId]
    );

    if (!Array.isArray(dados) || dados.length === 0) {
      return res.status(404).json({ message: 'Turma e matérias não encontradas para o aluno.' });
    }

    const turmaMateriaPairs = (dados as RowDataPacket[]).map((item) => [item.turma_id, item.materia_id]);

    // 2. Buscar os exercícios com base nas tuplas (turma_id, materia_id)
    const placeholders = turmaMateriaPairs.map(() => '(?, ?)').join(', ');
    const values = turmaMateriaPairs.flat();

    const [exercicios] = await pool.query(
      `SELECT id, professor_id, materia_id, turma_id, envios_id, titulo, tentativas_permitidas, 
              tempo_limite, mostrar_resultado, embaralhar_questoes, nota_max
       FROM exercicios
       WHERE (turma_id, materia_id) IN (${placeholders})`,
      values
    );

    res.json(exercicios);
  } catch (error) {
    console.error('Erro ao buscar exercícios online:', error);
    res.status(500).json({ message: 'Erro interno ao buscar exercícios online.' });
  }
};

// GET /api/exercicios/envios/:enviosId/questoes
export const getQuestoesPorEnvioId = async (req: Request, res: Response) => {
  const { enviosId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
         id,
         envios_id,
         exercicio_id,
         enunciado,
         tipo,
         valor_questao,
         explicacao,
         alt_1,
         alt_2,
         alt_3,
         alt_4,
         alt_certa,
         resp_modelo,
         resp_numerica
       FROM exercicios_questoes
       WHERE envios_id = ?`,
      [enviosId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar questões do exercício:', error);
    res.status(500).json({ message: 'Erro interno ao buscar questões.' });
  }
};

// GET /api/exercicios/envio/:enviosId/detalhes
export const getDetalhesExercicio = async (req: Request, res: Response) => {
  const { enviosId } = req.params;

  try {
    // 1. Buscar dados do exercício
    const [exercicioRows] = await pool.query(
      `SELECT id, titulo, tentativas_permitidas, nota_max
       FROM exercicios
       WHERE envios_id = ?
       LIMIT 1`,
      [enviosId]
    );

    if (!Array.isArray(exercicioRows) || exercicioRows.length === 0) {
      return res.status(404).json({ message: 'Exercício não encontrado.' });
    }

    const exercicio = exercicioRows[0] as RowDataPacket;

    // 2. Contar número de questões
    const [questoesRows] = await pool.query(
      `SELECT COUNT(*) AS total_questoes
       FROM exercicios_questoes
       WHERE exercicio_id = ?`,
      [exercicio.id]
    );

    const totalQuestoes = (questoesRows as RowDataPacket[])[0]?.total_questoes || 0;

    res.json({
      titulo: exercicio.titulo,
      tentativasPermitidas: exercicio.tentativas_permitidas,
      notaMax: exercicio.nota_max,
      totalQuestoes
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do exercício:', error);
    res.status(500).json({ message: 'Erro interno ao buscar detalhes do exercício.' });
  }
};


// CORREÇÃO: Salvar respostas de exercício online
export const salvarRespostasExercicioOnline = async (req: Request, res: Response) => {
  const { envioId, alunoId } = req.params;
  // CORREÇÃO: Agora aceita tanto string quanto number
  const respostas = req.body.respostas as {
    [questaoId: string]: string | number;
  };

  try {
    // 1. Buscar turma e exercicio_id
    const [turmaRows] = await pool.query(
      `SELECT at.turma_id, e.id AS exercicio_id
       FROM alunos_turmas at
       JOIN exercicios e ON e.envios_id = ?
       WHERE at.aluno_id = ?
       LIMIT 1`,
      [envioId, alunoId]
    );

    const turmaRow = (turmaRows as RowDataPacket[])[0];
    if (!turmaRow) {
      return res.status(404).json({ message: 'Turma ou exercício não encontrado.' });
    }

    const turmaId = turmaRow.turma_id;
    const exercicioId = turmaRow.exercicio_id;

    // 2. Buscar número de tentativas anteriores
    const [tentativasRows] = await pool.query(
      `SELECT COUNT(DISTINCT tentativa) AS total FROM exercicios_alunos
      WHERE aluno_id = ? AND envios_id = ?`,
      [alunoId, envioId]
    );

    const tentativaAtual = ((tentativasRows as RowDataPacket[])[0]?.total || 0) + 1;

    let respostasSalvas = [];

    // 3. Buscar questões do exercício
    const [questoesRows] = await pool.query(
      `SELECT * FROM exercicios_questoes WHERE exercicio_id = ?`,
      [exercicioId]
    );

    const questoes = questoesRows as RowDataPacket[];

    for (const questao of questoes) {
      const respostaBruta = respostas[questao.id];
      let alt_selecionada = null;
      let resp_num = null;
      let resp_texto = null;
      let nota = 0;

      // Avaliação conforme tipo da questão
      switch (questao.tipo) {
        case 'multipla_escolha':
        case 'verdadeiro_falso': {
          // CORREÇÃO: Agora a resposta já vem como número (1-4) do frontend
          if (typeof respostaBruta === 'number') {
            alt_selecionada = respostaBruta;
          } else {
            // Fallback para compatibilidade com versões antigas que ainda enviam texto
            const alternativas = [questao.alt_1, questao.alt_2, questao.alt_3, questao.alt_4];
            const index = alternativas.findIndex((alt) => alt === respostaBruta);
            alt_selecionada = index !== -1 ? index + 1 : null;
          }
          
          // Verificar se a alternativa selecionada está correta
          if (alt_selecionada === questao.alt_certa) {
            nota = questao.valor_questao;
          }
          break;
        }

        case 'numerica': {
          const respostaNum = parseFloat(String(respostaBruta));
          resp_num = respostaNum;
          const esperado = parseFloat(questao.resp_numerica);
          if (Math.abs(respostaNum - esperado) < 0.01) {
            nota = questao.valor_questao;
          }
          break;
        }

        case 'aberta': {
          resp_texto = String(respostaBruta);
          // Nota será atribuída posteriormente (correção manual)
          nota = 0;
          break;
        }
      }

      // 4. Inserir tentativa no banco
      await pool.query(
        `INSERT INTO exercicios_alunos 
          (envios_id, exercicios_questoes_id, aluno_id, turma_id, exercicio_id, data_envio, tentativa, nota_obtida, alt_selecionada, resp_num, resp_texto)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
        [
          envioId,
          questao.id,
          alunoId,
          turmaId,
          exercicioId,
          tentativaAtual,
          nota,
          alt_selecionada, // CORREÇÃO: Agora salva o número da alternativa (1-4) ou null
          resp_num,
          resp_texto
        ]
      );

      respostasSalvas.push({ questaoId: questao.id, nota, alt_selecionada });
    }

    res.status(201).json({
      message: 'Respostas salvas com sucesso.',
      tentativa: tentativaAtual,
      respostasSalvas
    });

  } catch (error) {
    console.error('Erro ao salvar respostas:', error);
    res.status(500).json({ message: 'Erro interno ao salvar respostas.' });
  }
};

// GET /api/exercicios/:envioId/aluno/:alunoId/tentativas
export const getNumeroTentativas = async (req: Request, res: Response) => {
  const { envioId, alunoId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT COUNT(DISTINCT tentativa) AS total FROM exercicios_alunos
       WHERE aluno_id = ? AND envios_id = ?`,
      [alunoId, envioId]
    );

    const tentativaAtual = ((rows as RowDataPacket[])[0]?.total || 0) + 1;
    res.json({ tentativaAtual });
  } catch (error) {
    console.error('Erro ao contar tentativas:', error);
    res.status(500).json({ message: 'Erro ao contar tentativas.' });
  }
};

// GET /api/exercicios/:envioId/aluno/:alunoId/melhor-nota
export const getMelhorNotaExercicio = async (req: Request, res: Response) => {
  const { envioId, alunoId } = req.params;

  try {
    // Verificar o tipo de todas as questões do exercício
    const [questoesRows] = await pool.query(
      `SELECT tipo, id FROM exercicios_questoes 
       WHERE exercicio_id = (SELECT id FROM exercicios WHERE envios_id = ? LIMIT 1)`,
      [envioId]
    );

    const questoes = questoesRows as RowDataPacket[];
    // Verificar se existe questão do tipo 'aberta'
    const questaoAberta = questoes.find(q => q.tipo === 'aberta');

    if (questaoAberta) {
      // Verificar se o status_correcao para as questões abertas está 'pendente'
      const [statusRows] = await pool.query(
        `SELECT status_correcao 
         FROM exercicios_alunos 
         WHERE aluno_id = ? AND envios_id = ? AND exercicios_questoes_id = ?`,
        [alunoId, envioId, questaoAberta.id]
      );

      const status = statusRows as RowDataPacket[];
      const aguardandoCorrecao = status.some(s => s.status_correcao === 'pendente');

      // Se o status for 'pendente', retornar aguardando correção
      if (aguardandoCorrecao) {
        return res.json({ aguardandoCorrecao: true });
      }
    }

    // Caso não tenha questões pendentes ou não seja 'aberta', calcular a melhor nota
    const [notasRows] = await pool.query(
      `SELECT tentativa, SUM(nota_obtida) AS notaTotal
       FROM exercicios_alunos
       WHERE aluno_id = ? AND envios_id = ?
       GROUP BY tentativa`,
      [alunoId, envioId]
    );

    const melhoresNotas = (notasRows as RowDataPacket[]).map(r => r.notaTotal);
    const melhorNota = Math.max(...melhoresNotas, 0);

    res.json({ aguardandoCorrecao: false, melhorNota });
  } catch (error) {
    console.error('Erro ao buscar melhor nota:', error);
    res.status(500).json({ message: 'Erro ao buscar melhor nota.' });
  }
};

// GET /api/envios/:envioId/aluno/:alunoId/ultimo-arquivo
export const getUltimoArquivoEnviado = async (req: Request, res: Response) => {
  const { envioId, alunoId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT arquivo_url FROM exercicios_alunos 
       WHERE aluno_id = ? AND envios_id = ?
       ORDER BY data_envio DESC, tentativa DESC
       LIMIT 1`,
      [alunoId, envioId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum envio encontrado.' });
    }

    const row = rows[0] as RowDataPacket & { arquivo_url: string };
    const { arquivo_url } = row;
    res.json({ arquivo: arquivo_url });
  } catch (error) {
    console.error('Erro ao buscar último arquivo enviado:', error);
    res.status(500).json({ message: 'Erro interno ao buscar arquivo.' });
  }
};