import { Request, Response } from "express";
import pool from "../config/db";
import { buscarAnuncioPorIdDB, criarAnuncioDB, editarAnuncioDB, excluirAnuncioDB, listarAnunciosDB, incrementarVisualizacaoDB, marcarAnuncioComoLidoDB, listarAnunciosLidosDB } from "../models/anuncios";
interface AuthRequest extends Request {
  user?: { id: number };
}
export const criarAnuncio = async (req: Request, res: Response) => {
  try {
    const { titulo, conteudo, autor_id, data_inicio, data_fim } = req.body;
    if (!titulo || !conteudo || !autor_id || !data_inicio) {
      return res.status(400).json({ error: "Dados obrigatórios não informados." });
    }
    const anuncio = await criarAnuncioDB(pool, { titulo, conteudo, autor_id, data_inicio, data_fim: data_fim || null});
    res.status(201).json(anuncio);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar anúncio." });
  }
};

export const listarAnuncios = async (req: Request, res: Response) => {
  try {
    const anuncios = await listarAnunciosDB(pool);
    res.json(anuncios);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar anúncios." });
  }
};

export const buscarAnuncioPorId = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }
    const anuncio = await buscarAnuncioPorIdDB(pool, id);
    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }
    res.json(anuncio);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar anúncio." });
  }
};

export const editarAnuncio = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { titulo, conteudo, data_inicio, data_fim } = req.body;
    if (!titulo || !conteudo || !data_inicio) {
      return res.status(400).json({ error: "Dados obrigatórios não informados." });
    }
    const anuncioAtualizado = await editarAnuncioDB(pool, id, {
      titulo,
      conteudo,
      data_inicio,
      data_fim: data_fim || null,
    });
    res.json(anuncioAtualizado);
  } catch (error) {
    res.status(500).json({ error: "Erro ao editar anúncio." });
  }
};

export const excluirAnuncio = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await excluirAnuncioDB(pool, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir anúncio." });
  }
};

export const incrementarVisualizacao = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID inválido." });
    }
    await incrementarVisualizacaoDB(pool, id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao incrementar visualização." });
  }
};

export const marcarAnuncioComoLido = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.body.user_id; 
    const anuncioId = Number(req.params.id);
    if (!userId || isNaN(anuncioId)) {
      return res.status(400).json({ error: "Dados inválidos." });
    }
    await marcarAnuncioComoLidoDB(pool, userId, anuncioId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao marcar como lido." });
  }
};

export const listarAnunciosLidos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || Number(req.query.user_id);
    if (!userId) {
      return res.status(400).json({ error: "Usuário não informado." });
    }
    const lidos = await listarAnunciosLidosDB(pool, userId);
    res.json(lidos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar anúncios lidos." });
  }
};