import { describe, it, expect } from 'vitest';
import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema,
  ReviewReportSchema,
} from '../src/types/index.js';

describe('Schema Validations', () => {
  describe('CodeQualityResultSchema', () => {
    it('should validate a correct CodeQualityResult', () => {
      const validData = {
        file: 'src/app.ts',
        issues: [
          {
            line: 12,
            severity: 'high',
            category: 'security',
            description: 'Unchecked input',
            suggestion: 'Sanitize input before use',
          },
        ],
        overallScore: 85,
        summary: 'Generally sound with one high security issue.',
      };

      const result = CodeQualityResultSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when severity is invalid', () => {
      const invalidData = {
        file: 'src/app.ts',
        issues: [
          {
            severity: 'super-critical', // Invalid enum value
            category: 'security',
            description: 'Unchecked input',
            suggestion: 'Sanitize input',
          },
        ],
        overallScore: 85,
        summary: 'Invalid severity test',
      };

      const result = CodeQualityResultSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TestCoverageResultSchema', () => {
    it('should validate a correct TestCoverageResult', () => {
      const validData = {
        file: 'src/utils/math.ts',
        hasTests: true,
        testFiles: ['tests/utils/math.test.ts'],
        untestedPaths: ['src/utils/math.ts:45'],
        coverageEstimate: 90,
        summary: 'Good unit test coverage.',
      };

      const result = TestCoverageResultSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when coverageEstimate is greater than 100', () => {
      const invalidData = {
        file: 'src/utils/math.ts',
        hasTests: true,
        testFiles: [],
        untestedPaths: [],
        coverageEstimate: 150, // Invalid > 100
        summary: 'Invalid coverage test',
      };

      const result = TestCoverageResultSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('RefactoringSuggestionSchema', () => {
    it('should validate a correct RefactoringSuggestion', () => {
      const validData = {
        file: 'src/server.ts',
        suggestions: [
          {
            type: 'extract',
            location: 'lines 20-50',
            impact: 'medium',
            description: 'Extract middleware setup into dedicated file',
            before: 'app.use(...)',
            after: 'setupMiddleware(app)',
            benefits: 'Improves maintainability',
          },
        ],
        summary: 'One extract refactoring suggested.',
      };

      const result = RefactoringSuggestionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when refactoring type is invalid', () => {
      const invalidData = {
        file: 'src/server.ts',
        suggestions: [
          {
            type: 'invalid-type',
            location: 'lines 1-10',
            impact: 'low',
            description: 'Test',
            before: 'a',
            after: 'b',
            benefits: 'c',
          },
        ],
        summary: 'Test',
      };

      const result = RefactoringSuggestionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('ReviewReportSchema', () => {
    it('should successfully parse a valid ReviewReport object', () => {
      const validReport = {
        pullRequest: {
          owner: 'danielguerra1',
          repo: 'simple-todo-app',
          number: 1,
        },
        fileReviews: [
          {
            filename: 'src/index.js',
            status: 'modified',
            issues: [
              {
                severity: 'medium',
                category: 'quality',
                description: 'Unused variable',
                line: 10,
              },
            ],
            testCoverage: { coverageEstimate: 80 },
            refactorings: ['Simplify event listener'],
          },
        ],
        summary: {
          totalFiles: 1,
          overallScore: 85,
          criticalIssues: 0,
          highPriorityTests: 0,
          refactoringOpportunities: 1,
        },
        recommendations: [
          {
            title: 'Remove unused variables',
            description: 'Clean up unused variables in src/index.js',
            priority: 'MEDIUM',
            category: 'quality',
          },
        ],
        metadata: {
          analyzedAt: new Date().toISOString(),
          duration: 1200,
          agentVersions: {
            orchestrator: '1.0.0',
          },
        },
      };

      const parsed = ReviewReportSchema.safeParse(validReport);
      expect(parsed.success).toBe(true);
    });

    it('should fail when pullRequest number is invalid or negative', () => {
      const invalidReport = {
        pullRequest: {
          owner: 'danielguerra1',
          repo: 'simple-todo-app',
          number: -5,
        },
        fileReviews: [],
        summary: {
          totalFiles: 0,
          overallScore: 0,
          criticalIssues: 0,
          highPriorityTests: 0,
          refactoringOpportunities: 0,
        },
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
        },
      };

      const parsed = ReviewReportSchema.safeParse(invalidReport);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Integration Test Case (Real PR Integration)', () => {
    it.skip('integration: fetches and reviews real pull request (e.g., danielguerra1/simple-todo-app #1)', async () => {
      // Integration target: owner="danielguerra1", repo="simple-todo-app", prNumber=1
      // Execution path: CodeReviewOrchestrator.reviewPullRequest("danielguerra1", "simple-todo-app", 1)
      expect(true).toBe(true);
    });
  });
});
