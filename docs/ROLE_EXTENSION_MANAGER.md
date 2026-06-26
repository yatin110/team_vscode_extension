# UBS FlowPilot Role Guide: Extension Manager

This guide is for application owners or platform leads who manage FlowPilot
configuration for one or more applications.

## Role Purpose

The extension manager owns the application configuration and knowledge pack.
They decide which actions appear for a team, which repositories belong to the
application, which knowledge FlowPilot can use, and which data-support workflows
are approved.

## Main Responsibilities

- Create and maintain `.flowpilot/flowpilot.yml`.
- Maintain application knowledge under `ai-knowledge/`.
- Configure multi-repository application mappings.
- Configure application-specific action menus.
- Maintain GitLab project mappings.
- Maintain approved data query catalogs with the data/security owners.
- Define token budgets, approval policies, and support runbooks.
- Validate that users see the correct selected application in FlowPilot.

## Actions Performed

| Area | Actions | AI Used |
| --- | --- | --- |
| Workspace setup | Run Initialize Workspace to create starter configuration | No |
| Application selection | Verify users can select the right application context | No |
| Menu configuration | Add or remove commands in `applications[].actions.enabled` or `hidden` | No |
| Knowledge management | Add overview, architecture, API map, data model, test strategy, runbook files | No |
| Workflow policy | Enable workflows such as impact analysis, design document, MR review, tests, support | No |
| Copilot model default | Optionally set `flowpilot.selectedCopilotModelId` in workspace settings | No |
| GitLab mapping | Add project IDs for each repository | No |
| Data support | Add approved query catalogs and Data Gateway source IDs | No |
| Adoption support | Review generated outputs and improve knowledge files when answers are weak | AI may be used by users |

## Application Config Checklist

For each application, define:

- `id`: stable machine-readable identifier.
- `name`: display name shown in FlowPilot.
- `knowledgeRoots`: application-specific knowledge folders.
- `actions.enabled` or `actions.hidden`: curated menu actions.
- `repositories`: every Git repository owned by the application.
- `gitlabProjectId`: real enterprise GitLab project ID for each repository.
- `type`: service, frontend, batch-worker, infrastructure, test-automation, or
  other.
- `defaultBranch`: usually `main` or the enterprise default branch.

## Recommended Knowledge Files

```text
ai-knowledge/applications/<application>/
  overview.md
  architecture.md
  domain-model.md
  api-map.md
  data-model.md
  ui-flows.md
  test-strategy.md
  support-runbook.md
  known-risks.md
  data-queries.yml
```

Keep knowledge short, current, and structured. FlowPilot is more token-efficient
when knowledge files contain headings, tables, IDs, and decision rules rather
than long prose.

## Menu Configuration

Example for a BA/tester-focused team:

```yaml
actions:
  enabled:
    - flowpilot.selectApplication
    - flowpilot.analyseRequirement
    - flowpilot.generateDesignDocument
    - flowpilot.generateTestScenarios
    - flowpilot.gitlabOpenIssue
```

Example for an L3 support team:

```yaml
actions:
  enabled:
    - flowpilot.selectApplication
    - flowpilot.investigateSupportIssue
    - flowpilot.dataRunApprovedQuery
    - flowpilot.gitlabOpenIssue
    - flowpilot.gitlabCreateIssue
```

Universal actions such as selecting an application, initializing a workspace,
opening the dashboard, running the action picker, and selecting the Copilot AI
model remain visible so users can recover from configuration mistakes.

## Governance Checklist

- Replace all GitLab project placeholders before rollout.
- Confirm Data Gateway URLs and source IDs with platform owners.
- Confirm production query access is read-only.
- Confirm approved query catalogs avoid PII or mask it before AI use.
- Confirm token budgets match team usage.
- Review every action enabled for the application.
- Publish configuration changes through normal code review.
