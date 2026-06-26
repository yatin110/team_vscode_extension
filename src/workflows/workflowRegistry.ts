import * as vscode from "vscode";
import { WorkflowId, WorkflowResult } from "../types";
import {
  impactAnalysisPrompt,
  designDocumentPrompt,
  mergeRequestReviewPrompt,
  supportInvestigationPrompt,
  testScenarioPrompt,
} from "./promptLibrary";
import { WorkflowContext } from "./workflowContext";

export class WorkflowRegistry {
  constructor(private readonly context: WorkflowContext) {}

  async run(id: WorkflowId): Promise<void> {
    const result = await this.execute(id);
    await this.showResult(result);
  }

  private async execute(id: WorkflowId): Promise<WorkflowResult> {
    switch (id) {
      case "impact-analysis":
        return this.impactAnalysis();
      case "mr-review":
        return this.mergeRequestReview();
      case "test-scenarios":
        return this.testScenarios();
      case "support-investigation":
        return this.supportInvestigation();
      case "definition-of-done":
        return this.definitionOfDone();
      case "design-document":
        return this.designDocument();
    }
  }

  private async impactAnalysis(): Promise<WorkflowResult> {
    const issueText = await vscode.window.showInputBox({
      title: "Requirement or issue summary",
      prompt: "Paste the requirement, GitLab issue summary, or business problem.",
      value: selectedEditorText(),
      ignoreFocusOut: true,
    });

    if (!issueText) {
      throw new Error("Requirement text is required.");
    }

    const knowledge = await this.context.knowledge.retrieve(issueText);
    const prompt = impactAnalysisPrompt(issueText, knowledge);

    const markdown = await this.context.ai.runPrompt(
      "impact-analysis",
      prompt,
      8000,
    );

    return {
      title: "Impact Analysis",
      markdown,
      usedAi: true,
      tokenEstimate: this.context.tokens.estimate(prompt),
    };
  }

  private async mergeRequestReview(): Promise<WorkflowResult> {
    const status = await this.context.git.status();
    const diff = await this.context.git.diff();
    if (!diff.trim()) {
      return {
        title: "Merge Request Review",
        markdown: "No unstaged Git diff was found in the current workspace.",
        usedAi: false,
        tokenEstimate: 0,
      };
    }

    const knowledge = await this.context.knowledge.retrieve("code review security testing");
    const prompt = mergeRequestReviewPrompt(
      status.branch,
      diff.slice(0, 50000),
      knowledge,
    );

    const markdown = await this.context.ai.runPrompt("mr-review", prompt, 16000);
    return {
      title: "Merge Request Review",
      markdown,
      usedAi: true,
      tokenEstimate: this.context.tokens.estimate(prompt),
    };
  }

  private async testScenarios(): Promise<WorkflowResult> {
    const input = await vscode.window.showInputBox({
      title: "Feature or change summary",
      prompt: "Paste the issue, feature, or MR summary to generate tests for.",
      value: selectedEditorText(),
      ignoreFocusOut: true,
    });

    if (!input) {
      throw new Error("Feature or change summary is required.");
    }

    const knowledge = await this.context.knowledge.retrieve(`${input} test strategy`);
    const prompt = testScenarioPrompt(input, knowledge);

    const markdown = await this.context.ai.runPrompt(
      "test-scenarios",
      prompt,
      10000,
    );

    return {
      title: "Test Scenarios",
      markdown,
      usedAi: true,
      tokenEstimate: this.context.tokens.estimate(prompt),
    };
  }

  private async supportInvestigation(): Promise<WorkflowResult> {
    const incident = await vscode.window.showInputBox({
      title: "Incident or support issue",
      prompt: "Paste the incident summary, error, or business reference.",
      value: selectedEditorText(),
      ignoreFocusOut: true,
    });

    if (!incident) {
      throw new Error("Incident summary is required.");
    }

    const knowledge = await this.context.knowledge.retrieve(`${incident} runbook support`);
    const prompt = supportInvestigationPrompt(incident, knowledge);

    const markdown = await this.context.ai.runPrompt(
      "support-investigation",
      prompt,
      12000,
    );

    return {
      title: "Support Investigation",
      markdown,
      usedAi: true,
      tokenEstimate: this.context.tokens.estimate(prompt),
    };
  }

  private async designDocument(): Promise<WorkflowResult> {
    const input = await vscode.window.showInputBox({
      title: "Design document input",
      prompt: "Paste the requirement, problem statement, issue, or selected context.",
      value: selectedEditorText(),
      ignoreFocusOut: true,
    });

    if (!input) {
      throw new Error("Design document input is required.");
    }

    const knowledge = await this.context.knowledge.retrieve(`${input} architecture design data security testing`);
    const prompt = designDocumentPrompt(input, knowledge);
    const markdown = await this.context.ai.runPrompt(
      "design-document",
      prompt,
      16000,
    );

    return {
      title: "Design Document",
      markdown,
      usedAi: true,
      tokenEstimate: this.context.tokens.estimate(prompt),
    };
  }

  private async definitionOfDone(): Promise<WorkflowResult> {
    const status = await this.context.git.status();
    const checks = [
      `Current branch: ${status.branch || "(detached or unavailable)"}`,
      `Changed files: ${status.changedFiles.length}`,
      `Staged files: ${status.stagedFiles.length}`,
      status.hasUncommittedChanges
        ? "Working tree has uncommitted changes."
        : "Working tree is clean.",
      "Manual checks still required: linked issue, acceptance criteria, tests, documentation, and pipeline state.",
    ];

    return {
      title: "Definition of Done",
      markdown: checks.map((line) => `- ${line}`).join("\n"),
      usedAi: false,
      tokenEstimate: 0,
    };
  }

  private async showResult(result: WorkflowResult): Promise<void> {
    const document = await vscode.workspace.openTextDocument({
      language: "markdown",
      content: [
        `# ${result.title}`,
        "",
        result.markdown,
        "",
        "---",
        `AI used: ${result.usedAi ? "yes" : "no"}`,
        `Estimated tokens: ${result.tokenEstimate}`,
      ].join("\n"),
    });

    await vscode.window.showTextDocument(document, { preview: false });
  }
}

function selectedEditorText(): string {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    return "";
  }

  return editor.document.getText(editor.selection).slice(0, 8000);
}
