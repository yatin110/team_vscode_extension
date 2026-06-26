---
app: reporting
roles: developer,support,tech-lead
priority: high
---

# Reporting Architecture

## Components

- Java reporting service.
- Oracle schema for curated reporting datasets.
- Batch ingestion and transformation jobs.
- Data access layer for downstream consumers.
- Operational logs and batch status tables.

## Data Flow

1. Upstream systems provide reporting source data.
2. Reporting ingestion jobs load data into staging.
3. Transformation logic validates and curates records.
4. Curated records are written to Oracle reporting tables or views.
5. Insights reads reporting data for dashboards and reports.

## Design Considerations

- Data lineage must be preserved from source to curated dataset.
- Transformation rules should be testable and version-controlled.
- Query performance matters for dashboard consumers.
- Production support needs approved read-only investigation queries.
