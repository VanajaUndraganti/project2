import dotenv from 'dotenv';

dotenv.config();

export const env = {
  githubToken: process.env.GITHUB_TOKEN || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  anthropicModel: process.env.ANTHROPIC_MODEL || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export function validateEnv(): void {
  if (!env.githubToken) {
    console.warn('Warning: GITHUB_TOKEN is not set.');
  }

  if (!env.anthropicApiKey) {
    console.warn('Warning: ANTHROPIC_API_KEY is not set.');
  }
}
