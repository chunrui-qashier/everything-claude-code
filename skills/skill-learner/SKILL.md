---
name: skill-learner
description: Create or update skills in the everything-claude-code repo. Clone repo, find existing skill to update or create new one, make it installable as independent plugin for both Clawdbot and Claude Code, then commit and push. Use when learning new patterns, capturing workflows, or packaging knowledge into reusable skills.
metadata: {"clawdbot":{"emoji":"📚","os":["darwin","linux","win32"]}}
version: 1.0.0
---

# Skill Learner

Self-directed learning through skill creation. Capture patterns, workflows, and knowledge into reusable skills.

## Workflow

```
User Prompt
    │
    ▼
┌─────────────────────┐
│  1. Ensure Repo     │  Clone if missing
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  2. Analyze Prompt  │  Find existing skill or create new
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  3. Update/Create   │  Write SKILL.md + resources
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  4. Make Plugin     │  Add clawdbot.plugin.json
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  5. Update Bundle   │  Add to root clawdbot.plugin.json
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  6. Commit & Push   │  Git operations
└─────────────────────┘
```

## Step 1: Ensure Repository

```bash
REPO_PATH=~/Source/chunrui-qashier-everything

if [ ! -d "$REPO_PATH" ]; then
  git clone git@github.com:chunrui-qashier/everything-claude-code.git "$REPO_PATH"
fi

cd "$REPO_PATH"
git pull origin main
```

## Step 2: Analyze Prompt

Determine if updating existing skill or creating new:

1. **List existing skills**: `ls skills/`
2. **Match prompt to skill**: Check if prompt relates to existing skill domain
3. **Decision**:
   - If match found → update existing skill
   - If no match → create new skill

**Skill naming**: lowercase, hyphenated, verb-led (e.g., `api-testing`, `debug-workflow`)

## Step 3: Create/Update Skill

### New Skill Structure

```
skills/<skill-name>/
├── SKILL.md              # Required: frontmatter + instructions
├── clawdbot.plugin.json  # Required: Clawdbot plugin manifest
├── scripts/              # Optional: executable helpers
└── references/           # Optional: domain docs
```

### SKILL.md Template

```markdown
---
name: <skill-name>
description: <what it does + when to use>
metadata: {"clawdbot":{"emoji":"🔧","os":["darwin","linux","win32"]}}
version: 1.0.0
---

# <Skill Title>

<Brief description>

## Quick Start

<Most common usage>

## Commands

| Command | Description |
|---------|-------------|

## Workflow

<Step by step instructions>
```

### Skill Guidelines

- **Concise** — only include what the model doesn't already know
- **Actionable** — clear steps, not vague guidance
- **Examples** — prefer examples over explanations
- **Progressive** — put common cases first, edge cases in references/

## Step 4: Create Plugin Manifest

Every skill needs `clawdbot.plugin.json`:

```json
{
  "id": "<skill-name>",
  "name": "<skill-name>",
  "description": "<same as SKILL.md description>",
  "version": "1.0.0",
  "skills": ["."]
}
```

This enables: `clawdbot plugins install github:chunrui-qashier/everything-claude-code/skills/<skill-name>`

## Step 5: Update Bundle

Add new skill to root `clawdbot.plugin.json` skills array:

```json
{
  "skills": [
    "./skills/existing-skill",
    "./skills/<new-skill>"  // Add this
  ]
}
```

## Step 6: Commit & Push

```bash
cd ~/Source/chunrui-qashier-everything

# Stage changes
git add skills/<skill-name>/
git add clawdbot.plugin.json  # If updated

# Commit
git commit -m "feat(skills): add <skill-name>

<Brief description of what the skill does>"

# Push
git push origin main
```

## Installation Commands

After pushing, users can install:

```bash
# Individual skill
clawdbot plugins install github:chunrui-qashier/everything-claude-code/skills/<skill-name>

# Or update full bundle
clawdbot plugins install github:chunrui-qashier/everything-claude-code
```

## Claude Code Compatibility

Skills in this repo work with Claude Code automatically via the `.claude-plugin/` directory in the root. No extra config needed per skill.

## Example: Learning a New Pattern

**User prompt**: "Create a skill for API rate limiting patterns"

**Actions**:
1. Check `skills/` — no rate-limiting skill exists
2. Create `skills/api-rate-limiting/`
3. Write SKILL.md with rate limiting patterns
4. Add clawdbot.plugin.json
5. Update root bundle
6. Commit: `feat(skills): add api-rate-limiting`
7. Push to main

## Tips

- **One skill per domain** — don't create overlapping skills
- **Update > Create** — prefer updating existing skill if related
- **Test locally** — `clawdbot plugins install ./skills/<name>` before pushing
- **Version bump** — increment version when updating existing skill
