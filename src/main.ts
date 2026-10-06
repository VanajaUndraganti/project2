import * as dotenv from 'dotenv';
import { validateEnv } from './config/env.js';
import { CodeReviewOrchestrator } from './orchestrator.js';

dotenv.config();

async function main() {
  // Validate environment variables before executing any application logic
  try {
    validateEnv();
  } catch (error: any) {
    console.error('Environment Configuration Error:', error.message);
    process.exit(1);
  }

  const [owner, repo, prStr] = process.argv.slice(2);

  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('PR number must be a positive integer.');
    process.exit(1);
  }

  console.log(`Reviewing ${owner}/${repo} PR #${prNumber}...`);

  try {
    const orchestrator = new CodeReviewOrchestrator();

    const report = await orchestrator.reviewPullRequest(
      owner,
      repo,
      prNumber
    );

    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
