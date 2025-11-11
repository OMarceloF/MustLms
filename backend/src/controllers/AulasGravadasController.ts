import { Request, Response } from "express"
import db from "../config/db"
import { RowDataPacket, OkPacket } from "mysql2"

// ============================================================================
// 🔹 LISTAR TODAS AS AULAS GRAVADAS
// ============================================================================
export const listarAulasGravadas = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        ag.id,
        ag.titulo,
        ag.descricao,
        ag.data,
        ag.link,
        ag.professor_id,
        ag.turma_id,
        ag.disciplina_id,
        ag.arquivo,
        u.nome AS professor_nome,
        t.nome_turma AS turma_nome,
        d.nome AS disciplina_nome
      FROM aulas_gravadas ag
      LEFT JOIN users u ON ag.professor_id = u.id
      LEFT JOIN turmas t ON ag.turma_id = t.id
      LEFT JOIN cursos_disciplinas d ON ag.disciplina_id = d.id
      ORDER BY ag.data DESC
    `)

    res.status(200).json(rows)
  } catch (error) {
    console.error("Erro ao listar aulas gravadas:", error)
    res.status(500).json({ error: "Erro interno ao listar aulas gravadas." })
  }
}

// ============================================================================
// 🔹 CRIAR NOVA AULA GRAVADA
// ============================================================================
export const criarAulaGravada = async (req: Request, res: Response) => {
  const { titulo, descricao, data, link, professor_id, turma_id, disciplina_id } = req.body
  const arquivo = req.file ? `/uploads/aulas/${req.file.filename}` : null

  if (!titulo || !data || !link) {
    return res.status(400).json({ error: "Campos obrigatórios: título, data e link." })
  }

  try {
    const [result] = await db.query<OkPacket>(
      `
      INSERT INTO aulas_gravadas 
        (titulo, descricao, data, link, professor_id, turma_id, disciplina_id, arquivo, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        titulo,
        descricao || null,
        data,
        link,
        professor_id || null,
        turma_id || null,
        disciplina_id || null,
        arquivo || null,
      ]
    )

    res.status(201).json({
      id: result.insertId,
      titulo,
      descricao,
      data,
      link,
      professor_id,
      turma_id,
      disciplina_id,
      arquivo,
      message: "Aula gravada criada com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao criar aula gravada:", error)
    res.status(500).json({ error: "Erro ao criar aula gravada." })
  }
}

// ============================================================================
// 🔹 ATUALIZAR AULA GRAVADA
// ============================================================================
export const atualizarAulaGravada = async (req: Request, res: Response) => {
  const { id } = req.params
  const { titulo, descricao, data, link, professor_id, turma_id, disciplina_id } = req.body
  const arquivo = req.file ? `/uploads/aulas/${req.file.filename}` : req.body.arquivo || null

  try {
    const [result] = await db.query<OkPacket>(
      `
      UPDATE aulas_gravadas
      SET 
        titulo = ?, 
        descricao = ?, 
        data = ?, 
        link = ?, 
        professor_id = ?, 
        turma_id = ?, 
        disciplina_id = ?, 
        arquivo = ?, 
        atualizado_em = NOW()
      WHERE id = ?
    `,
      [
        titulo,
        descricao || null,
        data,
        link,
        professor_id || null,
        turma_id || null,
        disciplina_id || null,
        arquivo,
        id,
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Aula não encontrada." })
    }

    res.status(200).json({ message: "Aula gravada atualizada com sucesso!" })
  } catch (error) {
    console.error("Erro ao atualizar aula gravada:", error)
    res.status(500).json({ error: "Erro ao atualizar aula gravada." })
  }
}

// ============================================================================
// 🔹 EXCLUIR AULA GRAVADA
// ============================================================================
export const excluirAulaGravada = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Buscar e remover arquivo físico (se existir)
    const [rows]: any = await db.query("SELECT arquivo FROM aulas_gravadas WHERE id = ?", [id])
    if (rows.length > 0 && rows[0].arquivo) {
      const fs = await import("fs")
      const path = await import("path")
      const filePath = path.resolve(process.cwd(), rows[0].arquivo.replace("/uploads", "uploads"))
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }

    // Deletar registro
    const [result] = await db.query<OkPacket>("DELETE FROM aulas_gravadas WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Aula não encontrada." })
    }

    res.status(200).json({ message: "Aula gravada excluída com sucesso!" })
  } catch (error) {
    console.error("Erro ao excluir aula gravada:", error)
    res.status(500).json({ error: "Erro ao excluir aula gravada." })
  }
}
