import { query } from '@anthropic-ai/claude-agent-sdk';
import { mcpServersConfig } from './config/mcp.config.js';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester,
} from './agents/index.js';
import { orchestratorPrompt } from './prompts/orchestrator.prompt.js';
import {
  ReviewReportSchema,
  ReviewReport,
} from './types/report-types.js';

export interface OrchestratorOptions {
  model?: string;
  maxTurns?: number;
}

export class CodeReviewOrchestrator {
  private readonly model: string;
  private readonly maxTurns: number;

  constructor(options: OrchestratorOptions = {}) {
    this.model =
      options.model ||
      process.env.ANTHROPIC_MODEL ||
      'claude-sonnet-4-5-20250929';

    this.maxTurns = options.maxTurns ?? 20;
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const startTime = Date.now();

    const prompt = `
${orchestratorPrompt}

Pull request to review:
- Owner: ${owner}
- Repository: ${repo}
- Pull request number: ${prNumber}

Return only the final structured ReviewReport.
`;

    const result = query({
      prompt,
      options: {
        model: this.model,
        maxTurns: this.maxTurns,
        permissionMode: 'dontAsk',
        mcpServers: mcpServersConfig,
        allowedTools: [
          'mcp__github__pull_request_read',
          'Task',
        ],
        agents: {
          'code-quality-analyzer': codeQualityAnalyzer,
          'test-coverage-analyzer': testCoverageAnalyzer,
          'refactoring-suggester': refactoringSuggester,
        },
        outputFormat: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              pullRequest: {
                type: 'object',
                properties: {
                  owner: { type: 'string' },
                  repo: { type: 'string' },
                  number: { type: 'number' },
                },
                required: ['owner', 'repo', 'number'],
              },
              fileReviews: {
                type: 'array',
                items: {
                  type: 'object',
                },
              },
              summary: {
                type: 'object',
              },
              recommendations: {
                type: 'array',
              },
              metadata: {
                type: 'object',
              },
            },
            required: [
              'pullRequest',
              'fileReviews',
              'summary',
              'recommendations',
              'metadata',
            ],
          },
        },
      },
    });

    let structuredOutput: unknown;

    for await (const message of result) {
      if (
        message.type === 'result' &&
        message.subtype === 'success' &&
        message.structured_output
      ) {
        structuredOutput = message.structured_output;
      }
    }

    if (!structuredOutput) {
      throw new Error('Orchestrator did not return structured output.');
    }

    const parsed = ReviewReportSchema.safeParse(structuredOutput);

    if (!parsed.success) {
      throw new Error(
        `Invalid ReviewReport returned by orchestrator: ${parsed.error.message}`
      );
    }

    const duration = Date.now() - startTime;

    return {
      ...parsed.data,
      metadata: {
        ...parsed.data.metadata,
        duration,
      },
    };
  }
}

