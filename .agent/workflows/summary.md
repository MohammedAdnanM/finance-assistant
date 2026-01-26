---
description: Generate an extensive summary of recent changes after a git push
---

### Post-Push Summary Workflow

This workflow analyzes the most recent commit(s) and provides a detailed breakdown of what changed, why it matters, and any potential issues found.

#### Steps:

1. **Get Last Commit Info**
   // turbo
   `git log -n 1 --stat`

2. **Analyze Diff**
   // turbo
   `git show --summary`

3. **Generate Extensive Detail**
   Review the files changed in the last commit and provide:
   - **Main Features**: What new functionality was added?
   - **Refactors**: What code was restructured?
   - **Security**: Any changes to authentication or data handling?
   - **UI/UX**: Visual or navigational improvements.
   - **Technical Debt**: Anything that looks like a duplication or a bug (e.g., leftovers from a move).

4. **Report to User**
   Present the findings in a structured markdown format.
