import * as vscode from "vscode";
import { registerFlowPilotCommand } from "../platform/commandRunner";
import { FlowPilotLogger } from "../platform/logger";
import { getActiveWorkspaceFolder } from "../platform/workspace";
import { ApplicationService } from "../services/application/applicationService";
import { openDashboard } from "../ui/dashboard";
import { FlowPilotTreeDataProvider } from "../ui/flowPilotTreeDataProvider";
import { ConfigurationService } from "../services/config/configurationService";
import { GitService } from "../services/git/gitService";
import { WorkspaceInitializer } from "../services/onboarding/workspaceInitializer";
import { showFlowPilotActionPicker } from "../ui/actionQuickPick";
import { CopilotModelService } from "../services/ai/copilotModelService";

export function registerCoreCommands(
  context: vscode.ExtensionContext,
  configuration: ConfigurationService,
  git: GitService,
  tree: FlowPilotTreeDataProvider,
  logger: FlowPilotLogger,
  initializer: WorkspaceInitializer,
  applications: ApplicationService,
  copilotModels: CopilotModelService,
): void {
  registerFlowPilotCommand(
    context,
    "flowpilot.selectApplication",
    "Select Application",
    logger,
    async () => {
      await applications.selectApplication();
      tree.refresh();
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.initializeWorkspace",
    "Initialize Workspace",
    logger,
    async () => {
      await initializer.initialize();
      tree.refresh();
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.runAction",
    "Run FlowPilot Action",
    logger,
    () =>
      showFlowPilotActionPicker(applications),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.openDashboard",
    "Open Dashboard",
    logger,
    () =>
      openDashboard(configuration, git, applications, copilotModels),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.selectCopilotModel",
    "Select GitHub Copilot Model",
    logger,
    async () => {
      await copilotModels.selectModel();
    },
  );
  registerFlowPilotCommand(context, "flowpilot.refresh", "Refresh", logger, () =>
    tree.refresh(),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.openConfig",
    "Open Configuration",
    logger,
    async () => {
      const workspace = getActiveWorkspaceFolder().uri;
      const uri = vscode.Uri.joinPath(workspace, ".flowpilot", "flowpilot.yml");
      if (!(await exists(uri))) {
        await promptInitializeWorkspace(
          "FlowPilot configuration has not been created in this workspace.",
        );
        return;
      }
      const document = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(document, { preview: false });
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.openKnowledge",
    "Open Knowledge Pack",
    logger,
    async () => {
      const workspace = getActiveWorkspaceFolder().uri;
      const uri = vscode.Uri.joinPath(workspace, "ai-knowledge");
      if (!(await exists(uri))) {
        await promptInitializeWorkspace(
          "FlowPilot knowledge files have not been created in this workspace.",
        );
        return;
      }
      await vscode.commands.executeCommand(
        "revealInExplorer",
        uri,
      );
    },
  );
}

async function exists(uri: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(uri);
    return true;
  } catch {
    return false;
  }
}

async function promptInitializeWorkspace(message: string): Promise<void> {
  const action = await vscode.window.showInformationMessage(
    message,
    "Initialize Workspace",
  );
  if (action === "Initialize Workspace") {
    await vscode.commands.executeCommand("flowpilot.initializeWorkspace");
  }
}
