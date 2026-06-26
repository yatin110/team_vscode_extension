# UBS FlowPilot Role Guide: User

This guide is for BAs, developers, testers, and L3 support engineers who use UBS
FlowPilot inside VS Code.

## Role Purpose

The user runs FlowPilot actions to speed up delivery and support work. Users do
not need to understand the extension internals, but they should know which
actions use AI, which actions are deterministic, and which actions require
approval.

## First Use

1. Open the workspace in VS Code.
2. Open the `UBS FlowPilot` Activity Bar view.
3. Select the application you are working on.
4. Select the GitHub Copilot model if your team requires a specific model.
5. Set your GitLab token if you plan to read or create GitLab items.
6. Run the relevant action from the widget, status bar picker, or Command
   Palette.

## Actions Performed

| Area | Actions | AI Used |
| --- | --- | --- |
| Start | Select Application, Select AI Model, Open Dashboard | No |
| BA | Analyse Requirement, Generate Design Document | Yes |
| Developer | Review Current Diff, Check Definition of Done | Review uses AI; Definition of Done is deterministic |
| Tester | Generate Test Scenarios | Yes |
| Support | Investigate Support Issue | Yes |
| Data support | Run Approved Data Query | No for query execution; results may support AI investigation |
| Git | Show Status, Create Branch, Checkout Branch, Stage, Commit, Push | No |
| GitLab | Set Token, Test Connection, Open Issue, Open MR, Create Issue | No |
| Configuration | Open Configuration, Open Knowledge Pack | No |

## Selecting The AI Model

Use `Select AI Model` in the FlowPilot Activity Bar when your team wants a
specific GitHub Copilot model. FlowPilot stores the selected model ID in
workspace settings and uses it for AI workflows.

If no model is selected, FlowPilot uses the first available GitHub Copilot model
returned by VS Code.

## What To Select Before Running Actions

- For requirement analysis, select the story, epic, issue text, or acceptance
  criteria.
- For design documents, select the requirement or paste a concise summary into
  the input box.
- For test scenarios, select the requirement, defect, or MR summary.
- For support investigation, select the incident summary or error details.
- For merge request review, make sure the current branch contains the diff to
  review.

## Approval Behaviour

FlowPilot asks for confirmation before write actions such as:

- Creating a branch.
- Staging files.
- Committing files.
- Pushing a branch.
- Creating a GitLab issue.
- Running approved data queries.

Simple reads such as Git status, opening a GitLab issue, or opening a dashboard
do not need AI and should not consume tokens.

## Good Usage Habits

- Keep inputs concise.
- Select only the relevant text before running AI workflows.
- Check generated output before using it in tickets, MRs, or design documents.
- Do not paste secrets, tokens, or raw production data into AI prompts.
- Raise missing or incorrect knowledge to your extension manager so the
  application pack improves over time.
