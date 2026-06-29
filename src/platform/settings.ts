import * as vscode from "vscode";

const CONFIG_SECTION = "flowpilot";

export class FlowPilotSettings {
  static gitlabHost(): string | undefined {
    return this.optionalUrl("gitlabHost", "GitLab host");
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
    const value = this.optionalUrl(key, label);

    if (!value) {
      throw new Error(`Configure ${label} in UBS FlowPilot settings before using this action.`);
    }

    return value;
  }

  static normalizeUrl(value: string, label: string): string {
    try {
      return new URL(value).toString().replace(/\/$/, "");
    } catch {
      throw new Error(`${label} must be a valid URL.`);
    }
  }

  private static optionalUrl(key: string, label: string): string | undefined {
    const value = vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<string>(key, "")
      .trim();

    if (!value) {
      return undefined;
    }

    return this.normalizeUrl(value, label);
  }
}
