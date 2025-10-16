import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import * as FinanceiroModel from '../models/financeiro';
import { error } from 'console';

// ──────────────────────────────────────────────────────────────────────────────
// BUSCAR RESPONSÁVEIS (ex.: professores, funcionários que podem lançar transações)
// GET /api/financeiro/responsaveis
// ──────────────────────────────────────────────────────────────────────────────
export const getResponsaveis = async (_req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getResponsaveis();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar responsáveis:', err);
    res.status(500).json({ error: 'Erro ao buscar responsáveis' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// BUSCAR TURMAS PARA FILTRO (ex.: colunas “Turma” no front-end)
// GET /api/financeiro/turmas
// ──────────────────────────────────────────────────────────────────────────────
export const getTurmasFinanceiro = async (_req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getTurmas();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar turmas:', err);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// Criar transação manual (POST /api/financeiro/transacoes)
// Envia campos:
//   descricao, id_pessoa, valor, desconto_percentual, valor_com_desconto,
//   tipo, categoria, data_referencia, data_vencimento, responsavel, status
// Se anexar “comprovante”, o multer (rotas) já armazena em uploads/ e passa o filename.
// ──────────────────────────────────────────────────────────────────────────────

export const criarTransacao = async (req: Request, res: Response) => {
  try {
    const filename = req.file?.filename ?? null;
    await FinanceiroModel.criarTransacao(req.body, filename);
    return res.status(201).json({ message: 'Transação criada com sucesso' });
  } catch (err) {
    console.error('Erro ao criar transação:', err);
    return res.status(500).json({ error: 'Erro ao criar transação' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/financeiro/mensalidades/:alunoId
// Retorna todas as mensalidades (tabela mensalidades) de um aluno
// ──────────────────────────────────────────────────────────────────────────────
export const getMensalidadesAluno = async (req: Request, res: Response) => {
  try {
    console.log('alunoId recebido:', req.params.alunoId);
    const rows = await FinanceiroModel.getMensalidadesAluno(req.params.alunoId);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar mensalidades:', err);
    res.status(500).json({ error: 'Erro ao buscar mensalidades', details: error });
  }
};

export const getTransacoes = async (req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getTransacoes(req.query);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar transações:', err);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};
// ──────────────────────────────────────────────────────────────────────────────
// PUT /api/financeiro/mensalidades/:id/pagar
// Marca mensalidade como paga, atualiza status e insere na tabela pagamentos
// ──────────────────────────────────────────────────────────────────────────────
export const pagarMensalidade = async (req: Request, res: Response) => {
  try {
    const filename = req.file?.filename ?? null;
    await FinanceiroModel.pagarMensalidade(req.params.id, req.body, filename);
    res.json({ message: 'Mensalidade atualizada e pagamento registrado' });
  } catch (err) {
    console.error('Erro ao registrar pagamento:', err);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/financeiro/mensalidades
// Retorna todas as mensalidades ativas (data_inicial ≤ hoje)
// ──────────────────────────────────────────────────────────────────────────────
export const getMensalidades = async (_req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getMensalidades();
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar mensalidades:', err);
    res.status(500).json({ error: 'Erro ao buscar mensalidades' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/financeiro/descontos/:alunoId
// Retorna todos os descontos ativos daquele aluno
// ──────────────────────────────────────────────────────────────────────────────
export const getDescontosByAluno = async (req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getDescontosByAluno(req.params.alunoId);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar descontos:', err);
    res.status(500).json({ error: 'Erro ao buscar descontos' });
  }
};
export const lancamentoDeMensalidades = async (force: boolean = false) => {
  try {
    await FinanceiroModel.lancamentoDeMensalidades(force);
  } catch (err) {
    console.error('[Lancamento_de_Mensalidades] Erro:', err);
  }
};

export const lancamentoDePagamentos = async (force: boolean = false) => {
  try {
    await FinanceiroModel.lancamentoDePagamentos(force);
  } catch (err) {
    console.error('[Lancamento_de_Pagamentos] Erro:', err);
  }
};

export const atualizarLancamentos = async (_req: Request, res: Response) => {
  try {
    await FinanceiroModel.lancamentoDeMensalidades(true);
    await FinanceiroModel.lancamentoDePagamentos(true);
    return res.json({ message: 'Lançamentos de mensalidades e pagamentos verificados/com sucesso.' });
  } catch (err) {
    console.error('[AtualizarLancamentos] Erro ao forçar lançamentos:', err);
    return res.status(500).json({ error: 'Falha ao atualizar lançamentos.' });
  }
};
// financeiroController.ts
export const pagarTransacao = async (req: Request, res: Response) => {
  try {
    const filename = req.file?.filename ?? null;
    await FinanceiroModel.pagarTransacao(req.params.id, req.body, filename);
    return res.json({ message: 'Pagamento registrado com sucesso' });
  } catch (err) {
    console.error('Erro ao registrar pagamento da transação:', err);
    return res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTAR PARA PDF (todas as transações atuais, conforme tabela “transacoes”)
// GET /api/financeiro/exportar/pdf
// ──────────────────────────────────────────────────────────────────────────────

// 1) Declare as chaves que realmente vão aparecer na sua tabela:
type ColumnKey =
  | 'data_referencia'
  | 'descricao'
  | 'valor'
  | 'desconto_percentual'
  | 'valor_com_desconto'
  | 'tipo'
  | 'categoria'
  | 'data_vencimento'
  | 'data_pagamento'
  | 'status'
  | 'forma_pagamento'
  | 'responsavel';

export const exportarPDF = async (req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getTransacoes(req.query);

    // Prepara PDF em A4 landscape, margem reduzida
    const margin = 20;
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin });
    res.setHeader('Content-Disposition', 'attachment; filename=transacoes.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Título
    doc.fontSize(16)
       .text('Relatório de Transações Financeiras', { align: 'center' })
       .moveDown(1);

    // Função auxiliar para formatar datas, substituindo inválidos por '-'
    const formatDate = (value: any): string => {
      const date = new Date(value);
      return value && !isNaN(date.getTime())
        ? date.toLocaleDateString('pt-BR')
        : '-';
    };

    // Definição das colunas
    const columns: Array<{
      key: ColumnKey;
      label: string;
      width: number;
      x?: number;
      options?: PDFKit.Mixins.TextOptions;
    }> = [
      { key: 'data_referencia',     label: 'Data Ref.',   width: 50 },
      { key: 'descricao',           label: 'Descrição',   width: 180 },
      { key: 'valor',               label: 'Valor R$',    width: 50,  options: { align: 'right' } },
      { key: 'desconto_percentual', label: 'Desc.%',      width: 40,  options: { align: 'right' } },
      { key: 'valor_com_desconto',  label: 'Valor F.',    width: 60,  options: { align: 'right' } },
      { key: 'tipo',                label: 'Tipo',        width: 50 },
      { key: 'categoria',           label: 'Categoria',   width: 60 },
      { key: 'data_vencimento',     label: 'Venc.',       width: 50 },
      { key: 'data_pagamento',      label: 'Pagto.',      width: 50 },
      { key: 'status',              label: 'Status',      width: 60 },
      { key: 'forma_pagamento',     label: 'Forma Pgto',  width: 60 },
      { key: 'responsavel',         label: 'Responsável', width: 70 },
    ];

    // 6) Ajusta larguras para caber no A4 com gaps
    const pageWidth      = doc.page.width;
    const availableWidth = pageWidth - margin * 2;
    const gap            = 5;
    const totalInitial   = columns.reduce((sum, c) => sum + c.width, 0);
    const availableCols  = availableWidth - gap * (columns.length - 1);
    const scale          = availableCols / totalInitial;

    let currentX = margin;
    for (const col of columns) {
      col.width = Math.floor(col.width * scale);
      col.x     = currentX;
      currentX += col.width + gap;
    }

    // Cabeçalho da tabela
    const headerY = 100;
    doc.fontSize(10).font('Helvetica-Bold');
    columns.forEach(col => {
      doc.text(col.label, col.x!, headerY, { width: col.width, ...col.options });
    });
    doc.moveTo(margin, headerY + 15)
       .lineTo(pageWidth - margin, headerY + 15)
       .stroke();

    // Linhas de dados com quebra de página e wrap
    let y = headerY + 20;
    doc.font('Helvetica').fontSize(9);

    for (const t of rows) {
      const texts: Record<ColumnKey, string> = {
        data_referencia:     formatDate(t.data_referencia),
        descricao:           t.descricao,
        valor:               parseFloat(t.valor).toFixed(2),
        desconto_percentual: parseFloat(t.desconto_percentual || '0').toFixed(2) + '%',
        valor_com_desconto:  parseFloat(t.valor_com_desconto).toFixed(2),
        tipo:                t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1),
        categoria:           t.categoria,
        data_vencimento:     formatDate(t.data_vencimento),
        data_pagamento:      formatDate(t.data_pagamento),
        status:              t.status,
        forma_pagamento:     t.forma_pagamento || '-',
        responsavel:         t.responsavel || '-',
      };

      // Calcula altura de cada célula
      const heights   = columns.map(col => doc.heightOfString(texts[col.key], { width: col.width }));
      const rowHeight = Math.max(...heights) + 4;

      // Quebra de página
      if (y + rowHeight > doc.page.height - margin) {
        doc.addPage({ layout: 'landscape' });
        y = margin;
      }

      // Escreve cada célula
      columns.forEach(col => {
        doc.text(texts[col.key], col.x!, y, { width: col.width, ...col.options });
      });

      y += rowHeight;
    }

    doc.end();
  } catch (err) {
    console.error('Erro ao exportar PDF', err);
    res.status(500).json({ error: 'Erro ao exportar PDF' });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTAR CSV (todas as transações)  
// GET /api/financeiro/exportar
// ──────────────────────────────────────────────────────────────────────────────
export const exportarCSV = async (req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.exportarCSV(req.query);
    if (!rows.length) return res.status(404).json({ error: "Nenhuma transação" });

    const csvHeader = Object.keys(rows[0]).join(",") + "\n";
    const csvRows = rows.map((r) => Object.values(r).join(",")).join("\n");
    const filePath = path.join(__dirname, "../../exports/financeiro.csv");
    fs.writeFileSync(filePath, csvHeader + csvRows, "utf8");
    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao exportar CSV" });
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// EXPORTAR PARA EXCEL (todas as transações)
// GET /api/financeiro/exportar/excel
// ──────────────────────────────────────────────────────────────────────────────

export const exportarExcel = async (req: Request, res: Response) => {
  try {
    const rows = await FinanceiroModel.getTransacoes(req.query);

    // Cria a planilha
    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transações");

    // Helper para datas (transforma null/invalid em '-')
    const formatDate = (v: any): string => {
      if (!v) return "-";
      const d = new Date(v);
      return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
    };

    // Define colunas na ordem que aparece na UI
    worksheet.columns = [
      { header: "Data Referência",    key: "data_referencia",    width: 15 },
      { header: "Descrição",          key: "descricao",          width: 30 },
      { header: "Valor Bruto (R$)",   key: "valor",              width: 15 },
      { header: "Desconto (%)",       key: "desconto_percentual",width: 12 },
      { header: "Valor Final (R$)",   key: "valor_com_desconto", width: 15 },
      { header: "Tipo",               key: "tipo",               width: 12 },
      { header: "Categoria",          key: "categoria",          width: 20 },
      { header: "Vencimento",         key: "data_vencimento",    width: 15 },
      { header: "Data Pagamento",     key: "data_pagamento",     width: 15 },
      { header: "Status",             key: "status",             width: 12 },
      { header: "Observação",         key: "observacao",         width: 30 },
      { header: "Forma de Pagamento", key: "forma_pagamento",    width: 20 },
      { header: "Responsável",        key: "responsavel",        width: 20 },
    ];

    // Preenche as linhas
    rows.forEach((r) => {
      worksheet.addRow({
        data_referencia:     formatDate(r.data_referencia),
        descricao:           r.descricao,
        valor:               parseFloat(r.valor).toFixed(2),
        desconto_percentual: parseFloat(r.desconto_percentual || "0").toFixed(2),
        valor_com_desconto:  parseFloat(r.valor_com_desconto).toFixed(2),
        tipo:                r.tipo,
        categoria:           r.categoria,
        data_vencimento:     formatDate(r.data_vencimento),
        data_pagamento:      formatDate(r.data_pagamento),
        status:              r.status,
        observacao:          r.observacao || "-",
        forma_pagamento:     r.forma_pagamento || "-",
        responsavel:         r.responsavel || "-",
      });
    });

    // Formata cabeçalho
    const header = worksheet.getRow(1);
    header.font = { bold: true };
    header.alignment = { vertical: 'middle', horizontal: 'center' };
    header.height = 20;
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Envia para o cliente
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transacoes.xlsx"
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Erro ao exportar Excel", err);
    res.status(500).json({ error: "Erro ao exportar Excel" });
  }
};
