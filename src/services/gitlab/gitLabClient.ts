import * as vscode from "vscode";
import { FlowPilotSettings } from "../../platform/settings";
import { GitLabIssue, GitLabMergeRequest } from "../../types";
import { SecretService } from "../security/secretService";

const TOKEN_KEY = "flowpilot.gitlab.token";

export class GitLabClient {
  constructor(
    private readonly secrets: SecretService,
    private readonly output: vscode.OutputChannel,
  ) {}

  async ensureToken(): Promise<string> {
    const existing = await this.secrets.get(TOKEN_KEY);
    if (existing) {
      return existing;
    }

    return this.promptAndStoreToken();
  }

  async promptAndStoreToken(): Promise<string> {
    const token = await vscode.window.showInputBox({
      title: "GitLab token",
      prompt: "Paste your GitLab personal access token. It is stored in VS Code SecretStorage.",
      password: true,
      ignoreFocusOut: true,
    });

    if (!token) {
      throw new Error("GitLab token is required for this action.");
    }

    await this.secrets.store(TOKEN_KEY, token);
    return token;
  }

  async clearToken(): Promise<void> {
    await this.secrets.delete(TOKEN_KEY);
  }

  async getCurrentUser(): Promise<GitLabUser> {
    return this.request<GitLabUser>("/user");
  }

  async getIssue(projectId: string, iid: number): Promise<GitLabIssue> {
    const data = await this.request<GitLabApiIssue>(
      `/projects/${encodeURIComponent(projectId)}/issues/${iid}`,
    );

    return {
      iid: data.iid,
      title: data.title,
      description: data.description ?? "",
      labels: data.labels ?? [],
      webUrl: data.web_url,
    };
  }

  async getMergeRequest(
    projectId: string,
    iid: number,
  ): Promise<GitLabMergeRequest> {
    const data = await this.request<GitLabApiMergeRequest>(
      `/projects/${encodeURIComponent(projectId)}/merge_requests/${iid}`,
    );

    return {
      iid: data.iid,
      title: data.title,
      description: data.description ?? "",
      sourceBranch: data.source_branch,
      targetBranch: data.target_branch,
      webUrl: data.web_url,
    };
  }

  async createIssue(
    projectId: string,
    title: string,
    description: string,
  ): Promise<GitLabIssue> {
    const data = await this.request<GitLabApiIssue>(
      `/projects/${encodeURIComponent(projectId)}/issues`,
      {
        method: "POST",
        body: JSON.stringify({ title, description }),
      },
    );

    return {
      iid: data.iid,
      title: data.title,
      description: data.description ?? "",
      labels: data.labels ?? [],
      webUrl: data.web_url,
    };
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const token = await this.ensureToken();
    const host = FlowPilotSettings.gitlabHost();
    const response = await fetch(`${host}/api/v4${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "PRIVATE-TOKEN": token,
        ...init.headers,
      },
    });

    this.output.appendLine(
      `GitLab ${init.method ?? "GET"} ${path}: ${response.status}`,
    );

    if (!response.ok) {
      throw new Error(`GitLab API request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

interface GitLabApiIssue {
  iid: number;
  title: string;
  description?: string;
  labels?: string[];
  web_url?: string;
}

interface GitLabApiMergeRequest {
  iid: number;
  title: string;
  description?: string;
  source_branch: string;
  target_branch: string;
  web_url?: string;
}

interface GitLabUser {
  id: number;
  name: string;
  username: string;
}
