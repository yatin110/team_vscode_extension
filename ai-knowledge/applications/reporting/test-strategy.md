---
app: reporting
roles: tester,developer,support
priority: high
---

# Reporting Test Strategy

## Functional Testing

- Validate ingestion from upstream source files or APIs.
- Validate transformation rules.
- Validate rejected records and error handling.
- Validate reporting-period calculations.

## Data Testing

- Row count reconciliation.
- Aggregation checks.
- Duplicate detection.
- Null and mandatory field checks.
- Source-to-target validation.

## Regression Testing

- Existing reports remain stable after transformation changes.
- Oracle views remain compatible for downstream consumers.
- Batch jobs complete within expected windows.

## Support Testing

- Approved queries can trace records by reference ID.
- Batch run status can be linked to impacted datasets.
- Evidence can be captured without exposing sensitive data.
