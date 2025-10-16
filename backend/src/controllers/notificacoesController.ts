import { Request, Response } from 'express';
import pool from '../config/db';

// 🔹 GET /api/notificacoes/:id - Buscar notificações por usuário
export const getNotificacoesPorUsuario = async (req: Request, res: Response) => {
  const destinatarioId = req.params.id;

  try {
    const [notificacoes] = await pool.query(
      `SELECT 
        n.*,
        u.nome as remetente_nome,
        u.foto_url as remetente_foto
       FROM notificacoes n
       LEFT JOIN users u ON n.remetente_id = u.id
       WHERE n.destinatario_id = ?
       AND n.tipo = 'mensagem'
       ORDER BY n.criada_em DESC`,
      [destinatarioId]
    );

    res.status(200).json(notificacoes);
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ erro: 'Erro interno ao buscar notificações' });
  }
};

// 🔹 Marcar todas as mensagens como lidas (usado no botão flutuante)
export const marcarMensagensComoLidas = async (req: Request, res: Response) => {
  const { id } = req.params; // ID do destinatário

  try {
    const [result] = await pool.query(
      `UPDATE notificacoes 
       SET lida = 1 
       WHERE destinatario_id = ? 
         AND tipo = 'mensagem' 
         AND lida = 0`,
      [id]
    );

    // Buscar o novo total de não lidas
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM notificacoes WHERE destinatario_id = ? AND tipo = "mensagem" AND lida = 0',
      [id]
    );
    const totalNaoLidas = (countResult as any[])[0].total;

    res.status(200).json({ 
      status: 'ok', 
      alteradas: (result as any).affectedRows,
      totalNaoLidas
    });
  } catch (err) {
    console.error('Erro ao marcar mensagens como lidas:', err);
    res.status(500).json({ erro: 'Erro ao atualizar notificações' });
  }
};

// 🔹 Marcar notificações de uma conversa como lidas
export const deletarNotificacoesPorConversaEUsuario = async (req: Request, res: Response) => {
  const { conversaId, usuarioId } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM notificacoes 
       WHERE conversa_id = ? 
         AND destinatario_id = ? 
         AND tipo = 'mensagem'`,
      [conversaId, usuarioId]
    );

    // Buscar o novo total de não lidas
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM notificacoes WHERE destinatario_id = ? AND tipo = "mensagem" AND lida = 0',
      [usuarioId]
    );
    const totalNaoLidas = (countResult as any[])[0].total;

    res.status(200).json({ 
      mensagem: 'Notificações apagadas com sucesso', 
      apagadas: (result as any).affectedRows,
      totalNaoLidas
    });
  } catch (err) {
    console.error('Erro ao apagar notificações da conversa:', err);
    res.status(500).json({ erro: 'Erro ao apagar notificações' });
  }
};

// 🔹 Listar todas as não visualizadas (exemplo para menu superior)
export const listarNaoVisualizadas = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT 
        n.*,
        u.nome as remetente_nome,
        u.foto_url as remetente_foto
       FROM notificacoes n
       LEFT JOIN users u ON n.remetente_id = u.id
       WHERE n.destinatario_id = ? 
         AND n.visualizada = 0
       ORDER BY n.id DESC`,
      [usuarioId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar notificações não visualizadas:', err);
    res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
};

// 🔹 Marcar todas como visualizadas (não confundir com "lidas")
export const marcarComoVisualizadas = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;

  try {
    const [result] = await pool.query(
      `UPDATE notificacoes 
       SET visualizada = 1 
       WHERE destinatario_id = ? 
         AND visualizada = 0`,
      [usuarioId]
    );

    res.status(200).json({ 
      status: "ok",
      notificacoesVisualizadas: (result as any).affectedRows
    });
  } catch (err) {
    console.error("Erro ao marcar notificações como visualizadas:", err);
    res.status(500).json({ error: "Erro ao marcar como visualizadas." });
  }
};

// 🔹 Criar nova notificação (ex: nova mensagem)
export const criarNotificacao = async (req: Request, res: Response) => {
  const { remetente_id, destinatario_id, tipo, conteudo, conversa_id } = req.body;

  try {
    // Verificar se já existe uma notificação não lida para esta conversa
    const [existingNotif] = await pool.query(
      'SELECT id FROM notificacoes WHERE destinatario_id = ? AND conversa_id = ? AND tipo = ? AND lida = 0',
      [destinatario_id, conversa_id, tipo]
    );

    let notificacaoId;

    if ((existingNotif as any[]).length > 0) {
      // Atualizar a notificação existente com o novo conteúdo
      notificacaoId = (existingNotif as any[])[0].id;
      await pool.query(
        'UPDATE notificacoes SET conteudo = ?, remetente_id = ?, criada_em = NOW() WHERE id = ?',
        [conteudo, remetente_id, notificacaoId]
      );
    } else {
      // Criar nova notificação
      const [result] = await pool.query(
        `INSERT INTO notificacoes 
         (remetente_id, destinatario_id, tipo, conteudo, conversa_id, visualizada, lida, criada_em)
         VALUES (?, ?, ?, ?, ?, 0, 0, NOW())`,
        [remetente_id, destinatario_id, tipo, conteudo, conversa_id]
      );
      notificacaoId = (result as any).insertId;
    }

    // Buscar o total de não lidas para retornar
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM notificacoes WHERE destinatario_id = ? AND tipo = "mensagem" AND lida = 0',
      [destinatario_id]
    );
    const totalNaoLidas = (countResult as any[])[0].total;

    res.status(201).json({ 
      id: notificacaoId,
      totalNaoLidas
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ erro: 'Erro ao criar notificação' });
  }
};

// 🔹 Buscar total de notificações não lidas
export const buscarTotalNaoLidas = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;

  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as total FROM notificacoes WHERE destinatario_id = ? AND tipo = "mensagem" AND lida = 0',
      [usuarioId]
    );

    const total = (result as any[])[0].total;
    res.json({ totalNaoLidas: total });
  } catch (err) {
    console.error('Erro ao buscar total de não lidas:', err);
    res.status(500).json({ error: 'Erro ao buscar total de não lidas.' });
  }
};

// 🔹 Marcar notificação específica como lida
export const marcarNotificacaoComoLida = async (req: Request, res: Response) => {
  const { notificacaoId } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE notificacoes SET lida = 1 WHERE id = ?',
      [notificacaoId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Erro ao marcar notificação como lida:', err);
    res.status(500).json({ error: 'Erro ao marcar notificação como lida.' });
  }
};

// 🔹 Buscar notificações por conversa
export const buscarNotificacoesPorConversa = async (req: Request, res: Response) => {
  const { conversaId, usuarioId } = req.params;

  try {
    const [notificacoes] = await pool.query(
      `SELECT 
        n.*,
        u.nome as remetente_nome,
        u.foto_url as remetente_foto
       FROM notificacoes n
       LEFT JOIN users u ON n.remetente_id = u.id
       WHERE n.conversa_id = ? 
         AND n.destinatario_id = ?
         AND n.tipo = 'mensagem'
       ORDER BY n.criada_em DESC`,
      [conversaId, usuarioId]
    );

    res.status(200).json(notificacoes);
  } catch (err) {
    console.error('Erro ao buscar notificações por conversa:', err);
    res.status(500).json({ error: 'Erro ao buscar notificações por conversa.' });
  }
};
