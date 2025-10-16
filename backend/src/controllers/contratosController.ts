// controllers/contratosController.ts
import { Request, Response } from 'express';
import db from '../config/db'; // Conexão com o banco de dados
import { RowDataPacket} from 'mysql2';
import pool from '../config/db'; // seu pool MySQL

// ──────────────────────────────────────────────────────────────────────────────
// MOVIMENTAÇÕES PADRÃO NA TABELA 'CONTRATOS'
// ──────────────────────────────────────────────────────────────────────────────

// POST /api/contratos
export const createContrato = async (req: Request, res: Response) => {
  const { nome, tipo, conteudo, campos, numeroContrato } = req.body;

  if (!nome || !tipo || !conteudo || !campos || !numeroContrato) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const query = `
    INSERT INTO contratos (nome, tipo, conteudo, campos, numero_contrato, criado_em, atualizado_em)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const camposJson = JSON.stringify(campos);

  try {
    const [results]: any = await db.query(query, [nome, tipo, conteudo, camposJson, numeroContrato]);
    res.status(201).json({
      id: results.insertId,
      nome,
      tipo,
      conteudo,
      campos: camposJson,
      numeroContrato, 
      criado_em: new Date(),
      atualizado_em: new Date(),
    });
  } catch (err) {
    console.error('Erro ao criar contrato:', err);
    return res.status(500).json({ error: 'Erro ao criar contrato' });
  }
};



// GET /api/contratos
export const getContratos = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM contratos ORDER BY criado_em DESC');

    // Formatar e parsear o campo campos
    const data = rows.map((row: any) => ({
      id: row.id.toString(), // para garantir que seja string
      nome: row.nome,
      tipo: row.tipo,
      conteudo: row.conteudo,
      campos: JSON.parse(row.campos),
      numeroContrato: row.numero_contrato, // Incluindo o campo numero_contrato
      criadoEm: row.criado_em ? new Date(row.criado_em) : new Date(),
      atualizadoEm: row.atualizado_em ? new Date(row.atualizado_em) : new Date(),
    }));

    res.json(data);

  } catch (err) {
    console.error('Erro ao buscar contratos:', err);
    res.status(500).json({ error: 'Erro ao buscar contratos' });
  }
};


// Atualizar contrato existente (PUT /api/contratos/:id)
export const updateContrato = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nome, tipo, conteudo, campos, numeroContrato } = req.body; // Incluindo numeroContrato

  if (!id || !nome || !tipo || !conteudo || !campos || !numeroContrato) { // Verificando se numeroContrato foi enviado
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const query = `
    UPDATE contratos
    SET nome = ?, tipo = ?, conteudo = ?, campos = ?, numero_contrato = ?, atualizado_em = NOW()
    WHERE id = ?
  `;

  const camposJson = JSON.stringify(campos);

  try {
    const [result]: any = await db.query(query, [nome, tipo, conteudo, camposJson, numeroContrato, id]); // Incluindo numeroContrato na query
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }
    res.json({ message: 'Contrato atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar contrato:', err);
    res.status(500).json({ error: 'Erro ao atualizar contrato' });
  }
};


// Deletar contrato (DELETE /api/contratos/:id)
export const deleteContrato = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID do contrato é obrigatório" });
  }

  try {
    const query = `DELETE FROM contratos WHERE id = ?`;
    const [result]: any = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contrato não encontrado" });
    }

    res.json({ message: "Contrato excluído com sucesso" });
  } catch (err) {
    console.error('Erro ao deletar contrato:', err);
    res.status(500).json({ error: "Erro ao deletar contrato" });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// MOVIMENTAÇÕES PADRÃO NA TABELA 'CONTRATOS_PREENCHIDOS'
// ──────────────────────────────────────────────────────────────────────────────

// export const createContratoPreenchido = async (req: Request, res: Response) => {
//   const { contrato_id, aluno_id, dados_preenchidos, contrato_url, situacao_contrato } = req.body;

//   if (!contrato_id || !dados_preenchidos || !aluno_id || !situacao_contrato) {
//     return res.status(400).json({ error: "Campos obrigatórios faltando" });
//   }

//   const query = `
//     INSERT INTO contratos_preenchidos (contrato_id, aluno_id, dados_preenchidos, contrato_url, situacao_contrato, criado_em, atualizado_em)
//     VALUES (?, ?, ?, ?, ?, NOW(), NOW());
//   `;

//   try {
//     const dadosJson = JSON.stringify(dados_preenchidos);
//     const [result]: any = await db.query(query, [contrato_id, aluno_id, dadosJson, contrato_url, situacao_contrato]);
//     res.status(201).json({ id: result.insertId, message: "Contrato preenchido criado" });
//   } catch (error) {
//     console.error("Erro criando contrato preenchido:", error);
//     res.status(500).json({ error: "Erro interno" });
//   }
// };

export const createContratoPreenchido = async (req: Request, res: Response) => {
  const { contrato_id, aluno_id, dados_preenchidos, contrato_url, situacao_contrato } = req.body;

  if (!contrato_id || !dados_preenchidos || !aluno_id || !situacao_contrato) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }

  // Buscar tipo do contrato
  try {
    const [contratos]: any = await pool.query('SELECT tipo FROM contratos WHERE id = ?', [contrato_id]);

    if (contratos.length === 0) {
      return res.status(400).json({ error: 'Contrato não encontrado' });
    }

    const tipoContrato: string = contratos[0].tipo;

    // Salvar contrato preenchido
    const queryInsert = `
      INSERT INTO contratos_preenchidos (contrato_id, aluno_id, dados_preenchidos, contrato_url, situacao_contrato, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const dadosJson = JSON.stringify(dados_preenchidos);

    const [result]: any = await pool.execute(queryInsert, [
      contrato_id,
      aluno_id,
      dadosJson,
      contrato_url,
      situacao_contrato,
    ]);

    // Caso seja contrato de matrícula, criar mensalidade
    if (tipoContrato === 'Contrato de Matrícula') {
      // Extrair os campos relevantes de dados_preenchidos
      const formatarDataPadrao = (dataMes: string): string => {
        // Espera valor no formato 'YYYY-MM' e retorna 'YYYY-MM-01'
        if (!dataMes || typeof dataMes !== 'string') return '';
        const [ano, mes] = dataMes.split('-');
        if (!ano || !mes) return '';
        return `${ano}-${mes}-01`;
      };

      const valorMatriculaRaw = dados_preenchidos['{{valor_matricula}}'] || '0';
      const dataPrimeiraMensalidadeRaw = dados_preenchidos['{{data_primeira_mensalidade}}'] || '';

      const valorMatricula = valorMatriculaRaw.replace(/\./g, '').replace(',', '.') || '0'; // Converter para padrão float, ex: '1.500,50' → '1500.50'
      const dataPrimeiraMensalidade = formatarDataPadrao(dataPrimeiraMensalidadeRaw);

      // Inserir mensalidade
      if (dataPrimeiraMensalidade) {
        await criarMensalidade({
          aluno_id: Number(aluno_id),
          valor: valorMatricula,
          data_inicial: dataPrimeiraMensalidade,
        });
      }
    }

    res.status(201).json({ id: result.insertId, message: "Contrato preenchido criado" });

  } catch (error) {
    console.error("Erro ao criar contrato preenchido:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};


export const getContratosPreenchidos = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(`
    SELECT cp.*,c.nome AS nome_contrato, c.numero_contrato, a.nome AS aluno_nome, a.status AS aluno_status, a.cpf AS aluno_cpf, a.serie AS aluno_serie, a.turma AS aluno_turma,
          m.valor AS mensalidade_valor, m.data_inicial AS mensalidade_data_inicial
    FROM contratos_preenchidos cp
    LEFT JOIN contratos c ON c.id = cp.contrato_id
    LEFT JOIN alunos a ON a.id = cp.aluno_id
    LEFT JOIN (
    SELECT aluno_id, valor, data_inicial
    FROM mensalidades
    WHERE (aluno_id, data_inicial) IN (
      SELECT aluno_id, MAX(data_inicial) 
      FROM mensalidades
      GROUP BY aluno_id
    )
  ) m ON m.aluno_id = cp.aluno_id
    ORDER BY cp.criado_em DESC
    `);

    const data = rows.map((row: any) => ({
      ...row,
      dados_preenchidos: row.dados_preenchidos ? JSON.parse(row.dados_preenchidos) : {},
      situacao_contrato: row.situacao_contrato || 'Vigente',
      mensalidade_valor: row.mensalidade_valor ?? null,
      mensalidade_data_inicial: row.mensalidade_data_inicial ?? null,
    }));

    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar contratos preenchidos', err);
    res.status(500).json({ error: "Erro ao buscar contratos preenchidos" });
  }
};



export const updateContratoPreenchido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { aluno_id, dados_preenchidos, contrato_url, situacao_contrato } = req.body;

  if (!id || !dados_preenchidos || !aluno_id || !situacao_contrato) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const dadosJson = JSON.stringify(dados_preenchidos);
    const [result]: any = await db.query(
      `UPDATE contratos_preenchidos SET aluno_id = ?, dados_preenchidos = ?, contrato_url = ?, situacao_contrato = ?, atualizado_em = NOW() WHERE id = ?`,
      [aluno_id, dadosJson, contrato_url, situacao_contrato, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contrato preenchido não encontrado" });
    }

    res.json({ message: "Atualizado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar contrato preenchido" });
  }
};


export const deleteContratoPreenchido = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID do contrato preenchido é obrigatório" });
  }

  try {
    const query = `DELETE FROM contratos_preenchidos WHERE id = ?`;
    const [result]: any = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contrato preenchido não encontrado" });
    }

    res.json({ message: "Contrato preenchido excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar contrato preenchido:", err);
    res.status(500).json({ error: "Erro ao deletar contrato preenchido" });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// RELAÇÃO ENTRE A TABELA 'CONTRATOS' E A TABELA 'CONTRATOS_PREENCHIDOS'
// ──────────────────────────────────────────────────────────────────────────────

export const previewContratoPreenchido = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await db.query(`
      SELECT cp.dados_preenchidos, c.conteudo, c.campos
      FROM contratos_preenchidos cp
      JOIN contratos c ON c.id = cp.contrato_id
      WHERE cp.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Contrato preenchido não encontrado" });
    }

    // Parsear JSON dos dados preenchidos e campos
    const { dados_preenchidos, conteudo, campos } = rows[0];
    const dados = dados_preenchidos ? JSON.parse(dados_preenchidos) : {};

    res.json({ conteudo, campos, dados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar preview do contrato" });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// BUSCAR TODAS AS TRANSAÇÕES DO ALUNO ESPECIFICADO
// ──────────────────────────────────────────────────────────────────────────────

export const getTransacoesPorAluno = async (req: Request, res: Response) => {
  const alunoId = parseInt(req.params.alunoId, 10);
  const { ano, status } = req.query;

  if (!alunoId) {
    return res.status(400).json({ error: "ID do aluno é obrigatório" });
  }

  try {
    // Note que aqui use 'id_pessoa' no WHERE
    let query = `SELECT id, descricao AS referencia, valor AS valor_original, desconto_percentual, valor_com_desconto, data_vencimento, status, data_pagamento, forma_pagamento, comprovante_url, observacao
                 FROM transacoes
                 WHERE id_pessoa = ?`;
    const params: any[] = [alunoId];

    if (ano) {
      query += ` AND YEAR(data_vencimento) = ?`;
      params.push(ano);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY data_vencimento DESC`;

    const [rows]: any = await db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar transações do aluno:", err);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// ENVIAR ARQUIVO PARA CONTRATOS_PREENNCHIDOS -> CONTRATO_URL
// PUT  /api/contratos_preenchidos/:id/upload-contrato
// ──────────────────────────────────────────────────────────────────────────────

interface AtualizarContratoArgs {
  id: string;
  filename: string | null;
}

export const atualizarContratoAssinado = async ({ id, filename }: AtualizarContratoArgs) => {
  if (!filename) {
    throw new Error('Arquivo deve ser fornecido para atualizar o contrato assinado.');
  }

  // Opcional: validar se o contrato existe (pode omitir se confiar)
  const [rows]: any = await pool.query(
    `SELECT id FROM contratos_preenchidos WHERE id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new Error('Contrato preenchido não encontrado.');
  }

  // Atualizar o campo contrato_url com a url do arquivo na pasta /uploads/contratos/
  await pool.execute(
    `UPDATE contratos_preenchidos
     SET contrato_url = ?
     WHERE id = ?`,
    [`/uploads/contratos/${filename}`, id]
  );
};

export const enviarArquivoContratoPreenchido = async (req: Request, res: Response) => {
  const contratoId = req.params.id;
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo é obrigatório.' });
  }

  try {
    await atualizarContratoAssinado({ id: contratoId, filename: req.file.filename });
    res.status(200).json({ mensagem: 'Contrato assinado atualizado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar contrato assinado.' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// ENVIAR OS VALORES PARA MENSALIDADES E VALORES AVULSOS
// PUT  /api/contratos_preenchidos/:id/upload-contrato
// ──────────────────────────────────────────────────────────────────────────────

async function criarMensalidade(args: {
  aluno_id: number;
  valor: string; // valor monetário no formato string, e.g. '1500.50'
  data_inicial: string; // data no formato 'YYYY-MM-DD' esperado pelo banco
  }) {
  const { aluno_id, valor, data_inicial } = args;

  const query = `
    INSERT INTO mensalidades (aluno_id, valor, data_inicial)
    VALUES (?, ?, ?)
  `;

  await pool.execute(query, [aluno_id, valor, data_inicial]);
}

