# aiplay agent instructions

## Wiki index

- [OpenCode workflow](wiki/opencode.md)
- [Temporary Mac SSH access](wiki/access.md)
- [Testing and verification](wiki/testing.md)
- [OmGithub publishing](wiki/omgithub.md)

## Main project file

The main project file is [.github/workflows/opencode.yml](.github/workflows/opencode.yml).
In issue comments and workflow instructions, `oc` means OpenCode.

## Git delivery

After every code change, commit and push the change. For small code changes, amend
the current commit and push the amended commit instead of creating another commit.
When correcting a small change that was just pushed, fold it into that commit with
an amend and use `git push --force-with-lease`; do not leave a needless follow-up
commit on the branch.
Before running any workflow, verify that the working tree is clean and everything
is committed.

## Links in handoffs

When a relevant URL or stable identifier exists, include a clickable Markdown
link in the user-facing response. Link GitHub issues, Actions runs, pull
requests, commits, releases, public app URLs, and Codex tasks/threads rather
than reporting only their numbers or plain text. For Codex tasks/threads, use
the `codex://threads/<thread-id>` URL format.

When mentioning a commit, append its relative age in hours or days.

## OpenCode GitHub Actions

The issue-triggered workflow uses `opencode/muse-spark-1.2-contributor-free` and the GitHub Actions
token. It does not require an `OPENCODE_API_KEY` repository secret. When workflow steps call
the GitHub API, use the authenticated `GITHUB_TOKEN`; do not rely on unauthenticated API requests.

Trigger it by commenting `/oc <request>` or `/opencode <request>` on an issue
or pull request. The workflow starts a temporary AgentsWeb SSH session,
verifies it, runs OpenCode, and cleans up the SSH session afterward.

When monitoring a triggered run, use `gh run watch <run-id> --repo agents-dev/aiplay --exit-status` for overall job status.
Do not use `gh run view --log` to read logs from a running task: GitHub reports that
logs are unavailable until completion. Use `bash scripts/ssh-run-log.sh <run-id>`
for the live Actions log over SSH. Do not use tight `for` loops around `gh run list`,
which needlessly consume GitHub API rate limit.

When the user asks to check a live OpenCode workflow, always pull the runner logs
over SSH first, using `scripts/ssh-run-log.sh` or a targeted SSH read from the
same runner. Base the answer on those logs before discussing whether an action
is confirmed; do not lead with a generic inability-to-confirm statement when
live log evidence can be collected.

For real-time inspection from a live temporary SSH session, use the helper:

```sh
bash scripts/ssh-run-log.sh <run-id>
```

The helper discovers the temporary SSH command from the triggering issue or pull
request, then follows the freshest `_diag/pages` log. The runner uploads chunks from
`_diag/blocks` to GitHub. Do not print environment files, tokens, or private keys while
inspecting the runner.

## Mac SSH access

The Mac private key stays at `~/.ssh/aiplay-agentsweb`. Its public key is
stored in the repository Actions secret `AGENTSWEB_SSH_PUBLIC_KEY`. The issue
commented by the workflow contains a directly usable command such as:

```sh
ssh -i ~/.ssh/aiplay-agentsweb -p <port> runner@<run-name>.agentsweb.space
```

The command works only while the corresponding Actions job is running.
