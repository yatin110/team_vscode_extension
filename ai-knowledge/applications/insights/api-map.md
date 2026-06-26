---
app: insights
roles: developer,tester,support
priority: medium
---

# Insights API Map

## Reporting Integration

Insights depends on Reporting for dashboard and report data. Replace these
examples with actual endpoints when known.

| Purpose | Method | Endpoint |
| --- | --- | --- |
| Dashboard summary | GET | `/reporting/dashboard-summary` |
| Report detail | GET | `/reporting/reports/{reportId}` |
| Report filters | GET | `/reporting/report-filters` |

## Contract Expectations

- Responses include reporting period and dataset metadata.
- Numeric totals must be consistent with Reporting source data.
- Error responses should include a support correlation ID.
