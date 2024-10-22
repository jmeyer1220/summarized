import { App } from '@slack/bolt';
import { registerCommands } from './commands.js';
import { logger } from '../utils/logger.js';

export const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Error handling
app.error(async (error) => {
  logger.error('Slack app error:', error);
});

// Register all commands
registerCommands(app);