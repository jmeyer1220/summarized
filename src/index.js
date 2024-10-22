import './config/env.js';
import { app } from './slack/app.js';
import { logger } from './utils/logger.js';

const port = process.env.PORT || 3000;

async function startApp() {
  try {
    await app.start(port);
    logger.info(`⚡️ Slack Bolt app is running on port ${port}`);
  } catch (error) {
    logger.error('Failed to start app:', error);
    process.exit(1);
  }
}

startApp();