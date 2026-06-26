import * as vscode from "vscode";
import { FlowPilotAction } from "../../ui/flowPilotActions";
import {
  ConfigurationService,
  FlowPilotApplication,
} from "../config/configurationService";

const SELECTED_APPLICATION_KEY = "flowpilot.selectedApplicationId";
const ALWAYS_VISIBLE_ACTIONS = new Set([
  "flowpilot.selectApplication",
  "flowpilot.initializeWorkspace",
  "flowpilot.openDashboard",
  "flowpilot.selectCopilotModel",
  "flowpilot.runAction",
]);

export class ApplicationService {
  private readonly onDidChangeSelectedApplicationEmitter =
    new vscode.EventEmitter<FlowPilotApplication | undefined>();

  readonly onDidChangeSelectedApplication =
    this.onDidChangeSelectedApplicationEmitter.event;

  constructor(
    private readonly configuration: ConfigurationService,
    private readonly workspaceState: vscode.Memento,
  ) {}

  async applications(): Promise<FlowPilotApplication[]> {
    try {
      const config = await this.configuration.load();
      return config.applications ?? [];
    } catch {
      return [];
    }
  }

  async selectedApplication(): Promise<FlowPilotApplication | undefined> {
    const applications = await this.applications();
    if (applications.length === 0) {
      return undefined;
    }

    const selectedId = this.workspaceState.get<string>(SELECTED_APPLICATION_KEY);
    return (
      applications.find((application) => application.id === selectedId) ??
      applications[0]
    );
  }

  async selectApplication(): Promise<FlowPilotApplication | undefined> {
    const applications = await this.applications();
    if (applications.length === 0) {
      void vscode.window.showInformationMessage(
        "No applications are configured in .flowpilot/flowpilot.yml.",
      );
      return undefined;
    }

    const selected = await vscode.window.showQuickPick(
      applications.map((application) => ({
        label: application.name,
        description: application.id,
        detail: `${application.repositories.length} repositories`,
        application,
      })),
      {
        title: "Select FlowPilot Application",
        placeHolder: "Choose the application context for FlowPilot actions",
      },
    );

    if (!selected) {
      return undefined;
    }

    await this.workspaceState.update(
      SELECTED_APPLICATION_KEY,
      selected.application.id,
    );
    this.onDidChangeSelectedApplicationEmitter.fire(selected.application);
    return selected.application;
  }

  async visibleActions(actions: FlowPilotAction[]): Promise<FlowPilotAction[]> {
    const application = await this.selectedApplication();
    if (!application) {
      return actions.filter(
        (action) =>
          ALWAYS_VISIBLE_ACTIONS.has(action.command) ||
          action.command === "flowpilot.openConfig" ||
          action.command === "flowpilot.openKnowledge",
      );
    }

    const enabled = application?.actions?.enabled;
    const hidden = new Set(application?.actions?.hidden ?? []);

    if (enabled && enabled.length > 0) {
      const allowed = new Set(enabled);
      return actions.filter(
        (action) =>
          ALWAYS_VISIBLE_ACTIONS.has(action.command) ||
          allowed.has(action.command) ||
          this.hasCompatibleAlias(action.command, allowed),
      );
    }

    return actions.filter(
      (action) =>
        ALWAYS_VISIBLE_ACTIONS.has(action.command) || !hidden.has(action.command),
    );
  }

  private hasCompatibleAlias(command: string, allowed: Set<string>): boolean {
    return (
      command === "flowpilot.generateDesignDocument" &&
      allowed.has("flowpilot.createDesignDocument")
    );
  }
}
