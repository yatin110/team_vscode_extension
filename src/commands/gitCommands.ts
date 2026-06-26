import * as vscode from "vscode";
import { FlowPilotLogger } from "../platform/logger";
import { registerFlowPilotCommand } from "../platform/commandRunner";
import { ApprovalService } from "../services/approval/approvalService";
import { GitService } from "../services/git/gitService";

export function registerGitCommands(
  context: vscode.ExtensionContext,
  git: GitService,
  approval: ApprovalService,
  logger: FlowPilotLogger,
): void {
  registerFlowPilotCommand(
    context,
    "flowpilot.showGitStatus",
    "Show Git Status",
    logger,
    async () => {
      const status = await git.status();
      await showMarkdown("Git Status", [
        `- Branch: ${status.branch || "(detached)"}`,
        `- Changed files: ${status.changedFiles.length}`,
        `- Staged files: ${status.stagedFiles.length}`,
        `- Has uncommitted changes: ${status.hasUncommittedChanges ? "yes" : "no"}`,
        "",
        "## Changed Files",
        "",
        ...status.changedFiles.map((file) => `- ${file}`),
      ]);
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitCreateBranch",
    "Create Branch",
    logger,
    async () => {
      const branchName = await vscode.window.showInputBox({
        title: "Create Branch",
        prompt: "Enter the new branch name.",
        ignoreFocusOut: true,
      });

      if (!branchName) {
        return;
      }

      const approved = await approval.confirm(
        "Create Git branch",
        `Create and checkout branch '${branchName}'?`,
      );
      if (approved) {
        await git.createBranch(branchName);
        void vscode.window.showInformationMessage(`Created branch ${branchName}.`);
      }
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitCheckoutBranch",
    "Checkout Branch",
    logger,
    async () => {
      const branches = await git.listBranches();
      const branchName =
        (await vscode.window.showQuickPick(branches, {
          title: "Checkout Branch",
          placeHolder: "Choose a branch",
        })) ??
        (await vscode.window.showInputBox({
          title: "Checkout Branch",
          prompt: "Enter the branch name to checkout.",
          ignoreFocusOut: true,
        }));

      if (!branchName) {
        return;
      }

      const status = await git.status();
      const needsApproval = status.hasUncommittedChanges;
      const approved =
        !needsApproval ||
        (await approval.confirm(
          "Checkout with uncommitted changes",
          `Checkout '${branchName}' with ${status.changedFiles.length} changed files in the working tree?`,
        ));

      if (approved) {
        await git.checkout(branchName);
        void vscode.window.showInformationMessage(`Checked out ${branchName}.`);
      }
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitStageChangedFiles",
    "Stage Changed Files",
    logger,
    async () => {
      const status = await git.status();
      if (status.changedFiles.length === 0) {
        void vscode.window.showInformationMessage("No changed files to stage.");
        return;
      }

      const selected = await vscode.window.showQuickPick(status.changedFiles, {
        title: "Stage Changed Files",
        canPickMany: true,
      });

      if (!selected || selected.length === 0) {
        return;
      }

      const approved = await approval.confirm(
        "Stage files",
        `Stage ${selected.length} selected files?`,
      );
      if (approved) {
        await git.stageFiles(selected);
        void vscode.window.showInformationMessage(`Staged ${selected.length} files.`);
      }
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitCommitStaged",
    "Commit Staged Files",
    logger,
    async () => {
      const status = await git.status();
      if (status.stagedFiles.length === 0) {
        void vscode.window.showInformationMessage("No staged files to commit.");
        return;
      }

      const message = await vscode.window.showInputBox({
        title: "Commit Staged Files",
        prompt: "Enter the commit message.",
        ignoreFocusOut: true,
      });

      if (!message) {
        return;
      }

      const approved = await approval.confirm(
        "Commit staged files",
        `Commit ${status.stagedFiles.length} staged files with message '${message}'?`,
      );
      if (approved) {
        await git.commit(message);
        void vscode.window.showInformationMessage("Committed staged files.");
      }
    },
  );
  registerFlowPilotCommand(
    context,
    "flowpilot.gitPushCurrentBranch",
    "Push Current Branch",
    logger,
    async () => {
      const status = await git.status();
      if (!status.branch) {
        throw new Error("Cannot push from a detached HEAD state.");
      }

      const approved = await approval.confirm(
        "Push current branch",
        `Push '${status.branch}' to origin?`,
      );
      if (approved) {
        await git.push(status.branch);
        void vscode.window.showInformationMessage(`Pushed ${status.branch}.`);
      }
    },
  );
}

async function showMarkdown(title: string, lines: string[]): Promise<void> {
  const document = await vscode.workspace.openTextDocument({
    language: "markdown",
    content: [`# ${title}`, "", ...lines].join("\n"),
  });
  await vscode.window.showTextDocument(document, { preview: false });
}
