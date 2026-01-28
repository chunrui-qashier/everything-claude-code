---
name: everything
description: Claude Code 插件和学习系统 - 完整的 agents, skills, hooks, commands 配置集合
repo: chunrui-qashier/everything-claude-code
auto_generated: true
created: 2026-01-28
---

# Everything Claude Code

完整的 Claude Code 配置集合，包含 production-ready 的 agents, skills, hooks, commands, rules 和 MCP 配置。

这个 repo 是我们的 Claude Code 插件系统，用于：
- 自动学习和提取工作模式
- 管理跨项目的 skills 和 instincts
- 统一配置 hooks 和 commands

## Repository Info

- **Org:** chunrui-qashier
- **Repo:** everything-claude-code
- **Local Path:** ~/everything-claude-code

## Key Components

| 目录 | 用途 |
|------|------|
| `agents/` | 专业子 agent (planner, architect, code-reviewer) |
| `commands/` | 自定义命令 (/auto-learn, /verify, /tdd) |
| `hooks/` | 生命周期钩子 (PreCompact, SessionStart) |
| `skills/` | 可复用技能集 |
| `config/` | 配置文件 (auto-learn.json) |

## Learned Patterns

_No patterns learned yet. Run `/auto-learn` after working in this repo._

## Notes

- 这是我们的"元"项目 - 用来改进 Claude Code 体验
- 改动这个 repo 会影响所有其他项目的 Claude Code 行为
- 谨慎修改 hooks，可能影响性能
