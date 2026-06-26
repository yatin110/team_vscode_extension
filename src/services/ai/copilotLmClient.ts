import * as vscode from "vscode";
import { TokenBudgetService } from "../tokens/tokenBudgetService";
import { redactSensitiveText } from "../security/redactor";
import { CopilotModelService } from "./copilotModelService";

export class CopilotLmClient {
  constructor(
    private readonly tokens: TokenBudgetService,
    private readonly output: vscode.OutputChannel,
    private readonly models: CopilotModelService,
  ) {}

  async runPrompt(
    workflowId: string,
    prompt: string,
    maxInputTokens: number,
  ): Promise<string> {
    const safePrompt = redactSensitiveText(prompt);
    this.tokens.assertWithinBudget(workflowId, safePrompt, maxInputTokens);

    const model = await this.models.selectedModel();
    if (!model) {
      throw new Error("No Copilot language model is available.");
    }

    this.output.appendLine(
      `Using Copilot model ${model.id} for ${workflowId}.`,
    );

    const response = await model.sendRequest(
      [vscode.LanguageModelChatMessage.User(safePrompt)],
      {},
      new vscode.CancellationTokenSource().token,
    );

    let text = "";
    for await (const fragment of response.text) {
      text += fragment;
    }

    return text;
  }
}
