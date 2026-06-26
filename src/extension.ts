import * as vscode from "vscode";
import { registerCoreCommands } from "./commands/coreCommands";
import { registerDataCommands } from "./commands/dataCommands";
import { registerGitCommands } from "./commands/gitCommands";
import { registerGitLabCommands } from "./commands/gitLabCommands";
import { registerFlowPilotCommand } from "./platform/commandRunner";
import { FlowPilotLogger } from "./platform/logger";
import { ApplicationService } from "./services/application/applicationService";
import { CopilotLmClient } from "./services/ai/copilotLmClient";
import { CopilotModelService } from "./services/ai/copilotModelService";
import { ApprovalService } from "./services/approval/approvalService";
import { ConfigurationService } from "./services/config/configurationService";
import { DataGatewayClient } from "./services/data/dataGatewayClient";
import { GitService } from "./services/git/gitService";
import { GitLabClient } from "./services/gitlab/gitLabClient";
import { KnowledgeService } from "./services/knowledge/knowledgeService";
import { WorkspaceInitializer } from "./services/onboarding/workspaceInitializer";
import { SecretService } from "./services/security/secretService";
import { TokenBudgetService } from "./services/tokens/tokenBudgetService";
import { registerFlowPilotChatParticipant } from "./ui/chatParticipant";
import { FlowPilotActionsWebviewProvider } from "./ui/actionsWebviewProvider";
import { FlowPilotTreeDataProvider } from "./ui/flowPilotTreeDataProvider";
import { FlowPilotStatusBar } from "./ui/statusBar";
import { WorkflowRegistry } from "./workflows/workflowRegistry";

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel("UBS FlowPilot");
  const logger = new FlowPilotLogger(output);
  const secrets = new SecretService(context.secrets);
  const configuration = new ConfigurationService();
  const applications = new ApplicationService(configuration, context.workspaceState);
  const approval = new ApprovalService();
  const git = new GitService(output);
  const gitlab = new GitLabClient(secrets, output);
  const knowledge = new KnowledgeService(configuration, output);
  const tokens = new TokenBudgetService(output);
  const copilotModels = new CopilotModelService();
  const ai = new CopilotLmClient(tokens, output, copilotModels);
  const data = new DataGatewayClient(secrets, output);
  const initializer = new WorkspaceInitializer(approval, configuration);
  const tree = new FlowPilotTreeDataProvider(
    configuration,
    git,
    applications,
    copilotModels,
  );
  const workflows = new WorkflowRegistry({
    ai,
    approval,
    data,
    git,
    gitlab,
    knowledge,
    output,
    tokens,
  });

  context.subscriptions.push(
    output,
    new FlowPilotStatusBar(git, applications),
    vscode.window.registerWebviewViewProvider(
      FlowPilotActionsWebviewProvider.viewType,
      new FlowPilotActionsWebviewProvider(applications, copilotModels),
    ),
    vscode.window.registerTreeDataProvider("flowpilot.workspace", tree),
    applications.onDidChangeSelectedApplication(() => tree.refresh()),
    copilotModels.onDidChangeSelectedModel(() => tree.refresh()),
  );

  registerFlowPilotCommand(
    context,
    "flowpilot.analyseRequirement",
    "Analyse Requirement",
    logger,
    () =>
      workflows.run("impact-analysis"),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.reviewMergeRequest",
    "Review Current Diff",
    logger,
    () =>
      workflows.run("mr-review"),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.generateTestScenarios",
    "Generate Test Scenarios",
    logger,
    () =>
      workflows.run("test-scenarios"),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.investigateSupportIssue",
    "Investigate Support Issue",
    logger,
    () =>
      workflows.run("support-investigation"),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.checkDefinitionOfDone",
    "Check Definition of Done",
    logger,
    () =>
      workflows.run("definition-of-done"),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.createDesignDocument",
    "Create Design Document",
    logger,
    () =>
      workflows.run("design-document"),
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.generateDesignDocument",
    "Generate Design Document",
    logger,
    () =>
      workflows.run("design-document"),
  );

  registerCoreCommands(
    context,
    configuration,
    git,
    tree,
    logger,
    initializer,
    applications,
    copilotModels,
  );
  registerGitCommands(context, git, approval, logger);
  registerGitLabCommands(context, gitlab, approval, logger);
  registerDataCommands(context, data, approval, logger);
  registerFlowPilotChatParticipant(context, {
    ai,
    approval,
    data,
    git,
    gitlab,
    knowledge,
    output,
    tokens,
  });

  logger.info("UBS FlowPilot activated.");
}

export function deactivate(): void {
  // Reserved for future disposal of long-lived platform resources.
}
