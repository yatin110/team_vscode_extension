import * as vscode from "vscode";

const CONFIG_SECTION = "flowpilot";

export class FlowPilotSettings {
  static gitlabHost(): string {
    return this.requiredUrl("gitlabHost", "GitLab host");
  }

  static dataGatewayUrl(): string {
    return this.requiredUrl("dataGatewayUrl", "Data Gateway URL");
  }

  static showContextBeforeAi(): boolean {
    return vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<boolean>("showContextBeforeAi", true);
  }

  static requireApprovalForWrites(): boolean {
    return vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<boolean>("requireApprovalForWrites", true);
  }

  private static requiredUrl(key: string, label: string): string {
    const value = vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<string>(key, "")
      .trim();

    if (!value) {
      throw new Error(`Configure ${label} in UBS FlowPilot settings before using this action.`);
    }

    try {
      return new URL(value).toString().replace(/\/$/, "");
    } catch {
      throw new Error(`${label} must be a valid URL.`);
    }
  }
}
