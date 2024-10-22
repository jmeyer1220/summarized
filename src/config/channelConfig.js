import Conf from 'conf';

const config = new Conf({
  projectName: 'slack-summarizer',
  schema: {
    channels: {
      type: 'object',
      default: {},
      additionalProperties: {
        type: 'object',
        properties: {
          documentId: { type: 'string' },
          updateFrequency: { type: 'string', default: 'daily' }
        }
      }
    }
  }
});

export function getChannelConfig(channelId) {
  return config.get(`channels.${channelId}`);
}

export function setChannelConfig(channelId, documentId, frequency = 'daily') {
  config.set(`channels.${channelId}`, {
    documentId,
    updateFrequency: frequency
  });
}