import * as vscode from "vscode";

export function getActiveWorkspaceFolder(): vscode.WorkspaceFolder {
  const activeUri = vscode.window.activeTextEditor?.document.uri;
  if (activeUri) {
    const folder = vscode.workspace.getWorkspaceFolder(activeUri);
    if (folder) {
      return folder;
    }
  }

  const [first] = vscode.workspace.workspaceFolders ?? [];
  if (!first) {
    throw new Error("Open a workspace folder before using UBS FlowPilot.");
  }

  return first;
}
