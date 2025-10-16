import { Request, Response, NextFunction } from 'express';
import pool, { pingDB } from '../config/db';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mantém a mesma chave secreta
const SECRET_KEY = process.env.JWT_SECRET;

// Interface para o payload do token
interface TokenPayload {
  id: number;
  nome: string;
  role: string;
  iat: number;
  exp: number;
}

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET não está definido no ambiente.');
}

// -----------------------------------------------------------------------------
// Middlewares
// -----------------------------------------------------------------------------

/**
 * Middleware para garantir que o usuário está autenticado via JWT em cookie
 */
export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || (req.headers['x-access-token'] as string | undefined);
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY as string) as TokenPayload;
    // Anexa o usuário ao req para ser usado em rotas protegidas
    (req as any).user = decoded;
    next(); // <- OBRIGATÓRIO!
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}

// -----------------------------------------------------------------------------
// Controllers de Autenticação
// -----------------------------------------------------------------------------

/**
 * Faz login do usuário e emite JWT em cookie HttpOnly
 */
export const loginUser = async (req: Request, res: Response) => {
  const { login, email, senha } = req.body || {};

  try {
    if (!senha || (!login && !email)) {
      return res.status(400).json({ message: 'Informe login (ou email) e senha.' });
    }

    // Evita bater no DB se estiver fora (corrige 500 → 503)
    const ok = await pingDB();
    if (!ok) {
      return res.status(503).json({ message: 'Banco de dados indisponível. Tente novamente em instantes.' });
    }

    const identificador = String(login ?? email).trim();

    const [rows]: any = await pool.query(
      `SELECT id, nome, role, login, email, senha AS senhaHash
       FROM users
       WHERE login = ? OR email = ?
       LIMIT 1`,
      [identificador, identificador]
    );

    if (!rows.length) {
      // mantém semântica próxima do seu código (404 para "usuário não existe")
      return res.status(404).json({ message: 'Usuário não existe' });
    }

    const user = rows[0];
    const senhaCorreta = await bcrypt.compare(String(senha), String(user.senhaHash));
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, role: user.role },
      SECRET_KEY as string,
      { expiresIn: '7d' } // dá uma folga melhor que 1h pra cookie de sessão
    );

    // Cookie httpOnly compatível com localhost
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,   // em produção (HTTPS) => true
      sameSite: 'lax',
      path: '/',       // garante envio em toda a app
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    });

    // Atualiza last_seen (não bloqueia o login se falhar)
    pool.query('UPDATE users SET last_seen = NOW() WHERE id = ?', [user.id]).catch(() => {});

    return res.status(200).json({
      message: 'Usuário autenticado',
      id: user.id,
      nome: user.nome,
      role: user.role,
    });
  } catch (error: any) {
    if (String(error?.code) === 'ETIMEDOUT') {
      return res.status(503).json({ message: 'Banco de dados indisponível. Tente novamente.' });
    }
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};


/**
 * Verifica se o token em cookie é válido e retorna dados do usuário
 */
export const checkAuth = (req: Request, res: Response) => {
  const token = req.cookies?.token || (req.headers['x-access-token'] as string | undefined);
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY as string) as TokenPayload;

    return res.status(200).json({
      message: 'Usuário autenticado',
      id: decoded.id,
      nome: decoded.nome,
      role: decoded.role,
    });
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};


/**
 * Faz logout limpando o cookie de autenticação
 */
export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
     path: '/', // precisa bater com o set do cookie
  });
  return res.status(200).json({ message: 'Logout efetuado com sucesso' });
};

export const verifyPassword = async (req: Request, res: Response) => {
  try {
    const { id, senha } = req.body;
    if (!id || !senha) {
      return res
        .status(400)
        .json({ valido: false, message: 'ID e senha são obrigatórios.' });
    }

    const [rows]: any = await pool.query(
      'SELECT senha FROM users WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ valido: false, message: 'Aluno não encontrado.' });
    }

    const senhaHash = rows[0].senha;
    const valido = await bcrypt.compare(senha, senhaHash);

    return res.status(200).json({ valido });
  } catch (error) {
    console.error('Erro ao verificar senha do aluno:', error);
    return res
      .status(500)
      .json({ valido: false, message: 'Erro interno do servidor.' });
  }
};
