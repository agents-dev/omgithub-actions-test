import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
const enc = value => Buffer.from(JSON.stringify(value)).toString('base64url')
export function sign(value, secret) { const body = enc(value); return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}` }
export function verify(value, secret) { try { const [body, mac] = value.split('.'); const expected = createHmac('sha256', secret).update(body).digest('base64url'); if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null; return JSON.parse(Buffer.from(body, 'base64url')) } catch { return null } }
export const nonce = () => randomBytes(18).toString('base64url')
export function cookies(header = '') { return Object.fromEntries(header.split(';').map(v => v.trim().split('=').map(decodeURIComponent)).filter(v => v.length === 2)) }
