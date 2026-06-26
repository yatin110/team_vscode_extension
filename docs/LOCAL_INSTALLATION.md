# Local Installation Guide

This guide explains how to build and install UBS FlowPilot locally in VS Code.

## Prerequisites

- VS Code installed.
- Node.js 20 or later installed.
- npm available on your terminal path.
- Git installed.
- GitHub Copilot enabled in VS Code for AI-assisted workflows.

Check the basics:

```bash
node --version
npm --version
git --version
code --version
```

If `code --version` does not work, open VS Code, run the Command Palette, and
select `Shell Command: Install 'code' command in PATH`.

If `npm` is not found, install Node.js 20 or later through your approved
enterprise software channel. npm is distributed with Node.js.

On this machine, Codex also has a bundled Node.js and pnpm runtime that can be
used for local testing without changing your system PATH:

```bash
export PATH="/Users/yatinmehta/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/yatinmehta/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin:$PATH"
node --version
pnpm --version
```

## Install Dependencies

From the repository root:

```bash
cd /Users/yatinmehta/Documents/Pure_employee
npm install
```

If you are using the bundled runtime instead of npm:

```bash
cd /Users/yatinmehta/Documents/Pure_employee
pnpm install
```

If pnpm reports ignored build scripts for `@vscode/vsce-sign` or `keytar`, run:

```bash
pnpm approve-builds @vscode/vsce-sign keytar
```

If pnpm is running in a non-interactive terminal and asks about recreating
`node_modules`, use:

```bash
CI=true pnpm install
```

## Compile

```bash
npm run check
npm run compile
```

With pnpm:

```bash
pnpm run check
pnpm run compile
```

## Run In Extension Development Host

1. Open the repository folder in VS Code.
2. Press `F5`.
3. A new VS Code window opens as the Extension Development Host.
4. In that new window, click the `UBS FlowPilot` icon in the Activity Bar.
5. Use the Actions widget to run a workflow.

The extension also contributes:

- A `UBS FlowPilot` Activity Bar view with an Actions widget.
- A `FlowPilot` Status Bar entry that opens a searchable action picker.
- Editor, Explorer, and SCM context menu actions.
- A VS Code Chat participant: `@flowpilot`.

Available commands:

- `UBS FlowPilot: Analyse Requirement`
- `UBS FlowPilot: Review Merge Request`
- `UBS FlowPilot: Generate Test Scenarios`
- `UBS FlowPilot: Investigate Support Issue`
- `UBS FlowPilot: Check Definition of Done`

## Configure GitLab And Data Gateway

In VS Code settings, configure:

```json
{
  "flowpilot.gitlabHost": "https://gitlab.company.internal",
  "flowpilot.dataGatewayUrl": "https://flowpilot-data-gateway.company.internal"
}
```

The Data Gateway URL is required only for support data workflows.

## Package As A VSIX

After compilation succeeds:

```bash
npm run package
```

With pnpm:

```bash
pnpm run package
```

This creates a `.vsix` file in the repository root.

## Install The VSIX Locally

Use either the command line:

```bash
code --install-extension ubs-flowpilot-0.1.0.vsix
```

Or install through VS Code:

1. Open Extensions.
2. Select the three-dot menu.
3. Choose `Install from VSIX...`.
4. Select the generated `ubs-flowpilot-0.1.0.vsix`.

## First Smoke Test

After installation:

1. Open a Git repository in VS Code.
2. Click the `UBS FlowPilot` icon in the Activity Bar.
3. In a new project, click `Initialize Workspace`.
4. Edit `.flowpilot/flowpilot.yml`.
5. Click `Check Definition of Done`.

This command is token-free and does not require Copilot, GitLab, or Data
Gateway setup.

## Troubleshooting

If `npm run package` fails because `vsce` is missing, run:

```bash
npm install
```

If Copilot workflows fail, confirm GitHub Copilot is signed in and enabled in
VS Code.

If GitLab workflows fail, confirm `flowpilot.gitlabHost` is configured and that
your token has the required GitLab permissions.
