import * as vscode from "vscode";

export class ApprovalService {
  async confirm(title: string, detail: string): Promise<boolean> {
    const choice = await vscode.window.showWarningMessage(
      detail,
      { modal: true, detail: title },
      "Approve",
      "Cancel",
    );

    return choice === "Approve";
  }
}
