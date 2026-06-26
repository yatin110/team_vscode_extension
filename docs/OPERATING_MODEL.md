# UBS FlowPilot Operating Model

## Ownership

| Area | Owner |
| --- | --- |
| Extension core | Central enablement engineering team |
| Security and approval policies | Central governance with team review |
| Application knowledge | Owning application team |
| Workflow configuration | Owning application team |
| Approved data queries | Application team plus data owner |
| VSIX distribution | Internal developer tooling or platform team |

## Release Model

Recommended release flow:

```text
main branch
  -> CI validation
  -> versioned VSIX
  -> internal release artifact
  -> pilot ring
  -> wider ring
```

Use semantic versioning:

- Patch: fixes and documentation updates.
- Minor: new workflows or non-breaking service features.
- Major: policy, configuration, or runtime breaking changes.

## Rollout Rings

1. Core maintainers.
2. One pilot squad.
3. One application area.
4. Multiple application areas.
5. Enterprise catalogue or managed install.

## Success Metrics

- MR preparation time.
- Review cycle time.
- Test scenario coverage.
- Support investigation time.
- Token usage per workflow.
- Percentage of deterministic actions completed without AI.
- Policy violations blocked before execution.

## Minimum Production Readiness Checklist

- [ ] Configuration schema validation.
- [ ] GitLab host and project mapping resolved from config.
- [ ] OAuth or approved token process agreed.
- [ ] VSIX release pipeline created.
- [ ] Audit log policy agreed.
- [ ] Data Gateway integration threat-modelled.
- [ ] One application knowledge pack reviewed.
- [ ] Pilot feedback loop established.
