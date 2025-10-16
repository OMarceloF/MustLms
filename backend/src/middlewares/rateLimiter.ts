import rateLimit from 'express-rate-limit';

// Limite geral (ex: 100 req por 15min)
/*export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições feitas. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});*/

// Limite específico para login (mais restrito)
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1, // 5 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',

  handler: (req, res) => {
    res.status(429).json({
      error: 'bloqueado',
      message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    });
  },
});

