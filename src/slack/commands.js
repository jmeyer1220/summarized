import { getChannelConfig, setChannelConfig } from '../config/channelConfig.js';
import { analyzeChannel } from '../services/analyzer.js';
import { updateGoogleDoc } from '../services/googleDocs.js';
import { logger } from '../utils/logger.js';

export function registerCommands(app) {
  // Command to set Google Doc for channel
  app.command('/set-doc', async ({ command, ack, respond }) => {
    await ack();

    try {
      const docUrl = command.text.trim();
      if (!docUrl) {
        await respond({
          text: 'Please provide a Google Doc URL. Usage: `/set-doc [Google Doc URL]`',
          response_type: 'ephemeral'
        });
        return;
      }

      const docId = extractDocId(docUrl);
      if (!docId) {
        await respond({
          text: 'Invalid Google Doc URL. Please provide a valid sharing URL.',
          response_type: 'ephemeral'
        });
        return;
      }

      setChannelConfig(command.channel_id, docId);

      await respond({
        text: '✅ Successfully configured Google Doc for this channel!',
        response_type: 'in_channel'
      });
    } catch (error) {
      logger.error('Error in /set-doc command:', error);
      await respond({
        text: 'Failed to set Google Doc. Please try again.',
        response_type: 'ephemeral'
      });
    }
  });

  // Command to manually trigger summary
  app.command('/summarize', async ({ command, ack, respond }) => {
    await ack();

    try {
      const config = getChannelConfig(command.channel_id);
      if (!config) {
        await respond({
          text: 'No Google Doc configured for this channel. Use `/set-doc [URL]` first.',
          response_type: 'ephemeral'
        });
        return;
      }

      await respond({
        text: '🤖 Analyzing channel messages and threads...',
        response_type: 'in_channel'
      });

      const messages = await fetchChannelHistoryWithThreads(app, command.channel_id);
      const summary = await analyzeChannel(messages);
      
      await updateGoogleDoc(config.documentId, summary);

      await respond({
        text: '✅ Channel summary (including threads) has been added to the Google Doc!',
        response_type: 'in_channel'
      });
    } catch (error) {
      logger.error('Error in /summarize command:', error);
      await respond({
        text: 'Failed to generate summary. Please try again.',
        response_type: 'ephemeral'
      });
    }
  });
}

async function fetchChannelHistoryWithThreads(app, channelId) {
  try {
    // Get main channel messages
    const result = await app.client.conversations.history({
      channel: channelId,
      limit: 100,
      include_all_metadata: true
    });

    const messages = [];

    // Process each message and its thread
    for (const msg of result.messages) {
      // Add the main message
      messages.push({
        text: msg.text,
        user: msg.user,
        timestamp: new Date(msg.ts * 1000).toISOString().split('T')[0],
        threadTs: msg.thread_ts || msg.ts,
        isThreadParent: msg.thread_ts ? false : true,
        replyCount: msg.reply_count || 0
      });

      // If message has replies, fetch the thread
      if (msg.reply_count && msg.reply_count > 0) {
        const threadReplies = await app.client.conversations.replies({
          channel: channelId,
          ts: msg.ts,
          limit: 100
        });

        // Add thread replies (excluding the parent message)
        threadReplies.messages.slice(1).forEach(reply => {
          messages.push({
            text: reply.text,
            user: reply.user,
            timestamp: new Date(reply.ts * 1000).toISOString().split('T')[0],
            threadTs: msg.ts,
            isThreadParent: false,
            parentText: msg.text
          });
        });
      }
    }

    return messages;
  } catch (error) {
    logger.error('Error fetching channel history:', error);
    throw error;
  }
}

function extractDocId(url) {
  try {
    const docIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return docIdMatch ? docIdMatch[1] : null;
  } catch {
    return null;
  }
}