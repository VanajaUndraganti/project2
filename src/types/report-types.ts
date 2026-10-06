import { z } from 'zod';
import { SeveritySchema } from './analysis-results.js';

export const PullRequestInfoSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  number: z.number().int().positive(),
});

export const RecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  category: z.string(),
});

export const FileReviewSchema = z.object({
  filename: z.string().optional(),
  filePath: z.string().optional(),
  status: z.string().optional(),
  issues: z
    .array(
      z.object({
        severity: SeveritySchema.optional(),
        category: z.string().optional(),
        message: z.string().optional(),
        description: z.string().optional(),
        line: z.number().optional(),
      })
    )
    .optional(),
  testCoverage: z.any().optional(),
  refactorings: z.array(z.any()).optional(),
});

export const SummarySchema = z.object({
  totalFiles: z.number().min(0),
  overallScore: z.number().min(0).max(100),
  criticalIssues: z.number().min(0),
  highPriorityTests: z.number().min(0),
  refactoringOpportunities: z.number().min(0),
});

export const MetadataSchema = z.object({
  analyzedAt: z.string(),
  duration: z.number().optional(),
  agentVersions: z.record(z.string()).optional(),
});

export const ReviewReportSchema = z.object({
  pullRequest: PullRequestInfoSchema,
  fileReviews: z.array(FileReviewSchema),
  summary: SummarySchema,
  recommendations: z.array(RecommendationSchema),
  metadata: MetadataSchema,
});

export type PullRequestInfo = z.infer<typeof PullRequestInfoSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type FileReview = z.infer<typeof FileReviewSchema>;
export type Summary = z.infer<typeof SummarySchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type ReviewReport = z.infer<typeof ReviewReportSchema>;

export const ReviewReportJSONSchema = {
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
      items: { type: 'object' },
    },
    summary: { type: 'object' },
    recommendations: { type: 'array' },
    metadata: { type: 'object' },
  },
  required: ['pullRequest', 'fileReviews', 'summary', 'recommendations', 'metadata'],
};
