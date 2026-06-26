export type FlowPilotActionGroup =
  | "Start"
  | "Delivery"
  | "Support"
  | "Git"
  | "GitLab"
  | "Configuration";

export interface FlowPilotAction {
  command: string;
  label: string;
  description: string;
  group: FlowPilotActionGroup;
  icon: string;
  primary?: boolean;
}

export const FLOWPILOT_ACTIONS: FlowPilotAction[] = [
  {
    command: "flowpilot.selectApplication",
    label: "Select Application",
    description: "Choose which configured application FlowPilot should use",
    group: "Start",
    icon: "layers-active",
    primary: true,
  },
  {
    command: "flowpilot.initializeWorkspace",
    label: "Initialize Workspace",
    description: "Create .flowpilot and ai-knowledge templates in this workspace",
    group: "Start",
    icon: "sparkle",
    primary: true,
  },
  {
    command: "flowpilot.openDashboard",
    label: "Open Dashboard",
    description: "View workspace profile, configured applications, and current Git state",
    group: "Start",
    icon: "compass",
    primary: true,
  },
  {
    command: "flowpilot.selectCopilotModel",
    label: "Select AI Model",
    description: "Choose the GitHub Copilot model used by FlowPilot AI workflows",
    group: "Start",
    icon: "symbol-misc",
    primary: true,
  },
  {
    command: "flowpilot.analyseRequirement",
    label: "Analyse Requirement",
    description: "Create impact analysis and acceptance criteria from a requirement or issue",
    group: "Delivery",
    icon: "inspect",
    primary: true,
  },
  {
    command: "flowpilot.reviewMergeRequest",
    label: "Review Current Diff",
    description: "Review changed files against standards and identify risks",
    group: "Delivery",
    icon: "git-pull-request",
    primary: true,
  },
  {
    command: "flowpilot.generateDesignDocument",
    label: "Generate Design Document",
    description: "Generate a technical design document from a requirement, issue, or selected text",
    group: "Delivery",
    icon: "symbol-structure",
    primary: true,
  },
  {
    command: "flowpilot.generateTestScenarios",
    label: "Generate Test Scenarios",
    description: "Create functional, regression, negative, and automation test ideas",
    group: "Delivery",
    icon: "beaker",
    primary: true,
  },
  {
    command: "flowpilot.checkDefinitionOfDone",
    label: "Check Definition of Done",
    description: "Run a token-free readiness check for the current workspace",
    group: "Delivery",
    icon: "checklist",
    primary: true,
  },
  {
    command: "flowpilot.investigateSupportIssue",
    label: "Investigate Support Issue",
    description: "Create an L3 investigation plan using runbook and application knowledge",
    group: "Support",
    icon: "pulse",
    primary: true,
  },
  {
    command: "flowpilot.dataRunApprovedQuery",
    label: "Run Approved Data Query",
    description: "Run a governed Data Gateway query with approval",
    group: "Support",
    icon: "database",
  },
  {
    command: "flowpilot.showGitStatus",
    label: "Show Git Status",
    description: "View branch, changed files, and staged files",
    group: "Git",
    icon: "source-control",
  },
  {
    command: "flowpilot.gitCreateBranch",
    label: "Create Branch",
    description: "Create and checkout a new branch with approval",
    group: "Git",
    icon: "git-branch",
  },
  {
    command: "flowpilot.gitCheckoutBranch",
    label: "Checkout Branch",
    description: "Pick and checkout an existing branch",
    group: "Git",
    icon: "repo",
  },
  {
    command: "flowpilot.gitStageChangedFiles",
    label: "Stage Changed Files",
    description: "Select changed files to stage",
    group: "Git",
    icon: "add",
  },
  {
    command: "flowpilot.gitCommitStaged",
    label: "Commit Staged Files",
    description: "Commit staged files after approval",
    group: "Git",
    icon: "git-commit",
  },
  {
    command: "flowpilot.gitPushCurrentBranch",
    label: "Push Current Branch",
    description: "Push the current branch to origin after approval",
    group: "Git",
    icon: "cloud-upload",
  },
  {
    command: "flowpilot.gitlabSetToken",
    label: "Set GitLab Token",
    description: "Store your GitLab token in VS Code SecretStorage",
    group: "GitLab",
    icon: "key",
  },
  {
    command: "flowpilot.gitlabTestConnection",
    label: "Test GitLab Connection",
    description: "Validate GitLab host and credentials",
    group: "GitLab",
    icon: "plug",
  },
  {
    command: "flowpilot.gitlabOpenIssue",
    label: "Open GitLab Issue",
    description: "Fetch and inspect an issue by project and IID",
    group: "GitLab",
    icon: "issues",
  },
  {
    command: "flowpilot.gitlabOpenMergeRequest",
    label: "Open GitLab Merge Request",
    description: "Fetch and inspect a merge request by project and IID",
    group: "GitLab",
    icon: "git-pull-request",
  },
  {
    command: "flowpilot.gitlabCreateIssue",
    label: "Create GitLab Issue",
    description: "Create a GitLab issue after approval",
    group: "GitLab",
    icon: "new-file",
  },
  {
    command: "flowpilot.openConfig",
    label: "Open Configuration",
    description: "Open .flowpilot/flowpilot.yml",
    group: "Configuration",
    icon: "settings-gear",
  },
  {
    command: "flowpilot.openKnowledge",
    label: "Open Knowledge Pack",
    description: "Reveal the ai-knowledge folder",
    group: "Configuration",
    icon: "book",
  },
];

export const PRIMARY_ACTIONS = FLOWPILOT_ACTIONS.filter((action) => action.primary);
