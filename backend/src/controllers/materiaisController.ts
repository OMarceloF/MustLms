import type { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import path from 'node:path';
import fs from 'node:fs/promises';

const UPLOADS_DIR   = '/home/ubuntu/app/couto/backend/uploads';
const MATERIAIS_DIR = '/home/ubuntu/app/couto/backend/materiais';

// Listar todos os materiais
export const listarMateriais = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, nome, autor, capa_url, conteudo_url FROM materiais
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    res.status(500).json({ error: 'Erro interno ao listar materiais' });
  }
};

// Upload de novo material
// Upload de novo material
export const criarMaterial = async (req: Request, res: Response) => {
  try {
    const { nome, autor } = req.body;

    const files = (req.files as any) || {};
    const capaFile = files.capa?.[0] || null;
    const conteudoFile = files.conteudo?.[0] || null;

    if (!nome || !autor || !capaFile || !conteudoFile) {
      return res.status(400).json({ error: 'Dados incompletos para criar material' });
    }

    // URL públicas coerentes com Nginx:
    // - capa (imagem): /uploads/images/...
    // - conteúdo (PDF): /materiais/...
    const capa_url = `/uploads/images/${capaFile.filename}`;
    const conteudo_url = `/materiais/${conteudoFile.filename}`;

    await pool.query(
      `INSERT INTO materiais (nome, autor, capa_url, conteudo_url)
       VALUES (?, ?, ?, ?)`,
      [nome, autor, capa_url, conteudo_url]
    );

    return res.status(201).json({ message: 'Material criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar material:', error);
    return res.status(500).json({ error: 'Erro interno ao criar material' });
  }
};

// Converte URL pública em caminho absoluto no disco, com segurança.
function publicUrlToAbs(p: string): string | null {
  if (!p || typeof p !== 'string') return null;

  // Normaliza
  const clean = p.replace(/\.\./g, '').trim();

  if (clean.startsWith('/uploads/images/')) {
    const rel = clean.replace(/^\/uploads\/images\//, '');
    return path.join(UPLOADS_DIR, 'images', rel);
  }
  if (clean.startsWith('/materiais/')) {
    const rel = clean.replace(/^\/materiais\//, '');
    return path.join(MATERIAIS_DIR, rel);
  }
  return null; // não apagamos nada que não seja dessas duas pastas
}

// Remove arquivo do disco, ignorando erros (ex.: já não existe)
async function safeUnlink(absPath: string | null) {
  if (!absPath) return;
  try {
    await fs.unlink(absPath);
  } catch {
    /* ignore */
  }
}

/** DELETE /api/materiais/:id  */
export const excluirMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1) Descobre URLs atuais para apagar do disco
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT capa_url, conteudo_url FROM materiais WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }

    const { capa_url, conteudo_url } = rows[0];

    // 2) Deleta do banco
    await pool.query('DELETE FROM materiais WHERE id = ?', [id]);

    // 3) Tenta remover arquivos físicos
    await Promise.all([
      safeUnlink(publicUrlToAbs(capa_url)),
      safeUnlink(publicUrlToAbs(conteudo_url)),
    ]);

    return res.json({ message: 'Material excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir material:', error);
    return res.status(500).json({ error: 'Erro ao excluir material' });
  }
};

/** PUT /api/materiais/:id  (multipart) */
export const editarMaterial = async (req: Request, res: Response) => {
  const { id } = req.params;
  const nome  = (req.body?.nome  ?? '').toString().trim();
  const autor = (req.body?.autor ?? '').toString().trim();

  try {
    // 1) Material atual
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT capa_url, conteudo_url FROM materiais WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Material não encontrado' });
    }
    const atual = rows[0] as { capa_url: string; conteudo_url: string };

    // 2) Arquivos enviados (opcionais)
    const files: any = req.files || {};
    const capaFile     = files.capa?.[0]     || null;
    const conteudoFile = files.conteudo?.[0] || null;

    // 3) Monta novas URLs públicas (se enviou arquivo novo)
    const novaCapaUrl     = capaFile     ? `/uploads/images/${capaFile.filename}`  : atual.capa_url;
    const novoConteudoUrl = conteudoFile ? `/materiais/${conteudoFile.filename}`   : atual.conteudo_url;

    // 4) Atualiza campos “nome/autor” apenas se vieram preenchidos
    const novoNome  = nome  || (await (async () => {
      const [r2] = await pool.query<RowDataPacket[]>('SELECT nome FROM materiais WHERE id = ?', [id]);
      return r2[0]?.nome ?? '';
    })());
    const novoAutor = autor || (await (async () => {
      const [r3] = await pool.query<RowDataPacket[]>('SELECT autor FROM materiais WHERE id = ?', [id]);
      return r3[0]?.autor ?? '';
    })());

    // 5) Persiste
    await pool.query(
      'UPDATE materiais SET nome = ?, autor = ?, capa_url = ?, conteudo_url = ? WHERE id = ?',
      [novoNome, novoAutor, novaCapaUrl, novoConteudoUrl, id]
    );

    // 6) Se trocou arquivo, remove o antigo do disco
    await Promise.all([
      capaFile     ? safeUnlink(publicUrlToAbs(atual.capa_url))     : Promise.resolve(),
      conteudoFile ? safeUnlink(publicUrlToAbs(atual.conteudo_url)) : Promise.resolve(),
    ]);

    return res.json({ message: 'Material atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao editar material:', error);
    return res.status(500).json({ error: 'Erro ao editar material' });
  }
};


