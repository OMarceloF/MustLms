import pool from '../config/db';
import { RowDataPacket } from 'mysql2/promise';

// Funções SQL montadas individualmente

export const getResponsaveis = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT 
    f.id,
    f.nome 
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    u.status = 'ativo'
ORDER BY 
    f.nome;
  `
  );
return rows;
};

export const getTurmas = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, nome FROM turmas ORDER BY nome'
  );
  return rows;
};

export const getTransacoes = async (query: any) => {
  const {
    inicio = '2000-01-01',
    fim = '2100-12-31',
    categoria,
    tipo,
    forma_pagamento,
    responsavel,
    status,
  } = query;

  let sql = 'SELECT * FROM transacoes WHERE data_referencia BETWEEN ? AND ?';
  const params: any[] = [inicio, fim];

  if (categoria && categoria.trim() !== "") { sql += ' AND categoria = ?'; params.push(categoria); }
  if (tipo && tipo.trim() !== "") { sql += ' AND tipo = ?'; params.push(tipo); }
  if (forma_pagamento && forma_pagamento.trim() !== "") { sql += ' AND forma_pagamento = ?'; params.push(forma_pagamento); }
  if (responsavel && responsavel.trim() !== "") { sql += ' AND responsavel = ?'; params.push(responsavel); }
  if (status && status.trim() !== "") { sql += ' AND status = ?'; params.push(status); }

  sql += ' ORDER BY id DESC';

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows;
};

export const criarTransacao = async (body: any, filename: string | null) => {
  const {
    descricao,
    valor_com_desconto,
    tipo,
    categoria,
    data_referencia,
    data_pagamento,
    observacao,
    forma_pagamento,
    responsavel,
  } = body;

  const comprovanteUrl = filename ? `/uploads/comprovantes/${filename}` : null;

  await pool.execute(
    `INSERT INTO transacoes
       (descricao, valor, desconto_percentual, valor_com_desconto, tipo, categoria,
        data_referencia, data_pagamento, observacao, forma_pagamento, responsavel, status, comprovante_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      descricao,
      valor_com_desconto,
      '0',
      valor_com_desconto,
      tipo,
      categoria,
      data_referencia,
      data_pagamento,
      observacao,
      forma_pagamento,
      responsavel,
      'pago',
      comprovanteUrl,
    ]
  );
};

export const getMensalidadesAluno = async (alunoId: string) => {
  const [rows] = await pool.execute(
    `SELECT * FROM mensalidades WHERE aluno_id = ? ORDER BY id DESC`,
    [alunoId]
  );
  return rows;
};

export const pagarMensalidade = async (id: string, body: any, filename: string | null) => {
  const { valor_pago, data_pagamento, forma_pagamento } = body;

  // Checa se já está paga para evitar duplicidade
  const [rows]: any = await pool.query(
    `SELECT status FROM mensalidades WHERE id = ?`,
    [id]
  );
  if (rows.length && rows[0].status === 'pago') {
    throw new Error('Mensalidade já está paga.');
  }

  await pool.execute(
    `UPDATE mensalidades
     SET status = 'pago', data_pagamento = ?, forma_pagamento = ?
     WHERE id = ?`,
    [data_pagamento, forma_pagamento, id]
  );
  await pool.execute(
    `INSERT INTO pagamentos (mensalidade_id, valor_pago, data_pagamento, comprovante_url)
     VALUES (?, ?, ?, ?)`,
    [
      id,
      valor_pago,
      data_pagamento,
      filename ? `/uploads/comprovantes/${filename}` : null,
    ]
  );
};

export const getMensalidades = async () => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT aluno_id, valor, data_inicial FROM mensalidades`
  );
  return rows;
};

export const getDescontosByAluno = async (alunoId: string) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, aluno_id, descricao, percentual, data_inicio, data_fim
     FROM descontos
     WHERE aluno_id = ?`,
    [alunoId]
  );
  return rows;
};

export const pagarTransacao = async (id: string, body: any, filename: string | null) => {
  const { data_pagamento, observacao, forma_pagamento } = body;
  const comprovanteUrl = filename ? `/uploads/comprovantes/${filename}` : null;
  await pool.execute(
    `UPDATE transacoes
       SET status = 'pago',
           data_pagamento = ?,
           observacao = ?,
           forma_pagamento = ?,
           comprovante_url = ?
     WHERE id = ?`,
    [
      data_pagamento,
      observacao,
      forma_pagamento,
      comprovanteUrl,
      id,
    ]
  );
};

export const exportarCSV = async (query: any) => {
  const {
    inicio = '2000-01-01',
    fim = '2100-12-31',
    categoria,
    tipo,
    forma_pagamento,
    responsavel,
    status,
  } = query;

  let sql = 'SELECT * FROM transacoes WHERE data_referencia BETWEEN ? AND ?';
  const params: any[] = [inicio, fim];

  if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
  if (tipo) { sql += ' AND tipo = ?'; params.push(tipo); }
  if (forma_pagamento) { sql += ' AND forma_pagamento = ?'; params.push(forma_pagamento); }
  if (responsavel) { sql += ' AND responsavel = ?'; params.push(responsavel); }
  if (status) { sql += ' AND status = ?'; params.push(status); }

  sql += ' ORDER BY id DESC';

  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows;
};

export const lancamentoDeMensalidades = async (force: boolean = false) => {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();
  const dataReferencia = `${ano}-${String(mes).padStart(2, '0')}-01`;

  if (!force && dia !== 1) {
    console.log('[Lancamento_de_Mensalidades] Não é dia 01. Abortando.');
    return;
  }

  const dataVencimentoObj = new Date(ano, hoje.getMonth(), 1);
  dataVencimentoObj.setDate(11);
  const dataVencimento = `${dataVencimentoObj.getFullYear()}-${String(
    dataVencimentoObj.getMonth() + 1
  ).padStart(2, '0')}-${String(dataVencimentoObj.getDate()).padStart(2, '0')}`;

  try {
    const [mensalidades]: any = await pool.query(
      `SELECT m.aluno_id, m.valor, m.data_inicial, u.nome 
       FROM mensalidades AS m
       INNER JOIN users AS u ON u.id = m.aluno_id
       WHERE m.data_inicial <= ?`,
      [dataReferencia]
    );

    for (const ms of mensalidades as Array<{ aluno_id: number; valor: string; data_inicial: string; nome: string; }>) {
      const alunoId = ms.aluno_id;
      const valorOriginal = parseFloat(ms.valor);

      const [existing]: any = await pool.query(
        `SELECT COUNT(*) AS count
         FROM transacoes
         WHERE id_pessoa = ?
           AND categoria = 'mensalidades'
           AND YEAR(data_referencia) = ?
           AND MONTH(data_referencia) = ?`,
        [alunoId, ano, mes]
      );
      if ((existing[0].count as number) > 0) continue;

      const [descontoRows]: any = await pool.query(
        `SELECT percentual
         FROM descontos
         WHERE aluno_id = ?
           AND data_inicio <= ?
           AND data_fim >= ?
         ORDER BY id DESC
         LIMIT 1`,
        [alunoId, dataReferencia, dataReferencia]
      );
      let percentualDesconto = 0.0;
      if (descontoRows.length > 0) {
        percentualDesconto = parseFloat(descontoRows[0].percentual);
      }
      const valorComDesconto = parseFloat(
        (valorOriginal * (1 - percentualDesconto / 100)).toFixed(2)
      );

      await pool.execute(
        `INSERT INTO transacoes
          (descricao, id_pessoa, valor, desconto_percentual, valor_com_desconto, tipo, categoria,
           data_referencia, data_vencimento, responsavel, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `Mensalidade - ${ms.nome}`,
          alunoId,
          valorOriginal.toFixed(2),
          percentualDesconto.toFixed(2),
          valorComDesconto.toFixed(2),
          'receita',
          'mensalidades',
          dataReferencia,
          dataVencimento,
          'sistema',
          'aguardando',
        ]
      );
      console.log(
        `[Lancamento_de_Mensalidades] Lançado para aluno_id=${alunoId} | valor=${valorOriginal.toFixed(2)} | desconto=${percentualDesconto.toFixed(2)}% | valor_com_desconto=${valorComDesconto.toFixed(2)}`
      );
    }
    console.log('[Lancamento_de_Mensalidades] Concluído.');
  } catch (err) {
    console.error('[Lancamento_de_Mensalidades] Erro:', err);
    throw err;
  }
};

export const atualizarStatusAtrasados = async () => {
  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0]; // formato YYYY-MM-DD

  try {
    const [result]: any = await pool.query(
      `UPDATE transacoes
       SET status = 'atrasado'
       WHERE data_vencimento < ?
         AND status <> 'atrasado'
         AND status <> 'pago'`
      ,
      [hojeStr]
    );

    console.log(`[Atualizar_Status_Atrasados] Transações atualizadas para 'atrasado': ${result.affectedRows}`);
  } catch (err) {
    console.error('[Atualizar_Status_Atrasados] Erro ao atualizar status atrasado:', err);
    throw err;
  }
};


export const lancamentoDePagamentos = async (force: boolean = false) => {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;
  const ano = hoje.getFullYear();
  const dataReferencia = `${ano}-${String(mes).padStart(2, '0')}-01`;

  if (!force && dia !== 1) {
    console.log('[Lancamento_de_Pagamentos] Não é dia 01. Abortando.');
    return;
  }

  const dataVencimentoObj = new Date(ano, hoje.getMonth(), 1);
  dataVencimentoObj.setDate(11);
  const dataVencimento = `${dataVencimentoObj.getFullYear()}-${String(
    dataVencimentoObj.getMonth() + 1
  ).padStart(2, '0')}-${String(dataVencimentoObj.getDate()).padStart(2, '0')}`;

  try {
    const [pagamentos]: any = await pool.query(
      `SELECT pf.funcionario_id, pf.valor, pf.data_inicial, f.nome 
       FROM pagamentos_funcionarios AS pf
       INNER JOIN funcionarios AS f ON f.id = pf.funcionario_id
       WHERE pf.data_inicial <= ?`,
      [dataReferencia]
    );

    for (const pg of pagamentos as Array<{ funcionario_id: number; valor: string; data_inicial: string; nome: string; }>) {
      const funcionarioId = pg.funcionario_id;
      const valorOriginal = parseFloat(pg.valor);

      const [existing]: any = await pool.query(
        `SELECT COUNT(*) AS count
           FROM transacoes
          WHERE id_pessoa = ?
            AND categoria = 'salarios dos funcionarios'
            AND YEAR(data_referencia) = ?
            AND MONTH(data_referencia) = ?`,
        [funcionarioId, ano, mes]
      );
      if ((existing[0].count as number) > 0) continue;

      const descontoPercentual = 0.0;
      const valorComDesconto = valorOriginal;

      await pool.execute(
        `INSERT INTO transacoes
           (descricao, id_pessoa, valor, desconto_percentual, valor_com_desconto, tipo, categoria,
            data_referencia, data_vencimento, responsavel, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `Pagamento de Salário - ${pg.nome}`,
          funcionarioId,
          valorOriginal.toFixed(2),
          descontoPercentual.toFixed(2),
          valorComDesconto.toFixed(2),
          'despesa',
          'salarios dos funcionarios',
          dataReferencia,
          dataVencimento,
          'sistema',
          'aguardando',
        ]
      );
      console.log(
        `[Lancamento_de_Pagamentos] Lançado para funcionario_id=${funcionarioId} | valor=${valorOriginal.toFixed(2)}`
      );
    }
    console.log('[Lancamento_de_Pagamentos] Concluído.');
  } catch (err) {
    console.error('[Lancamento_de_Pagamentos] Erro:', err);
    throw err;
  }
};