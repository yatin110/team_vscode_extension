---
scope: global
roles: ba,developer,tester,support,tech-lead
priority: high
---

# Security Rules

## AI Context

- Do not send secrets, tokens, certificates, or private keys to AI.
- Do not send raw customer records to AI.
- Prefer summaries, aggregates, and masked examples.

## Production Data

- Production data access must be read-only.
- Production queries must come from approved query catalogs.
- Query results must be row-limited, masked, and audited.
