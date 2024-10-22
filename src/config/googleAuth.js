import { authenticate as googleAuth } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCOPES = ['https://www.googleapis.com/auth/documents'];
const CREDENTIALS_PATH = join(__dirname, '../../credentials.json');

export async function authenticate() {
  try {
    return await googleAuth({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH
    });
  } catch (error) {
    console.error('Failed to authenticate with Google:', error);
    throw error;
  }
}