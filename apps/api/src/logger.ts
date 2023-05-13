import { pino as createLogger } from 'pino';
import { Env } from './env.js';

export const logger = createLogger({ level: Env.get().isProd ? 'debug' : 'trace' });
