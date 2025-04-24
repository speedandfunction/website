# Pull Request Workflow

This document outlines the standard workflow for making changes to the codebase through Pull Requests.

## Steps

### 1. Create a Branch

Before making any changes, create a new branch from the main branch:

```bash
# Switch to main branch and pull latest changes
git checkout main
git pull

# Create and switch to a new branch
git checkout -b your-feature-name
```

Replace `your-feature-name` with a descriptive name for your changes.

### 2. Make and Commit Changes

After making your changes, use the "I" chat to commit them:

1. Review the changes
2. Type "Commit changes" in the chat - this command will:
   - Create a properly formatted commit message following the commit guidelines
   - Push your changes to the remote repository

### 3. Create a Pull Request

Once your changes are committed and pushed, create a pull request:

1. Type "Create pull request" in the chat - this command will:
   - Set the PR title and description according to the PR guidelines
   - Request reviewers if needed
   - Complete the PR creation

## Workflow Diagram

```mermaid
flowchart TD
    A[Start] --> B[Checkout main branch]
    B --> C[Pull latest changes]
    C --> D[Create feature branch]
    D --> E[Make code changes]
    E --> F[Review changes]
    F --> G[Commit changes via I-chat]
    G --> H[Push to remote]
    H --> I[Create PR via I-chat]
    I --> J[PR review process]
    J --> K[Merge to main]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#9f9,stroke:#333,stroke-width:2px
```

## Notes

- Ensure your branch is up to date with the main branch before creating a PR
- Follow the commit message and PR description formatting guidelines for consistency 