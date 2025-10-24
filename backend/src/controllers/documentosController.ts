import { Request, Response } from 'express';
import pool from '../config/db'; // Corrigido: Caminho para o arquivo de conexão

/**
 * POST /api/alunos/:id/documentos
 * Recebe e salva os documentos de um aluno.
 */
export const uploadDocumentosAluno = async (req: Request, res: Response) => {
  const { id: alunoId } = req.params;
  // Corrigido: `uploadAny` cria um objeto `req.files` e não um array direto.
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!alunoId) {
    return res.status(400).json({ message: 'ID do aluno é obrigatório.' });
  }

  if (!files || Object.keys(files).length === 0) {
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

    // Itera sobre as chaves do objeto (nomes dos campos)
    for (const fieldname in files) {
      // Itera sobre os arquivos de cada campo
      for (const file of files[fieldname]) {
        const tipoDocumento = file.fieldname;
        const caminhoArquivo = `/uploads/documentos/${file.filename}`;

        await connection.execute(
          `INSERT INTO documentos_alunos (aluno_id, tipo_documento, caminho_arquivo, nome_original)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           caminho_arquivo = VALUES(caminho_arquivo),
           nome_original = VALUES(nome_original),
           data_upload = CURRENT_TIMESTAMP`,
          [alunoId, tipoDocumento, caminhoArquivo, file.originalname]
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
