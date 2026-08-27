# OpenCode GitHub workflow

The canonical workflow is `.github/workflows/opencode.yml`.
The build and verification prompt templates are stored as Markdown files in
`.github/prompts/`.

## Trigger

`/oc <request>`, `/opencode <request>`, or `/goal <objective>` can appear in a
newly created or edited issue/PR title or body, an issue comment, or a
pull-request review comment. Bot-authored events are ignored, so status
comments do not recurse. `/goal` selects the installed
`opencode-goal-plugin`, configures `noInterruptOnUserMessage: true`, and starts
the runner with `opencode run --command goal`; `/oc` and `/opencode` retain the
standard `opencode run` path. A `/goal` trigger also automatically adds the
`/Goal` GitHub issue label.

## What the job does

1. Checks out the repository with persisted `GITHUB_TOKEN` credentials.
2. Copies `agents.template.md` to `project/Agents.md` so the worker receives
   issue-update, screenshot, and completion-report requirements.
3. Starts an ephemeral AgentsWeb SSH tunnel.
4. Starts the OpenCode web UI and publishes it through a temporary public
   trycloudflare.com tunnel.
5. Creates an `opencode/<run-id>` branch from the relevant base branch.
6. Starts `opencode run --attach` against the same OpenCode installation and
   server-backed session store, then posts a direct URL to that live session.
7. Verifies SSH connectivity.
8. Replaces the access comment with aggregate OpenCode progress statistics and
   refreshes it about every 10 seconds while the run is active. The report also
   counts active child sessions from `/session/status` and all descendant
   subagent sessions from their `parentID` lineage. It also reports inferred
   image-context model calls by following image MIME attachments through each
   session transcript. Message text, reasoning, prompts, and tool details are
   never rendered in the live comment; full logs are published only in the
   completion release.
9. Runs a second verification prompt in the same OpenCode session as the build,
   starts the app, and exposes it through a
   separate temporary trycloudflare.com tunnel, and verifies the public URL.
10. Verifies the app through the public tunnel. If verification fails, sends a
   remediation prompt to the same OpenCode session and retries up to three
   times. Detects both uncommitted generated files and commits already created
   by OpenCode, then pushes the branch and creates the pull request in YAML.
11. Gives the verified public URL back to the worker, requests committed final
    browser screenshots, and embeds immutable screenshot URLs with the game,
    commit, and PR links in the triggering issue. If screenshots are missing,
    it sends up to two follow-up prompts to the same OpenCode session before
    continuing delivery with a warning.
12. Creates a uniquely tagged GitHub release containing the final OpenCode
    response JSON and safe runner log files, then adds the release and asset
    download links to the final issue comment.
13. Keeps SSH, the OpenCode Web UI, and the app available for 5 hours after
   verification,
   then marks the comment closed and terminates both tunnels.

After PR creation, the workflow also ZIPs `project/dist`, publishes it through
the token-protected OmGithub API, verifies the permanent wildcard URL, and puts
the permanent game and install links in the final issue comment. See
[OmGithub publishing](omgithub.md).

The comment URL opens `/<encoded-worktree>/session/<session-id>` rather than
the web home page. This matters because the web home page stores its project
selection in the browser, while the runner's project exists only on the
temporary GitHub Actions filesystem.

## Local tracker test

On macOS, run `./scripts/test-opencode-progress-tracker.sh`. It starts a local
mock OpenCode HTTP server with nested, active, and completed child sessions,
including user and tool image attachments, then asserts the three derived
progress counters.

The workflow uses the built-in OpenCode model path and does not require an
`OPENCODE_API_KEY` secret. Branch creation, pushing, and pull-request creation
are deliberately handled by the workflow rather than by OpenCode's GitHub
integration.

## Findings: tracking the GitHub run in Web UI

The previous GitHub integration installed the OpenCode CLI and ran:

```sh
opencode github run
```

The workflow now sends the comment text directly to `opencode run --attach`.

For the installed `opencode-goal-plugin`, invoke a goal from the non-interactive
CLI with `opencode run --command goal "<objective>"`; passing `/goal <objective>`
as the message sends literal text instead of invoking the custom command. To
send a follow-up to the same attached session, use `opencode run --attach
<server-url> --session <session-id> "<message>"`. In this workflow, the
`/goal` marker is stripped from the objective before it is passed to the
custom command, and later human messages steer the running goal instead of
pausing it.

Before starting OpenCode, the workflow checks out `agents-dev/skills` into
`project/.agents`. OpenCode discovers project skills from
`project/.agents/skills/**/SKILL.md`.
The workflow excludes this nested skills checkout through `.git/info/exclude`
so it cannot be included in the generated app commit.
The workflow verifies the discovered skill list through OpenCode's `/skill`
endpoint and synchronizes `model/<provider>/<name>` and `skill/<name>` labels
in the repository.
This keeps the regular OpenCode session while making branch and PR behavior
explicit and reviewable in YAML.
Model labels are refreshed from the live OpenCode catalog on each run and are
limited to models with zero input, output, and cache-read cost. Default GitHub
labels are removed, and the triggering issue is marked `in progress`,
`complete`, or `failed` as the job advances.
For difficult game requests, the `game-issue-e2e` skill selects the synchronized
`model/opencode/muse-spark-1.2-contributor-free` label; if that label is
unavailable, the skill records that it used the workflow default instead.

The workflow starts OpenCode Web from `$GITHUB_WORKSPACE/project` and uses the
same directory for OpenCode runs, so both browser-created sessions and generated
app files stay under the repository's `project/` directory. OpenCode's server
also loads project instances per request using the `x-opencode-directory` header.
A tunneled browser request does not know the runner's `$GITHUB_WORKSPACE`, so
the UI can appear empty even while `opencode github run` is actively working.

The reliable architecture is:

```text
opencode github run
        |
        v
shared OpenCode session/database
        ^
        | x-opencode-directory: $PROJECT_DIR
        |
local header-injecting proxy
        ^
        |
trycloudflare tunnel -> browser Web UI
```

The workflow tunnels a minimal local nginx reverse proxy that injects
`x-opencode-directory: $PROJECT_DIR` before forwarding requests to
OpenCode Web, including WebSocket upgrade headers. The access comment points
to the encoded worktree/session route, so the browser opens the live run
directly. A loaded Web UI or healthy tunnel alone does not prove session
tracking; acceptance requires a screenshot while the run is active.

## Required repository settings

- Actions must be allowed to create and approve pull requests.
- The `AGENTSWEB_SSH_PUBLIC_KEY` Actions secret must contain the public key
  matching the Mac private key described in [access.md](access.md).
