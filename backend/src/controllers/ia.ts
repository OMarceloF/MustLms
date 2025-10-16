// backend/src/controllers/ia.ts
import axios from 'axios';
import { Request, Response } from 'express';
import { buscarAlunosPorTermo } from '../models/alunos';

type ChatMsg = { role: 'system'|'user'|'assistant'; content: string };

export const responderPerguntaIA = async (req: Request, res: Response) => {
  try {
    // 1) Aceita vários formatos
    const body = req.body ?? {};
    const single =
      typeof body.message === 'string' ? body.message :
      typeof body.prompt  === 'string' ? body.prompt  :
      typeof body.question=== 'string' ? body.question: '';

    let messages: ChatMsg[] = Array.isArray(body.messages) ? body.messages : [];
    if (!messages.length && single) {
      messages = [{ role: 'user', content: single }];
    }

    if (!messages.length) {
      return res.status(400).json({ erro: 'Envie "message" ou "messages" válidos.' });
    }

    if (!process.env.GROQ_API_KEY) {
      // se preferir, retorne 503
      return res.status(500).json({ erro: 'Serviço de IA indisponível (chave ausente).' });
    }

    // 2) Pegue a última mensagem do usuário
    const ultimaUser = [...messages].reverse().find(m => m.role === 'user');
    const termoDeBusca = ultimaUser?.content?.trim() || '';

    // 3) Contexto opcional do seu banco
    let contextoAlunos = 'Nenhum aluno relevante encontrado para a consulta.';
    if (termoDeBusca) {
      try {
        const alunos = await buscarAlunosPorTermo(termoDeBusca);
        if (Array.isArray(alunos) && alunos.length) {
          contextoAlunos = alunos.map(a =>
            `• Nome: ${a.nome}, Matrícula: ${a.matricula}, Série: ${a.serie}, Turma: ${a.turma}, Email: ${a.email}, Telefone: ${a.telefone}, Turno: ${a.turno}`
          ).join('\n');
        }
      } catch {
        // não derruba a IA se o DB falhar
      }
    }

    const systemMessage: ChatMsg = {
      role: 'system',
      content: [
        'Você é uma IA educacional. Se o usuário perguntar sobre alunos, use as informações a seguir:',
        contextoAlunos,
        'Se não houver dados relevantes, responda sem inventar.'
      ].join('\n')
    };

    const payload: ChatMsg[] = [systemMessage, ...messages];

    // 4) Chamada Groq
    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: payload,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30_000
      }
    );

    const texto = resp?.data?.choices?.[0]?.message?.content ?? '';
    if (!texto) {
      return res.status(502).json({ erro: 'Resposta vazia da IA.' });
    }

    return res.status(200).json({ resposta: texto });
  } catch (err: any) {
    // Erros mais legíveis
    if (err?.response) {
      // resposta da Groq
      return res.status(502).json({
        erro: 'Falha na IA upstream',
        status: err.response.status,
        data: err.response.data
      });
    }
    if (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNABORTED') {
      return res.status(504).json({ erro: 'Tempo esgotado ao consultar IA.' });
    }
    return res.status(500).json({ erro: 'Erro ao acessar IA.' });
  }
};
