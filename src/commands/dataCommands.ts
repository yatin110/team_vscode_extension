import * as vscode from "vscode";
import { registerFlowPilotCommand } from "../platform/commandRunner";
import { FlowPilotLogger } from "../platform/logger";
import { ApprovalService } from "../services/approval/approvalService";
import { DataGatewayClient } from "../services/data/dataGatewayClient";

export function registerDataCommands(
  context: vscode.ExtensionContext,
  data: DataGatewayClient,
  approval: ApprovalService,
  logger: FlowPilotLogger,
): void {
  registerFlowPilotCommand(
    context,
    "flowpilot.dataRunApprovedQuery",
    "Run Approved Data Query",
    logger,
    async () => {
      const sourceId = await prompt("Data source ID");
      const queryId = await prompt("Approved query ID");
      const environment = await prompt("Environment", "dev/test/prod");
      const rawParameters = await vscode.window.showInputBox({
        title: "Query Parameters",
        prompt: "Enter JSON parameters, for example {\"referenceId\":\"ABC123\"}.",
        ignoreFocusOut: true,
        value: "{}",
      });

      if (!sourceId || !queryId || !environment || rawParameters === undefined) {
        return;
      }

      const parameters = JSON.parse(rawParameters) as Record<
        string,
        string | number | boolean
      >;
      const approved = await approval.confirm(
        "Run approved data query",
        `Run approved query '${queryId}' on '${sourceId}' in '${environment}'?`,
      );
      if (!approved) {
        return;
      }

      const result = await data.runApprovedQuery({
        sourceId,
        queryId,
        environment,
        parameters,
      });

      const document = await vscode.workspace.openTextDocument({
        language: "json",
        content: JSON.stringify(result, null, 2),
      });
      await vscode.window.showTextDocument(document, { preview: false });
    },
  );
}

async function prompt(
  title: string,
  promptText?: string,
): Promise<string | undefined> {
  return vscode.window.showInputBox({
    title,
    prompt: promptText,
    ignoreFocusOut: true,
  });
}
