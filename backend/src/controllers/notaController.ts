import { Request, Response } from 'express';
import pool from '../config/db';

export const obterFrequenciaMensal = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`
      SELECT 
        MONTH(data) AS mes,
        YEAR(data) AS ano,
        COUNT(*) AS total_aulas,
        SUM(presenca = 1) AS total_presentes
      FROM presencas
      GROUP BY ano, mes
      ORDER BY ano, mes
    `);

    const frequenciaMensal = rows.map((row: any) => {
      const percentual =
        row.total_aulas > 0
          ? Math.round((row.total_presentes / row.total_aulas) * 100)
          : 0;

      return {
        mes: row.mes,
        ano: row.ano,
        frequencia: percentual,
      };
    });

    res.json(frequenciaMensal);
  } catch (error) {
    console.error('Erro ao obter frequência mensal:', error);
    res.status(500).json({ error: 'Erro ao obter frequência mensal' });
  }
};

export const getNotasPorAluno = async (req: Request, res: Response) => {
  const alunoId = req.params.alunoId;

  try {
    // 1. Obter tipo de avaliação
    const [tipoRows]: any = await pool.query(
      'SELECT tipo FROM calendario_letivo LIMIT 1'
    );
    const tipo = tipoRows[0]?.tipo.toLowerCase();
    let etapasEsperadas = 4;
    if (tipo.includes('trimestral')) etapasEsperadas = 3;
    else if (tipo.includes('semestral')) etapasEsperadas = 2;

    // 2. Obter períodos da tabela calendario_gestor
    const [periodos]: any = await pool.query(
      'SELECT id, data_inicial, data_final FROM calendario_gestor ORDER BY id ASC LIMIT ?',
      [etapasEsperadas]
    );
    if (periodos.length !== etapasEsperadas) {
      return res
        .status(400)
        .json({ error: 'Número incorreto de períodos no calendário gestor.' });
    }

    // 3. Buscar todas as matérias do aluno (por turma)
    const [materiasAluno]: any = await pool.query(
      `SELECT DISTINCT m.id, m.nome
       FROM materias m
       JOIN turmas_materias tm ON tm.materia_id = m.id
       JOIN alunos_turmas atur ON atur.turma_id = tm.turma_id
       WHERE atur.aluno_id = ?`,
      [alunoId]
    );

    // 4. Buscar avaliações por matéria e período
    const materias = [];
    for (const materia of materiasAluno) {
      const grades: (number | null)[] = [];
      for (let etapaIndex = 0; etapaIndex < periodos.length; etapaIndex++) {
        const periodo = periodos[etapaIndex];

        // Buscar avaliações da matéria para o período (usando calendario_id do período)
        const [avaliacoes]: any = await pool.query(
          `SELECT a.id, a.valor
           FROM avaliacoes a
           WHERE a.materia_id = ? AND a.calendario_id = ?`,
          [materia.id, periodo.id]
        );

        let somaNotas = 0;
        let encontrouNota = false;

        for (const avaliacao of avaliacoes) {
          // Buscar nota do aluno para essa avaliação
          const [notas]: any = await pool.query(
            `SELECT nota FROM notas WHERE avaliacao_id = ? AND aluno_id = ?`,
            [avaliacao.id, alunoId]
          );
          if (notas.length > 0) {
            somaNotas += Number(notas[0].nota);
            encontrouNota = true;
          }
        }
        // Se não tem nota, coloca null
        grades.push(encontrouNota ? Number(somaNotas.toFixed(2)) : null);
      }
      materias.push({
        id: materia.id,
        name: materia.nome,
        grades,
        faltas: Array(etapasEsperadas).fill(0), // faltas pode ser ajustado depois
        finalGrade: grades.reduce((acc: number, n) => acc + (n || 0), 0),
        attendance: 100,
        status: 'Em andamento'
      });
    }

    // 5. Calcular status (aprovado/reprovado)
    for (const r of materias) {
      const validas = r.grades.filter((n: number | null) => typeof n === 'number' && !isNaN(n));
      if (validas.length > 0) {
        const soma = validas.reduce((acc: number, v: number | null) => acc + (v !== null ? v : 0), 0);
        r.finalGrade = Number(soma.toFixed(1));
        r.status = soma >= 24 ? 'Aprovado' : 'Reprovado'; // ajuste conforme sua regra
      }
    }

    res.json({
      tipoAvaliacao: tipo.includes('trimestral')
        ? 'trimestre'
        : tipo.includes('semestral')
          ? 'semestre'
          : 'bimestre',
      materias,
    });
  } catch (err) {
    console.error('Erro ao buscar boletim do aluno:', err);
    res.status(500).json({ error: 'Erro ao buscar boletim do aluno.' });
  }
};

export const getNotasByCalendario = async (req: Request, res: Response) => {
  const calendarioId = Number(req.query.calendarioId);
  if (isNaN(calendarioId)) {
    return res.status(400).json({ error: 'calendarioId inválido' });
  }

  try {
    // JOIN entre notas e avaliacoes para filtrar pelo calendario_id
    const sql = `
      SELECT
        n.aluno_id,
        n.avaliacao_id,
        n.nota,
        n.valor,
        n.recuperacao,
        n.nota_rec
      FROM notas n
      JOIN avaliacoes a
        ON a.id = n.avaliacao_id
      WHERE a.calendario_id = ?
    `;
    const [rows] = await pool.query(sql, [calendarioId]);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar notas:', err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
};

type NotaPayload = {
  aluno_id: number;
  avaliacao_id: number;
  nota: number;
  valor: number;
  recuperacao: 'Sim' | 'Não';
  nota_rec: number;
};

export const salvarNotasBatch = async (req: Request, res: Response): Promise<void> => {
  // 1. Faz cast do body para o tipo correto
  const notas = req.body as NotaPayload[];

  // 2. Prepara o array de valores para o bulk insert
  const values = notas.map(n => [
    n.aluno_id,
    n.avaliacao_id,
    n.nota,
    n.valor,
    n.recuperacao,
    n.nota_rec
  ]);

  // 3. Monta o SQL incluindo a coluna `valor` no INSERT e no UPDATE
  const sql = `
    INSERT INTO notas
      (aluno_id, avaliacao_id, nota, valor, recuperacao, nota_rec)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      nota        = VALUES(nota),
      valor       = VALUES(valor),
      recuperacao = VALUES(recuperacao),
      nota_rec    = VALUES(nota_rec)
  `;

  try {
    await pool.query(sql, [values]);
    res.status(201).json({ inserted: notas.length });
  } catch (error) {
    console.error('Erro no salvarNotasBatch:', error);
    res.status(500).json({ error: 'Erro ao gravar notas' });
  }
};

export const getFaltasPorEtapa = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  try {
    const [rows]: any = await pool.query(
      `
      SELECT 
        p.materia_id,
        cg.periodo AS etapa,
        COUNT(*) AS total_aulas,
        SUM(p.presenca = 0) AS total_faltas
      FROM presencas p
      JOIN aulas a ON p.aula_id = a.id
      JOIN calendario_gestor cg ON a.calendario_id = cg.id
      WHERE p.aluno_id = ?
      GROUP BY p.materia_id, etapa
      ORDER BY p.materia_id, etapa
      `,
      [alunoId]
    );

    const faltasPorMateria: Record<number, { etapa: number; faltas: number }[]> = {};

    for (const row of rows) {
      const materiaId = row.materia_id;
      const etapa = row.etapa;

      if (!faltasPorMateria[materiaId]) {
        faltasPorMateria[materiaId] = [];
      }

      faltasPorMateria[materiaId].push({
        etapa,
        faltas: row.total_faltas,
      });
    }

    res.json(faltasPorMateria);
  } catch (error) {
    console.error('Erro ao buscar faltas por etapa:', error);
    res.status(500).json({ error: 'Erro ao buscar faltas por etapa' });
  }
};

export const getFrequenciaPorMateria = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  try {
    const [rows]: any = await pool.query(
      `
      SELECT 
        materia_id,
        COUNT(*) AS total_aulas,
        SUM(presenca = 1) AS total_presentes
      FROM presencas
      WHERE aluno_id = ?
      GROUP BY materia_id
      `,
      [alunoId]
    );

    const frequencias: Record<number, number> = {};

    for (const row of rows) {
      const percentual =
        row.total_aulas > 0
          ? Math.round((row.total_presentes / row.total_aulas) * 100)
          : 0;

      frequencias[row.materia_id] = percentual;
    }

    res.json(frequencias);
  } catch (error) {
    console.error('Erro ao calcular frequência por matéria:', error);
    res.status(500).json({ error: 'Erro ao calcular frequência' });
  }
};