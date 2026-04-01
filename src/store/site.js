import { reactive } from 'vue'

const FALLBACK_TITLE = 'MSH ADMIN'
const FALLBACK_LOGO = '/assets/logo_blue-B7kOdN8N.png'

export const siteState = reactive({
  title: FALLBACK_TITLE,
  webLogo: FALLBACK_LOGO,
})

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '')
  const p = String(path || '').replace(/^\/+/, '')
  if (!b) return `/${p}`
  if (!p) return b
  return `${b}/${p}`
}

function normalizeLogoUrl(input) {
  if (!input) return ''
  const s = String(input).replaceAll('\\/', '/').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  const base = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL || ''
  if (s.startsWith('/')) return joinUrl(base, s)
  if (s.includes('api.msgameapi.com') && !s.startsWith('http')) return `https://${s}`
  return joinUrl(base, s)
}

export function applySite(data) {
  if (data && typeof data === 'object') {
    if (data.title) siteState.title = String(data.title)
    const logo = normalizeLogoUrl(data.web_logo)
    if (logo) siteState.webLogo = logo
  }
  if (typeof document !== 'undefined' && siteState.title) document.title = siteState.title
}
