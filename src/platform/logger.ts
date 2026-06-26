import * as vscode from "vscode";
import { redactSensitiveText } from "../services/security/redactor";

export class FlowPilotLogger {
  constructor(private readonly output: vscode.OutputChannel) {}

  info(message: string): void {
    this.output.appendLine(`[info] ${redactSensitiveText(message)}`);
  }

  warn(message: string): void {
    this.output.appendLine(`[warn] ${redactSensitiveText(message)}`);
  }

  error(message: string): void {
    this.output.appendLine(`[error] ${redactSensitiveText(message)}`);
  }

  show(): void {
    this.output.show(true);
  }
}
