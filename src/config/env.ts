import dotenv from 'dotenv';

dotenv.config();

export const config = {
  githubToken: process.env.GITHUB_TOKEN,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  logLevel: process.env.LOG_LEVEL || 'info',
};

export function validateEnv(): void {
  const missingVars: string[] = [];

  if (!process.env.GITHUB_TOKEN) {
    missingVars.push('GITHUB_TOKEN');
  }

  // Add any other required tokens here if applicable
  if (!process.env.ANTHROPIC_API_KEY) {
    missingVars.push('ANTHROPIC_API_KEY');
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missingVars.join(
        ', '
      )}. Please set them in your .env file or environment.`
    );
  }
}
