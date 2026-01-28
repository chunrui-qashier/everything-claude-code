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
const { execSync } = require('child_process');
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

/**
 * Get git repository info from a directory
 */
function getGitInfo(cwd) {
  const info = {
    remote: null,
    branch: null,
    repoName: null,
    org: null
  };

  try {
    // Get remote URL
    const remote = execSync('git remote get-url origin 2>/dev/null', { cwd, encoding: 'utf8' }).trim();
    info.remote = remote;

    // Parse org/repo from remote URL
    // Supports: https://github.com/org/repo.git, git@github.com:org/repo.git
    const match = remote.match(/[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      info.org = match[1];
      info.repoName = match[2];
    }

    // Get current branch
    info.branch = execSync('git branch --show-current 2>/dev/null', { cwd, encoding: 'utf8' }).trim();
  } catch {
    // Not a git repo or git not available
  }

  return info;
}

/**
 * Extract cwd from transcript (first user message)
 */
function extractCwdFromTranscript(transcriptPath) {
  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.cwd) return obj.cwd;
      } catch {
        continue;
      }
    }
  } catch {
    // Ignore errors
  }
  return process.cwd();
}

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
      const baseFilename = `${timestamp.replace(/[: ]/g, '-')}-${shortId}`;
      const dumpFile = path.join(learningQueueDir, `${baseFilename}.jsonl`);
      const metaFile = path.join(learningQueueDir, `${baseFilename}.meta.json`);
      
      // Get cwd from transcript and extract git info
      const cwd = extractCwdFromTranscript(transcriptPath);
      const gitInfo = getGitInfo(cwd);
      
      // Create metadata
      const metadata = {
        timestamp,
        sessionId,
        messageCount,
        cwd,
        git: gitInfo,
        transcriptFile: `${baseFilename}.jsonl`
      };

      // Copy transcript to learning queue
      try {
        fs.copyFileSync(transcriptPath, dumpFile);
        fs.writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
        
        const repoLabel = gitInfo.repoName ? `[${gitInfo.org}/${gitInfo.repoName}]` : '[no-repo]';
        log(`[PreCompact] 📚 Transcript dumped for learning: ${repoLabel}`);
        log(`[PreCompact] Messages: ${messageCount}, Branch: ${gitInfo.branch || 'N/A'}`);
        appendFile(compactionLog, `  -> Dumped ${messageCount} messages to ${path.basename(dumpFile)} ${repoLabel}\n`);
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
