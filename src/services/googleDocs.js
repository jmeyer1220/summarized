import { google } from 'googleapis';
import { authenticate } from '../config/googleAuth.js';
import { logger } from '../utils/logger.js';

export async function updateGoogleDoc(docId, content) {
  try {
    const auth = await authenticate();
    const docs = google.docs({ version: 'v1', auth });

    // Get the current document
    const doc = await docs.documents.get({
      documentId: docId
    });

    // Prepare the requests to update the document
    const requests = [{
      insertText: {
        location: {
          index: doc.data.body.content[0].endIndex - 1
        },
        text: `\n${content}\n`
      }
    }];

    // Execute the update
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests
      }
    });

    logger.info(`Successfully updated Google Doc: ${docId}`);
  } catch (error) {
    logger.error('Error updating Google Doc:', error);
    throw error;
  }
}