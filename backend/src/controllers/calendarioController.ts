// src/controllers/calendarioController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
// CORREÇÃO: Importar RowDataPacket de mysql2
import { RowDataPacket } from 'mysql2'; 
import {
  criarCalendario,
  listarCalendarios,
  criarCalendarioLetivo,
  buscarCalendario,
  buscarCalendarioPorId,
} from '../models/calendarioLetivo';

export const criarNovoCalendario = async (req: Request, res: Response) => {
  try {
    const { ano_letivo, tipo, periodos } = req.body;

    if (!Array.isArray(periodos) || periodos.length > 1000) {
      return res.status(400).json({ error: 'Formato inválido de períodos' });
    }

    for (let i = 0; i < periodos.length; i++) {
      const { inicio, fim, valor } = periodos[i] || {};
      if (!inicio || !fim || typeof valor !== 'number') {
        return res.status(400).json({ error: 'Dados de período inválidos' });
      }

      await criarCalendario(pool, {
        data_inicial: inicio,
        data_final: fim,
        ano_letivo,
        tipo,
        valor,
      });
    }

    res.status(201).json({ message: 'Calendário criado com sucesso!' });
  } catch (error) {
    console.error(error);
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};


export const unificarCalendariosLetivos = async (
  req: Request,
  res: Response
) => {
  try {
    const { ano_letivo } = req.body;
    const calendarios = await listarCalendarios(pool, ano_letivo);

    if (!Array.isArray(calendarios) || calendarios.length === 0) {
      return res
        .status(404)
        .json({ error: 'Nenhum calendário encontrado para este ano.' });
    }
    const inicio = `${ano_letivo}-01-01`;
    const fim = `${ano_letivo}-12-31`;

    let tipo = 'Desconhecido';
    const tipos = calendarios.map((c: any) => c.tipo);
    if (tipos.every((t: string) => t === 'Bimestral')) {
      tipo = 'Bimestral';
    } else if (tipos.every((t: string) => t === 'Trimestral')) {
      tipo = 'Trimestral';
    } else if (tipos.every((t: string) => t === 'Semestral')) {
      tipo = 'Semestral';
    } else {
      tipo = tipos[0] || 'Desconhecido';
    }

    await criarCalendarioLetivo(pool, {
      escola_id: 1, // ajuste conforme a lógica da escola
      ano_letivo,
      inicio,
      fim,
      tipo,
    });

    res
      .status(201)
      .json({ message: 'Calendário letivo unificado criado com sucesso!' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const obterCalendario = async (req: Request, res: Response) => {
  const { ano_letivo } = req.params;
  try {
    const rows = await buscarCalendario(
      pool,
      ano_letivo ? Number(ano_letivo) : (null as unknown as number)
    );
    res.json(rows);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const obterCalendarioPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const row = await buscarCalendarioPorId(pool, Number(id));
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Calendário não encontrado.' });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getTipoAvaliacao = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      'SELECT tipo FROM calendario_letivo LIMIT 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum calendário encontrado.' });
    }

    const tipo = rows[0].tipo.toLowerCase();

    let tipoAvaliacao: 'bimestre' | 'trimestre' | 'semestre';

    if (tipo.includes('bimestral')) tipoAvaliacao = 'bimestre';
    else if (tipo.includes('trimestral')) tipoAvaliacao = 'trimestre';
    else if (tipo.includes('semestral')) tipoAvaliacao = 'semestre';
    else
      return res
        .status(400)
        .json({ error: 'Tipo inválido no banco de dados.' });

    res.json({ tipoAvaliacao });
  } catch (err) {
    console.error('Erro ao buscar tipo de avaliação:', err);
    res
      .status(500)
      .json({ error: 'Erro interno ao buscar tipo de avaliação.' });
  }
};

/**
 * @description Busca todas as avaliações e formata o nome do evento para o calendário do gestor.
 * @route GET /api/calendario/gestor/avaliacoes-formatadas
 */
export const getEventosAvaliacoesFormatados = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        av.id,
        av.data_inicio AS data,
        av.descricao AS nome_avaliacao,
        cd.codigo AS codigo_disciplina,
        t.nome_turma
      FROM avaliacoes AS av
      JOIN cursos_disciplinas AS cd ON av.materia_id = cd.id
      JOIN turmas AS t ON av.turma_id = t.id
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query);

    const eventosFormatados = rows.map(row => ({
      id: `avaliacao-${row.id}`,
      // Formata o título como: "[CODIGO - TURMA] NOME_AVALIACAO"
      nome: `[${row.codigo_disciplina} - ${row.nome_turma}] ${row.nome_avaliacao}`,
      data: row.data,
      tipo: 'prova', // Define o tipo como 'prova' para estilização
      importancia: 'media' // Define uma importância padrão
    }));

    res.status(200).json(eventosFormatados);
  } catch (error) {
    console.error("Erro ao buscar avaliações formatadas para o calendário:", error);
    res.status(500).json({ message: "Erro interno ao buscar os eventos de avaliação." });
  }
};

// Adicione esta função para buscar eventos de cursos
export const getEventosCursos = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                ce.id,
                ce.titulo AS nome,
                ce.data_inicio AS data,
                cp.sigla
            FROM cursos_eventos AS ce
            JOIN cursos_posgraduacao AS cp ON ce.curso_id = cp.id
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);

        const eventosFormatados = rows.map(row => ({
            id: `curso-evento-${row.id}`,
            nome: `[${row.sigla}] ${row.nome}`,
            data: row.data,
            tipo: 'evento_curso',
            importancia: 'media'
        }));

        res.status(200).json(eventosFormatados);
    } catch (error) {
        console.error("Erro ao buscar eventos de cursos:", error);
        res.status(500).json({ message: "Erro interno ao buscar eventos de cursos." });
    }
};
