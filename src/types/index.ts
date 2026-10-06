/**
 * Type exports for the Code Review System
 * 
 * Note: For SDK types (AgentDefinition, Options, McpServerConfig, etc.)
 * import directly from '@anthropic-ai/claude-agent-sdk'
 */

export {
  SeveritySchema,
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema,
} from './analysis-results.js';

export type {
  Severity,
  CodeQualityResult,
  TestCoverageResult,
  RefactoringSuggestion,
} from './analysis-results.js';

export {
  ReviewReportSchema,
  ReviewReportJSONSchema,
} from './report-types.js';

export type { ReviewReport } from './report-types.js';
