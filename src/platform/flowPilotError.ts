export class FlowPilotError extends Error {
  constructor(
    message: string,
    readonly remediation?: string,
  ) {
    super(message);
    this.name = "FlowPilotError";
  }
}
