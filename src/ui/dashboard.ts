import * as vscode from "vscode";
import { CopilotModelService } from "../services/ai/copilotModelService";
import { ApplicationService } from "../services/application/applicationService";
import { ConfigurationService } from "../services/config/configurationService";
import { GitService } from "../services/git/gitService";

export async function openDashboard(
  configuration: ConfigurationService,
  git: GitService,
  applicationsService: ApplicationService,
  copilotModels: CopilotModelService,
): Promise<void> {
  const config = await configuration.load();
  const status = await safeStatus(git);
  const selectedApplication = await applicationsService.selectedApplication();
  const selectedModel = await copilotModels.selectedModelSummary();
  const applications = config.applications ?? [];
  const applicationSummary =
    applications.length === 0
      ? "- No applications configured yet."
      : applications
          .map(
            (app) =>
              `- ${app.name} (${app.id}): ${app.repositories.length} repositories`,
          )
          .join("\n");

  const document = await vscode.workspace.openTextDocument({
    language: "markdown",
    content: [
      "# UBS FlowPilot",
      "",
      `Profile: **${config.name}**`,
      `Application: **${selectedApplication?.name ?? "Not selected"}**`,
      `AI model: **${selectedModel?.name ?? "Copilot default"}**`,
      `Version: **${config.version}**`,
      "",
      "## Workspace",
      "",
      `- Branch: ${status?.branch || "unavailable"}`,
      `- Changed files: ${status?.changedFiles.length ?? "unavailable"}`,
      `- Staged files: ${status?.stagedFiles.length ?? "unavailable"}`,
      "",
      "## Applications",
      "",
      applicationSummary,
      "",
      "## Primary Workflows",
      "",
      "- Analyse requirement",
      "- Review current diff",
      "- Generate test scenarios",
      "- Investigate support issue",
      "- Check Definition of Done",
      "",
      "## Interaction Surfaces",
      "",
      "- Activity bar: UBS FlowPilot",
      "- Command Palette: `UBS FlowPilot:*`",
      "- VS Code Chat: `@flowpilot`",
      "- Explorer and editor context menus",
    ].join("\n"),
  });

  await vscode.window.showTextDocument(document, { preview: false });
}

async function safeStatus(git: GitService) {
  try {
    return await git.status();
  } catch {
    return undefined;
  }
}
