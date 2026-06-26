import * as vscode from "vscode";

export class TokenBudgetService {
  constructor(private readonly output: vscode.OutputChannel) {}

  estimate(input: string): number {
    return Math.ceil(input.length / 4);
  }

  assertWithinBudget(workflowId: string, input: string, maxTokens: number): void {
    const estimate = this.estimate(input);
    this.output.appendLine(
      `Token estimate for ${workflowId}: ${estimate}/${maxTokens}`,
    );

    if (estimate > maxTokens) {
      throw new Error(
        `FlowPilot context is too large for ${workflowId}: ${estimate} estimated tokens, max ${maxTokens}.`,
      );
    }
  }
}
