import { KnowledgeChunk } from "../types";

export function impactAnalysisPrompt(input: string, knowledge: KnowledgeChunk[]): string {
  return [
    systemFrame("Impact Analysis"),
    "Task: produce a delivery-grade impact analysis for a BA and engineering audience.",
    "Return sections: Business impact, Technical impact, Assumptions, Open questions, Acceptance criteria.",
    "Be specific. Do not invent systems, APIs, data stores, or policies that are not in the input.",
    "",
    "Input:",
    input,
    "",
    knowledgeBlock(knowledge),
  ].join("\n");
}

export function mergeRequestReviewPrompt(
  branch: string,
  diff: string,
  knowledge: KnowledgeChunk[],
): string {
  return [
    systemFrame("Merge Request Review"),
    "Task: review the current Git diff for an enterprise software delivery team.",
    "Return sections: Summary, Behavioural risks, Security risks, Missing tests, Documentation impact, Suggested reviewer comments.",
    "Prioritise material findings over style comments.",
    "",
    `Branch: ${branch}`,
    "",
    knowledgeBlock(knowledge),
    "",
    "Diff:",
    diff,
  ].join("\n");
}

export function testScenarioPrompt(input: string, knowledge: KnowledgeChunk[]): string {
  return [
    systemFrame("Test Scenario Generation"),
    "Task: generate a test plan for a tester who needs actionable scenarios.",
    "Return sections: Functional scenarios, Regression scenarios, Negative scenarios, Test data, Automation candidates.",
    "Include edge cases and observable expected results.",
    "",
    "Change:",
    input,
    "",
    knowledgeBlock(knowledge),
  ].join("\n");
}

export function supportInvestigationPrompt(
  input: string,
  knowledge: KnowledgeChunk[],
): string {
  return [
    systemFrame("L3 Support Investigation"),
    "Task: create a safe investigation plan for an L3 support scenario.",
    "Do not invent database facts. Recommend evidence to collect and approved query types to run.",
    "Return sections: Evidence required, Hypotheses, Safe next actions, GitLab comment draft.",
    "",
    "Incident:",
    input,
    "",
    knowledgeBlock(knowledge),
  ].join("\n");
}

export function designDocumentPrompt(input: string, knowledge: KnowledgeChunk[]): string {
  return [
    systemFrame("Design Document"),
    "Task: create an enterprise-grade technical design document from the input.",
    "Return markdown with these sections:",
    "1. Executive summary",
    "2. Background and problem statement",
    "3. Goals and non-goals",
    "4. Current state",
    "5. Proposed solution",
    "6. Architecture and component changes",
    "7. Data model and data flow",
    "8. API or interface changes",
    "9. Security, privacy, and controls",
    "10. Operational considerations",
    "11. Testing strategy",
    "12. Rollout and rollback plan",
    "13. Risks, assumptions, and open questions",
    "14. Appendix",
    "Be specific, concise, and explicit about unknowns. Do not invent systems, policies, or facts not present in the input or knowledge.",
    "",
    "Input:",
    input,
    "",
    knowledgeBlock(knowledge),
  ].join("\n");
}

function systemFrame(workflowName: string): string {
  return [
    "You are UBS FlowPilot, an enterprise delivery assistant embedded in VS Code.",
    `Workflow: ${workflowName}.`,
    "Follow configured governance: minimise context, avoid sensitive data, and keep deterministic actions outside AI.",
  ].join("\n");
}

function knowledgeBlock(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) {
    return "Relevant knowledge: none found.";
  }

  return [
    "Relevant knowledge:",
    ...chunks.map(
      (chunk) => `## ${chunk.title}\nSource: ${chunk.source}\nPriority: ${chunk.priority}\n${chunk.text}`,
    ),
  ].join("\n\n");
}
