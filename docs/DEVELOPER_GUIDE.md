# UBS FlowPilot Developer Guide

This guide is for engineers maintaining or extending the UBS FlowPilot VS Code
extension.

## Design Principles

- Keep the extension generic.
- Keep team-specific behaviour in `.flowpilot/` and `ai-knowledge/`.
- Use AI only for reasoning, summarisation, generation, review, and planning.
- Use deterministic code for Git, GitLab, data gateway, tests, and build
  actions.
- Require approval before write actions.
- Never send secrets, tokens, or raw production data to AI.

## Code Structure

```text
src/
  extension.ts
  types.ts
  services/
    ai/
    approval/
    config/
    data/
    git/
    gitlab/
    knowledge/
    security/
    tokens/
  workflows/
```

## Main Components

### `extension.ts`

Creates services and registers VS Code commands.

### `WorkflowRegistry`

Routes user commands to workflow implementations. Each workflow decides whether
AI is required. Workflows should return a `WorkflowResult`.

### UI Contributions

FlowPilot contributes:

- Activity Bar container: `flowpilot`.
- Tree view: `flowpilot.workspace`.
- Command Palette commands.
- Explorer/editor/SCM context menu actions.
- VS Code Chat participant: `@flowpilot`.

### `CopilotLmClient`

Uses the VS Code Language Model API with Copilot as the vendor. It redacts
sensitive text and checks token budget before sending prompts.

### `CopilotModelService`

Lists available GitHub Copilot chat models, stores the selected model in
workspace settings, and provides the selected model to `CopilotLmClient`.

### `GitService`

Executes deterministic Git operations with `git` via `execFile`. Do not ask AI
to produce shell commands. Add Git operations here as typed methods.

### `GitLabClient`

Uses a user token stored in VS Code SecretStorage. The host is resolved from
FlowPilot settings and should move to enterprise OAuth or SSO-backed
authentication where available.

### `ConfigurationService`

Loads `.flowpilot/flowpilot.yml`, validates the minimum required structure, and
provides configuration to runtime services. Full JSON schema enforcement should
be added before broad rollout.

### `DataGatewayClient`

Calls an enterprise FlowPilot Data Gateway. The extension should not connect
directly to production Oracle or Databricks from every user desktop.

### `KnowledgeService`

Loads Markdown knowledge from `ai-knowledge/`, compacts it, and returns the most
relevant chunks. This should evolve into section-level indexing and caching.

### `TokenBudgetService`

Provides rough token estimates and workflow budget checks.

## Adding a Workflow

1. Add a workflow ID to `src/types.ts`.
2. Add a workflow config file under `.flowpilot/workflows/`.
3. Add a command contribution in `package.json`.
4. Register the command in `src/extension.ts`.
5. Add a branch in `WorkflowRegistry.execute`.
6. Decide whether the workflow is deterministic or AI-assisted.
7. Add a tree item or menu entry if the workflow needs a visible shortcut.
8. Add tests for prompt building and action validation.

## Git Action Rules

Allowed by default:

- Status.
- Diff.
- Checkout.
- Create branch.
- Stage selected files.
- Commit staged files.
- Push current branch.

Blocked by default:

- `reset --hard`.
- `clean -fd`.
- Force push.
- Delete remote branch.
- Change remote URL.

All write operations should go through `ApprovalService`.

## GitLab Rules

- Store tokens only in SecretStorage.
- Prefer OAuth or enterprise SSO where possible.
- Do not log tokens.
- Do not send tokens to AI.
- Require approval before creating issues, comments, or merge requests.

## Data Rules

For production:

- Use the Data Gateway.
- Allow approved queries only.
- Enforce read-only access.
- Mask PII before AI.
- Send aggregates and summaries, not raw record dumps.

For non-production:

- Free SQL drafting may be allowed if team policy permits.
- Generated SQL must still be reviewed by a user.

## Packaging

Recommended internal distribution:

```text
GitHub repo -> CI build -> signed/versioned VSIX -> internal release channel
```

Keep config packs separate from the extension so teams can adopt FlowPilot
without forking the codebase.

## Local Type Check

If Node is not installed globally but the Codex bundled runtime is available:

```bash
PATH=/Users/yatinmehta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ./node_modules/.bin/tsc --noEmit -p ./
```

## Next Engineering Steps

- Enforce full JSON schema validation for `.flowpilot` at activation time.
- Resolve GitLab project mappings from workspace config.
- Add OAuth support if available in the enterprise GitLab setup.
- Add unit tests for redaction, token budget, knowledge retrieval, and Git action
  validation.
- Add VSIX packaging workflow.
