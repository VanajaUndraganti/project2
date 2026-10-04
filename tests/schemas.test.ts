import { describe, it, expect } from 'vitest';

import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema,
  ReviewReportSchema,
} from '../src/types/index.js';

describe('Code Quality Result Schema', () => {
  it('should validate a valid code quality result', () => {
    const result = {
      file: 'src/example.ts',
      issues: [],
      overallScore: 90,
      summary: 'Good code quality',
    };

    expect(CodeQualityResultSchema.safeParse(result).success).toBe(true);
  });

  it('should reject an invalid severity', () => {
    const result = {
      file: 'src/example.ts',
      issues: [
        {
          line: 10,
          severity: 'invalid',
          category: 'style',
          description: 'Test issue',
          suggestion: 'Fix it',
        },
      ],
      overallScore: 90,
      summary: 'Test',
    };

    expect(CodeQualityResultSchema.safeParse(result).success).toBe(false);
  });
});

describe('Test Coverage Result Schema', () => {
  it('should validate a valid test coverage result', () => {
    const result = {
      file: 'src/example.ts',
      hasTests: true,
      testFiles: ['tests/example.test.ts'],
      untestedPaths: [],
      coverageEstimate: 85,
      summary: 'Good test coverage',
    };

    expect(TestCoverageResultSchema.safeParse(result).success).toBe(true);
  });

  it('should reject coverage above 100', () => {
    const result = {
      file: 'src/example.ts',
      hasTests: true,
      testFiles: [],
      untestedPaths: [],
      coverageEstimate: 120,
      summary: 'Invalid coverage',
    };

    expect(TestCoverageResultSchema.safeParse(result).success).toBe(false);
  });
});

describe('Refactoring Suggestion Schema', () => {
  it('should validate a valid refactoring suggestion', () => {
    const result = {
      file: 'src/example.ts',
      suggestions: [
        {
          type: 'simplify',
          location: 'line 10',
          impact: 'medium',
          description: 'Simplify the logic',
          before: 'complex code',
          after: 'simplified code',
          benefits: 'Improves readability',
        },
      ],
      summary: 'Some refactoring is recommended',
    };

    expect(RefactoringSuggestionSchema.safeParse(result).success).toBe(true);
  });

  it('should reject an invalid suggestion type', () => {
    const result = {
      file: 'src/example.ts',
      suggestions: [
        {
          type: 'invalid-type',
          location: 'line 10',
          impact: 'medium',
          description: 'Test',
          before: 'before',
          after: 'after',
          benefits: 'benefit',
        },
      ],
      summary: 'Test',
    };

    expect(RefactoringSuggestionSchema.safeParse(result).success).toBe(false);
  });
});

describe('Review Report Schema', () => {
  it('should be exported and available', () => {
    expect(ReviewReportSchema).toBeDefined();
  });
});
