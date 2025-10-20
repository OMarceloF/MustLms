import { executeQuery } from '../config/db';

interface ColorSettings {
  cor_primaria: string;
  cor_secundaria: string;
  cor_sucesso: string;
  cor_erro: string;
  cor_fundo: string;
}

export const getColors = async (): Promise<ColorSettings | null> => {
  const query =
    'SELECT cor_primaria, cor_secundaria, cor_sucesso, cor_erro, cor_fundo FROM configuracoes_cores LIMIT 1';
  const result = await executeQuery<ColorSettings[]>(query);

  if (Array.isArray(result) && result.length > 0) {
    return result[0];
  }
  return null;
};

export const updateColors = async (colors: ColorSettings): Promise<void> => {
  const { cor_primaria, cor_secundaria, cor_sucesso, cor_erro, cor_fundo } =
    colors;
  const query = `
    INSERT INTO configuracoes_cores (id, cor_primaria, cor_secundaria, cor_sucesso, cor_erro, cor_fundo)
    VALUES (1, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    cor_primaria = VALUES(cor_primaria),
    cor_secundaria = VALUES(cor_secundaria),
    cor_sucesso = VALUES(cor_sucesso),
    cor_erro = VALUES(cor_erro),
    cor_fundo = VALUES(cor_fundo)
  `;

  await executeQuery(query, [
    cor_primaria,
    cor_secundaria,
    cor_sucesso,
    cor_erro,
    cor_fundo,
  ]);
};
