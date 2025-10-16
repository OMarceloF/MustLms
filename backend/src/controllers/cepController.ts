// src/controllers/cepController.ts
import { Request, Response } from 'express';
import axios from 'axios';

export const consultarCep = async (req: Request, res: Response) => {
  const { cep } = req.params;

  if (!cep || !/^\d{8}$/.test(cep)) {
    return res.status(400).json({ message: 'CEP inválido. Forneça 8 dígitos numéricos.' });
  }

  try {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    const response = await axios.get(url );

    // Se a API da ViaCEP retornar um erro (ex: CEP não encontrado)
    if (response.data.erro) {
      return res.status(404).json({ message: 'CEP não encontrado.' });
    }

    // Retorna os dados do endereço para o frontend
    return res.status(200).json(response.data);

  } catch (error) {
    console.error('Erro ao consultar ViaCEP:', error);
    return res.status(500).json({ message: 'Erro interno ao consultar o serviço de CEP.' });
  }
};
