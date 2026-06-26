# UBS FlowPilot Management Summary

UBS FlowPilot is a configurable VS Code assistant framework for BA, developer,
tester, and L3 support workflows.

## Business Outcomes

- Faster issue-to-merge-request flow.
- Better requirement analysis and acceptance criteria.
- Faster MR preparation and review.
- Stronger test scenario generation.
- Faster L3 support investigation.
- Controlled token usage through deterministic automation.

## Why Build It Internally

The target environment has strict extension availability and approved AI
constraints. FlowPilot is built as an internal codebase and distributed as a
controlled VSIX artifact.

## Operating Model

Central team owns:

- Extension core.
- Security guardrails.
- Release pipeline.
- Enterprise defaults.

Application teams own:

- `.flowpilot` configuration.
- Application knowledge markdown.
- GitLab project mappings.
- Approved data query catalogs.

## Risk Controls

- Human approval before writes.
- No AI for deterministic Git/GitLab operations.
- Tokens used only for analysis, review, summarisation, and generation.
- Secret redaction before AI.
- Production data through read-only approved query gateway.
- Configurable team policies.

## Rollout Path

1. Build MVP extension.
2. Pilot with one application team.
3. Add GitLab and Git workflow hardening.
4. Add Data Gateway for L3 support.
5. Publish reusable config packs.
6. Scale to other teams without forking.
