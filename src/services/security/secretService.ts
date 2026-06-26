import * as vscode from "vscode";

export class SecretService {
  constructor(private readonly storage: vscode.SecretStorage) {}

  get(key: string): Thenable<string | undefined> {
    return this.storage.get(key);
  }

  store(key: string, value: string): Thenable<void> {
    return this.storage.store(key, value);
  }

  delete(key: string): Thenable<void> {
    return this.storage.delete(key);
  }
}
