import * as dotenv from 'dotenv';
import { validateEnv } from './config/env.js';
import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './reporters/report-generator.js';

dotenv.config();

async function main() {
  // 1. Startup environment validation
  try {
    validateEnv();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Startup Error: ${message}`);
    console.error(
      'Hint: Please check your .env file and ensure GITHUB_TOKEN and ANTHROPIC_API_KEY are properly configured.'
    );
    process.exit(1);
  }

  // 2. Parse command-line arguments
  const [owner, repo, prStr] = process.argv.slice(2);

  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    console.error('Hint: Example usage: npm run dev -- danielguerra1 simple-todo-app 1');
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('PR number must be a positive integer.');
    console.error('Hint: Provide a valid PR number greater than 0.');
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

    // 3. Generate and save reports to reports/ (report.json, report.md, report.html)
    const reportGenerator = new ReportGenerator();
    await reportGenerator.generateReports(report);

    console.log('Review process completed successfully.');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Review Execution Error: ${errorMessage}`);
    console.error(
      'Hint: Verify that the specified owner, repository, and PR number exist and your GITHUB_TOKEN has access permissions.'
    );
    process.exit(1);
  }
}

main();
