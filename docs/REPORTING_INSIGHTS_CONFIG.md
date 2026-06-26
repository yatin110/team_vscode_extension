# Reporting And Insights Configuration Notes

This workspace includes starter FlowPilot configuration for two applications:

- `Reporting`: Java and Oracle reporting data mart.
- `Insights`: React UI that reads Reporting data and shows dashboards/reports.

## Config Already Added

The `.flowpilot/flowpilot.yml` file now includes:

- Application entries for Reporting and Insights.
- Multi-repository mappings per application.
- Application-specific action menus.
- GitLab project mapping placeholders.
- Knowledge roots for both applications.

## Values To Replace

Replace these placeholders with real enterprise values:

```yaml
REPORTING_SERVICE_PROJECT_ID
REPORTING_DB_PROJECT_ID
REPORTING_BATCH_PROJECT_ID
INSIGHTS_UI_PROJECT_ID
INSIGHTS_E2E_PROJECT_ID
```

Also confirm:

- GitLab host.
- GitLab group.
- Repository paths relative to the workspace.
- Default branch names.
- Data Gateway URL.
- Oracle source ID used by approved query catalogs.

## Additional Config Recommended

For Reporting:

- Oracle schema names.
- Approved production support queries.
- Batch job names and run-status query IDs.
- Source-to-target reconciliation rules.
- Dataset ownership and support contacts.

For Insights:

- Reporting API endpoints.
- Dashboard route map.
- UI test automation repository.
- Accessibility expectations.
- Error and empty-state conventions.

For both:

- Team-specific action menu.
- Token budgets per workflow.
- Security and approval policy.
- GitLab labels, issue templates, and MR templates.
- Environment names and access rules.

## Application Menu Customization

Reporting includes support and data-query actions because it owns Oracle-backed
data investigation.

Insights omits data-query actions by default because it should normally debug
through UI behaviour, API contracts, and Reporting evidence rather than direct
Oracle access.
