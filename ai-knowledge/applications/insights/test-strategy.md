---
app: insights
roles: tester,developer
priority: high
---

# Insights Test Strategy

## Functional Testing

- Dashboard renders expected Reporting data.
- Filters update the displayed data correctly.
- Drill-down navigation preserves context.
- Error states show actionable messages.
- Empty states are clear and non-blocking.

## UI Automation

- Smoke tests for key dashboard routes.
- Regression tests for filters and date ranges.
- Accessibility checks for tables, charts, and keyboard navigation.
- Visual checks for dashboard layout stability.

## Integration Testing

- Contract with Reporting response shape.
- UI totals match Reporting API totals.
- Loading and retry behaviour works during Reporting latency or failure.
