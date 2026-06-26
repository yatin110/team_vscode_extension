---
app: insights
roles: ba,developer,tester,support,tech-lead
priority: high
---

# Insights Application Overview

Insights is a React-based UI application that connects to Reporting and presents
reporting data as dashboards and reports.

## Technology

- React frontend.
- Dashboard and reporting UI.
- Connects to Reporting APIs or reporting data access endpoints.
- Browser-based user journeys.

## Primary Responsibilities

- Display Reporting data in dashboards and reports.
- Provide filtering, sorting, and drill-down experiences.
- Surface loading, empty, and error states clearly.
- Preserve consistency between UI totals and Reporting source data.

## Key User Journeys

- View dashboard summary.
- Filter reporting data by period or business dimension.
- Drill into report details.
- Export or share report output where supported.

## Known Risk Areas

- UI totals differ from Reporting data.
- Filters or date ranges are applied inconsistently.
- Slow dashboard load time.
- Empty states are unclear.
- API errors are not actionable for users.
