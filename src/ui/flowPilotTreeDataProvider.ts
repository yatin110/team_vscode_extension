import * as vscode from "vscode";
import { ConfigurationService } from "../services/config/configurationService";
import { GitService } from "../services/git/gitService";
import { FLOWPILOT_ACTIONS } from "./flowPilotActions";

type TreeItemKind = "workflow" | "git" | "gitlab" | "support" | "config";

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

    const actionByCommand = new Map(
      FLOWPILOT_ACTIONS.map((action) => [action.command, action]),
    );

    const items: FlowPilotTreeItemDefinition[] = [
      {
        id: "config",
        label: configName,
        description: "workspace profile",
        icon: new vscode.ThemeIcon("settings-gear"),
        command: {
          command: "flowpilot.openDashboard",
          title: "Open FlowPilot Dashboard",
        },
        kind: "config",
      },
      {
        id: "dod",
        label: actionByCommand.get("flowpilot.checkDefinitionOfDone")?.label ?? "Definition of Done",
        description: status?.branch ?? "git status",
        icon: new vscode.ThemeIcon("checklist"),
        command: {
          command: "flowpilot.checkDefinitionOfDone",
          title: "Check Definition of Done",
        },
        kind: "workflow",
      },
      {
        id: "impact",
        label: "Analyse Requirement",
        icon: new vscode.ThemeIcon("inspect"),
        command: {
          command: "flowpilot.analyseRequirement",
          title: "Analyse Requirement",
        },
        kind: "workflow",
      },
      {
        id: "review",
        label: "Review Current Diff",
        description: status ? `${status.changedFiles.length} changed` : undefined,
        icon: new vscode.ThemeIcon("git-pull-request"),
        command: {
          command: "flowpilot.reviewMergeRequest",
          title: "Review Current Diff",
        },
        kind: "workflow",
      },
      {
        id: "tests",
        label: "Generate Test Scenarios",
        icon: new vscode.ThemeIcon("beaker"),
        command: {
          command: "flowpilot.generateTestScenarios",
          title: "Generate Test Scenarios",
        },
        kind: "workflow",
      },
      {
        id: "support",
        label: "Investigate Support Issue",
        icon: new vscode.ThemeIcon("pulse"),
        command: {
          command: "flowpilot.investigateSupportIssue",
          title: "Investigate Support Issue",
        },
        kind: "support",
      },
      {
        id: "git",
        label: "Git Actions",
        description: "branch, commit, push",
        icon: new vscode.ThemeIcon("source-control"),
        command: {
          command: "flowpilot.showGitStatus",
          title: "Show Git Status",
        },
        kind: "git",
      },
      {
        id: "gitlab",
        label: "GitLab",
        description: "issues and merge requests",
        icon: new vscode.ThemeIcon("remote"),
        command: {
          command: "flowpilot.gitlabTestConnection",
          title: "Test GitLab Connection",
        },
        kind: "gitlab",
      },
    ];

    return items.map((item) => new FlowPilotTreeItem(item));
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
