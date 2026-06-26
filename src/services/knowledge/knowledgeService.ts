import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { KnowledgeChunk } from "../../types";
import { ConfigurationService } from "../config/configurationService";

export class KnowledgeService {
  constructor(
    private readonly configuration: ConfigurationService,
    private readonly output: vscode.OutputChannel,
  ) {}

  async retrieve(query: string, maxChunks = 5): Promise<KnowledgeChunk[]> {
    const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspace) {
      return [];
    }

    const config = await this.configuration.load();
    const roots = config.knowledge.roots.map((root) => path.resolve(workspace, root));

    const files = (await Promise.all(roots.map((root) => this.findMarkdown(root))))
      .flat();
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    const chunks: KnowledgeChunk[] = [];

    for (const file of files) {
      const text = await fs.readFile(file, "utf8");
      const score = terms.reduce(
        (total, term) => total + (text.toLowerCase().includes(term) ? 1 : 0),
        0,
      );

      if (score > 0 || chunks.length < maxChunks) {
        chunks.push({
          source: path.relative(workspace, file),
          title: this.titleFor(text, file),
          priority: text.includes("priority: high") ? "high" : "medium",
          text: this.compact(text),
        });
      }
    }

    this.output.appendLine(`Retrieved ${chunks.length} knowledge chunks.`);
    return chunks.slice(0, maxChunks);
  }

  private async findMarkdown(root: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      const nested = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(root, entry.name);
          if (entry.isDirectory()) {
            return this.findMarkdown(fullPath);
          }

          return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
        }),
      );
      return nested.flat();
    } catch {
      return [];
    }
  }

  private titleFor(text: string, file: string): string {
    const heading = text.match(/^#\s+(.+)$/m);
    return heading?.[1] ?? path.basename(file);
  }

  private compact(text: string): string {
    return text
      .replace(/^---[\s\S]*?---\s*/m, "")
      .split("\n")
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0)
      .slice(0, 80)
      .join("\n");
  }
}
