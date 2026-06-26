import * as vscode from "vscode";
import { CopilotModelService } from "../services/ai/copilotModelService";
import { ApplicationService } from "../services/application/applicationService";
import { FLOWPILOT_ACTIONS, FlowPilotActionGroup } from "./flowPilotActions";

export class FlowPilotActionsWebviewProvider implements vscode.WebviewViewProvider {
  static readonly viewType = "flowpilot.actions";
  private view: vscode.WebviewView | undefined;

  constructor(
    private readonly applications: ApplicationService,
    private readonly copilotModels: CopilotModelService,
  ) {
    this.applications.onDidChangeSelectedApplication(() => {
      void this.refresh();
    });
    this.copilotModels.onDidChangeSelectedModel(() => {
      void this.refresh();
    });
  }

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.html = await this.html(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (message: { command?: string }) => {
      if (message.command) {
        await vscode.commands.executeCommand(message.command);
      }
    });
  }

  async refresh(): Promise<void> {
    if (this.view) {
      this.view.webview.html = await this.html(this.view.webview);
    }
  }

  private async html(webview: vscode.Webview): Promise<string> {
    const nonce = String(Date.now());
    const csp = [
      "default-src 'none'",
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
    ].join("; ");

    const selectedApplication = await this.applications.selectedApplication();
    const selectedModel = await this.copilotModels.selectedModelSummary();
    const body = await this.renderActions();

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      margin: 0;
      padding: 14px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      background: var(--vscode-sideBar-background);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    .mark {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      background: var(--vscode-foreground);
      position: relative;
    }
    .mark::after {
      content: "";
      position: absolute;
      right: 4px;
      top: 7px;
      width: 8px;
      height: 8px;
      border-right: 3px solid #e85d2a;
      border-top: 3px solid #e85d2a;
      transform: rotate(45deg);
    }
    h2 {
      font-size: 13px;
      line-height: 18px;
      margin: 0;
      font-weight: 700;
      letter-spacing: 0;
    }
    .section {
      margin: 16px 0 8px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    button {
      width: 100%;
      min-height: 34px;
      margin: 0 0 7px;
      padding: 7px 9px;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      font-family: var(--vscode-font-family);
      font-size: 12px;
      text-align: left;
      cursor: pointer;
    }
    button.secondary {
      color: var(--vscode-foreground);
      background: var(--vscode-input-background);
      border-color: var(--vscode-input-border, var(--vscode-panel-border));
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    button:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }
    button.secondary:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .hint {
      margin-top: 14px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      line-height: 17px;
    }
    .app {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      margin: -8px 0 12px;
    }
    .meta {
      display: grid;
      gap: 4px;
      margin: -8px 0 12px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      line-height: 17px;
    }
    .meta strong {
      color: var(--vscode-foreground);
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="mark"></div>
    <h2>UBS FlowPilot</h2>
  </div>
  <div class="meta">
    <div>Application: <strong>${escapeHtml(selectedApplication?.name ?? "Not selected")}</strong></div>
    <div>AI model: <strong>${escapeHtml(selectedModel?.name ?? "Copilot default")}</strong></div>
  </div>

  <button type="button" data-command="flowpilot.selectApplication" class="secondary">Select Application</button>
  <button type="button" data-command="flowpilot.selectCopilotModel" class="secondary">Select AI Model</button>
  <button type="button" data-command="flowpilot.initializeWorkspace">Initialize Workspace</button>
  <button type="button" data-command="flowpilot.openDashboard" class="secondary">Open Dashboard</button>
  ${selectedApplication ? "" : `<div class="hint">Start by initializing this workspace. FlowPilot will create editable .flowpilot and ai-knowledge templates.</div>`}
  ${body}

  <div class="hint">
    AI is used for analysis and generation. Git, GitLab, and data actions are deterministic and approval-controlled.
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.querySelectorAll("button[data-command]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({ command: button.dataset.command });
      });
    });
  </script>
</body>
</html>`;
  }

  private async renderActions(): Promise<string> {
    const groups: FlowPilotActionGroup[] = [
      "Delivery",
      "Support",
      "Git",
      "GitLab",
      "Configuration",
    ];

    const visibleActions = await this.applications.visibleActions(FLOWPILOT_ACTIONS);
    return groups
      .map((group) => {
        const actions = visibleActions.filter(
          (action) => action.group === group && action.command !== "flowpilot.openDashboard",
        );
        return [
          `<div class="section">${escapeHtml(group)}</div>`,
          ...actions.map(
            (action) =>
              `<button type="button" class="${action.primary ? "" : "secondary"}" data-command="${escapeHtml(action.command)}" aria-label="${escapeHtml(action.label)}. ${escapeHtml(action.description)}">${escapeHtml(action.label)}</button>`,
          ),
        ].join("\n");
      })
      .join("\n");
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
