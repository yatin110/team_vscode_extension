import * as vscode from "vscode";
import { registerFlowPilotCommand } from "../platform/commandRunner";
import { FlowPilotLogger } from "../platform/logger";
import { ApprovalService } from "../services/approval/approvalService";
import { GitLabClient } from "../services/gitlab/gitLabClient";

export function registerGitLabCommands(
  context: vscode.ExtensionContext,
  gitlab: GitLabClient,
  approval: ApprovalService,
  logger: FlowPilotLogger,
): void {
  registerFlowPilotCommand(
    context,
    "flowpilot.gitlabSetToken",
    "Set GitLab Token",
    logger,
    async () => {
      await gitlab.promptAndStoreToken();
      void vscode.window.showInformationMessage("GitLab token stored in VS Code SecretStorage.");
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitlabClearToken",
    "Clear GitLab Token",
    logger,
    async () => {
      const approved = await approval.confirm(
        "Clear GitLab token",
        "Remove the stored GitLab token from VS Code SecretStorage?",
      );
      if (approved) {
        await gitlab.clearToken();
        void vscode.window.showInformationMessage("GitLab token removed.");
      }
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitlabTestConnection",
    "Test GitLab Connection",
    logger,
    async () => {
      const user = await gitlab.getCurrentUser();
      void vscode.window.showInformationMessage(
        `Connected to GitLab as ${user.name} (${user.username}).`,
      );
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitlabOpenIssue",
    "Open GitLab Issue",
    logger,
    async () => {
      const projectId = await prompt("GitLab project ID");
      const iid = await promptNumber("Issue IID");
      if (!projectId || iid === undefined) {
        return;
      }

      const issue = await gitlab.getIssue(projectId, iid);
      await showMarkdown(`GitLab Issue #${issue.iid}`, [
        `# ${issue.title}`,
        "",
        `Labels: ${issue.labels.join(", ") || "none"}`,
        issue.webUrl ? `URL: ${issue.webUrl}` : "",
        "",
        issue.description || "_No description._",
      ]);
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitlabOpenMergeRequest",
    "Open GitLab Merge Request",
    logger,
    async () => {
      const projectId = await prompt("GitLab project ID");
      const iid = await promptNumber("Merge request IID");
      if (!projectId || iid === undefined) {
        return;
      }

      const mr = await gitlab.getMergeRequest(projectId, iid);
      await showMarkdown(`GitLab MR !${mr.iid}`, [
        `# ${mr.title}`,
        "",
        `Source: ${mr.sourceBranch}`,
        `Target: ${mr.targetBranch}`,
        mr.webUrl ? `URL: ${mr.webUrl}` : "",
        "",
        mr.description || "_No description._",
      ]);
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitlabCreateIssue",
    "Create GitLab Issue",
    logger,
    async () => {
      const projectId = await prompt("GitLab project ID");
      const title = await prompt("Issue title");
      const description = await vscode.window.showInputBox({
        title: "Issue Description",
        prompt: "Enter a short issue description.",
        ignoreFocusOut: true,
      });

      if (!projectId || !title) {
        return;
      }

      const approved = await approval.confirm(
        "Create GitLab issue",
        `Create issue '${title}' in project '${projectId}'?`,
      );
      if (!approved) {
        return;
      }

      const issue = await gitlab.createIssue(projectId, title, description ?? "");
      void vscode.window.showInformationMessage(`Created GitLab issue #${issue.iid}.`);
    },
  );
}

async function prompt(title: string): Promise<string | undefined> {
  return vscode.window.showInputBox({ title, ignoreFocusOut: true });
}

async function promptNumber(title: string): Promise<number | undefined> {
  const value = await prompt(title);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${title} must be a positive integer.`);
  }

  return parsed;
}

async function showMarkdown(title: string, lines: string[]): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    language: "markdown",
    content: lines.join("\n"),
  });
  await vscode.window.showTextDocument(document, { preview: false });
  document.uri;
  title;
}
