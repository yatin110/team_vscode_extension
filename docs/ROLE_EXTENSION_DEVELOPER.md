# UBS FlowPilot Role Guide: Extension Developer

This guide is for engineers who maintain the UBS FlowPilot VS Code extension
codebase.

## Role Purpose

The extension developer owns the shared product capability. They add commands,
views, integrations, workflow engines, validation, packaging, and diagnostics.
They do not hardcode application-specific behaviour into the extension.

## Main Responsibilities

- Maintain the VS Code extension codebase.
- Keep the UI native to VS Code.
- Add or improve reusable workflow capabilities.
- Maintain Git, GitLab, Data Gateway, Copilot, token, and security services.
- Keep deterministic operations outside AI.
- Package and release signed/versioned VSIX builds.
- Protect backward compatibility for existing `.flowpilot` configurations.

## Actions Performed

| Area | Actions | AI Used |
| --- | --- | --- |
| Extension lifecycle | Activate services, register commands, register views, dispose resources | No |
| UI | Maintain Activity Bar, Actions widget, Workspace tree, status bar, Quick Pick commands | No |
| Copilot model support | List Copilot models, store selected model, route AI workflows to selected model | No for selection, yes when workflow runs |
| Workflow execution | Add workflow IDs, command handlers, prompt builders, result renderers | Depends on workflow |
| Git | Status, diff, checkout, branch, stage, commit, push through typed service methods | No |
| GitLab | Token storage, issue/MR read, issue creation, connection testing | No |
| Data Gateway | Approved-query execution, row limits, read-only controls, result rendering | No |
| Knowledge retrieval | Load and compact Markdown knowledge from configured roots | No |
| Security | Redaction, approval gates, token storage, safe logging | No |
| Packaging | Type-check, compile, package VSIX, publish release artifacts | No |

## Implementation Rules

- Put extension behaviour under `src/`.
- Put team/application behaviour under `.flowpilot/` and `ai-knowledge/`.
- Register every user-facing command in `package.json`.
- Use `registerFlowPilotCommand` for consistent progress, logging, and error
  handling.
- Use VS Code SecretStorage for tokens.
- Use typed service methods for Git/GitLab/data operations.
- Use `CopilotModelService` to resolve the selected Copilot model.
- Use `CopilotLmClient` only for AI workflows that need reasoning,
  summarisation, generation, review, or planning.
- Avoid direct shell command generation by AI.

## Files Commonly Changed

| File | Purpose |
| --- | --- |
| `src/extension.ts` | Extension activation and dependency wiring |
| `src/ui/actionsWebviewProvider.ts` | Activity Bar Actions widget |
| `src/ui/flowPilotActions.ts` | Action metadata used by widget and Quick Pick |
| `src/workflows/workflowRegistry.ts` | Workflow routing and execution |
| `src/services/ai/copilotModelService.ts` | Copilot model discovery and selection |
| `src/services/ai/copilotLmClient.ts` | AI prompt execution through VS Code LM API |
| `package.json` | Commands, views, menus, settings, activation events |

## Verification Before Release

Run:

```bash
npm run check
npm run compile
npm run package
```

Then install the generated VSIX in a clean VS Code profile and verify:

- FlowPilot Activity Bar loads.
- Initialize Workspace creates `.flowpilot` and `ai-knowledge`.
- Select Application updates the widget/status bar.
- Select AI Model lists available GitHub Copilot models.
- AI workflows use the selected model.
- Git/GitLab/data write actions request approval.
