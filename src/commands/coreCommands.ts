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
      await vscode.commands.executeCommand(
        "revealInExplorer",
        vscode.Uri.joinPath(workspace, "ai-knowledge"),
      );
    },
  );
}
