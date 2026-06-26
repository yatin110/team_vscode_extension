import * as childProcess from "node:child_process";
import * as util from "node:util";
import * as vscode from "vscode";
import { getActiveWorkspaceFolder } from "../../platform/workspace";
import { GitStatusSummary } from "../../types";

const execFile = util.promisify(childProcess.execFile);

export class GitService {
  constructor(private readonly output: vscode.OutputChannel) {}

  async status(): Promise<GitStatusSummary> {
    const branch = (await this.git(["branch", "--show-current"])).trim();
    const porcelain = await this.git(["status", "--porcelain"]);
    const changedFiles = porcelain
      .split("\n")
      .filter(Boolean)
      .map((line) => line.slice(3).trim());
    const stagedFiles = porcelain
      .split("\n")
      .filter((line) => line.length > 0 && line[0] !== " " && line[0] !== "?")
      .map((line) => line.slice(3).trim());

    return {
      branch,
      changedFiles,
      stagedFiles,
      hasUncommittedChanges: changedFiles.length > 0,
    };
  }

  async diff(paths: string[] = []): Promise<string> {
    return this.git(["diff", "--", ...paths]);
  }

  async listBranches(): Promise<string[]> {
    const output = await this.git(["branch", "--format=%(refname:short)"]);
    return output
      .split("\n")
      .map((branch) => branch.trim())
      .filter(Boolean);
  }

  async createBranch(branchName: string): Promise<void> {
    this.assertSafeBranchName(branchName);
    await this.git(["checkout", "-b", branchName]);
  }

  async checkout(branchName: string): Promise<void> {
    this.assertSafeBranchName(branchName);
    await this.git(["checkout", branchName]);
  }

  async stageFiles(files: string[]): Promise<void> {
    if (files.length === 0) {
      throw new Error("No files selected for staging.");
    }

    await this.git(["add", "--", ...files]);
  }

  async commit(message: string): Promise<void> {
    if (!message.trim()) {
      throw new Error("Commit message cannot be empty.");
    }

    await this.git(["commit", "-m", message]);
  }

  async push(branchName: string): Promise<void> {
    this.assertSafeBranchName(branchName);
    await this.git(["push", "-u", "origin", branchName]);
  }

  private async git(args: string[]): Promise<string> {
    const cwd = getActiveWorkspaceFolder().uri.fsPath;

    this.output.appendLine(`git ${args.join(" ")}`);
    const result = await execFile("git", args, {
      cwd,
      maxBuffer: 10 * 1024 * 1024,
    });
    return result.stdout;
  }

  private assertSafeBranchName(branchName: string): void {
    const value = branchName.trim();
    const isSafe =
      value.length > 0 &&
      value.length <= 120 &&
      /^[A-Za-z0-9._/-]+$/.test(value) &&
      !value.includes("..") &&
      !value.startsWith("-") &&
      !value.endsWith("/") &&
      !value.endsWith(".");

    if (!isSafe) {
      throw new Error("Branch name failed FlowPilot safety validation.");
    }
  }
}
