#!/usr/bin/env node
/**
 * PreCompact Hook - Save state and trigger learning before context compaction
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs before Claude compacts context, giving you a chance to
 * preserve important state that might get lost in summarization.
 * 
 * IMPROVED: Now triggers continuous learning before compaction to extract
 * valuable patterns before they get lost in summarization.
 */

const path = require('path');
const fs = require('fs');
const {
  getSessionsDir,
  getLearnedSkillsDir,
  getDateTimeString,
  getTimeString,
  findFiles,
  ensureDir,
  appendFile,
  countInFile,
  log
} = require('../lib/utils');

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');

  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // Log compaction event with timestamp
  const timestamp = getDateTimeString();
  appendFile(compactionLog, `[${timestamp}] Context compaction triggered\n`);

  // If there's an active session file, note the compaction
  const sessions = findFiles(sessionsDir, '*.tmp');

  if (sessions.length > 0) {
    const activeSession = sessions[0].path;
    const timeStr = getTimeString();
    appendFile(activeSession, `\n---\n**[Compaction occurred at ${timeStr}]** - Context was summarized\n`);
  }

  // ========== DUMP TRANSCRIPT BEFORE COMPACTION ==========
  // Get transcript path from environment (set by Claude Code)
  const transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;
  const minMessages = parseInt(process.env.LEARN_MIN_MESSAGES || '8', 10);

  if (transcriptPath && fs.existsSync(transcriptPath)) {
    // Count user messages in current context (before compaction)
    const messageCount = countInFile(transcriptPath, /"type":"user"/g);

    if (messageCount >= minMessages) {
      // Dump transcript to learning queue for later processing
      const learningQueueDir = path.join(sessionsDir, 'learning-queue');
      ensureDir(learningQueueDir);
      
      const sessionId = process.env.CLAUDE_SESSION_ID || 'unknown';
      const shortId = sessionId.slice(-8);
      const dumpFile = path.join(learningQueueDir, `${timestamp.replace(/[: ]/g, '-')}-${shortId}.jsonl`);
      
      // Copy transcript to learning queue
      try {
        fs.copyFileSync(transcriptPath, dumpFile);
        log(`[PreCompact] 📚 Transcript dumped for learning: ${dumpFile}`);
        log(`[PreCompact] Messages saved: ${messageCount}`);
        appendFile(compactionLog, `  -> Dumped ${messageCount} messages to ${path.basename(dumpFile)}\n`);
      } catch (err) {
        log(`[PreCompact] Failed to dump transcript: ${err.message}`);
      }
    }
  }

  log('[PreCompact] State saved before compaction');
  process.exit(0);
}

main().catch(err => {
  console.error('[PreCompact] Error:', err.message);
  process.exit(0);
});
