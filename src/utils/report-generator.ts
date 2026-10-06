import * as fs from 'fs/promises';
import * as path from 'path';
import { ReviewReport } from '../types/report-types.js';

export class ReportGenerator {
  private readonly outputDir: string;

  constructor(outputDir: string = './reports') {
    this.outputDir = path.resolve(process.cwd(), outputDir);
  }

  async generateReports(report: ReviewReport): Promise<void> {
    // Ensure the reports/ directory exists
    await fs.mkdir(this.outputDir, { recursive: true });

    // Generate formatted contents
    const jsonContent = this.generateJson(report);
    const mdContent = this.generateMarkdown(report);
    const htmlContent = this.generateHtml(report, mdContent);

    // Save files as specified: report.json, report.md, and report.html
    await fs.writeFile(path.join(this.outputDir, 'report.json'), jsonContent, 'utf-8');
    await fs.writeFile(path.join(this.outputDir, 'report.md'), mdContent, 'utf-8');
    await fs.writeFile(path.join(this.outputDir, 'report.html'), htmlContent, 'utf-8');

    console.log(`Report files successfully saved to: ${this.outputDir}`);
  }

  private generateJson(report: ReviewReport): string {
    return JSON.stringify(report, null, 2);
  }

  private generateMarkdown(report: ReviewReport): string {
    const { pullRequest, summary, fileReviews, recommendations, metadata } = report;

    let md = `# Pull Request Review Report\n\n`;
    md += `**Repository:** \`${pullRequest.owner}/${pullRequest.repo}\`  \n`;
    md += `**PR Number:** #${pullRequest.number}  \n`;
    md += `**Analyzed At:** ${metadata?.analyzedAt || new Date().toISOString()}  \n`;
    md += `**Duration:** ${metadata?.duration ? `${metadata.duration}ms` : 'N/A'}\n\n`;

    md += `---  \n\n`;
    md += `## Executive Summary\n\n`;
    if (summary) {
      md += `- **Total Files Reviewed:** ${summary.totalFiles ?? 'N/A'}\n`;
      md += `- **Overall Code Quality Score:** ${summary.overallScore ?? 'N/A'}/100\n`;
      md += `- **Critical Issues Found:** ${summary.criticalIssues ?? 0}\n`;
      md += `- **High Priority Tests Needed:** ${summary.highPriorityTests ?? 0}\n`;
      md += `- **Refactoring Opportunities:** ${summary.refactoringOpportunities ?? 0}\n\n`;
    }

    if (recommendations && recommendations.length > 0) {
      md += `## Key Recommendations\n\n`;
      recommendations.forEach((rec: any, index: number) => {
        md += `${index + 1}. ${typeof rec === 'string' ? rec : rec.description || JSON.stringify(rec)}\n`;
      });
      md += `\n`;
    }

    if (fileReviews && fileReviews.length > 0) {
      md += `## File Reviews\n\n`;
      fileReviews.forEach((file: any) => {
        md += `### File: \`${file.filename || file.filePath || 'Unknown'}\`\n\n`;
        if (file.status) md += `**Status:** ${file.status}\n\n`;
        
        if (file.issues && file.issues.length > 0) {
          md += `#### Code Quality & Security Issues\n`;
          file.issues.forEach((issue: any) => {
            md += `- **[${issue.severity || 'INFO'}]** ${issue.message || issue.description}\n`;
          });
          md += `\n`;
        }

        if (file.testCoverage) {
          md += `#### Test Coverage Analysis\n`;
          md += `${typeof file.testCoverage === 'string' ? file.testCoverage : JSON.stringify(file.testCoverage, null, 2)}\n\n`;
        }

        if (file.refactorings && file.refactorings.length > 0) {
          md += `#### Refactoring Suggestions\n`;
          file.refactorings.forEach((ref: any) => {
            md += `- ${typeof ref === 'string' ? ref : ref.suggestion || ref.description}\n`;
          });
          md += `\n`;
        }
      });
    }

    return md;
  }

  private generateHtml(report: ReviewReport, markdownContent: string): string {
    const title = `PR Review Report - ${report.pullRequest.owner}/${report.pullRequest.repo} #${report.pullRequest.number}`;
    
    // Clean formatted HTML rendering
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
    h3 { color: #16a085; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    .card { background: #f9f9f9; border-left: 4px solid #3498db; padding: 15px; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Code Review Report</h1>
    <p><strong>Repository:</strong> ${report.pullRequest.owner}/${report.pullRequest.repo}</p>
    <p><strong>PR Number:</strong> #${report.pullRequest.number}</p>
  </div>
  <pre>${this.escapeHtml(markdownContent)}</pre>
</body>
</html>`;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
