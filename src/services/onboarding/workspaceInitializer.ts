import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { getActiveWorkspaceFolder } from "../../platform/workspace";
import { ApprovalService } from "../approval/approvalService";
import { ConfigurationService } from "../config/configurationService";

interface TemplateFile {
  relativePath: string;
  content: string;
}

export class WorkspaceInitializer {
  constructor(
    private readonly approval: ApprovalService,
    private readonly configuration: ConfigurationService,
  ) {}

  async initialize(): Promise<void> {
    const workspace = getActiveWorkspaceFolder().uri.fsPath;
    const existing = await this.existingFiles(workspace);

    if (existing.length > 0) {
      const approved = await this.approval.confirm(
        "Initialize UBS FlowPilot",
        `FlowPilot found ${existing.length} existing files. Missing files will be created, existing files will be left unchanged.`,
      );
      if (!approved) {
        return;
      }
    }

    const created: string[] = [];
    for (const file of TEMPLATE_FILES) {
      const target = path.join(workspace, file.relativePath);
      if (await exists(target)) {
        continue;
      }

      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.content, "utf8");
      created.push(file.relativePath);
    }

    this.configuration.invalidate();

    if (created.length === 0) {
      void vscode.window.showInformationMessage(
        "UBS FlowPilot workspace is already initialized.",
      );
      return;
    }

    const openConfig = "Open Config";
    const choice = await vscode.window.showInformationMessage(
      `UBS FlowPilot initialized ${created.length} files.`,
      openConfig,
    );
    if (choice === openConfig) {
      const document = await vscode.workspace.openTextDocument(
        path.join(workspace, ".flowpilot", "flowpilot.yml"),
      );
      await vscode.window.showTextDocument(document, { preview: false });
    }
  }

  private async existingFiles(workspace: string): Promise<string[]> {
    const existing: string[] = [];
    for (const file of TEMPLATE_FILES) {
      if (await exists(path.join(workspace, file.relativePath))) {
        existing.push(file.relativePath);
      }
    }
    return existing;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

const TEMPLATE_FILES: TemplateFile[] = [
  {
    relativePath: ".flowpilot/flowpilot.yml",
    content: `name: UBS FlowPilot Enterprise Reference Pack
version: 1
defaultRole: developer

applications:
  - id: reporting
    name: Reporting
    knowledgeRoots:
      - ai-knowledge/applications/reporting
    actions:
      enabled:
        - flowpilot.selectApplication
        - flowpilot.initializeWorkspace
        - flowpilot.openDashboard
        - flowpilot.analyseRequirement
        - flowpilot.generateDesignDocument
        - flowpilot.reviewMergeRequest
        - flowpilot.generateTestScenarios
        - flowpilot.checkDefinitionOfDone
        - flowpilot.investigateSupportIssue
        - flowpilot.dataRunApprovedQuery
        - flowpilot.showGitStatus
        - flowpilot.gitCreateBranch
        - flowpilot.gitCheckoutBranch
        - flowpilot.gitStageChangedFiles
        - flowpilot.gitCommitStaged
        - flowpilot.gitPushCurrentBranch
        - flowpilot.gitlabSetToken
        - flowpilot.gitlabTestConnection
        - flowpilot.gitlabOpenIssue
        - flowpilot.gitlabOpenMergeRequest
        - flowpilot.gitlabCreateIssue
        - flowpilot.openConfig
        - flowpilot.openKnowledge
    repositories:
      - name: reporting-service
        path: reporting-service
        gitlabProjectId: REPORTING_SERVICE_PROJECT_ID
        type: service
        defaultBranch: main
      - name: reporting-db
        path: reporting-db
        gitlabProjectId: REPORTING_DB_PROJECT_ID
        type: infrastructure
        defaultBranch: main
      - name: reporting-batch
        path: reporting-batch
        gitlabProjectId: REPORTING_BATCH_PROJECT_ID
        type: batch-worker
        defaultBranch: main

  - id: insights
    name: Insights
    knowledgeRoots:
      - ai-knowledge/applications/insights
    actions:
      enabled:
        - flowpilot.selectApplication
        - flowpilot.initializeWorkspace
        - flowpilot.openDashboard
        - flowpilot.analyseRequirement
        - flowpilot.generateDesignDocument
        - flowpilot.reviewMergeRequest
        - flowpilot.generateTestScenarios
        - flowpilot.checkDefinitionOfDone
        - flowpilot.showGitStatus
        - flowpilot.gitCreateBranch
        - flowpilot.gitCheckoutBranch
        - flowpilot.gitStageChangedFiles
        - flowpilot.gitCommitStaged
        - flowpilot.gitPushCurrentBranch
        - flowpilot.gitlabSetToken
        - flowpilot.gitlabTestConnection
        - flowpilot.gitlabOpenIssue
        - flowpilot.gitlabOpenMergeRequest
        - flowpilot.gitlabCreateIssue
        - flowpilot.openConfig
        - flowpilot.openKnowledge
    repositories:
      - name: insights-ui
        path: insights-ui
        gitlabProjectId: INSIGHTS_UI_PROJECT_ID
        type: frontend
        defaultBranch: main
      - name: insights-e2e
        path: insights-e2e
        gitlabProjectId: INSIGHTS_E2E_PROJECT_ID
        type: test-automation
        defaultBranch: main

gitlab:
  host: https://gitlab.company.internal
  defaultGroup: reporting-and-insights
  projectMappings:
    - repoPath: reporting-service
      projectId: REPORTING_SERVICE_PROJECT_ID
    - repoPath: reporting-db
      projectId: REPORTING_DB_PROJECT_ID
    - repoPath: reporting-batch
      projectId: REPORTING_BATCH_PROJECT_ID
    - repoPath: insights-ui
      projectId: INSIGHTS_UI_PROJECT_ID
    - repoPath: insights-e2e
      projectId: INSIGHTS_E2E_PROJECT_ID

knowledge:
  roots:
    - ai-knowledge/global
    - ai-knowledge/applications/reporting
    - ai-knowledge/applications/insights
  ignore:
    - "**/.env"
    - "**/*.pem"
    - "**/*secret*"
    - "**/customer-data/**"

workflows:
  enabled:
    - impact-analysis
    - design-document
    - mr-review
    - test-scenarios
    - support-investigation
    - definition-of-done

data:
  enabled: false
  gatewayUrl: https://flowpilot-data-gateway.company.internal
  environments:
    - name: dev
      allowed: true
    - name: test
      allowed: true
    - name: prod
      allowed: readOnly
`,
  },
  {
    relativePath: ".flowpilot/policies/token-budget.yml",
    content: `budgets:
  dailyUserLimit: 50000
  commandLimits:
    impact-analysis: 8000
    mr-review: 16000
    test-scenarios: 10000
    support-investigation: 12000
    pipeline-failure: 6000
    definition-of-done: 6000

largeContext:
  requireApprovalAbove: 12000
  summarizeBeforeSend: true
  maxGitDiffFiles: 20
  maxLogLines: 300
  maxRowsSentToAi: 20
`,
  },
  {
    relativePath: ".flowpilot/policies/security.yml",
    content: `security:
  showContextBeforeAi: true
  redactSecrets: true
  blockFiles:
    - "**/.env"
    - "**/*.pem"
    - "**/*.key"
    - "**/*secret*"
    - "**/customer-data/**"
  data:
    productionMode: approvedQueriesOnly
    maskPii: true
    maxRows: 100
    allowFreeSqlInProd: false
`,
  },
  {
    relativePath: ".flowpilot/policies/approvals.yml",
    content: `approvals:
  requiredFor:
    - gitCommit
    - gitPush
    - gitCheckoutWithDirtyTree
    - createGitLabIssue
    - updateGitLabIssue
    - createGitLabMergeRequest
    - postGitLabComment
    - runDataQuery
  blockedActions:
    - gitResetHard
    - gitClean
    - gitForcePush
    - deleteRemoteBranch
    - productionDataWrite
`,
  },
  {
    relativePath: ".flowpilot/workflows/impact-analysis.yml",
    content: `id: impact-analysis
name: Impact Analysis
roles:
  - ba
  - developer
inputs:
  - gitlab.issue
  - knowledge.applicationOverview
  - knowledge.domainModel
  - workspace.relatedFiles
ai:
  enabled: true
  maxInputTokens: 8000
  promptTemplate: prompts/impact-analysis.md
outputs:
  - businessImpact
  - technicalImpact
  - assumptions
  - openQuestions
  - acceptanceCriteria
`,
  },
  {
    relativePath: ".flowpilot/workflows/design-document.yml",
    content: `id: design-document
name: Design Document
roles:
  - developer
  - tech-lead
  - ba
inputs:
  - gitlab.issue
  - knowledge.applicationOverview
  - knowledge.architecture
  - knowledge.domainModel
  - workspace.relatedFiles
ai:
  enabled: true
  maxInputTokens: 16000
  promptTemplate: prompts/design-document.md
outputs:
  - executiveSummary
  - proposedSolution
  - architectureChanges
  - dataFlow
  - interfaceChanges
  - securityControls
  - testingStrategy
  - rolloutPlan
  - risksAndOpenQuestions
`,
  },
  {
    relativePath: ".flowpilot/workflows/mr-review.yml",
    content: `id: mr-review
name: Merge Request Review
roles:
  - developer
  - tech-lead
inputs:
  - gitlab.mergeRequest
  - git.diff
  - knowledge.codingStandards
  - knowledge.securityRules
ai:
  enabled: true
  maxInputTokens: 16000
  promptTemplate: prompts/mr-review.md
outputs:
  - reviewSummary
  - risks
  - missingTests
  - suggestedComments
approval:
  requiredFor:
    - postGitLabComment
`,
  },
  {
    relativePath: ".flowpilot/workflows/test-scenarios.yml",
    content: `id: test-scenarios
name: Test Scenario Generation
roles:
  - tester
  - ba
  - developer
inputs:
  - gitlab.issue
  - gitlab.mergeRequest
  - git.diff
  - knowledge.testStrategy
  - knowledge.domainRules
ai:
  enabled: true
  maxInputTokens: 10000
  promptTemplate: prompts/test-scenarios.md
outputs:
  - functionalTests
  - regressionTests
  - negativeTests
  - dataSetup
  - automationIdeas
`,
  },
  {
    relativePath: ".flowpilot/workflows/support-investigation.yml",
    content: `id: support-investigation
name: L3 Support Investigation
roles:
  - support
  - developer
  - tester
inputs:
  - gitlab.issue
  - data.approvedQueries
  - gitlab.pipeline
  - knowledge.runbook
ai:
  enabled: true
  maxInputTokens: 12000
  promptTemplate: prompts/support-investigation.md
outputs:
  - evidenceSummary
  - likelyCause
  - nextActions
  - gitLabCommentDraft
approval:
  requiredFor:
    - runDataQuery
    - postGitLabComment
`,
  },
  {
    relativePath: ".flowpilot/workflows/definition-of-done.yml",
    content: `id: definition-of-done
name: Definition of Done Check
roles:
  - ba
  - developer
  - tester
  - tech-lead
inputs:
  - git.status
  - git.diff
  - gitlab.mergeRequest
  - knowledge.definitionOfDone
ai:
  enabled: false
outputs:
  - missingAcceptanceCriteria
  - missingTests
  - missingDocumentation
  - pipelineState
  - approvalReadiness
`,
  },
  {
    relativePath: "ai-knowledge/global/engineering-standards.md",
    content: `---
scope: global
roles: developer,tech-lead
priority: high
---

# Engineering Standards

## Principles

- Prefer deterministic automation for Git, GitLab, tests, and build actions.
- Use AI only for analysis, summarisation, generation, review, or planning.
- Require human approval before file writes, Git writes, GitLab writes, and data queries.

## Code Review Expectations

- Changes should be small enough to review.
- Tests should cover changed behaviour.
- Security-sensitive changes need explicit review notes.
- User-facing behaviour changes need release or support notes.
`,
  },
  {
    relativePath: "ai-knowledge/global/security-rules.md",
    content: `---
scope: global
roles: ba,developer,tester,support,tech-lead
priority: high
---

# Security Rules

## AI Context

- Do not send secrets, tokens, certificates, or private keys to AI.
- Do not send raw customer records to AI.
- Prefer summaries, aggregates, and masked examples.

## Production Data

- Production data access must be read-only.
- Production queries must come from approved query catalogs.
- Query results must be row-limited, masked, and audited.
`,
  },
  {
    relativePath: "ai-knowledge/global/definition-of-done.md",
    content: `---
scope: global
roles: ba,developer,tester,tech-lead
priority: high
---

# Definition of Done

- Requirement or issue is linked.
- Acceptance criteria are clear.
- Code has been reviewed.
- Tests are added or updated.
- Relevant documentation and support notes are updated.
- Pipeline is passing or exceptions are recorded.
- Merge request description explains business and technical impact.
`,
  },
  {
    relativePath: "ai-knowledge/applications/reporting/overview.md",
    content: `---
app: reporting
roles: ba,developer,tester,support
priority: medium
---

# Reporting Application Overview

Reporting is the enterprise reporting data mart. It consolidates reporting data
from upstream systems, applies business rules, and exposes curated datasets for
dashboards, reports, and operational investigations.

## Technology

- Java services and batch components.
- Oracle schemas for curated reporting data.
- GitLab repositories for service, database, and batch code.

## Support Notes

- Start from report name, reporting period, dataset, and business key.
- Compare source extract status, transformation status, and final reporting rows.
- Use approved Oracle query catalogs through the governed Data Gateway.
`,
  },
  {
    relativePath: "ai-knowledge/applications/reporting/data-queries.yml",
    content: `queries:
  - id: reporting-row-by-business-key
    name: Find reporting rows by business key
    source: reporting-oracle
    environment: prod
    access: readOnly
    sql: |
      select report_name, reporting_period, business_key, status, updated_at
      from reporting_mart.reporting_facts
      where business_key = :businessKey
      fetch first 20 rows only
    parameters:
      businessKey:
        type: string
        required: true
    maxRows: 20
    pii: false
`,
  },
  {
    relativePath: "ai-knowledge/applications/insights/overview.md",
    content: `---
app: insights
roles: ba,developer,tester
priority: medium
---

# Insights Application Overview

Insights is a React-based UI application that connects to Reporting and presents
reporting data as dashboards and reports.

## Technology

- React frontend.
- API integration with Reporting.
- UI and end-to-end test automation.

## Support Notes

- Start from dashboard route, user role, filter selections, and reporting period.
- Compare UI totals with Reporting API responses before raising data defects.
- Treat Reporting as the system of record for reporting data.
`,
  },
  {
    relativePath: "ai-knowledge/applications/insights/api-map.md",
    content: `---
app: insights
roles: developer,tester,support
priority: high
---

# Insights API Map

## Reporting Integration

Replace these placeholders with real endpoint names once known.

| UI Area | Reporting Endpoint | Notes |
| --- | --- | --- |
| Executive dashboard | GET /api/reporting/dashboard-summary | Summary tiles and trend charts |
| Report detail | GET /api/reporting/reports/{reportId} | Detail table and drilldown data |
| Export | POST /api/reporting/reports/{reportId}/export | Async export request |

## Contract Rules

- Numeric totals must be consistent with Reporting source data.
- Date filters must use the agreed reporting-period calendar.
- Empty states must distinguish no data, no access, and service failure.
`,
  },
];
