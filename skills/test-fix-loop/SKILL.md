---
name: test-fix-loop
description: Multi-agent test-fix cycle. CC-Test writes failure reports, Fixers repair code, Lead reviews, then re-test until all pass. Use when running integration tests with parallel repair workers.
metadata: {"clawdbot":{"emoji":"🔄","os":["darwin","linux","win32"]}}
version: 1.0.0
---

# Test-Fix Loop

Automated multi-agent cycle: Test → Report → Fix → Review → Re-test → Loop until green.

## Architecture

```
                    ┌─────────────┐
                    │  CC-Test    │
                    │  (Tester)   │
                    └──────┬──────┘
                           │ failure report
                           ▼
              ┌────────────┴────────────┐
              │                         │
        ┌─────▼─────┐            ┌─────▼─────┐
        │ CC-Fixer-1│            │ CC-Fixer-2│
        │ (Service A)│           │ (Service B)│
        └─────┬─────┘            └─────┬─────┘
              │                         │
              └────────────┬────────────┘
                           │ fixes
                           ▼
                    ┌─────────────┐
                    │  CC-Lead    │
                    │  (Reviewer) │
                    └──────┬──────┘
                           │ approved
                           ▼
                    ┌─────────────┐
                    │  CC-Test    │◄──── loop
                    │  (Re-test)  │
                    └─────────────┘
```

## State File

Location: `/tmp/swarm-<project>/swarm-state.json`

```json
{
  "task": "project-name",
  "phase": "testing|fixing|reviewing|completed",
  "iteration": 1,
  "agents": {
    "cc-test": { "status": "running|waiting|completed" },
    "cc-fixer-1": { "status": "running|waiting|completed", "scope": "..." },
    "cc-fixer-2": { "status": "running|waiting|completed", "scope": "..." },
    "cc-lead": { "status": "running|waiting|completed" }
  },
  "testResults": {
    "total": 53,
    "passed": 36,
    "failed": 17,
    "failures": [...]
  },
  "cronJobId": "..."
}
```

## Failure Report Format

CC-Test outputs to `/tmp/swarm-<project>/test-report.md`:

```markdown
# Test Failure Report - Iteration N

## Summary
- Total: 53
- Passed: 36
- Failed: 17

## Failures by Service

### Service A (CC-Fixer-1)
| Test | File | Error |
|------|------|-------|
| should return 200 | controller.test.ts:106 | got 500 |

### Service B (CC-Fixer-2)
| Test | File | Error |
|------|------|-------|
| should publish event | publisher.test.ts:45 | mock not called |

## Root Cause Analysis
1. Controller missing error handler
2. Publisher mock not properly set up
```

## Workflow Steps

### Step 1: CC-Test Runs Tests

```bash
# Run tests and capture output
npm test -- "<test-pattern>" 2>&1 | tee /tmp/test-output.log

# Parse failures and generate report
```

CC-Test then:
1. Parses test output
2. Groups failures by service/owner
3. Writes failure report
4. Updates state: `phase: "fixing"`

### Step 2: Fixers Receive Assignments

Each fixer:
1. Reads failure report
2. Filters for their assigned scope
3. Investigates and fixes
4. Runs affected tests locally
5. Updates state when done

### Step 3: CC-Lead Reviews

CC-Lead:
1. Reviews all fixes
2. Outputs review JSON
3. If issues found → Fixers fix → repeat
4. If approved → Updates state: `phase: "testing"`

### Step 4: Re-test

CC-Test:
1. Runs full test suite
2. If all pass → `phase: "completed"`, delete cron
3. If failures → increment iteration, goto Step 1

## Agent Prompts

### CC-Test Prompt

```
你是 CC-Test (Tester)。

## 职责
1. 运行测试: npm test -- "<pattern>"
2. 解析失败，按服务分组
3. 输出 test-report.md
4. 更新 swarm-state.json

## 输出格式
/tmp/swarm-<project>/test-report.md

## 完成条件
- 所有测试通过 → phase: "completed"
- 有失败 → phase: "fixing"，等待 fixer
```

### CC-Fixer Prompt

```
你是 CC-Fixer-N。

## 职责
1. 读取 test-report.md，找你负责的失败
2. 分析根本原因
3. 修复代码
4. 本地验证: npm test -- "<affected-tests>"
5. 更新 swarm-state.json

## 注意
- 编译必须通过才能报告完成
- 不要修改其他 fixer 负责的文件
```

### CC-Lead Prompt

```
你是 CC-Lead (Reviewer)。

## 职责
1. 等待所有 fixer 完成
2. Review 代码改动
3. 输出 review JSON
4. 如果有问题，打回给 fixer
5. 如果通过，更新 phase: "testing"

## Review 标准
- 修复是否解决根本原因
- 是否引入新问题
- 测试覆盖是否足够
```

## Cron Coordinator

```javascript
cron.add({
  name: "Test-Fix-Loop",
  schedule: { kind: "cron", expr: "*/5 * * * *" },
  sessionTarget: "isolated",
  payload: {
    kind: "agentTurn",
    message: `检查 test-fix-loop 状态:
1. sessions_list 查看 agent 状态
2. 读取 swarm-state.json
3. 根据 phase 触发下一步
4. 如果 completed，删除 cron job`,
    deliver: true,
    channel: "discord",
    to: "<user-id>"
  }
})
```

## Exit Conditions

| Condition | Action |
|-----------|--------|
| All tests pass | phase: "completed", delete cron |
| Max iterations (5) | Escalate to human |
| Fixer stuck (3 attempts same test) | Escalate to human |
| Build fails | Block until fixed |

## Quick Start

```javascript
// 1. Create state file
exec("mkdir -p /tmp/swarm-myproject")

// 2. Spawn CC-Test
sessions_spawn({
  task: "你是 CC-Test...[见上方 prompt]",
  label: "cc-test",
  runTimeoutSeconds: 1800
})

// 3. Spawn Fixers
sessions_spawn({
  task: "你是 CC-Fixer-1，负责 <service-a>...",
  label: "cc-fixer-1",
  runTimeoutSeconds: 3600
})

// 4. Spawn Lead
sessions_spawn({
  task: "你是 CC-Lead...",
  label: "cc-lead",
  runTimeoutSeconds: 1800
})

// 5. Set up coordinator cron
cron.add({ ... })
```

## Best Practices

1. **Clear scope boundaries** — each fixer owns specific files/services
2. **Local verification** — fixer must run affected tests before reporting
3. **Iteration limit** — prevent infinite loops
4. **Escalation path** — human intervenes when stuck
5. **Atomic fixes** — one logical fix per iteration, don't over-engineer

---

## Lessons Learned (2026-02-04)

### Express Async Middleware 陷阱

**问题**: 单元测试全过，但集成测试 500 错误
**根因**: Express async 中间件不保证在路由前完成

```typescript
// ❌ 不可靠
app.use(async (req, res, next) => {
  await initService();
  next();
});

// ✅ 移到 boot 阶段
export const initializeApp = async () => {
  await initService();
};
// 在 server.listen() 前调用
```

### Vitest Mock Hoisting

```typescript
// ❌ mockRedis 是 undefined
const mockRedis = { publish: vi.fn() };
vi.mock('@common/infra', () => ({ getRedisSingleton: () => mockRedis }));

// ✅ 使用 vi.hoisted()
const { mockRedis } = vi.hoisted(() => ({ mockRedis: { publish: vi.fn() } }));
vi.mock('@common/infra', () => ({ getRedisSingleton: () => mockRedis }));
```

### 单元测试 ≠ 集成测试

- 单元测试 mock 依赖，可能掩盖初始化问题
- 集成测试验证真实环境行为
- **两者都要有，缺一不可**

### Cron 协调器防中断

当任务可能耗时较长时，设置 cron 每 5 分钟检查：
- 防止 agent 卡住无人知晓
- 自动汇报进度
- 任务完成后自动清理
