---
name: speckit
description: Spec-Driven Development workflow. Use when starting new features, documenting requirements, creating implementation plans, or managing development tasks. Supports the full cycle from constitution → specify → plan → tasks → implement.
metadata: {"clawdbot":{"emoji":"📋","os":["darwin","linux","win32"]}}
version: 1.0.0
---

# Spec Kit - Spec-Driven Development

A complete workflow for spec-driven development. From requirements to implementation.

## Quick Start

```
speckit-constitution  →  Define project principles
speckit-specify       →  Create feature spec from description
speckit-plan          →  Generate technical implementation plan
speckit-tasks         →  Create ordered task list
speckit-implement     →  Execute the tasks
```

## Workflow Diagram

```
Constitution → Specify → Plan → Tasks → Implement
     ↓           ↓        ↓       ↓        ↓
  Principles   What/Why   How   Work Items  Code

Optional helpers:
  - speckit-baseline   → Generate spec from existing code
  - speckit-clarify    → Resolve ambiguities in spec
  - speckit-analyze    → Validate consistency before implementing
  - speckit-checklist  → Generate quality checklists
  - speckit-taskstoissues → Convert tasks to GitHub Issues
```

## Available Skills

| Skill | Description | When to Use |
|-------|-------------|-------------|
| `speckit-constitution` | Create/update project principles | Initial setup or governance changes |
| `speckit-specify` | Generate feature spec from natural language | New feature request |
| `speckit-baseline` | Generate spec from existing code | Documenting legacy code |
| `speckit-clarify` | Ask targeted clarification questions | Before planning, spec is ambiguous |
| `speckit-plan` | Create technical implementation plan | Spec is ready, need architecture |
| `speckit-analyze` | Cross-artifact consistency check | Before implementation |
| `speckit-tasks` | Generate dependency-ordered task list | Plan is ready |
| `speckit-taskstoissues` | Convert tasks.md to GitHub Issues | Want to track in GitHub |
| `speckit-checklist` | Generate domain-specific quality checklist | Need validation criteria |
| `speckit-implement` | Execute all tasks from tasks.md | Ready to code |

## Directory Structure

After using Spec Kit, your project will have:

```
your-project/
├── .specify/
│   ├── memory/
│   │   └── constitution.md      # Project principles
│   ├── templates/               # Spec/plan/tasks templates
│   └── scripts/bash/            # Helper scripts
└── specs/
    └── <feature-name>/
        ├── spec.md              # Feature specification
        ├── plan.md              # Implementation plan
        ├── tasks.md             # Task list
        ├── data-model.md        # (optional) Data model
        ├── research.md          # (optional) Research notes
        └── checklists/          # Quality checklists
```

## Setup

The `.specify/` directory contains templates and scripts needed by Spec Kit skills.
When using in a new project, copy the `.specify/` directory to your project root:

```bash
cp -r /path/to/speckit/.specify /your/project/
```

## Usage Examples

### Start a new feature
```
"Create a spec for user authentication with OAuth2"
→ Uses speckit-specify
```

### Document existing code
```
"Generate a spec from src/payments/"
→ Uses speckit-baseline
```

### Plan implementation
```
"Create an implementation plan for the auth feature"
→ Uses speckit-plan
```

### Generate tasks
```
"Break down the auth implementation into tasks"
→ Uses speckit-tasks
```

## Credits

Based on [speckit-agent-skills](https://github.com/dceoy/speckit-agent-skills) by dceoy.
License: AGPL-3.0
