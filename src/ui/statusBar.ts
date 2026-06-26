import * as vscode from "vscode";
import { ApplicationService } from "../services/application/applicationService";
import { GitService } from "../services/git/gitService";

export class FlowPilotStatusBar implements vscode.Disposable {
  private readonly item: vscode.StatusBarItem;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly git: GitService,
    private readonly applications: ApplicationService,
  ) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      96,
    );
    this.item.command = "flowpilot.runAction";
    this.item.name = "UBS FlowPilot";
    this.item.text = "$(compass) FlowPilot";
    this.item.tooltip = "Run a UBS FlowPilot workflow or action";
    this.item.show();

    this.disposables.push(
      this.item,
      vscode.window.onDidChangeActiveTextEditor(() => void this.refresh()),
      vscode.workspace.onDidChangeWorkspaceFolders(() => void this.refresh()),
      this.applications.onDidChangeSelectedApplication(() => void this.refresh()),
    );

    void this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const status = await this.git.status();
      const application = await this.applications.selectedApplication();
      this.item.text = status.branch
        ? `$(compass) FlowPilot: ${application?.name ?? status.branch}`
        : `$(compass) FlowPilot${application ? `: ${application.name}` : ""}`;
      this.item.tooltip = [
        "Run a UBS FlowPilot workflow or action",
        status.changedFiles.length > 0
          ? `${status.changedFiles.length} changed files`
          : "Working tree clean",
      ].join("\n");
    } catch {
      this.item.text = "$(compass) FlowPilot";
      this.item.tooltip = "Run a UBS FlowPilot workflow or action";
    }
  }

  dispose(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
