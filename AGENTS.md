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

## Homepage redesign in progress

- The design contract is `.design/redesign/DESIGN.md`. The reasons for every choice, including rejected options, are in `.design/redesign/decisions.md`. Read both before you change the redesign. The root `DESIGN.md` covers only the Things page.
- The working prototype is `mockups/desk-prototype/index.html`. `mockups/` is gitignored, so the prototype exists only on this laptop. Savar opens it as a file (`open <path>`); it needs no server.
- Agents cannot see the prototype render. After each edit, run a headless runtime test (jsdom, with stubs for `matchMedia` and `Element.animate`) as well as a syntax check.
- The site version of the desk is `app/_components/desk/`: `markup.ts` (HTML), `engine.js` (the prototype script, with cleanup), and `desk.css` (scoped under `.desk-page`). After `npm run build`, run `node mockups/desk-prototype/tools/desk-port.mjs`. It mounts the engine on the prerendered homepage in jsdom and must print `no runtime errors`. Run it again with `POCKET=1` for the phone layout.
- The desk has two start paths. On a full page load, an inline pre-paint script in `markup.ts` scales the stage, applies the phone layout, and adds the CSS landing classes before the first paint. On a client-side navigation React does not run that script, so `engine.js` does the same work. Both read the phone layout from `desk/pocket.js`. Change a position there, never in only one of the two. The script saves each object's desk style in `data-desk-style`, and the engine restores from it.
- Measure performance with the Lighthouse CLI (headless) against production, one run at a time. The hook allows it. Vercel previews need a login, so Lighthouse cannot test them. The PageSpeed Insights API without a key often has no quota left.
