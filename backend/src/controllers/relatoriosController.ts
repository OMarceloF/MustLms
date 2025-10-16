import { Request, Response } from 'express';
import pool from '../config/db';
import PDFDocument from 'pdfkit';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import type { ChartConfiguration } from 'chart.js';
import 'chart.js/auto';

export const getEstatisticasAlunos = async (req: Request, res: Response) => {
  try {
    console.log('Entrou na rota');

    // Busca estatísticas por aluno
    const [rows] = await pool.query<any[]>(`
      SELECT 
        a.id,
        a.nome AS name,
        a.turma AS class,
        ROUND(SUM(n.nota), 2) AS averageGrade,
        (
          SELECT 
            ROUND(SUM(CASE WHEN p.presenca = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 0)
          FROM presencas p
          WHERE p.aluno_id = a.id
        ) AS attendance
      FROM alunos a
      LEFT JOIN notas n ON n.aluno_id = a.id
      WHERE n.nota IS NOT NULL AND status != 'inativo'
      GROUP BY a.id
    `);

    // Calcula a média das somas individuais de notas (média geral)
    const [mediaRow] = await pool.query<any[]>(`
      SELECT 
        ROUND(AVG(sub.total), 2) AS mediaGeral
      FROM (
        SELECT 
          aluno_id,
          SUM(nota) AS total
        FROM notas
        WHERE nota IS NOT NULL
        GROUP BY aluno_id
      ) AS sub;
    `);

    const mediaGeral = mediaRow[0]?.mediaGeral || 0;

    // Calcula média de presenças individuais
    const [presencaRow] = await pool.query<any[]>(`
  SELECT 
    ROUND(AVG(presenca_percentual), 0) AS mediaPresenca
  FROM (
    SELECT 
      aluno_id,
      ROUND(SUM(CASE WHEN presenca = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS presenca_percentual
    FROM presencas
    GROUP BY aluno_id
  ) AS sub;
  `);

    const mediaPresenca = presencaRow[0]?.mediaPresenca || 0;

    const alunos = rows.map((row) => {
      const grade = row.averageGrade !== null ? Number(row.averageGrade) : null;
      const att = row.attendance !== null ? Number(row.attendance) : 0;

      return {
        ...row,
        averageGrade: grade,
        attendance: att,
        completedTasks: Math.floor(Math.random() * 6) + 10,
        pendingTasks: Math.floor(Math.random() * 5),
        progress: Math.floor(Math.random() * 50) + 50,
        status:
          grade !== null && (grade < 6 || att < 70)
            ? grade < 5 || att < 60
              ? 'alert'
              : 'warning'
            : 'normal',
      };
    });

    res.json({ alunos, mediaGeral, mediaPresenca });
  } catch (error) {
    console.error('Erro ao buscar estatísticas dos alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas dos alunos' });
  }
};

export const getRelatorioAlunos = async (req: Request, res: Response) => {
  const { selectedClass = 'all', startDate, endDate } = req.query as Record<string, string>;
  console.log('Filtros recebidos:', req.query, 'Start:', startDate, 'End:', endDate);
  try {

    let sql = `
      SELECT
        a.id,
        a.nome AS name,
        a.turma AS class,
        t.id   AS turma_id,
        a.status,
        (
          SELECT SUM(CASE WHEN p.presenca = 1 THEN 1 ELSE 0 END)
            FROM presencas p
            WHERE p.aluno_id = a.id
              AND p.turma_id = t.id
              ${startDate && endDate ? "AND p.data BETWEEN ? AND ?" : ""}
        ) AS presencaCount,
        (
          SELECT COUNT(DISTINCT CONCAT(p.data, '_', p.materia_id))
            FROM presencas p
            WHERE p.turma_id = t.id
            ${startDate && endDate ? "AND p.data BETWEEN ? AND ?" : ""}
        ) AS totalAulas,
        CASE
          WHEN (
            SELECT COUNT(DISTINCT CONCAT(p2.data, '_', p2.materia_id))
              FROM presencas p2
              WHERE p2.turma_id = t.id
              ${startDate && endDate ? "AND p2.data BETWEEN ? AND ?" : ""}
          ) > 0
          THEN ROUND(
            (
              SELECT SUM(CASE WHEN p3.presenca = 1 THEN 1 ELSE 0 END)
                FROM presencas p3
                WHERE p3.aluno_id = a.id
                  AND p3.turma_id = t.id
                  ${startDate && endDate ? "AND p3.data BETWEEN ? AND ?" : ""}
            )
            /
            (
              SELECT COUNT(DISTINCT CONCAT(p4.data, '_', p4.materia_id))
                FROM presencas p4
                WHERE p4.turma_id = t.id
                ${startDate && endDate ? "AND p4.data BETWEEN ? AND ?" : ""}
            )
            * 100
          , 2)
          ELSE 0
        END AS attendancePercent
      FROM alunos a
      JOIN turmas t ON t.nome = a.turma
      WHERE 1=1 AND status != 'inativo'
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      // Para cada subquery de presença/adiciona as datas (são usadas 4 vezes na query)
      for (let i = 0; i < 5; i++) {
        params.push(startDate, endDate);
      }
    }

    if (selectedClass !== 'all') {
      sql += ` AND a.turma = ?`;
      params.push(selectedClass);
    }
    
    const [alunosRows] = await pool.query<any[]>(sql, params);

    // Buscar matérias da turma selecionada
    let materiasQuery = `
      SELECT DISTINCT m.id, m.nome 
      FROM materias m
      INNER JOIN notas n ON n.materia_id = m.id
      INNER JOIN alunos a ON a.id = n.aluno_id
    `;
    const materiasParams: any[] = [];

    if (selectedClass !== 'all') {
      materiasQuery += ` WHERE a.turma = ?`;
      materiasParams.push(selectedClass);
    }

    materiasQuery += ` ORDER BY m.nome`;

    const [materiasRows] = await pool.query<any[]>(materiasQuery, materiasParams);
    

    // Para cada aluno, calcular a média por matéria
    const alunosComMedias = await Promise.all(
      alunosRows.map(async (aluno) => {
        const mediasMateria: Record<string, number> = {};

        for (const materia of materiasRows) {
          let notaQuery = `
            SELECT 
              tipo,
              valor,
              GREATEST(COALESCE(nota, 0), COALESCE(nota_rec, 0)) as maior_nota
            FROM notas
            WHERE aluno_id = ? AND materia_id = ?
            ${startDate && endDate ? "AND data BETWEEN ? AND ?" : ""}
          `;
          const notaParams = [aluno.id, materia.id];
          if (startDate && endDate) {
            notaParams.push(startDate, endDate);
          }
          const [notasRows] = await pool.query<any[]>(notaQuery, notaParams);

          if (notasRows.length > 0) {
            // Agrupar por tipo e pegar a maior nota de cada tipo
            const notasPorTipo: Record<string, { nota: number; valor: number }> = {};
            
            notasRows.forEach((nota: any) => {
              if (!notasPorTipo[nota.tipo] || notasPorTipo[nota.tipo].nota < nota.maior_nota) {
                notasPorTipo[nota.tipo] = {
                  nota: nota.maior_nota,
                  valor: nota.valor
                };
              }
            });

            // Calcular média: soma das notas / soma dos valores
            const somaNotas = Object.values(notasPorTipo).reduce((acc, item) => acc + item.nota, 0);
            const somaValores = Object.values(notasPorTipo).reduce((acc, item) => acc + item.valor, 0);
            
            if (somaValores > 0) {
              mediasMateria[`media_${materia.nome.toLowerCase().replace(/\s+/g, '_')}`] = 
                Math.round((somaNotas / somaValores) * 100) / 100;
            }
          }
        }

        return {
          ...aluno,
          ...mediasMateria
        };
      })
    );

    // Retornar dados dos alunos com médias e lista de matérias
    return res.json({ 
      alunos: alunosComMedias,
      materias: materiasRows.map(m => ({
        id: m.id,
        nome: m.nome,
        coluna: `media_${m.nome.toLowerCase().replace(/\s+/g, '_')}`
      }))
    });

    
  } catch (error) {
    console.error('Erro ao buscar relatório de alunos:', error);
    return res.status(500).json({ error: 'Erro ao buscar relatório de alunos' });
  }
};



// logo abaixo dos outros exports
export const getTaxaPresencaPorTurma = async (req: Request, res: Response) => {
  const { month } = req.query as { month: string }; // formato "YYYY-MM"
  try {
    // 1) consulta % de presença por turma e dia
    const [rows] = await pool.query<any[]>(`
      SELECT 
        t.nome     AS turma,
        DATE_FORMAT(p.data, '%d') AS dia,
        ROUND(SUM(p.presenca) / COUNT(*) * 100, 2) AS percent
      FROM presencas p
      JOIN turmas t ON t.id = p.turma_id
      WHERE DATE_FORMAT(p.data, '%Y-%m') = ?
      GROUP BY p.turma_id, dia
      ORDER BY dia
    `, [month]);

    // 2) montar array de datas e turmas únicas
    const dias   = Array.from(new Set(rows.map(r => r.dia))).sort();
    const turmas = Array.from(new Set(rows.map(r => r.turma)));

    // 3) montar objeto por dia, com chave para cada turma
    const data = dias.map(d => {
      const obj: Record<string, any> = { dia: d };
      turmas.forEach(t => {
        const rec = rows.find(r => r.dia === d && r.turma === t);
        obj[t] = rec ? rec.percent : 0;
      });
      return obj;
    });

    return res.json({ data, turmas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar taxa de presença por turma' });
  }
};



export const exportarRelatorioPDF = async (req: Request, res: Response) => {
  const {
    dateRange = 'this-month',
    selectedClass = 'all',
    selectedSubject = 'all',
    startDate,
    endDate,
    subPeriod = ''
  } = req.query as Record<string, string>;
  try {

    let sql = `
      SELECT
        a.id,
        a.nome AS name,
        a.turma AS class,
        t.id   AS turma_id,
        a.status,
        (
          SELECT SUM(CASE WHEN p.presenca = 1 THEN 1 ELSE 0 END)
            FROM presencas p
            WHERE p.aluno_id = a.id
              AND p.turma_id = t.id
              ${startDate && endDate ? "AND p.data BETWEEN ? AND ?" : ""}
        ) AS presencaCount,
        (
          SELECT COUNT(DISTINCT CONCAT(p.data, '_', p.materia_id))
            FROM presencas p
            WHERE p.turma_id = t.id
            ${startDate && endDate ? "AND p.data BETWEEN ? AND ?" : ""}
        ) AS totalAulas,
        CASE
          WHEN (
            SELECT COUNT(DISTINCT CONCAT(p2.data, '_', p2.materia_id))
              FROM presencas p2
              WHERE p2.turma_id = t.id
              ${startDate && endDate ? "AND p2.data BETWEEN ? AND ?" : ""}
          ) > 0
          THEN ROUND(
            (
              SELECT SUM(CASE WHEN p3.presenca = 1 THEN 1 ELSE 0 END)
                FROM presencas p3
                WHERE p3.aluno_id = a.id
                  AND p3.turma_id = t.id
                  ${startDate && endDate ? "AND p3.data BETWEEN ? AND ?" : ""}
            )
            /
            (
              SELECT COUNT(DISTINCT CONCAT(p4.data, '_', p4.materia_id))
                FROM presencas p4
                WHERE p4.turma_id = t.id
                ${startDate && endDate ? "AND p4.data BETWEEN ? AND ?" : ""}
            )
            * 100
          , 2)
          ELSE 0
        END AS attendancePercent
      FROM alunos a
      JOIN turmas t ON t.nome = a.turma
      WHERE 1=1 AND status != 'inativo'
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      // Para cada subquery de presença/adiciona as datas (são usadas 4 vezes na query)
      for (let i = 0; i < 5; i++) {
        params.push(startDate, endDate);
      }
    }

    if (selectedClass !== 'all') {
      sql += ` AND a.turma = ?`;
      params.push(selectedClass);
    }

    const [alunosRows] = await pool.query<any[]>(sql, params);

    // Buscar matérias da turma selecionada
    let materiasQuery = `
      SELECT DISTINCT m.id, m.nome 
      FROM materias m
      INNER JOIN notas n ON n.materia_id = m.id
      INNER JOIN alunos a ON a.id = n.aluno_id
    `;
    const materiasParams: any[] = [];

    if (selectedClass !== 'all') {
      materiasQuery += ` WHERE a.turma = ?`;
      materiasParams.push(selectedClass);
    }

    materiasQuery += ` ORDER BY m.nome`;

    const [materiasRows] = await pool.query<any[]>(materiasQuery, materiasParams);
    

    // Para cada aluno, calcular a média por matéria
    const alunosComMedias = await Promise.all(
      alunosRows.map(async (aluno) => {
        const mediasMateria: Record<string, number> = {};

        for (const materia of materiasRows) {
          let notaQuery = `
            SELECT 
              tipo,
              valor,
              GREATEST(COALESCE(nota, 0), COALESCE(nota_rec, 0)) as maior_nota
            FROM notas
            WHERE aluno_id = ? AND materia_id = ?
            ${startDate && endDate ? "AND data BETWEEN ? AND ?" : ""}
          `;
          const notaParams = [aluno.id, materia.id];
          if (startDate && endDate) {
            notaParams.push(startDate, endDate);
          }
          const [notasRows] = await pool.query<any[]>(notaQuery, notaParams);

          if (notasRows.length > 0) {
            // Agrupar por tipo e pegar a maior nota de cada tipo
            const notasPorTipo: Record<string, { nota: number; valor: number }> = {};
            
            notasRows.forEach((nota: any) => {
              if (!notasPorTipo[nota.tipo] || notasPorTipo[nota.tipo].nota < nota.maior_nota) {
                notasPorTipo[nota.tipo] = {
                  nota: nota.maior_nota,
                  valor: nota.valor
                };
              }
            });

            // Calcular média: soma das notas / soma dos valores
            const somaNotas = Object.values(notasPorTipo).reduce((acc, item) => acc + item.nota, 0);
            const somaValores = Object.values(notasPorTipo).reduce((acc, item) => acc + item.valor, 0);
            
            if (somaValores > 0) {
              mediasMateria[`media_${materia.nome.toLowerCase().replace(/\s+/g, '_')}`] = 
                Math.round((somaNotas / somaValores) * 100) / 100;
            }
          }
        }

        return {
          ...aluno,
          ...mediasMateria
        };
      })
    );

    // 4. Buscar nome da escola
    const [escolaRow] = await pool.query<any[]>('SELECT nome FROM escolas LIMIT 1');
    const nomeEscola = escolaRow[0]?.nome || 'Escola';

    // 5. Buscar taxa de presença por turma
    // const year = new Date().getFullYear();
    // const month = String(new Date().getMonth() + 1).padStart(2, '0');
    // const monthParam = `${year}-${month}`;

    // const [taxaPorTurmaRows] = await pool.query<any[]>(`
    //   SELECT 
    //     t.nome     AS turma,
    //     DATE_FORMAT(p.data, '%d') AS dia,
    //     ROUND(SUM(p.presenca) / COUNT(*) * 100, 2) AS percent
    //   FROM presencas p
    //   JOIN turmas t ON t.id = p.turma_id
    //   WHERE DATE_FORMAT(p.data, '%Y-%m') = ?
    //   GROUP BY p.turma_id, dia
    //   ORDER BY dia
    // `, [monthParam]);

    // só gera o gráfico de presença se veio filtro de mês
    let taxaPorTurmaRows: any[] = [];
    if (dateRange === 'this-month' && startDate) {
      // startDate = YYYY-MM-01
      const monthParam = startDate.slice(0,7);
      [taxaPorTurmaRows] = await pool.query<any[]>(`
        SELECT 
          t.nome     AS turma,
          DATE_FORMAT(p.data, '%d') AS dia,
          ROUND(SUM(p.presenca) / COUNT(*) * 100, 2) AS percent
        FROM presencas p
        JOIN turmas t ON t.id = p.turma_id
        WHERE DATE_FORMAT(p.data, '%Y-%m') = ?
          ${selectedClass !== 'all' ? 'AND t.nome = ?' : ''}
        GROUP BY p.turma_id, dia
        ORDER BY dia
      `, selectedClass !== 'all' ? [monthParam, selectedClass] : [monthParam]);
    }

    // 6. Calcular estatísticas gerais
    const materiasTabela = materiasRows.map(m => ({
      id: m.id,
      nome: m.nome,
      coluna: `media_${m.nome.toLowerCase().replace(/\s+/g, '_')}`
    }));

    // Filtrar matérias se uma específica foi selecionada
    const displayedMaterias = selectedSubject === 'all' 
      ? materiasTabela 
      : materiasTabela.filter(m => m.id.toString() === selectedSubject);

    // Calcular média geral
    let somaMediaGeral = 0;
    let qtdMediaGeral = 0;
    alunosComMedias.forEach(student => {
      materiasTabela.forEach(mat => {
        const val = student[mat.coluna];
        if (val != null) {
          somaMediaGeral += val * 100;
          qtdMediaGeral++;
        }
      });
    });
    const mediaGeralPercent = qtdMediaGeral > 0 ? `${(somaMediaGeral / qtdMediaGeral).toFixed(0)}%` : '—';

    // Calcular média de presença
    const presencasValidas = alunosComMedias
      .map(student => {
        const attendance = student.attendancePercent;
        const numericAttendance = typeof attendance === 'string' ? parseFloat(attendance) : attendance;
        return numericAttendance;
      })
      .filter((presenca): presenca is number => {
        return presenca != null && 
              !isNaN(presenca) && 
              isFinite(presenca) && 
              presenca > 0 &&
              presenca <= 100;
      });

    const mediaPresencaPercent = presencasValidas.length > 0 
      ? `${Math.round(presencasValidas.reduce((acc, presenca) => acc + presenca, 0) / presencasValidas.length)}%`
      : '—';

    // 7. Gerar PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${Date.now()}.pdf"`);
    
    // Pipe do PDF para a resposta
    doc.pipe(res);

    // Título do relatório
    doc.fontSize(20).text('Relatório de Desempenho Escolar', { align: 'center' });
    doc.fontSize(14).text(nomeEscola, { align: 'center' });
    doc.moveDown();

    // --- Blocos lado a lado ---
    const filtrosX = doc.page.margins.left;
    const estatisticasX = doc.page.width / 2 + 10; // Ajuste para seu layout
    const topY = doc.y;

    doc.fontSize(12).text('Filtros Aplicados:', filtrosX, topY, { underline: true });
    doc.fontSize(10);
    let currentY = doc.y;
    // if (startDate && endDate) {
    //   doc.text(`Período: ${startDate} até ${endDate}`, filtrosX);
    // } else {
    //   doc.text(`Período: ${dateRange}`, filtrosX);
    // }

    function dateRangeLabel(value: string) {
      const map: Record<string, string> = {
        'this-month': 'Mês',
        'bimestral': 'Bimestre',
        'trimestral': 'Trimestre',
        'semestral': 'Semestre',
        'year': 'Ano'
      };
      return map[value] || value;
    }

    doc.text(`Turma: ${selectedClass === 'all' ? 'Todas as turmas' : selectedClass}`, filtrosX, doc.y);
    doc.text(`Disciplina: ${selectedSubject === 'all' ? 'Todas as disciplinas' : materiasRows.find(m => m.id.toString() === selectedSubject)?.nome || 'N/A'}`, filtrosX, doc.y);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, filtrosX, doc.y);
    doc.text(`Período: ${dateRangeLabel(dateRange)}`, filtrosX, doc.y);
    if (subPeriod) {
      doc.text(`Subperíodo: ${subPeriod}`, filtrosX, doc.y);
    }

    // Pega a maior altura das informações de filtro
    const filtrosBottomY = doc.y;

    // Move para coluna 2 no topo do mesmo bloco
    doc.fontSize(12).text('Estatísticas Gerais', estatisticasX, topY, { underline: true });
    doc.fontSize(10);
    let estatY = doc.y;
    doc.text(`Média Geral: ${mediaGeralPercent}`, estatisticasX, estatY);
    doc.text(`Taxa de Presença: ${mediaPresencaPercent}`, estatisticasX, doc.y);

    // Vai para baixo do bloco (quem for mais baixo)
    const yAbaixoDosBlocos = Math.max(filtrosBottomY, doc.y) + 15;
    doc.y = yAbaixoDosBlocos;

    const estatisticasBottomY = doc.y;
    doc.x = doc.page.margins.left;
    doc.y = Math.max(filtrosBottomY, estatisticasBottomY) + 15;

    // Desempenho Acadêmico por Disciplina
    if (displayedMaterias.length > 0) {
      doc.fontSize(14).text('Desempenho Acadêmico por Disciplina', { underline: true });
      doc.fontSize(10);
      
      // Prepare data for Academic Performance Chart
      const academicPerformanceChartData = {
        labels: displayedMaterias.map(materia => materia.nome),
        datasets: [{
          label: 'Média por Disciplina',
          data: displayedMaterias.map(materia => {
            const notasValidas = alunosComMedias
              .map(student => student[materia.coluna])
              .filter(nota => nota != null && !isNaN(nota));
            return notasValidas.length > 0 ? (notasValidas.reduce((acc, nota) => acc + nota, 0) / notasValidas.length) * 100 : 0;
          }),
          backgroundColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
            '#EF4444', '#06B6D4', '#84CC16', '#F97316',
            '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
          ],
        }],
      };

      const academicPerformanceChartConfig = {
        type: 'bar'as const,
        data: academicPerformanceChartData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Desempenho Acadêmico por Disciplina' },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: { display: true, text: 'Porcentagem (%)' }
            }
          }
        },
      };

      const academicBuf = await generateChartImage(academicPerformanceChartConfig, 1200, 600);
      doc.image(academicBuf, { fit: [500, 300], align: 'center' });
      doc.moveDown();
    }

    // Taxa de Presença por Turma
    if (taxaPorTurmaRows.length > 0) {
      doc.fontSize(14).text('Taxa de Presença por Turma (Mês Atual)', { underline: true });
      doc.fontSize(10);
      
      const turmasUnicas = Array.from(new Set(taxaPorTurmaRows.map(r => r.turma)));
      const diasUnicos = Array.from(new Set(taxaPorTurmaRows.map(r => r.dia))).sort((a, b) => parseInt(a) - parseInt(b));

      const attendanceChartData = {
        labels: diasUnicos,
        datasets: turmasUnicas.map((turma, index) => ({
          label: turma,
          data: diasUnicos.map(dia => {
            const rec = taxaPorTurmaRows.find(r => r.dia === dia && r.turma === turma);
            return rec ? rec.percent : 0;
          }),
          borderColor: [
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
            '#EF4444', '#06B6D4', '#84CC16', '#F97316',
            '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
          ][index % 12],
          fill: false,
        })),
      };

      const attendanceChartConfig = {
        type: 'line' as const,
        data: attendanceChartData,
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' as const},
            title: { display: true, text: 'Taxa de Presença por Turma' },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: { display: true, text: 'Porcentagem (%)' }
            },
            x: {
              title: { display: true, text: 'Dia do Mês' }
            }
          }
        },
      };

      const attendanceBuf = await generateChartImage(attendanceChartConfig, 1200, 600);
      doc.image(attendanceBuf, { fit: [500, 300], align: 'center' });
      doc.moveDown();
    }

    // Desempenho Detalhado dos Alunos
    doc.addPage({ layout: 'landscape' }); // Mudar para orientação paisagem
    doc.fontSize(14).text('Desempenho Detalhado dos Alunos', { underline: true });
    doc.moveDown();

    doc.page.margins.left = 30;
    doc.page.margins.right = 30;

    let yPosition = doc.y;
    const startX = doc.page.margins.left;
    const endX = doc.page.width - doc.page.margins.right;
    const usableWidth = endX - startX;

    // Definir larguras das colunas dinamicamente
    const baseColumns = ['Nome', 'Turma', 'Presença'];
    const dynamicColumns = displayedMaterias.map(m => m.nome);
    const nameColWidth = Math.max(130, usableWidth - 50 - 50 - (dynamicColumns.length * 45)); // Ajustável
    const classColWidth = 50;
    const attendanceColWidth = 50;
    const subjectColWidth = 45; // Matérias mais estreitas
    const dynamicColWidth = subjectColWidth;

    const colPositions: { [key: string]: number } = {};
    let currentX = startX;
    let headerEndY = yPosition;
    doc.fontSize(8).font('Helvetica-Bold');

    // Renderizar cabeçalhos
    doc.text('Nome', currentX, yPosition, { width: nameColWidth, align: 'left' });
    if (doc.y > headerEndY) headerEndY = doc.y;
    currentX += nameColWidth;

    doc.text('Turma', currentX, yPosition, { width: classColWidth, align: 'left' });
    if (doc.y > headerEndY) headerEndY = doc.y;
    currentX += classColWidth;

    doc.text('Presença', currentX, yPosition, { width: attendanceColWidth, align: 'left' });
    if (doc.y > headerEndY) headerEndY = doc.y;
    currentX += attendanceColWidth;

    dynamicColumns.forEach(colName => {
      doc.text(colName, currentX, yPosition, { width: dynamicColWidth, align: 'left' });
      if (doc.y > headerEndY) headerEndY = doc.y;
      currentX += dynamicColWidth;
    });

    // doc.font('Helvetica');
    // yPosition += 15; // Espaço após o cabeçalho

    // Desenhar linha abaixo do cabeçalho
    doc.lineWidth(0.5);
    doc.moveTo(startX, headerEndY + 2).lineTo(endX, headerEndY + 2).stroke();
    yPosition = headerEndY + 7;
    doc.font('Helvetica');

    // Ordenar por nome
    alunosComMedias.sort((a, b) => a.name.localeCompare(b.name));

    // Dados dos alunos
    alunosComMedias.forEach(aluno => {
      if (yPosition + 20 > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ layout: 'landscape' });
        doc.page.margins.left = 30;
        doc.page.margins.right = 30;
        yPosition = doc.y;

        // Repetir cabeçalho na nova página
        let repeatX = startX;
        let repeatHeaderEndY = yPosition;
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Nome', repeatX, yPosition, { width: nameColWidth, align: 'left' });
        if (doc.y > repeatHeaderEndY) repeatHeaderEndY = doc.y;
        repeatX += nameColWidth;
        doc.text('Turma', repeatX, yPosition, { width: classColWidth, align: 'left' });
        if (doc.y > repeatHeaderEndY) repeatHeaderEndY = doc.y;
        repeatX += classColWidth;
        doc.text('Presença', repeatX, yPosition, { width: attendanceColWidth, align: 'left' });
        if (doc.y > repeatHeaderEndY) repeatHeaderEndY = doc.y;
        repeatX += attendanceColWidth;
        dynamicColumns.forEach(colName => {
          doc.text(colName, repeatX, yPosition, { width: dynamicColWidth, align: 'left' });
          if (doc.y > repeatHeaderEndY) repeatHeaderEndY = doc.y;
          repeatX += dynamicColWidth;
        });
        doc.lineWidth(0.5);
        doc.moveTo(startX, repeatHeaderEndY + 2).lineTo(endX, repeatHeaderEndY + 2).stroke();
        yPosition = repeatHeaderEndY + 7;
        doc.font('Helvetica');
      }

      currentX = startX;
      doc.fontSize(8);

      // Nome do aluno com quebra de linha automática
      const nomeYInicio = yPosition;
      doc.text(aluno.name, currentX, yPosition, { width: nameColWidth, align: 'left', lineGap: 0 });
      const nomeYFinal = doc.y;

      // Outras colunas na mesma linha Y de início
      currentX += nameColWidth;
      doc.text(aluno.class, currentX, nomeYInicio, { width: classColWidth, align: 'left' });
      currentX += classColWidth;
      doc.text(`${aluno.attendancePercent}%`, currentX, nomeYInicio, { width: attendanceColWidth, align: 'left' });
      currentX += attendanceColWidth;

      displayedMaterias.forEach(materia => {
        const media = aluno[materia.coluna];
        const mediaText = media != null ? `${(media * 100).toFixed(0)}%` : '—';
        doc.text(mediaText, currentX, nomeYInicio, { width: dynamicColWidth, align: 'left' });
        currentX += dynamicColWidth;
      });

      // Avança Y para a próxima linha (considerando o nome quebrado em várias linhas)
      yPosition = Math.max(nomeYFinal, nomeYInicio + 12);
    });

    // Finalizar o PDF
    doc.end();

  } catch (error) {
    console.error('Erro ao gerar relatório PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório PDF' });
  }
};

const defaultBackground = 'white';

export function makeChartRenderer(width: number, height: number) {
  return new ChartJSNodeCanvas({
    width,
    height,
    backgroundColour: defaultBackground,
    chartCallback: (ChartJS) => {
      // caso queira registrar plugins, fontes etc
    }
  });
}

export async function generateChartImage(
  chartConfig: ChartConfiguration, 
  width: number, 
  height: number
): Promise<Buffer> {
  const renderer = makeChartRenderer(width, height);
  return await renderer.renderToBuffer(chartConfig);
}


export const getCalendarioGestor = async (req: Request, res: Response) => {
  try {
    const anoAtual = new Date().getFullYear();
    
    // Consulta para contar quantas linhas existem para o ano atual
    const [rows] = await pool.query<any[]>(`
      SELECT periodo, tipo, data_inicial, data_final, ano_letivo
      FROM calendario_gestor
      WHERE ano_letivo = ?
    `, [anoAtual]);
    const tipos = rows.map(row => row.tipo);
    // const uniqueTipos = [...new Set(tipos)];
    const uniqueTipos = [...new Set(tipos.map(t => t.toLowerCase()))];
    // Determinar o tipo de ano escolar
    let anoEscolar = '';
    if (uniqueTipos.length === 4) {
      anoEscolar = 'bimestral';
    } else if (uniqueTipos.length === 3) {
      anoEscolar = 'trimestral';
    } else if (uniqueTipos.length === 2) {
      anoEscolar = 'semestral';
    }
    res.json({ tipos: uniqueTipos, anoEscolar, dados: rows });
  } catch (error) {
    console.error('Erro ao buscar calendário gestor:', error);
    res.status(500).json({ error: 'Erro ao buscar calendário gestor' });
  }
};