# Generate Documentation Command

Generate technical documentation and user-facing documentation for a specified feature in this codebase.

Feature to document: $ARGUMENTS

## Review Standards
If existing documentation exists, match its style. Otherwise, use the templates below as the standard.

## Process
1. Search the codebase for files related to the feature named in $ARGUMENTS
2. Analyze how the feature is implemented (functions, components, data flow)
3. Classify the feature:
   - Frontend: only UI components, hooks, or client-side utilities
   - Backend: only API routes, server actions, or database logic
   - Full-stack: includes both UI components AND API/server/database logic
4. Identify appropriate documentation folders based on existing project structure (or create `/docs/technical` and `/docs/user` if none exist)
5. Using the Playwright MCP tool, launch the app locally (assume `npm run dev` is running on localhost:3000)
6. Navigate to the relevant screen(s) for this feature and capture a screenshot at each key step
7. Save screenshots to `docs/screenshots/{feature-name}/`
8. Search the existing `/docs` folder for any other documentation related to this feature
9. Generate both documentation files using the templates below

## Technical Doc Template (docs/technical/{feature-name}-spec.md)

# {Feature Name} - Technical Specification

## Overview
[Brief description of what this feature does]

## Classification
**Type:** Frontend / Backend / Full-stack

## Architecture
[How the feature is structured - components, data flow]

## API Details
[Endpoints, request/response formats - omit if frontend-only]

## Implementation Notes
[Key functions, files, and logic decisions]

## Related Documentation
- [User Guide](../user/{feature-name}-guide.md)
- See also: [links to related existing docs]

## User Doc Template (docs/user/{feature-name}-guide.md)

# {Feature Name} - User Guide

## What This Does
[Simple, non-technical explanation]

## Step-by-Step Instructions
1. [Step one]
   ![description](../screenshots/{feature-name}/step-1.png)
2. [Step two]
   ![description](../screenshots/{feature-name}/step-2.png)

## Related Guides
- Technical details: [Technical Spec](../technical/{feature-name}-spec.md)
- See also: [links to related existing docs]

## Naming Convention
- Technical doc: `docs/technical/{feature-name}-spec.md`
- User doc: `docs/user/{feature-name}-guide.md`
- Screenshots: `docs/screenshots/{feature-name}/step-N.png`

## Edge Cases
- If no code files match $ARGUMENTS, ask the user to clarify rather than guessing
- If a doc file already exists, ask before overwriting
- If no `/docs` folder or pattern exists, create a reasonable default and note this in the output
- If the app isn't running on localhost:3000, notify the user and ask them to start it with `npm run dev` first

## Final Checklist (verify before completing)
- [ ] Feature correctly classified as frontend / backend / full-stack
- [ ] Technical doc includes architecture, API details (if applicable), and implementation notes
- [ ] User doc includes step-by-step instructions with a real screenshot at each step
- [ ] Both files follow the naming convention
- [ ] Technical doc links to the user doc, and vice versa
- [ ] Existing /docs folder was searched, and "See also" links were added where relevant
- [ ] If the dev server wasn't running, the user was notified rather than screenshots being skipped silently
- [ ] No existing documentation file was overwritten without asking first

---
Command purpose: Automatically generates paired technical and user-facing documentation (with real screenshots) for any feature, classifying it as frontend/backend/full-stack, and linking it to related existing documentation.
Usage: /generate-docs <feature-name>
Example: /generate-docs csv-export
Requires: Playwright MCP server connected (claude mcp add playwright npx @playwright/mcp@latest)
---
