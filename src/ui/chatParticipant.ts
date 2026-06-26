import * as vscode from "vscode";
import {
  designDocumentPrompt,
  impactAnalysisPrompt,
  supportInvestigationPrompt,
  testScenarioPrompt,
} from "../workflows/promptLibrary";
import { WorkflowContext } from "../workflows/workflowContext";

export function registerFlowPilotChatParticipant(
  context: vscode.ExtensionContext,
  workflowContext: WorkflowContext,
): void {
  const participant = vscode.chat.createChatParticipant(
    "flowpilot",
    async (request, _chatContext, response) => {
      const prompt = request.prompt.trim();
      if (!prompt) {
        response.markdown(
          "Tell me what you want to analyse, review, test, or investigate.",
        );
        return { metadata: { command: "empty" } };
      }

      response.progress("Retrieving FlowPilot knowledge...");
      const knowledge = await workflowContext.knowledge.retrieve(prompt);

      const command = classifyChatRequest(request.command, prompt);
      if (command === "commands") {
        response.markdown(commandSummary());
        return { metadata: { command } };
      }

      response.progress("Preparing governed AI context...");
      const modelPrompt = buildPrompt(command, prompt, knowledge);
      const markdown = await workflowContext.ai.runPrompt(
        `chat-${command}`,
        modelPrompt,
        10000,
      );

      response.markdown(markdown);
      return {
        metadata: {
          command,
          tokenEstimate: workflowContext.tokens.estimate(modelPrompt),
        },
      };
    },
  );

  participant.iconPath = new vscode.ThemeIcon("compass");
  participant.followupProvider = {
    provideFollowups: () => [
      { prompt: "Generate test scenarios for this change" },
      { prompt: "Create an impact analysis for this requirement" },
      { prompt: "Create an L3 support investigation plan" },
    ],
  };

  context.subscriptions.push(participant);
}

function classifyChatRequest(
  command: string | undefined,
  prompt: string,
): "impact" | "test" | "support" | "design" | "general" | "commands" {
  if (command === "help") {
    return "commands";
  }

  const lower = prompt.toLowerCase();
  if (lower.includes("design document") || lower.includes("technical design") || lower.includes("solution design")) {
    return "design";
  }
  if (lower.includes("test") || lower.includes("scenario")) {
    return "test";
  }
  if (lower.includes("incident") || lower.includes("support") || lower.includes("l3")) {
    return "support";
  }
  if (lower.includes("requirement") || lower.includes("impact")) {
    return "impact";
  }

  return "general";
}

function buildPrompt(
  command: "impact" | "test" | "support" | "design" | "general" | "commands",
  prompt: string,
  knowledge: Parameters<typeof impactAnalysisPrompt>[1],
): string {
  switch (command) {
    case "impact":
      return impactAnalysisPrompt(prompt, knowledge);
    case "test":
      return testScenarioPrompt(prompt, knowledge);
    case "support":
      return supportInvestigationPrompt(prompt, knowledge);
    case "design":
      return designDocumentPrompt(prompt, knowledge);
    case "general":
    case "commands":
      return [
        "You are UBS FlowPilot, an enterprise VS Code extension.",
        "Answer using the configured application knowledge. Keep deterministic actions outside AI.",
        "",
        "User request:",
        prompt,
        "",
        "Relevant knowledge:",
        knowledge
          .map((chunk) => `## ${chunk.title}\nSource: ${chunk.source}\n${chunk.text}`)
          .join("\n\n"),
      ].join("\n");
  }
}

function commandSummary(): string {
  return [
    "# UBS FlowPilot Chat",
    "",
    "Use `@flowpilot` for delivery and support analysis.",
    "",
    "Examples:",
    "",
    "- `@flowpilot create an impact analysis for ...`",
    "- `@flowpilot create a technical design document for ...`",
    "- `@flowpilot generate test scenarios for ...`",
    "- `@flowpilot investigate this L3 incident ...`",
    "",
    "Git, GitLab, and data write actions remain deterministic extension commands and require approval.",
  ].join("\n");
}
