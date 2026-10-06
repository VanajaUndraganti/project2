import * as dotenv from 'dotenv';
import { validateEnv } from './config/env.js';
import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './reporters/report-generator.js';

dotenv.config();

async function main() {
  // Validate environment variables before executing any application logic
  try {
    validateEnv();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Startup Error: ${message}`);
    console.error(
      'Hint: Please check your .env file and ensure GITHUB_TOKEN and ANTHROPIC_API_KEY are configured.'
    );
    process.exit(1);
  }

  const [owner, repo, prStr] = process.argv.slice(2);

  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    console.error('Hint: Example command: npm run dev -- facebook react 12345');
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('PR number must be a positive integer.');
    console.error('Hint: Ensure the PR number is a number greater than 0.');
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

    // Instantiate ReportGenerator and save reports in JSON, Markdown, and HTML formats
    const reportGenerator = new ReportGenerator();
    await reportGenerator.generateReports(report);

    console.log('Review completed successfully. Reports saved to output directory.');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Review Failed: ${errorMessage}`);
    console.error(
      'Hint: Verify that the specified owner, repo, and PR number exist and that your GITHUB_TOKEN has access permissions.'
    );
    process.exit(1);
  }
}

main();
