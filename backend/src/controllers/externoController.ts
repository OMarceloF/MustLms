// backend/src/controllers/externoController.ts
import type { Request, Response } from 'express';

// Node 18+ já tem fetch global. Sem dependência extra.
export async function getFeriados(req: Request, res: Response) {
  // ano opcional; se não vier, usa o ano atual
  const param = (req.params.ano || '').trim();
  const agora = new Date();
  const ano = param ? Number(param) : agora.getFullYear();

  if (!Number.isFinite(ano) || ano < 1900 || ano > 2100) {
    return res.status(400).json({ message: 'Ano inválido' });
  }

  const url = `https://brasilapi.com.br/api/feriados/v1/${ano}`;

  // timeout decente, porque a internet adora te deixar esperando
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const upstream = await fetch(url, { signal: ac.signal });
    const body = await upstream.text();

    // propaga status e content-type; adiciona cache público (12h)
    res
      .status(upstream.status)
      .set('Content-Type', upstream.headers.get('content-type') || 'application/json')
      .set('Cache-Control', 'public, max-age=43200')
      .send(body);
  } catch (e: any) {
    const aborted = e?.name === 'AbortError';
    res
      .status(aborted ? 504 : 502)
      .json({ message: 'Falha ao consultar BrasilAPI', detail: String(e?.message || e) });
  } finally {
    clearTimeout(timer);
  }
}
