import * as vscode from "vscode";
import { ApplicationService } from "../services/application/applicationService";
import { FLOWPILOT_ACTIONS } from "./flowPilotActions";

interface FlowPilotQuickPickItem extends vscode.QuickPickItem {
  command: string;
}

export async function showFlowPilotActionPicker(
  applications: ApplicationService,
): Promise<void> {
  const selectedApplication = await applications.selectedApplication();
  const visibleActions = await applications.visibleActions(FLOWPILOT_ACTIONS);
  const items: FlowPilotQuickPickItem[] = visibleActions.map((action) => ({
    label: `$(${action.icon}) ${action.label}`,
    description: action.group,
    detail: action.description,
    command: action.command,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: selectedApplication
      ? `UBS FlowPilot - ${selectedApplication.name}`
      : "UBS FlowPilot",
    placeHolder: "Choose a workflow or action",
    matchOnDescription: true,
    matchOnDetail: true,
  });

  if (selected) {
    await vscode.commands.executeCommand(selected.command);
  }
}
