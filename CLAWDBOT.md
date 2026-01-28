# Clawdbot Plugin

This repository is a Clawdbot plugin with **24 independent skills**.

## Installation

### Option 1: Full Bundle
Install everything at once:
```bash
clawdbot plugins install github:chunrui-qashier/everything-claude-code
```

### Option 2: Individual Skills
Install only what you need:
```bash
# Examples
clawdbot plugins install github:chunrui-qashier/everything-claude-code/skills/planning-with-files
clawdbot plugins install github:chunrui-qashier/everything-claude-code/skills/quant-research
clawdbot plugins install github:chunrui-qashier/everything-claude-code/skills/tdd-workflow
```

## Available Skills

| Skill | Description |
|-------|-------------|
| 📋 planning-with-files | Manus-style persistent markdown planning |
| 📿 beads-task-tracker | Git-backed distributed task tracking |
| 🐝 multi-agent-swarm | Multi-AI agent coordination |
| 📈 quant-research | Quantitative finance research tools |
| 🔬 deep-research | Autonomous multi-step research agent |
| 🧪 tdd-workflow | Test-driven development workflow |
| 🧠 continuous-learning-v2 | Self-improvement through experience |
| ✅ verification-loop | Continuous verification pattern |
| 📦 strategic-compact | Context compaction strategies |
| 📏 coding-standards | Code quality standards |
| 🔧 backend-patterns | Backend development patterns |
| 🎨 frontend-patterns | Frontend development patterns |
| 🐹 golang-patterns | Go language patterns |
| 🧪 golang-testing | Go testing patterns |
| 🐘 postgres-patterns | PostgreSQL patterns |
| 🔒 security-review | Security review checklist |

## Uninstall

```bash
# Remove full bundle
clawdbot plugins uninstall everything-claude-code

# Remove individual skill
clawdbot plugins uninstall planning-with-files
```
