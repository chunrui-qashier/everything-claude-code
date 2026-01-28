#!/bin/bash
# Setup directories for auto-learn system

set -e

echo "Setting up auto-learn directories..."

# Instincts directories
mkdir -p ~/.claude/homunculus/instincts/{personal,inherited}

# Sessions directories  
mkdir -p ~/.claude/sessions/{learning-queue,learning-archive}

# Evolved output directories
mkdir -p ~/.claude/homunculus/evolved/{agents,skills,commands}

# Create observations file if not exists
touch ~/.claude/homunculus/observations.jsonl

echo "✓ Directories created:"
echo "  ~/.claude/homunculus/instincts/personal/   - Your learned instincts"
echo "  ~/.claude/homunculus/instincts/inherited/  - Imported instincts"
echo "  ~/.claude/sessions/learning-queue/         - Pending transcripts"
echo "  ~/.claude/sessions/learning-archive/       - Processed transcripts"
echo "  ~/.claude/homunculus/evolved/              - Generated skills/commands"
echo ""
echo "Run /auto-learn to process pending transcripts"
