import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { getActiveWorkspaceFolder } from "../../platform/workspace";
import { parseSimpleYaml } from "./simpleYaml";

export interface FlowPilotConfig {
  name: string;
  version: number;
  defaultRole?: "ba" | "developer" | "tester" | "support" | "tech-lead";
  applications?: FlowPilotApplication[];
  knowledge: {
    roots: string[];
    ignore?: string[];
  };
  workflows: {
    enabled: string[];
  };
  gitlab?: {
    host?: string;
    defaultGroup?: string;
    projectMappings?: Array<{
      repoPath: string;
      projectId: string | number;
    }>;
  };
  data?: {
    enabled?: boolean;
    gatewayUrl?: string;
  };
}

export interface FlowPilotApplication {
  id: string;
  name: string;
  repositories: FlowPilotRepository[];
  knowledgeRoots?: string[];
  actions?: {
    enabled?: string[];
    hidden?: string[];
  };
}

export interface FlowPilotRepository {
  name: string;
  path: string;
  gitlabProjectId: string | number;
  type?: "service" | "frontend" | "batch-worker" | "library" | "test-automation" | "infrastructure" | "other";
  defaultBranch?: string;
}

export class ConfigurationService {
  private cache: FlowPilotConfig | undefined;

  async load(): Promise<FlowPilotConfig> {
    if (this.cache) {
      return this.cache;
    }

    const workspace = this.workspacePath();
    const configPath = vscode.workspace
      .getConfiguration("flowpilot")
      .get<string>("configPath", ".flowpilot/flowpilot.yml");
    const absolutePath = path.resolve(workspace, configPath);
    const raw = await fs.readFile(absolutePath, "utf8");
    const config = parseSimpleYaml(raw) as FlowPilotConfig;

    this.validate(config, absolutePath);
    this.cache = config;
    return config;
  }

  invalidate(): void {
    this.cache = undefined;
  }

  private workspacePath(): string {
    return getActiveWorkspaceFolder().uri.fsPath;
  }

  private validate(config: FlowPilotConfig, source: string): void {
    if (!config || typeof config !== "object") {
      throw new Error(`FlowPilot config is invalid: ${source}`);
    }

    if (!config.name || !Number.isInteger(config.version)) {
      throw new Error(`FlowPilot config must define name and integer version: ${source}`);
    }

    if (!Array.isArray(config.knowledge?.roots) || config.knowledge.roots.length === 0) {
      throw new Error(`FlowPilot config must define at least one knowledge root: ${source}`);
    }

    if (!Array.isArray(config.workflows?.enabled)) {
      throw new Error(`FlowPilot config must define enabled workflows: ${source}`);
    }
  }
}
