export type FlowPilotRole =
  | "ba"
  | "developer"
  | "tester"
  | "support"
  | "tech-lead";

export type WorkflowId =
  | "impact-analysis"
  | "mr-review"
  | "test-scenarios"
  | "support-investigation"
  | "definition-of-done"
  | "design-document";

export interface WorkflowResult {
  title: string;
  markdown: string;
  usedAi: boolean;
  tokenEstimate: number;
}

export interface KnowledgeChunk {
  source: string;
  title: string;
  priority: "high" | "medium" | "low";
  text: string;
}

export interface GitStatusSummary {
  branch: string;
  changedFiles: string[];
  stagedFiles: string[];
  hasUncommittedChanges: boolean;
}

export interface GitLabIssue {
  iid: number;
  title: string;
  description: string;
  labels: string[];
  webUrl?: string;
}

export interface GitLabMergeRequest {
  iid: number;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  webUrl?: string;
}

export interface ApprovedQueryRequest {
  sourceId: string;
  queryId: string;
  environment: string;
  parameters: Record<string, string | number | boolean>;
}

export interface ApprovedQueryResult {
  columns: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
  masked: boolean;
  rowCount: number;
}
