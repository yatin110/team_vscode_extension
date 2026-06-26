---
app: insights
roles: developer,tester,tech-lead
priority: high
---

# Insights Architecture

## Components

- React application shell.
- Dashboard and report components.
- Data fetching layer for Reporting.
- Client-side state and filter management.
- UI test automation.

## Data Flow

1. User opens dashboard or report page.
2. Insights sends query parameters to Reporting.
3. Reporting returns curated reporting data.
4. Insights renders dashboards, tables, charts, and report summaries.
5. User filters, drills down, or exports data.

## Design Considerations

- Keep dashboard state predictable and shareable.
- Treat Reporting as the source of truth.
- Show clear loading, empty, and error states.
- Avoid duplicating Reporting transformation logic in the UI.
