const API = 'https://api.github.com'
export async function github(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { accept: 'application/vnd.github+json', 'user-agent': 'OmGithub', 'x-github-api-version': '2022-11-28', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } })
  const text = await response.text(); let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw Object.assign(new Error(data?.message || `GitHub returned ${response.status}`), { status: response.status })
  return data
}
export function extractUrls(issue, comments = []) {
  const text = [issue.body || '', ...comments.map(c => c.body || '')].join('\n')
  const urls = [...text.matchAll(/https:\/\/[^\s)<\"]+/g)].map(match => match[0].replace(/[.,]+$/, ''))
  const trycf = urls.filter(url => /\.trycloudflare\.com/i.test(url))
  const opencode = trycf.find(url => /\/session\/ses_/i.test(url)) || ''
  const preview = [...trycf].reverse().find(url => !/\/session\/ses_/i.test(url)) || ''
  const screenshots = [...new Set(urls.filter(url => /raw\.githubusercontent\.com\/.+\/(?:screenshots|project%2Fscreenshots|project\/screenshots)\/.+\.(png|jpe?g|webp)/i.test(url)))]
  const pr = [...urls].reverse().find(url => /github\.com\/[^/]+\/[^/]+\/pull\/\d+/i.test(url)) || ''
  return { opencode, preview, screenshots, pr }
}
export function slugify(value) { return String(value || 'game').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 46) || 'game' }
