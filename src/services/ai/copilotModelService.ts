import * as vscode from "vscode";

const CONFIG_SECTION = "flowpilot";
const SELECTED_MODEL_KEY = "selectedCopilotModelId";

export interface CopilotModelSummary {
  id: string;
  name: string;
  family?: string;
  vendor?: string;
  version?: string;
}

export class CopilotModelService {
  private readonly onDidChangeSelectedModelEmitter =
    new vscode.EventEmitter<CopilotModelSummary | undefined>();

  readonly onDidChangeSelectedModel = this.onDidChangeSelectedModelEmitter.event;

  async availableModels(): Promise<vscode.LanguageModelChat[]> {
    return vscode.lm.selectChatModels({ vendor: "copilot" });
  }

  async selectedModelSummary(): Promise<CopilotModelSummary | undefined> {
    try {
      const model = await this.selectedModel();
      return model ? this.toSummary(model) : undefined;
    } catch {
      return undefined;
    }
  }

  async selectedModel(): Promise<vscode.LanguageModelChat | undefined> {
    const models = await this.availableModels();
    if (models.length === 0) {
      return undefined;
    }

    const selectedId = this.selectedModelId();
    return models.find((model) => model.id === selectedId) ?? models[0];
  }

  async selectModel(): Promise<CopilotModelSummary | undefined> {
    const models = await this.availableModels();
    if (models.length === 0) {
      void vscode.window.showWarningMessage(
        "No GitHub Copilot chat models are available in this VS Code session.",
      );
      return undefined;
    }

    const currentModelId = this.selectedModelId();
    const selected = await vscode.window.showQuickPick(
      models.map((model) => ({
        label: model.name,
        description: model.id === currentModelId ? "Current" : model.family,
        detail: model.id,
        model,
      })),
      {
        title: "Select GitHub Copilot Model",
        placeHolder: "Choose the model FlowPilot should use for AI workflows",
        matchOnDescription: true,
        matchOnDetail: true,
      },
    );

    if (!selected) {
      return undefined;
    }

    await vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .update(SELECTED_MODEL_KEY, selected.model.id, vscode.ConfigurationTarget.Workspace);

    const summary = this.toSummary(selected.model);
    this.onDidChangeSelectedModelEmitter.fire(summary);
    void vscode.window.showInformationMessage(
      `UBS FlowPilot will use ${summary.name} for AI workflows.`,
    );
    return summary;
  }

  private selectedModelId(): string {
    return vscode.workspace
      .getConfiguration(CONFIG_SECTION)
      .get<string>(SELECTED_MODEL_KEY, "")
      .trim();
  }

  private toSummary(model: vscode.LanguageModelChat): CopilotModelSummary {
    return {
      id: model.id,
      name: model.name,
      family: model.family,
      vendor: model.vendor,
      version: model.version,
    };
  }
}
