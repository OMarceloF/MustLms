import type { Request, Response } from 'express';
import axios from 'axios'; // 👈 Importe o axios

export async function getFeriados(req: Request, res: Response) {
  const param = (req.params.ano || '').trim();
  const agora = new Date();
  const ano = param ? Number(param) : agora.getFullYear();

  if (!Number.isFinite(ano) || ano < 1900 || ano > 2100) {
    return res.status(200).json([]);
  }

  const url = `https://brasilapi.com.br/api/feriados/v1/${ano}`;

  try {
    // 👇 Substituindo fetch por axios
    const response = await axios.get(url, {
      timeout: 5000, // Timeout de 5 segundos
    } );

    // O axios já lança um erro para status não-2xx, então a verificação de 'upstream.ok' não é necessária.
    // Se chegarmos aqui, a resposta foi bem-sucedida.

    res
      .status(200)
      .set('Cache-Control', 'public, max-age=43200') // Cache de 12 horas
      .json(response.data); // Usa response.data para obter o corpo da resposta

  } catch (error: any) {
    // O axios fornece mais detalhes no erro
    if (axios.isAxiosError(error)) {
      console.error(`Falha ao consultar BrasilAPI para o ano ${ano}:`, error.message);
    } else {
      console.error(`Erro inesperado ao buscar feriados para o ano ${ano}:`, error.message);
    }
    
    // Mantém a lógica de retornar um array vazio para não quebrar o frontend
    res.status(200).json([]);
  }
}
