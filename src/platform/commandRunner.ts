import * as vscode from "vscode";
import { FlowPilotLogger } from "./logger";

export type FlowPilotCommandHandler = () => Promise<void> | void;

export function registerFlowPilotCommand(
  context: vscode.ExtensionContext,
  command: string,
  title: string,
  logger: FlowPilotLogger,
  handler: FlowPilotCommandHandler,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(command, () =>
      runFlowPilotCommand(title, logger, handler),
    ),
  );
}

export async function runFlowPilotCommand(
  title: string,
  logger: FlowPilotLogger,
  handler: FlowPilotCommandHandler,
): Promise<void> {
  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title,
      },
      async () => handler(),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`${title}: ${message}`);
    const action = await vscode.window.showErrorMessage(
      `UBS FlowPilot: ${message}`,
      "Show Log",
      "Open Settings",
    );

    if (action === "Show Log") {
      logger.show();
    }
    if (action === "Open Settings") {
      await vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "@ext:ubs-internal.ubs-flowpilot",
      );
    }
  }
}
