import * as vscode from "vscode";
import { CopilotModelService } from "../services/ai/copilotModelService";
import { ApplicationService } from "../services/application/applicationService";
import { ConfigurationService } from "../services/config/configurationService";
import { GitService } from "../services/git/gitService";
import { FLOWPILOT_ACTIONS, FlowPilotAction } from "./flowPilotActions";

type TreeItemKind = "start" | "workflow" | "git" | "gitlab" | "support" | "config";

interface FlowPilotTreeItemDefinition {
  id: string;
  label: string;
  description?: string;
  icon: vscode.ThemeIcon;
  command?: vscode.Command;
  kind: TreeItemKind;
}

export class FlowPilotTreeDataProvider
  implements vscode.TreeDataProvider<FlowPilotTreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    FlowPilotTreeItem | undefined | void
  >();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(
    private readonly configuration: ConfigurationService,
    private readonly git: GitService,
    private readonly applications: ApplicationService,
    private readonly copilotModels: CopilotModelService,
  ) {}

  refresh(): void {
    this.configuration.invalidate();
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: FlowPilotTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: FlowPilotTreeItem): Promise<FlowPilotTreeItem[]> {
    if (element) {
      return [];
    }

    const status = await this.safeGitStatus();
    const configName = await this.safeConfigName();
    const selectedApplication = await this.applications.selectedApplication();
    const selectedModel = await this.copilotModels.selectedModelSummary();
    const visibleActions = await this.applications.visibleActions(FLOWPILOT_ACTIONS);

    const items: FlowPilotTreeItemDefinition[] = [
      {
        id: "config",
        label: configName,
        description: selectedApplication?.name ?? "workspace profile",
        icon: new vscode.ThemeIcon("settings-gear"),
        command: {
          command: "flowpilot.openDashboard",
          title: "Open FlowPilot Dashboard",
        },
        kind: "config",
      },
      {
        id: "application",
        label: "Application",
        description: selectedApplication?.name ?? "not selected",
        icon: new vscode.ThemeIcon("layers-active"),
        command: {
          command: "flowpilot.selectApplication",
          title: "Select Application",
        },
        kind: "start",
      },
      {
        id: "model",
        label: "AI Model",
        description: selectedModel?.name ?? "Copilot default",
        icon: new vscode.ThemeIcon("symbol-misc"),
        command: {
          command: "flowpilot.selectCopilotModel",
          title: "Select GitHub Copilot Model",
        },
        kind: "start",
      },
    ];

    for (const action of visibleActions) {
      if (!this.shouldShowActionInTree(action)) {
        continue;
      }
      items.push(this.toTreeItem(action, status));
    }

    return items.map((item) => new FlowPilotTreeItem(item));
  }

  private shouldShowActionInTree(action: FlowPilotAction): boolean {
    if (action.group === "Start" || action.group === "Configuration") {
      return false;
    }

    if (action.primary) {
      return true;
    }

    return (
      action.command === "flowpilot.showGitStatus" ||
      action.command === "flowpilot.gitlabTestConnection" ||
      action.command === "flowpilot.dataRunApprovedQuery"
    );
  }

  private toTreeItem(action: FlowPilotAction, status?: Awaited<ReturnType<GitService["status"]>>): FlowPilotTreeItemDefinition {
    return {
      id: action.command,
      label: action.label,
      description: this.descriptionForAction(action, status),
      icon: new vscode.ThemeIcon(action.icon),
      command: {
        command: action.command,
        title: action.label,
      },
      kind: this.kindForAction(action),
    };
  }

  private descriptionForAction(
    action: FlowPilotAction,
    status?: Awaited<ReturnType<GitService["status"]>>,
  ): string | undefined {
    if (action.command === "flowpilot.reviewMergeRequest" && status) {
      return `${status.changedFiles.length} changed`;
    }
    if (action.command === "flowpilot.checkDefinitionOfDone") {
      return status?.branch ?? "git status";
    }
    if (action.command === "flowpilot.showGitStatus") {
      return status?.branch ?? "branch status";
    }
    return undefined;
  }

  private kindForAction(action: FlowPilotAction): TreeItemKind {
    switch (action.group) {
      case "Support":
        return "support";
      case "Git":
        return "git";
      case "GitLab":
        return "gitlab";
      case "Start":
        return "start";
      default:
        return "workflow";
    }
  }

  private async safeGitStatus() {
    try {
      return await this.git.status();
    } catch {
      return undefined;
    }
  }

  private async safeConfigName(): Promise<string> {
    try {
      return (await this.configuration.load()).name;
    } catch {
      return "UBS FlowPilot";
    }
  }
}

export class FlowPilotTreeItem extends vscode.TreeItem {
  constructor(definition: FlowPilotTreeItemDefinition) {
    super(definition.label, vscode.TreeItemCollapsibleState.None);
    this.id = definition.id;
    this.description = definition.description;
    this.iconPath = definition.icon;
    this.command = definition.command;
    this.contextValue = definition.kind;
  }
}
