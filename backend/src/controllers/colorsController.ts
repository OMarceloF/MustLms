import { Request, Response } from 'express';
import { getColors, updateColors } from '../models/colorsModel';

export const getColorsController = async (req: Request, res: Response) => {
  try {
    const colors = await getColors();
    res.status(200).json(colors);
  } catch (error) {
    console.error('Erro ao buscar configurações de cores:', error);
    res
      .status(500)
      .json({ message: 'Erro interno do servidor ao buscar cores.' });
  }
};

export const updateColorsController = async (req: Request, res: Response) => {
  try {
    const { cor_primaria, cor_secundaria, cor_sucesso, cor_erro, cor_fundo } =
      req.body;
    if (
      !cor_primaria ||
      !cor_secundaria ||
      !cor_sucesso ||
      !cor_erro ||
      !cor_fundo
    ) {
      return res
        .status(400)
        .json({ message: 'Todos os campos de cor são obrigatórios.' });
    }
    await updateColors({
      cor_primaria,
      cor_secundaria,
      cor_sucesso,
      cor_erro,
      cor_fundo,
    });
    res.status(200).json({ message: 'Cores atualizadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar configurações de cores:', error);
    res
      .status(500)
      .json({ message: 'Erro interno do servidor ao atualizar cores.' });
  }
};
