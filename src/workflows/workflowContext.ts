import * as vscode from "vscode";
import { CopilotLmClient } from "../services/ai/copilotLmClient";
import { ApprovalService } from "../services/approval/approvalService";
import { DataGatewayClient } from "../services/data/dataGatewayClient";
import { GitService } from "../services/git/gitService";
import { GitLabClient } from "../services/gitlab/gitLabClient";
import { KnowledgeService } from "../services/knowledge/knowledgeService";
import { TokenBudgetService } from "../services/tokens/tokenBudgetService";

export interface WorkflowContext {
  ai: CopilotLmClient;
  approval: ApprovalService;
  data: DataGatewayClient;
  git: GitService;
  gitlab: GitLabClient;
  knowledge: KnowledgeService;
  output: vscode.OutputChannel;
  tokens: TokenBudgetService;
}
