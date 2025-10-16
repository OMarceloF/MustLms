import { Request, Response } from 'express';
import pool from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2';

// Tipos auxiliares
type CountResult = { total: number };
type IdResult = { id: number };

// Função utilitária para criar uma notificação
const criarNotificacao = async (
  tipo: string,
  titulo: string,
  conteudo: string,
  usuario_id: number
) => {
  await pool.query<OkPacket>(
    'INSERT INTO notificacoes_eventos (tipo, titulo, conteudo, usuario_id) VALUES (?, ?, ?, ?)',
    [tipo, titulo, conteudo, usuario_id]
  );
};

//////////////////////////////////////////
// 1. Criar Notificação de Evento Manual
//////////////////////////////////////////
export const criarNotificacaoEvento = async (req: Request, res: Response) => {
  const { tipo, titulo, conteudo, usuario_id } = req.body;

  try {
    const [result] = await pool.query<OkPacket>(
      'INSERT INTO notificacoes_eventos (tipo, titulo, conteudo, usuario_id) VALUES (?, ?, ?, ?)',
      [tipo, titulo, conteudo, usuario_id]
    );

    res.status(201).json({
      message: 'Notificação de evento criada com sucesso!',
      notificacaoId: result.insertId,
    });
  } catch (err) {
    console.error('Erro ao criar notificação de evento:', err);
    res.status(500).json({ error: 'Erro ao criar notificação de evento' });
  }
};

/////////////////////////////////////////////
// 2. Listar Notificações de Evento por Usuário
/////////////////////////////////////////////
export const listarNotificacoesEventos = async (req: Request, res: Response) => {
  const usuarioId = req.params.usuarioId;

  try {
    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM notificacoes_eventos WHERE usuario_id = ? ORDER BY data DESC',
      [usuarioId]
    );

    res.json(result);
  } catch (err) {
    console.error('Erro ao listar notificações de evento:', err);
    res.status(500).json({ error: 'Erro ao listar notificações de evento' });
  }
};

///////////////////////////////////////
// 3. Marcar Notificação como Lida
///////////////////////////////////////
export const marcarNotificacaoEventoComoLida = async (req: Request, res: Response) => {
  const { notificacaoId } = req.params;

  try {
    await pool.query(
      'UPDATE notificacoes_eventos SET lida = TRUE WHERE id = ?',
      [notificacaoId]
    );
    res.json({ message: 'Notificação marcada como lida.' });
  } catch (err) {
    console.error('Erro ao marcar como lida:', err);
    res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
};

///////////////////////////////////////////////////
// 4. Marcar Notificação como Visualizada
///////////////////////////////////////////////////
export const marcarNotificacaoEventoComoVisualizada = async (req: Request, res: Response) => {
  const { notificacaoId } = req.params;

  try {
    await pool.query(
      'UPDATE notificacoes_eventos SET visualizada = TRUE WHERE id = ?',
      [notificacaoId]
    );
    res.json({ message: 'Notificação marcada como visualizada.' });
  } catch (err) {
    console.error('Erro ao marcar como visualizada:', err);
    res.status(500).json({ error: 'Erro ao marcar notificação como visualizada' });
  }
};

///////////////////////////////////////////////////
// 5. Notificar ao Receber Mensagem
///////////////////////////////////////////////////
export const notificarMensagemRecebida = async (destinatario_id: number, remetente_id: number) => {
  if (destinatario_id !== remetente_id) {
    await criarNotificacao(
      'mensagem',
      'Nova mensagem recebida',
      'Você recebeu uma nova mensagem.',
      destinatario_id
    );
  }
};

///////////////////////////////////////////////////
// 6. Notificar ao Lançar Nota
///////////////////////////////////////////////////
export const notificarNotaLancada = async (aluno_id: number) => {
  await criarNotificacao(
    'nota_lancada',
    'Nota registrada',
    'Uma nova nota foi lançada para você.',
    aluno_id
  );
};

///////////////////////////////////////////////////
// 7. Notificar Envio para Alunos de uma Turma
///////////////////////////////////////////////////
export const notificarEnvioParaTurma = async (turma_id: number) => {
  const [alunos] = await pool.query<(IdResult & RowDataPacket)[]>(
    'SELECT aluno_id as id FROM alunos_turmas WHERE turma_id = ?',
    [turma_id]
  );

  for (const { id: aluno_id } of alunos) {
    await criarNotificacao(
      'envio_material',
      'Novo material disponível',
      'Um novo material foi enviado para sua turma.',
      aluno_id
    );
  }
};

///////////////////////////////////////////////////
// 8. Verificar se há calendário e notificar gestores
///////////////////////////////////////////////////
export const verificarCalendarioENotificarGestores = async () => {
  try {
    const [result] = await pool.query<(CountResult & RowDataPacket)[]>(
      'SELECT COUNT(*) as total FROM calendario_gestor'
    );
    const total = result[0]?.total || 0;

    console.log("🧪 Etapa 1: Total de calendários encontrados:", total);

    if (total === 0) {
      console.log("✅ Etapa 2: Nenhum calendário — buscando gestores...");

      const [gestores] = await pool.query<(IdResult & RowDataPacket)[]>(
        'SELECT id FROM users WHERE role = "gestor"'
      );

      console.log("✅ Etapa 3: Gestores encontrados:", gestores);

      for (const { id } of gestores) {
        console.log("🔔 Etapa 4: Inserindo notificação para gestor ID:", id);

        const [insert] = await pool.query(
          'INSERT INTO notificacoes_eventos (tipo, titulo, conteudo, usuario_id) VALUES (?, ?, ?, ?)',
          [
            'calendario',
            'Calendário não definido',
            'O calendário gestor ainda não foi cadastrado.',
            id,
          ]
        );

        console.log("📝 Notificação criada! ID:", (insert as OkPacket).insertId);
      }
    } else {
      console.log("ℹ️ Etapa 1: Já existe calendário. Nada a fazer.");
    }
  } catch (error) {
    console.error("❌ Erro durante verificação de calendário:", error);
  }
};


///////////////////////////////////////////////////
// 9. Verificar pendências de professores
///////////////////////////////////////////////////
export const verificarPendenciasProfessores = async () => {
  const [professores] = await pool.query<(IdResult & RowDataPacket)[]>(
    'SELECT id FROM users WHERE role = "professor"'
  );

  for (const { id: professorId } of professores) {
    const [aulasPendentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT a.id FROM aulas a
      JOIN professores_turmas pt ON a.turma_id = pt.turma_id AND a.materia_id = pt.materia_id
      WHERE pt.professor_id = ? AND a.status = 'pendente'
    `,
      [professorId]
    );

    const [avaliacoesPendentes] = await pool.query<RowDataPacket[]>(
      `
      SELECT av.id FROM avaliacoes av
      JOIN professores_turmas pt ON av.turma_id = pt.turma_id AND av.materia_id = pt.materia_id
      WHERE pt.professor_id = ? AND av.status = 'Pendente'
    `,
      [professorId]
    );

    if (aulasPendentes.length > 0) {
      await criarNotificacao(
        'aula_pendente',
        'Aulas pendentes',
        'Você possui aulas ainda não realizadas.',
        professorId
      );
    }

    if (avaliacoesPendentes.length > 0) {
      await criarNotificacao(
        'avaliacao_pendente',
        'Avaliações pendentes',
        'Existem avaliações que ainda não foram concluídas.',
        professorId
      );
    }
  }
};

///////////////////////////////////////////////////
// 10. Apagar notificação de evento
///////////////////////////////////////////////////

export const apagarNotificacaoEvento = async (req: Request, res: Response) => {
  const { notificacaoId } = req.params;

  try {
    await pool.query(
      'DELETE FROM notificacoes_eventos WHERE id = ?',
      [notificacaoId]
    );
    res.json({ message: 'Notificação apagada com sucesso.' });
  } catch (err) {
    console.error('Erro ao apagar notificação de evento:', err);
    res.status(500).json({ error: 'Erro ao apagar notificação' });
  }
};


///////////////////////////////////////////////////
// 11. Notificar Pendências de Presenças e Notas
///////////////////////////////////////////////////
export const verificarPendenciasLancamento = async () => {
  try {
    // 🔹 Aulas com status = 'pendente'
    const [aulasPendentes] = await pool.query<RowDataPacket[]>(`
      SELECT a.id, a.turma_id, a.materia_id
      FROM aulas a
      WHERE a.status = 'pendente'
    `);

    for (const aula of aulasPendentes) {
      const [professores] = await pool.query<RowDataPacket[]>(`
        SELECT professor_id FROM professores_turmas
        WHERE turma_id = ? AND materia_id = ?
      `, [aula.turma_id, aula.materia_id]);

      for (const { professor_id } of professores) {
        console.log(`🔔 Notificando professor ${professor_id} sobre presença pendente da aula ${aula.id}`);
        await criarNotificacao(
          'pendencia_presenca',
          'Presença não lançada',
          'Há uma aula com presença pendente de lançamento.',
          professor_id
        );
      }
    }

    // 🔹 Avaliações com status = 'Pendente'
    const [avaliacoesPendentes] = await pool.query<RowDataPacket[]>(`
      SELECT av.id, av.turma_id, av.materia_id
      FROM avaliacoes av
      WHERE av.status = 'Pendente'
    `);

    for (const av of avaliacoesPendentes) {
      const [professores] = await pool.query<RowDataPacket[]>(`
        SELECT professor_id FROM professores_turmas
        WHERE turma_id = ? AND materia_id = ?
      `, [av.turma_id, av.materia_id]);

      for (const { professor_id } of professores) {
        console.log(`🔔 Notificando professor ${professor_id} sobre nota pendente da avaliação ${av.id}`);
        await criarNotificacao(
          'pendencia_nota',
          'Nota não lançada',
          'Há uma avaliação com nota pendente de lançamento.',
          professor_id
        );
      }
    }

    console.log("✅ Verificação de pendências concluída com base no status das tabelas.");
  } catch (err) {
    console.error("❌ Erro ao verificar pendências de lançamentos:", err);
  }
};


///////////////////////////////////////////////////
// 12. Executar todas verificações (GET para testes manuais ou cron)
///////////////////////////////////////////////////
export const executarVerificacoes = async (_req: Request, res: Response) => {
  try {
    // await verificarCalendarioENotificarGestores();
    await verificarPendenciasProfessores();
    await verificarPendenciasLancamento();
    await notificarFaltaDeCalendarioLetivo(); // ✅ ← Adicionado aqui
    res.status(200).json({ message: 'Verificações executadas com sucesso.' });
  } catch (err) {
    console.error('Erro ao executar verificações:', err);
    res.status(500).json({ error: 'Erro ao executar verificações' });
  }
};

///////////////////////////////////////////////////
// 13. Verificar ausência de calendário_letivo e notificar gestores
///////////////////////////////////////////////////
export const notificarFaltaDeCalendarioLetivo = async () => {
  try {
    // 1️⃣ Verifica se existe algum calendário_letivo
    const [result] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) as total FROM calendario_letivo
    `);

    const total = result[0]?.total || 0;

    if (total === 0) {
      console.log("🗓️ Nenhum calendário letivo encontrado. Notificando gestores...");

      // 2️⃣ Verifica se JÁ EXISTE ALGUMA notificação tipo 'calendario' E titulo 'Calendário não definido'
      const [duplicadas] = await pool.query<RowDataPacket[]>(`
        SELECT id FROM notificacoes_eventos
        WHERE tipo = 'calendario' AND titulo = 'Calendário não definido'
      `);

      if (duplicadas.length > 0) {
        console.log("ℹ️ Já existe notificação de calendário, nada será criado.");
        return;
      }

      // 3️⃣ Busca todos os gestores
      const [gestores] = await pool.query<RowDataPacket[]>(`
        SELECT id FROM users WHERE role = 'gestor'
      `);

      for (const { id: gestorId } of gestores) {
        await criarNotificacao(
          'calendario',
          'Calendário não definido',
          'O calendário gestor ainda não foi cadastrado.',
          gestorId
        );
        console.log(`🔔 Notificação enviada para gestor ${gestorId}`);
      }
    } else {
      console.log("✅ Calendário letivo encontrado. Nenhuma notificação necessária.");
    }
  } catch (err) {
    console.error("❌ Erro ao verificar calendário letivo:", err);
  }
};


///////////////////////////////////////////////////
// 14. Contador de Notificações Não Visualizadas
///////////////////////////////////////////////////


export const contarNaoVisualizadasEventos = async (req: Request, res: Response) => {
  const { usuarioId } = req.params;

  try {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM notificacoes_eventos WHERE usuario_id = ? AND lida = 0`,
      [usuarioId]
    );

    res.json({ total: result[0]?.total || 0 });
  } catch (err) {
    console.error('Erro ao contar notificações não visualizadas:', err);
    res.status(500).json({ error: 'Erro ao contar notificações não visualizadas' });
  }
};