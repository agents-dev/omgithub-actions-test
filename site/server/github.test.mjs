import test from 'node:test'
import assert from 'node:assert/strict'
import { extractUrls, slugify } from './github.mjs'
test('extracts OpenCode, preview, PR and screenshots from issue comments', () => {
  const issue = { body: 'started' }, comments = [{ body: 'Live OpenCode: https://quiet-field.trycloudflare.com/work/session/ses_123' }, { body: 'Public game: https://bright-game.trycloudflare.com\nPR https://github.com/agents-dev/aiplay/pull/96\n![shot](https://raw.githubusercontent.com/agents-dev/aiplay/abc/project/screenshots/final-game.png)' }]
  const result = extractUrls(issue, comments)
  assert.match(result.opencode, /ses_123/); assert.equal(result.preview, 'https://bright-game.trycloudflare.com'); assert.match(result.pr, /pull\/96/); assert.equal(result.screenshots.length, 1)
})
test('normalizes a game name for subdomain allocation', () => assert.equal(slugify('Football Physics!'), 'football-physics'))
