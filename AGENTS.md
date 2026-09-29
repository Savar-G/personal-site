<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## No local servers, no localhost browsing

This laptop has 24 GB of RAM. One Next.js dev server plus one browser pane costs about 3 GB. Several agents doing this at once freeze the machine. A PreToolUse hook in `.claude/settings.json` (`.claude/hooks/block-local-servers.sh`) enforces the rules below. Do not work around it.

- **Do not start a dev server.** Never run `npm run dev`, `next dev`, `npm run dev:agent`, or Playwright. The `dev` script exists for the human owner only.
- **Do not open the built-in browser pane or any localhost URL.** No `preview_start`. No `navigate` to `localhost`, `127.0.0.1`, or `*.localhost`.
- **Verify with a build.** `npm run build` and `npm run lint` are the verification steps for this site. A green build is enough for a static site.
- **To see a page, use Vercel.** Push the branch. Vercel builds a preview deployment. Read that URL with `WebFetch` or the Vercel MCP. Never a local server.
- **One worktree at a time for this repo.** Do not spawn parallel worktrees or subagents with `isolation: "worktree"` here. Check `git worktree list` before creating one.
- **Before handoff, run `npm run dev:check`.** If it reports a listener, inspect ownership before stopping it. Never kill an unknown or user-owned process.
- **The hook also matches prose.** A shell heredoc that mentions the banned commands is blocked too. Edit documentation with the file tools, not with Bash.
