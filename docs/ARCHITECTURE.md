# UBS FlowPilot Architecture

UBS FlowPilot is an internal VS Code extension platform for delivery and L3
support workflows. It is built as a generic extension core with team-owned
configuration and application knowledge packs.

## Architectural Goals

- Keep deterministic operations token-free.
- Use AI only for reasoning, summarisation, review, and generation.
- Require human approval before write actions.
- Make adoption possible without code forks.
- Route production data through centrally governed services.

## Runtime View

```text
VS Code Command
  -> Workflow Registry
  -> Context Builder
  -> Token Budget + Redaction
  -> Optional Copilot LM Call
  -> Approval Service
  -> Deterministic Action Service
```

## Interaction Surfaces

- Activity Bar Actions widget for command-centre navigation.
- Status Bar entry for one-click access to the native action picker.
- Command Palette for every workflow and action.
- Context menus for editor, explorer, and SCM workflows.
- VS Code Chat participant `@flowpilot` for analysis and generation.
- Markdown result documents for reviewable outputs.

FlowPilot resolves the active workspace from the focused editor first, then
falls back to the first workspace folder. This keeps multi-root workspaces
predictable without adding setup friction.

## Main Services

| Service | Responsibility |
| --- | --- |
| `CopilotLmClient` | Executes approved AI prompts through the VS Code Language Model API. |
| `GitService` | Runs deterministic Git operations through typed methods. |
| `GitLabClient` | Reads and writes GitLab issues and merge requests using user credentials. |
| `DataGatewayClient` | Runs approved data queries through an enterprise gateway. |
| `ConfigurationService` | Loads workspace FlowPilot configuration and exposes runtime settings. |
| `KnowledgeService` | Retrieves compact Markdown knowledge chunks for workflow context. |
| `TokenBudgetService` | Estimates context size and enforces workflow budgets. |
| `ApprovalService` | Requires user confirmation before sensitive operations. |

## Configuration Model

FlowPilot resolves behaviour from:

```text
VS Code settings
.flowpilot/flowpilot.yml
.flowpilot/workflows/*.yml
.flowpilot/policies/*.yml
ai-knowledge/**
```

The extension core should not contain team-specific application logic. Teams
adopt FlowPilot by adding configuration, knowledge, and approved query catalogs.

## AI Boundary

AI is allowed to:

- Summarise requirements, MRs, logs, and evidence.
- Generate acceptance criteria, test scenarios, and MR descriptions.
- Review diffs against standards.
- Recommend investigation steps.

AI is not allowed to:

- Run arbitrary shell commands.
- Execute free-form production SQL.
- Commit, push, or create GitLab records without approval.
- Decide to bypass configured policies.

## Data Boundary

The VS Code extension should not become a direct production database client for
every desktop. Production Oracle and Databricks access should be mediated by the
FlowPilot Data Gateway with central audit, masking, rate limits, and approved
query catalogs.
