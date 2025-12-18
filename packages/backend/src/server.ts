import 'reflect-metadata'; // Required for inversify
import app from './app.js';
import { container } from './container.js';
import { TYPES } from './types.js';
import type { ConfigService } from './config/index.js';
import type { ILogger } from './lib/logger.js';

const config = container.get<ConfigService>(TYPES.ConfigService);
const logger = container.get<ILogger>(TYPES.Logger);

const PORT = config.getPort();

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
  logger.info(`Environment: ${config.isDevelopment() ? 'development' : 'production'}`);
});
