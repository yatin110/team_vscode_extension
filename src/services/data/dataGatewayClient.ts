import * as vscode from "vscode";
import { FlowPilotSettings } from "../../platform/settings";
import { ApprovedQueryRequest, ApprovedQueryResult } from "../../types";
import { SecretService } from "../security/secretService";

const DATA_TOKEN_KEY = "flowpilot.dataGateway.token";

export class DataGatewayClient {
  constructor(
    private readonly secrets: SecretService,
    private readonly output: vscode.OutputChannel,
  ) {}

  async runApprovedQuery(
    request: ApprovedQueryRequest,
  ): Promise<ApprovedQueryResult> {
    const token = await this.ensureToken();
    const gatewayUrl = FlowPilotSettings.dataGatewayUrl();
    const response = await fetch(`${gatewayUrl}/api/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    this.output.appendLine(
      `Data Gateway query ${request.queryId}: ${response.status}`,
    );

    if (!response.ok) {
      throw new Error(`Data Gateway request failed: ${response.status}`);
    }

    return (await response.json()) as ApprovedQueryResult;
  }

  private async ensureToken(): Promise<string> {
    const existing = await this.secrets.get(DATA_TOKEN_KEY);
    if (existing) {
      return existing;
    }

    const token = await vscode.window.showInputBox({
      title: "FlowPilot Data Gateway token",
      prompt: "Paste your data gateway token. It is stored in VS Code SecretStorage.",
      password: true,
      ignoreFocusOut: true,
    });

    if (!token) {
      throw new Error("Data Gateway token is required for this action.");
    }

    await this.secrets.store(DATA_TOKEN_KEY, token);
    return token;
  }
}
