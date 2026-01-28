# /auto-learn - Automatic Pattern Extraction

Process transcripts in the learning queue and extract reusable instincts/patterns.

## Usage

```
/auto-learn              # Process all pending transcripts
/auto-learn --preview    # Show what would be extracted without saving
/auto-learn --file <f>   # Process a specific transcript file
```

## Process

### 1. Scan Learning Queue

```bash
QUEUE_DIR="${CLAUDE_SESSIONS_DIR:-$HOME/.claude/sessions}/learning-queue"
ls -la "$QUEUE_DIR"/*.jsonl 2>/dev/null
```

If no files found, report "No transcripts pending" and exit.

### 2. For Each Transcript File

Read the transcript and analyze for extractable patterns:

**Pattern Types to Detect:**

| Type | Signal | Example |
|------|--------|---------|
| `user_correction` | User says "no", "wrong", "actually", "instead" after Claude action | "No, use pnpm not npm" → instinct: prefer-pnpm |
| `error_resolution` | Error occurred → multiple attempts → success | TypeError fix → instinct: null-check-pattern |
| `repeated_workflow` | Same sequence of tools used 3+ times | Read→Edit→Test loop → instinct: tdd-micro-cycle |
| `explicit_preference` | User states preference directly | "Always use Zod for validation" → instinct: use-zod |
| `tool_preference` | User redirects tool choice | "Use Edit not Write for small changes" → instinct: prefer-edit |

### 3. Extract Instincts

For each detected pattern, create an instinct file:

```markdown
---
id: <kebab-case-id>
trigger: "<when this applies>"
confidence: <0.3-0.7 for new instincts>
domain: "<code-style|testing|git|debugging|workflow|tooling>"
source: "auto-learn"
extracted: "<YYYY-MM-DD>"
transcript: "<source-filename>"
---

# <Descriptive Title>

## Observed Pattern
<What was observed in the session>

## Action
<What Claude should do when this pattern applies>

## Evidence
- <Specific observation 1>
- <Specific observation 2>
```

### 4. Save or Update Instincts

**Save location:**
```
~/.claude/homunculus/instincts/personal/<id>.md
```

**If instinct already exists:**
- Increase confidence by 0.1 (max 0.9)
- Append new evidence
- Update `last_seen` date

**If new instinct:**
- Start with confidence 0.5
- Ask user to confirm before saving (unless --auto flag)

### 5. Archive Processed Transcript

```bash
ARCHIVE_DIR="${CLAUDE_SESSIONS_DIR:-$HOME/.claude/sessions}/learning-archive"
mkdir -p "$ARCHIVE_DIR"
mv "$QUEUE_DIR/<file>" "$ARCHIVE_DIR/"
```

### 6. Report Summary

```
AUTO-LEARN SUMMARY
==================
Transcripts processed: 3
Patterns detected: 7
  - user_correction: 2
  - error_resolution: 3
  - repeated_workflow: 1
  - explicit_preference: 1

Instincts created: 4
  ✓ prefer-pnpm (0.5) - NEW
  ✓ null-check-pattern (0.5) - NEW
  ✓ use-zod-validation (0.6) - UPDATED (+0.1)
  ✓ tdd-micro-cycle (0.5) - NEW

Instincts skipped: 3 (low confidence / duplicate)

Files archived: 3
```

## Flags

| Flag | Description |
|------|-------------|
| `--preview` | Analyze but don't save (dry run) |
| `--auto` | Skip confirmation for new instincts |
| `--file <f>` | Process specific file only |
| `--min-confidence <n>` | Min confidence to save (default: 0.3) |
| `--verbose` | Show detailed analysis |

## Directory Setup

Ensure directories exist before first run:

```bash
mkdir -p ~/.claude/homunculus/instincts/{personal,inherited}
mkdir -p ~/.claude/sessions/{learning-queue,learning-archive}
```

## Integration

This command is designed to be called:
1. **Manually** - Run `/auto-learn` when you want to extract learnings
2. **Scheduled** - Via cron or similar to process overnight
3. **On demand** - After particularly productive sessions

## Notes

- Transcripts are JSONL format (one JSON object per line)
- Each line has `type`, `role`, `content`, `tool_name`, etc.
- Focus on extracting **reusable** patterns, not one-time fixes
- When in doubt, prefer lower confidence over skipping entirely
