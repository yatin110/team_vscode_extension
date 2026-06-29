# UBS FlowPilot User Guide

This guide explains how BAs, developers, testers, and support engineers use the
UBS FlowPilot VS Code extension.

## What FlowPilot Does

FlowPilot helps with delivery workflows by combining:

- GitHub Copilot for analysis and generation.
- Git and GitLab automation for delivery actions.
- Markdown application knowledge.
- Controlled data investigation workflows for L3 support.
- Token and security controls.

FlowPilot does not use AI for simple deterministic actions such as branch
checkout, commit, push, or GitLab API reads.

## Main Commands

FlowPilot is available through multiple VS Code surfaces. The primary user
experience is the `UBS FlowPilot` Activity Bar widget.

- Activity Bar: open the `UBS FlowPilot` view and click actions directly.
- Status Bar: click `FlowPilot` to open the searchable action picker.
- Command Palette: run `UBS FlowPilot:*` commands.
- VS Code Chat: use `@flowpilot`.
- Explorer/editor context menus for common workflow actions.
- SCM title menu for Definition of Done and diff review.

The Activity Bar widget includes buttons for:

- Initialize Workspace.
- Delivery workflows.
- L3 support.
- Git actions.
- GitLab actions.
- Data Gateway actions.
- Configuration and knowledge packs.

From the Command Palette, the same actions are also available:

- `UBS FlowPilot: Analyse Requirement`
- `UBS FlowPilot: Generate Design Document`
- `UBS FlowPilot: Select GitHub Copilot Model`
- `UBS FlowPilot: Review Merge Request`
- `UBS FlowPilot: Generate Test Scenarios`
- `UBS FlowPilot: Investigate Support Issue`
- `UBS FlowPilot: Check Definition of Done`
- `UBS FlowPilot: Open Dashboard`
- `UBS FlowPilot: Show Git Status`
- `UBS FlowPilot: Create Branch`
- `UBS FlowPilot: Stage Changed Files`
- `UBS FlowPilot: Commit Staged Files`
- `UBS FlowPilot: Push Current Branch`
- `UBS FlowPilot: Set GitLab Token`
- `UBS FlowPilot: Open GitLab Issue`
- `UBS FlowPilot: Open GitLab Merge Request`
- `UBS FlowPilot: Create GitLab Issue`
- `UBS FlowPilot: Run Approved Data Query`

Tip: select text in the editor before running analysis, testing, or support
workflows. FlowPilot uses the selection as the initial input.

## First Use In A New Project

1. Open the project folder in VS Code.
2. Click the `UBS FlowPilot` Activity Bar icon.
3. Click `Initialize Workspace`.
4. Edit `.flowpilot/flowpilot.yml`.
5. Replace `application-id` knowledge files with your application details.

The initializer creates missing files only. It does not overwrite existing
FlowPilot configuration or knowledge files.

## GitLab Host Configuration

FlowPilot resolves the enterprise GitLab host in this order:

1. VS Code workspace setting `flowpilot.gitlabHost`.
2. `.flowpilot/flowpilot.yml` under `gitlab.host`.

If you use VS Code workspace settings, the file must be named:

```text
.vscode/settings.json
```

Example:

```json
{
  "flowpilot.gitlabHost": "https://gitlab.company.com"
}
```

The singular filename `setting.json` is ignored by VS Code.

## Selecting An Application

If the workspace contains multiple configured applications, use `Select
Application` from the Activity Bar or Status Bar picker. FlowPilot shows the
selected application in the widget and status bar, and uses that application to
decide which actions are visible.

Application teams can curate their own menu items in `.flowpilot/flowpilot.yml`
with `applications[].actions.enabled` or `applications[].actions.hidden`.

## Selecting The AI Model

Use `Select AI Model` in the Activity Bar widget, or run `UBS FlowPilot: Select
GitHub Copilot Model` from the Command Palette. FlowPilot stores the selected
model ID in workspace settings and uses it for AI workflows such as requirement
analysis, design documents, MR review, test generation, and support
investigation.

If no model is selected, FlowPilot uses the first GitHub Copilot model returned
by VS Code.

## Chat

Use VS Code Chat:

```text
@flowpilot create an impact analysis for this requirement...
@flowpilot create a technical design document for this requirement...
@flowpilot generate test scenarios for this change...
@flowpilot investigate this L3 incident...
```

Chat is for analysis and generation. Git, GitLab, and data write actions remain
separate extension commands with approval.

## BA Workflow

Use `Analyse Requirement` when you have a story, epic, or GitLab issue that
needs refinement.

FlowPilot returns:

- Business impact.
- Technical impact.
- Assumptions.
- Open questions.
- Acceptance criteria.

## Design Document Workflow

Use `Generate Design Document` when a requirement or issue needs a structured
technical design.

FlowPilot returns a markdown document with:

- Executive summary.
- Goals and non-goals.
- Proposed solution.
- Architecture and component changes.
- Data model and data flow.
- API or interface changes.
- Security and operational considerations.
- Testing strategy.
- Rollout and rollback plan.
- Risks, assumptions, and open questions.

Best input:

- A concise requirement.
- Known business rules.
- Relevant application name.
- Links or IDs for related GitLab issues.

## Developer Workflow

Use `Review Merge Request` before raising or updating an MR.

FlowPilot reads:

- Current branch.
- Current Git diff.
- Relevant engineering and security knowledge.

FlowPilot returns:

- Change summary.
- Risk areas.
- Missing tests.
- Documentation impact.
- Suggested reviewer comments.

Use `Check Definition of Done` for a token-free readiness check.

Git actions are also token-free:

- Create branch.
- Checkout branch.
- Stage changed files.
- Commit staged files.
- Push current branch.

## Tester Workflow

Use `Generate Test Scenarios` from a requirement, MR summary, or defect.

FlowPilot returns:

- Functional scenarios.
- Regression scenarios.
- Negative tests.
- Data setup.
- Automation ideas.

## L3 Support Workflow

Use `Investigate Support Issue` for incidents, defects, or production support
queries.

FlowPilot does not invent database evidence. It recommends evidence and approved
queries to run through the FlowPilot Data Gateway.

Production data rules:

- Read-only only.
- Approved queries only.
- Masked and row-limited results.
- User approval before query execution.

## Token Awareness

FlowPilot estimates token usage before AI calls. It avoids tokens for:

- Git status.
- Git checkout.
- Git commit.
- Git push.
- GitLab reads/writes.
- Definition of Done checks.
- Approved data query execution.

Use AI only when you need reasoning, summarisation, review, generation, or
planning.

## Safety Rules

Do not paste secrets, passwords, private keys, or raw customer records into
FlowPilot prompts. The extension includes redaction controls, but users should
still avoid adding sensitive content.
