import { z } from 'zod';

export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);

export const CodeQualityIssueSchema = z.object({
  line: z.number().optional(),
  severity: SeveritySchema,
  category: z.string(),
  description: z.string(),
  suggestion: z.string(),
});

export const CodeQualityResultSchema = z.object({
  file: z.string(),
  issues: z.array(CodeQualityIssueSchema),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
});

export const TestCoverageResultSchema = z.object({
  file: z.string(),
  hasTests: z.boolean(),
  testFiles: z.array(z.string()),
  untestedPaths: z.array(z.string()),
  coverageEstimate: z.number().min(0).max(100),
  summary: z.string(),
});

export const RefactoringItemSchema = z.object({
  type: z.enum(['simplify', 'extract', 'rename', 'restructure', 'deduplicate']),
  location: z.string(),
  impact: SeveritySchema,
  description: z.string(),
  before: z.string(),
  after: z.string(),
  benefits: z.string(),
});

export const RefactoringSuggestionSchema = z.object({
  file: z.string(),
  suggestions: z.array(RefactoringItemSchema),
  summary: z.string(),
});

export type Severity = z.infer<typeof SeveritySchema>;
export type CodeQualityResult = z.infer<typeof CodeQualityResultSchema>;
export type TestCoverageResult = z.infer<typeof TestCoverageResultSchema>;
export type RefactoringSuggestion = z.infer<typeof RefactoringSuggestionSchema>;
