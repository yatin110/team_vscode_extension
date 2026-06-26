---
app: reporting
roles: ba,developer,tester,support,tech-lead
priority: high
---

# Reporting Application Overview

Reporting is the enterprise reporting data mart. It consolidates reporting data
from upstream sources and exposes curated datasets for downstream applications,
dashboards, operational reporting, and support investigations.

## Technology

- Java service codebase.
- Oracle database.
- Batch or scheduled ingestion jobs.
- SQL-based reporting datasets and views.

## Primary Responsibilities

- Ingest reporting data from upstream systems.
- Transform and validate reporting datasets.
- Store curated reporting data in Oracle.
- Serve reporting data to downstream consumers such as Insights.
- Provide traceable support evidence for data quality and reconciliation issues.

## Key Support Entry Points

- Business report identifier.
- Dataset name.
- Reporting period.
- Source system reference.
- Oracle record status.
- Batch run ID.

## Known Risk Areas

- Late or missing upstream feeds.
- Data transformation errors.
- Duplicate records.
- Reporting-period cut-off issues.
- Mismatch between Oracle data and UI dashboard totals.
