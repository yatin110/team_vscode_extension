# Adopting New Applications Into UBS FlowPilot

This guide explains how a new team or application adopts UBS FlowPilot without
forking the extension.

## Adoption Goal

Each application should provide:

- FlowPilot configuration.
- Application knowledge.
- GitLab project mapping.
- Workflow choices.
- Optional approved data query catalog.

The extension remains shared and generic.

## Fast Start

In a new repository, use the `UBS FlowPilot: Initialize Workspace` action or
click `Initialize Workspace` in the FlowPilot Activity Bar. This creates the
standard `.flowpilot/` and `ai-knowledge/` starter structure in the current
workspace.

Then edit the generated files for the application.

## Step 1: Add Application Knowledge

Create:

```text
ai-knowledge/applications/<application-name>/
  overview.md
  architecture.md
  domain-model.md
  api-map.md
  data-model.md
  ui-flows.md
  test-strategy.md
  support-runbook.md
  known-risks.md
```

Keep files concise. FlowPilot performs better with short, structured knowledge
than with long unstructured documents.

Recommended front matter:

```md
---
app: payments
domain: refunds
roles: ba,developer,tester,support
priority: high
---
```

## Step 2: Configure FlowPilot

Create or update:

```text
.flowpilot/flowpilot.yml
```

Example:

```yaml
name: Payments FlowPilot
version: 1
defaultRole: developer

applications:
  - id: payments
    name: Payments
    knowledgeRoots:
      - ai-knowledge/applications/payments
    actions:
      enabled:
        - flowpilot.selectApplication
        - flowpilot.openDashboard
        - flowpilot.analyseRequirement
        - flowpilot.generateDesignDocument
        - flowpilot.reviewMergeRequest
        - flowpilot.generateTestScenarios
        - flowpilot.checkDefinitionOfDone
        - flowpilot.gitlabOpenIssue
        - flowpilot.gitlabOpenMergeRequest
    repositories:
      - name: payments-api
        path: payments-api
        gitlabProjectId: 12345
        type: service
        defaultBranch: main
      - name: payments-ui
        path: payments-ui
        gitlabProjectId: 12346
        type: frontend
        defaultBranch: main
      - name: payments-worker
        path: payments-worker
        gitlabProjectId: 12347
        type: batch-worker
        defaultBranch: main

gitlab:
  host: https://gitlab.company.com
  defaultGroup: payments
  projectMappings:
    - repoPath: payments-api
      projectId: 12345
    - repoPath: payments-ui
      projectId: 67890

knowledge:
  roots:
    - ai-knowledge/global
    - ai-knowledge/applications/payments

workflows:
  enabled:
    - impact-analysis
    - design-document
    - mr-review
    - test-scenarios
    - support-investigation
    - definition-of-done
```

Use `applications[].repositories[]` when one application spans multiple
repositories. Keep `gitlab.projectMappings` for compatibility with simpler
single-repository teams.

Use `applications[].actions.enabled` when an application team wants a curated
FlowPilot menu. If `enabled` is omitted, all actions are shown except actions
listed in `hidden`.

Example for a BA-heavy application:

```yaml
actions:
  enabled:
    - flowpilot.selectApplication
    - flowpilot.analyseRequirement
    - flowpilot.generateDesignDocument
    - flowpilot.generateTestScenarios
    - flowpilot.gitlabOpenIssue
```

Example for an L3 support-heavy application:

```yaml
actions:
  enabled:
    - flowpilot.selectApplication
    - flowpilot.investigateSupportIssue
    - flowpilot.dataRunApprovedQuery
    - flowpilot.gitlabOpenIssue
    - flowpilot.gitlabCreateIssue
```

## Step 3: Select Workflows

Enable only workflows the team is ready to support.

Recommended starting set:

- `impact-analysis`
- `design-document`
- `mr-review`
- `test-scenarios`
- `definition-of-done`

Add `support-investigation` after runbooks and approved data queries are ready.

## Step 4: Add Data Support Safely

For Oracle or Databricks support, use an approved query catalog.

Example:

```yaml
queries:
  - id: find-payment-by-reference
    name: Find payment by reference
    source: payments-oracle
    environment: prod
    access: readOnly
    sql: |
      select payment_id, status, amount, currency, created_at, updated_at
      from payments
      where payment_reference = :paymentReference
      fetch first 20 rows only
    parameters:
      paymentReference:
        type: string
        required: true
    maxRows: 20
    pii: false
```

Production query requirements:

- Approved query only.
- Read-only.
- Row limit.
- PII masking.
- Audit logging.
- User approval before execution.

## Step 5: Define Team Policies

Review:

```text
.flowpilot/policies/token-budget.yml
.flowpilot/policies/security.yml
.flowpilot/policies/approvals.yml
```

Recommended defaults:

- Show context before AI.
- Require approval above large-context threshold.
- Block secrets and customer data.
- Block destructive Git actions.
- Require approval for GitLab writes and data queries.

## Step 6: Pilot With One Squad

Start with a small group:

- One BA.
- Two developers.
- One tester.
- One support engineer or tech lead.

Measure:

- Time saved in MR preparation.
- Review quality.
- Test scenario coverage.
- Support investigation time.
- Token usage per workflow.

## Step 7: Promote to Wider Use

Before rollout:

- Validate knowledge files.
- Validate GitLab project mappings.
- Validate data query approvals.
- Confirm support ownership.
- Publish a known-good VSIX version.
- Share team-specific examples.

## Adoption Checklist

- [ ] Application knowledge files created.
- [ ] GitLab project IDs mapped.
- [ ] Workflows selected.
- [ ] Token limits reviewed.
- [ ] Security policy reviewed.
- [ ] Approved data queries reviewed, if applicable.
- [ ] Pilot users onboarded.
- [ ] Feedback loop established.
