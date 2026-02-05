---
name: work-journal
description: Standardized work journal format for daily session summaries. Captures completed work, lessons learned, time tracking, and next steps. Use at end of work sessions or during memory flush to create consistent, searchable records.
metadata: {"clawdbot":{"emoji":"📓","os":["darwin","linux","win32"]}}
version: 1.0.0
---

# Work Journal

Standardized format for daily work logs. Keeps records consistent and searchable across sessions.

## Quick Start

At session end or memory flush, create/update `memory/YYYY-MM-DD.md`:

```markdown
# YYYY-MM-DD 工作日志

## 完成的功能
### 1. [Feature/Task Name]
- **Branch**: `branch-name`
- **PR**: URL (if created)
- **任务**: X/Y 完成
- **耗时**: ~Xmin

**实现内容**:
- Key component 1
- Key component 2

## 踩过的坑
| 问题 | 解决方案 |
|-----|---------|
| Issue description | How it was fixed |

## 关键决策
- **Decision 1**: Reasoning
- **Decision 2**: Reasoning

## 时间统计
- Task A: Xmin
- Task B: Ymin
- Total: ~Zmin

## 明日待办
- [ ] Task 1
- [ ] Task 2
```

## Sections Reference

### 完成的功能 (Completed Work)
For each feature/task:
- **Branch**: Git branch name
- **PR**: Pull request URL if created
- **任务**: Task count (X/Y completed)
- **耗时**: Time spent
- **实现内容**: Bullet list of what was built

### 踩过的坑 (Lessons Learned)
Table format for quick scanning:
```markdown
| 问题 | 解决方案 |
|-----|---------|
| Domain layer returned Data models | Created domain models + mapper |
| Used android.util.Log in domain | Switched to SLF4J |
```

### 关键决策 (Key Decisions)
Document architectural choices with reasoning:
```markdown
- **OkHttp for WebSocket**: Already in dependencies, handles TLS
- **Room for cache**: Survives restart, supports migrations
```

### 时间统计 (Time Tracking)
Useful for estimating similar future work:
```markdown
- Implementation: 15min
- Code review fixes: 8min
- Testing: 10min
- Total: ~33min
```

### 当前调试状态 (Debug State)
When leaving mid-debug, capture:
- **症状**: What's happening
- **已验证**: What you've confirmed
- **可能原因**: Hypotheses to test
- **下一步**: Specific next actions

### 明日待办 (Next Steps)
Checkbox format for easy tracking:
```markdown
- [ ] Debug API call issue
- [ ] Create PR for feature X
- [ ] Test with production data
```

## Multi-Agent Swarm Sessions

For swarm-based development, add:

```markdown
## Multi-Agent Swarm 经验

### 流程
CCA (Coder) → CCB (Reviewer) × N rounds → CCC (Tester) → [Bug?] → fix cycle

### 时间统计
- Phase 1 (Implement): Xmin
- Phase 2 (Review): Ymin  
- Phase 3 (Test): Zmin
- Bug fixes: Wmin

### 可改进点
- Issue encountered and potential solution
```

## Tips

- **Write as you go** — don't wait until session end
- **Be specific** — file paths, line numbers, exact error messages
- **Link PRs** — future you will thank you
- **Track time** — helps estimate similar work
- **Capture debug state** — especially when leaving mid-investigation
