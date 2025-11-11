import type { Request, Response } from "express";
import pool from "../config/db";
import path from "node:path";
import fs from "node:fs/promises";

// Diretório base de armazenamento dos materiais
const MATERIAIS_DIR = "/home/ubuntu/app/couto/backend/materiais_novos";

/**
 * Converte uma URL pública em um caminho físico absoluto
 * (usado para apagar arquivos do disco de forma segura)
 */
function publicUrlToAbs(p: string): string | null {
  if (!p || typeof p !== "string") return null;
  const clean = p.replace(/\.\./g, "").trim();
  if (clean.startsWith("/materiais_novos/")) {
    const rel = clean.replace(/^\/materiais_novos\//, "");
    return path.join(MATERIAIS_DIR, rel);
  }
  return null;
}

/** Remove arquivo físico, ignorando erros (ex.: não existe mais) */
async function safeUnlink(absPath: string | null) {
  if (!absPath) return;
  try {
    await fs.unlink(absPath);
  } catch {
    /* ignora */
  }
}

// ============================================================================
// 📚 LISTAR MATERIAIS
// ============================================================================
export const listarMateriaisNovo = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.id,
        m.titulo,
        m.descricao,
        m.data,
        m.link,
        m.professor_id,
        m.turma_id,
        m.disciplina_id,
        m.arquivo,
        m.criado_em,
        m.atualizado_em,
        u.nome AS professor_nome,
        t.nome_turma AS turma_nome,
        d.nome AS disciplina_nome
      FROM materiais_novo m
      LEFT JOIN users u ON m.professor_id = u.id
      LEFT JOIN turmas t ON m.turma_id = t.id
      LEFT JOIN cursos_disciplinas d ON m.disciplina_id = d.id
      ORDER BY m.criado_em DESC
    `);
    return res.json(rows);
  } catch (error) {
    console.error("Erro ao listar materiais:", error);
    return res.status(500).json({ error: "Erro ao listar materiais." });
  }
};

// ============================================================================
// 🆕 CRIAR MATERIAL NOVO (corrigido com cursos_disciplinas)
// ============================================================================
export const criarMaterialNovo = async (req: Request, res: Response) => {
  try {
    console.log("📩 req.body recebido:", req.body);
    console.log("📎 req.file recebido:", req.file);

    const {
      titulo,
      descricao,
      data,
      link,
      professor_id,
      turma_id,
      disciplina_id: disciplinaRaw,
    } = req.body;

    const arquivoFile = (req.file as Express.Multer.File) || null;
    const arquivoPath = arquivoFile ? `/materiais_novos/${arquivoFile.filename}` : null;

    if (!titulo) {
      return res.status(400).json({ error: "Campo 'título' é obrigatório." });
    }

    // 🔹 Corrige e valida disciplina_id
    let disciplina_id: number | null = null;
    if (disciplinaRaw && disciplinaRaw !== "undefined" && disciplinaRaw !== "null" && disciplinaRaw !== "") {
      disciplina_id = Number(disciplinaRaw);
      if (isNaN(disciplina_id)) disciplina_id = null;
    }

    // 🔹 Verifica se disciplina existe na tabela correta
    if (disciplina_id) {
      const [discRows]: any = await pool.query("SELECT id FROM cursos_disciplinas WHERE id = ?", [disciplina_id]);
      if (discRows.length === 0) {
        return res.status(400).json({ error: `Disciplina ID ${disciplina_id} não existe em cursos_disciplinas.` });
      }
    }

    // 🔹 Cria o registro
    await pool.query(
      `INSERT INTO materiais_novo 
        (titulo, descricao, data, link, professor_id, turma_id, disciplina_id, arquivo, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        titulo,
        descricao || null,
        data || null,
        link || null,
        professor_id ? Number(professor_id) : null,
        turma_id ? Number(turma_id) : null,
        disciplina_id,
        arquivoPath || null,
      ]
    );

    return res.status(201).json({ message: "Material criado com sucesso!" });
  } catch (error: any) {
    console.error("❌ Erro ao criar material:", error);
    return res.status(500).json({
      error: error.sqlMessage || "Erro interno ao criar material.",
    });
  }
};

// ============================================================================
// ✏️ EDITAR MATERIAL
// ============================================================================
export const editarMaterialNovo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { titulo, descricao, data, link, professor_id, turma_id, disciplina_id } = req.body;
  const arquivoFile = (req.file as Express.Multer.File) || null;

  try {
    const [rows]: any = await pool.query("SELECT arquivo FROM materiais_novo WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Material não encontrado." });
    }

    const atual = rows[0];
    const novoArquivo = arquivoFile ? `/materiais_novos/${arquivoFile.filename}` : atual.arquivo;

    await pool.query(
      `UPDATE materiais_novo
       SET titulo = ?, descricao = ?, data = ?, link = ?, 
           professor_id = ?, turma_id = ?, disciplina_id = ?, 
           arquivo = ?, atualizado_em = NOW()
       WHERE id = ?`,
      [
        titulo,
        descricao || null,
        data || null,
        link || null,
        professor_id ? Number(professor_id) : null,
        turma_id ? Number(turma_id) : null,
        disciplina_id ? Number(disciplina_id) : null,
        novoArquivo,
        id,
      ]
    );

    // Remove arquivo antigo se houve upload novo
    if (arquivoFile) {
      await safeUnlink(publicUrlToAbs(atual.arquivo));
    }

    return res.json({ message: "Material atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao editar material:", error);
    return res.status(500).json({ error: "Erro interno ao editar material." });
  }
};

// ============================================================================
// 🗑️ EXCLUIR MATERIAL
// ============================================================================
export const excluirMaterialNovo = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query("SELECT arquivo FROM materiais_novo WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Material não encontrado." });
    }

    const { arquivo } = rows[0];

    await pool.query("DELETE FROM materiais_novo WHERE id = ?", [id]);
    await safeUnlink(publicUrlToAbs(arquivo));

    return res.json({ message: "Material excluído com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir material:", error);
    return res.status(500).json({ error: "Erro interno ao excluir material." });
  }
};

// ============================================================================
// 🔍 BUSCAR MATERIAL POR ID
// ============================================================================
export const buscarMaterialPorId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await pool.query(
      `SELECT 
        m.*, 
        u.nome AS professor_nome,
        t.nome_turma AS turma_nome,
        d.nome AS disciplina_nome
       FROM materiais_novo m
       LEFT JOIN users u ON m.professor_id = u.id
       LEFT JOIN turmas t ON m.turma_id = t.id
       LEFT JOIN cursos_disciplinas d ON m.disciplina_id = d.id
       WHERE m.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Material não encontrado." });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar material:", error);
    return res.status(500).json({ error: "Erro ao buscar material." });
  }
};
