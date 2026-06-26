# UBS FlowPilot

UBS FlowPilot is an enterprise VS Code assistant platform for delivery teams.
It combines GitHub Copilot, GitLab workflow automation, repository knowledge,
safe Git actions, and governed data-support workflows for BA, developer,
tester, and L3 support use cases.

## What This Repo Contains

- A VS Code extension foundation with role-based workflow commands.
- A configuration-first framework under `.flowpilot/`.
- Markdown knowledge pack templates under `ai-knowledge/`.
- Git, GitLab, Copilot, and data gateway service abstractions.
- Enterprise safety controls for tokens, secrets, approval, and production data.
- Configuration schemas under `schemas/`.
- Architecture, operating model, and user-facing documentation under `docs/`.

## Core Principle

FlowPilot uses AI only where it adds reasoning or language value. Straight
operations such as branch checkout, commit, push, GitLab reads, and approved
data queries are deterministic extension actions and do not spend tokens.

## Initial Commands

- `UBS FlowPilot: Analyse Requirement`
- `UBS FlowPilot: Generate Design Document`
- `UBS FlowPilot: Review Merge Request`
- `UBS FlowPilot: Generate Test Scenarios`
- `UBS FlowPilot: Investigate Support Issue`
- `UBS FlowPilot: Check Definition of Done`

## Extension Surfaces

- Activity Bar: `UBS FlowPilot`, with an Actions widget for primary workflows.
- Status Bar: `FlowPilot`, which opens the native action picker.
- Command Palette: `UBS FlowPilot:*`.
- VS Code Chat: `@flowpilot`.
- Editor, Explorer, and SCM context menus.

The Activity Bar widget is the primary user experience. Command Palette entries
exist for keyboard-driven users and automation-friendly access.

Selecting text before running an analysis, test, or support workflow pre-fills
the input box, reducing copy/paste friction.

## Empty Workspace Onboarding

In a new project, click `Initialize Workspace` from the FlowPilot Activity Bar.
The extension creates editable starter files:

```text
.flowpilot/
  flowpilot.yml
  policies/
  workflows/
ai-knowledge/
  global/
  applications/application-id/
```

Existing files are left unchanged.

## Application-Specific Actions

Each configured application can choose which FlowPilot actions appear in the
Activity Bar and action picker:

```yaml
applications:
  - id: payments
    name: Payments
    actions:
      enabled:
        - flowpilot.analyseRequirement
        - flowpilot.generateDesignDocument
        - flowpilot.reviewMergeRequest
        - flowpilot.generateTestScenarios
```

Users can switch the selected application from `Select Application`; the
selected application is shown in the FlowPilot widget and status bar.

## Repository Layout

```text
.flowpilot/              Team and application configuration
ai-knowledge/            Markdown knowledge packs
docs/                    Management, developer, and adoption guides
src/                     VS Code extension source
schemas/                 Configuration and workflow schema contracts
```

## Enterprise Controls

- Git, GitLab, and data operations are deterministic service calls.
- Copilot is used only for reasoning, review, summarisation, and generation.
- Tokens are stored in VS Code SecretStorage.
- Production data access is designed to go through an approved Data Gateway.
- Destructive Git actions are excluded from the default action surface.
- Team-specific behaviour is configured, not hardcoded.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Operating model](docs/OPERATING_MODEL.md)
- [Security policy](SECURITY.md)
- [Developer guide](docs/DEVELOPER_GUIDE.md)
- [Local installation](docs/LOCAL_INSTALLATION.md)
- [User guide](docs/USER_GUIDE.md)
- [Adopting new applications](docs/ADOPTING_NEW_APPLICATIONS.md)
- [Role guide: extension developer](docs/ROLE_EXTENSION_DEVELOPER.md)
- [Role guide: extension manager](docs/ROLE_EXTENSION_MANAGER.md)
- [Role guide: user](docs/ROLE_USER.md)

## Implementation Status

This repository contains the first internal reference implementation. The next
productionisation milestones are schema validation at startup, enterprise
GitLab OAuth, CI packaging, and Data Gateway integration with audited approved
queries.
