// backend/src/index.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/routes';
import path from 'path';
import { config } from './config/config';
import helmet from 'helmet';
import cron from 'node-cron';
import { pingDB } from './config/db';
import {
  lancamentoDeMensalidades,
  lancamentoDePagamentos,
} from './controllers/financeiroController';
import { atualizarStatusAtrasados } from './models/financeiro';
import fetch from 'node-fetch';
import fs from 'fs';

// =============================
// App / Server Express
// =============================
const app = express();
const port = config.port;

const FRONT_ORIGINS = [
  process.env.FRONT_URL || 'http://localhost:5173',
  'http://localhost:3001',
  'http://ec2-52-67-126-32.sa-east-1.compute.amazonaws.com', // <-- ADICIONE ESTA LINHA
  'http://52.67.126.32' // <-- E ESTA TAMBÉM, POR GARANTIA
];

app.set('trust proxy', 1);

// Middlewares Express
app.use(helmet());
app.use(
  cors({
    origin: FRONT_ORIGINS,
    credentials: true,
  })
);

// ====================================================================
// >> CORREÇÃO ADICIONADA AQUI <<
// Middleware para permitir o carregamento de recursos (imagens) de outras origens
// Isso corrige o erro 'net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin'.
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
// ====================================================================

const BODY_LIMIT = `${process.env.BODY_MAX_MB || 50}mb`;

app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ limit: BODY_LIMIT, extended: true }));
app.use(cookieParser());


// Pasta base de uploads
const uploadsBaseDir = path.resolve(__dirname, '..', '..', 'uploads');

// Subpastas específicas
const subPastas = ['contratos', 'comprovantes', 'aulas'];

for (const sub of subPastas) {
  const fullPath = path.join(uploadsBaseDir, sub);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`📂 Pasta criada: ${fullPath}`);
  }
}


app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'), {
    maxAge: '7d',
    index: false,
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// Roteador principal
app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Rotinas mensais (CRON)
(async () => {
  try {
    const ok = await pingDB();
    if (!ok) {
      console.error(
        '[Startup] Banco de dados indisponível. Pulando rotinas financeiras.'
      );
      return;
    }
    console.log('[Startup] Executando rotinas financeiras iniciais...');
    await lancamentoDeMensalidades(true);
    await lancamentoDePagamentos(true);
    await atualizarStatusAtrasados();
    console.log('[Startup] Rotinas financeiras iniciais concluídas.');
  } catch (err) {
    console.error('Erro ao executar rotinas de startup:', err);
  }
})();

cron.schedule('0 0 1 * *', async () => {
  console.log('[CRON] Executando rotinas financeiras mensais...');
  const ok = await pingDB();
  if (!ok) {
    console.error('[CRON] Banco de dados indisponível. Pulando rotinas.');
    return;
  }
  try {
    await lancamentoDeMensalidades();
    await lancamentoDePagamentos();
  } catch (err) {
    console.error('Erro durante a execução do CRON:', err);
  }
});

// Inicia o servidor Express
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor Express puro rodando na porta ${port}`);
});

export default app;
