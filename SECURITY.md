# Security Policy

UBS FlowPilot is designed for internal enterprise environments where source
code, GitLab metadata, and support evidence require explicit governance.

## Core Controls

- Secrets are stored only in VS Code SecretStorage.
- Tokens are never sent to the language model.
- AI context is redacted before submission.
- Users can review context before AI calls.
- Git, GitLab, and data write actions require explicit approval.
- Production data access must go through an approved read-only data gateway.

## Data Handling

Do not submit raw customer records, credentials, private keys, certificates, or
production data dumps to FlowPilot prompts. Production support workflows should
use approved queries, masked results, and compact summaries.

## Reporting Issues

For internal rollout, connect this repository to the owning engineering team's
standard vulnerability and operational-risk process. Do not include secrets,
tokens, or customer data in issue descriptions.
