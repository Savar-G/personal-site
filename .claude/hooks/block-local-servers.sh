#!/usr/bin/env bash
# PreToolUse guard for this repo.
# Blocks: dev servers, Playwright, and any browser tool aimed at localhost.
# Why: each dev server + browser pane costs ~3 GB; several at once freeze the laptop.
# Verification for this site is `npm run build` + `npm run lint`, then the Vercel preview URL.
set -u
input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // ""')

deny() {
  jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

case "$tool" in
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
    if printf '%s' "$cmd" | grep -Eiq '(^|[^[:alnum:]_:-])(next[[:space:]]+(dev|start)|npm[[:space:]]+run[[:space:]]+(dev|start|dev:agent)|(pnpm|yarn|bun)[[:space:]]+(run[[:space:]]+)?(dev|start)|npx[[:space:]]+next[[:space:]]+(dev|start)|playwright|with-dev-server|turbopack)([^[:alnum:]_:-]|$)'; then
      deny "Blocked by .claude/hooks/block-local-servers.sh: no dev servers, Playwright, or localhost previews in this repo. Verify with 'npm run build' and 'npm run lint'. To view pages, use the Vercel preview deployment URL."
    fi
    ;;
  mcp__Claude_Browser__preview_start)
    deny "Blocked: the built-in browser pane is not allowed for this repo (memory). Use the Vercel preview deployment URL via WebFetch or the Vercel MCP instead."
    ;;
  mcp__Claude_Browser__navigate|mcp__Claude_Browser__tabs_create|mcp__claude-in-chrome__navigate|mcp__claude-in-chrome__tabs_create_mcp|mcp__Control_Chrome__open_url)
    url=$(printf '%s' "$input" | jq -r '.tool_input.url // ""')
    if printf '%s' "$url" | grep -Eiq '(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|\.localhost|\.test)(:|/|$)'; then
      deny "Blocked: no localhost browsing for this repo. Use the Vercel preview deployment URL."
    fi
    ;;
esac
exit 0
