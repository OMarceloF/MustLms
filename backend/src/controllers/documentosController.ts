import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * POST /api/alunos/:id/documentos
 * Recebe e salva os documentos de um aluno.
 */
export const uploadDocumentosAluno = async (req: Request, res: Response) => {
  const { id: alunoId } = req.params;
  
  // =======================================================================
  // CORREÇÃO APLICADA AQUI
  // Com o middleware `uploadAny()`, `req.files` é um ARRAY de arquivos.
  // Ex: [ { fieldname: 'foto3x4', ... }, { fieldname: 'adicionais', ... } ]
  // =======================================================================
  const files = req.files as Express.Multer.File[];

  if (!alunoId) {
    return res.status(400).json({ message: 'ID do aluno é obrigatório.' });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ message: 'Nenhum arquivo foi enviado.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [alunoRows]: any = await connection.execute('SELECT id FROM alunos WHERE id = ?', [alunoId]);
    if (alunoRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    // Agora, simplesmente iteramos sobre o array de arquivos.
    for (const file of files) {
      // O `fieldname` (tipo do documento) está dentro de cada objeto `file`.
      const tipoDocumento = file.fieldname; 
      const caminhoArquivo = `/uploads/documentos/${file.filename}`;
      const nomeOriginal = file.originalname;

      // A lógica para inserir ou atualizar continua a mesma.
      if (tipoDocumento === 'adicionais') {
        // Para documentos adicionais, sempre inserimos um novo registro.
        await connection.execute(
          `INSERT INTO documentos_alunos (aluno_id, tipo_documento, caminho_arquivo, nome_original)
           VALUES (?, ?, ?, ?)`,
          [alunoId, tipoDocumento, caminhoArquivo, nomeOriginal]
        );
      } else {
        // Para documentos obrigatórios/opcionais, usamos a lógica de substituir se já existir.
        await connection.execute(
          `INSERT INTO documentos_alunos (aluno_id, tipo_documento, caminho_arquivo, nome_original)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           caminho_arquivo = VALUES(caminho_arquivo),
           nome_original = VALUES(nome_original),
           data_upload = CURRENT_TIMESTAMP`,
          [alunoId, tipoDocumento, caminhoArquivo, nomeOriginal]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Documentos salvos com sucesso!' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao salvar documentos:', error);
    res.status(500).json({ message: 'Erro interno ao salvar documentos.' });
  } finally {
    if (connection) connection.release();
  }
};
