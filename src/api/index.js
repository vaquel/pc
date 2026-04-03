import { showError } from '../ui/modal'

const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.msgameapi.com'

export class ApiError extends Error {
  constructor(message, { status, code, data, url, method } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status ?? 0
    this.code = code ?? ''
    this.data = data
    this.url = url ?? ''
    this.method = method ?? ''
  }
}

function joinUrl(base, path) {
  if (!base) return path || ''
  if (!path) return base
  if (/^https?:\/\//i.test(String(path))) return String(path)
  const b = String(base).replace(/\/+$/, '')
  const p = String(path).replace(/^\/+/, '')
  return `${b}/${p}`
}

function withQuery(url, query) {
  if (!query) return url
  const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    u.searchParams.set(k, String(v))
  })
  const out = u.toString()
  return typeof window !== 'undefined' ? out : out.replace(u.origin, '')
}

function toFormUrlEncoded(body) {
  const params = new URLSearchParams()
  if (!body || typeof body !== 'object') return params.toString()
  Object.entries(body).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (Array.isArray(v)) {
      v.forEach(it => {
        if (it === undefined || it === null) return
        params.append(k, String(it))
      })
      return
    }
    params.append(k, String(v))
  })
  return params.toString()
}

async function readResponse(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  try {
    const t = await res.text()
    const s = String(t || '').trim()
    if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
      try {
        return JSON.parse(s)
      } catch {
        return t
      }
    }
    return t
  } catch {
    return null
  }
}

function getToken() {
  try {
    return localStorage.getItem('token') || ''
  } catch {
    return ''
  }
}

function createHttpClient({
  baseURL = '',
  timeoutMs = DEFAULT_TIMEOUT_MS,
  getToken = () => '',
  onBusinessError,
} = {}) {
  async function request(path, options = {}) {
    const { method = 'POST', headers, query, body, auth = false, timeout = timeoutMs, signal, raw = false } = options

    const url = withQuery(joinUrl(baseURL, path), query)

    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), timeout)
    if (signal) {
      if (signal.aborted) controller.abort()
      else signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    const token = getToken?.() || ''
    const finalHeaders = new Headers(headers || {})
    if (auth && token && !finalHeaders.has('token')) finalHeaders.set('token', token)

    let finalBody = body
    if (finalBody instanceof FormData) {
      if (finalHeaders.has('Content-Type')) finalHeaders.delete('Content-Type')
    } else {
      if (!finalHeaders.has('Content-Type')) finalHeaders.set('Content-Type', DEFAULT_CONTENT_TYPE)
      const ct = finalHeaders.get('Content-Type') || ''
      if (ct.includes('application/x-www-form-urlencoded')) {
        if (body && typeof body === 'object') finalBody = toFormUrlEncoded(body)
      } else if (ct.includes('application/json')) {
        if (body && typeof body === 'object') finalBody = JSON.stringify(body)
      }
    }

    let res
    try {
      res = await fetch(url, { method, headers: finalHeaders, body: finalBody, signal: controller.signal })
    } catch {
      clearTimeout(t)
      throw new ApiError('网络异常', { url, method })
    }
    clearTimeout(t)

    if (raw) return res

    const data = await readResponse(res)

    if (!res.ok) {
      const msg = (data && typeof data === 'object' && (data.message || data.msg)) || `请求失败(${res.status})`
      throw new ApiError(String(msg), { status: res.status, data, url, method })
    }

    if (data && typeof data === 'object' && 'code' in data) {
      const code = data.code
      const ok = String(code) === '200'
      if (!ok) {
        onBusinessError?.(data)
        const msg = String(data.msg || data.message || '请求失败')
        throw new ApiError(msg, { status: res.status, code, data, url, method })
      }
    }

    return data
  }

  return {
    request,
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  }
}

export const http = createHttpClient({
  baseURL: API_BASE_URL,
  getToken,
  onBusinessError: data => {
    const msg = (data && (data.msg || data.message)) || '请求失败'
    showError(msg)
  },
})

export const authApi = {
  login: payload => http.post('/login', payload, { auth: false }),
  register: payload => http.post('/api/register', payload, { auth: false }),
  forgotPassword: payload => http.post('/api/forgot-password', payload, { auth: false }),
}

export const siteApi = {
  getSite: () => http.post('/site', {}, { auth: false }),
}

export const bannerApi = {
  getBanners: (show_status = 2) => http.post('/banner', undefined, { auth: false, query: { show_status } }),
}

export const noticeApi = {
  getNotices: () => http.post('/notice', undefined, { auth: false }),
}

export const gameTypeApi = {
  getGameTypes: () => http.post('/game_type', undefined, { auth: true }),
}

export const gameListApi = {
  getGameList: payload => http.post('/game_list', payload, { auth: true }),
  getHotGames: () => http.post('/game_list', { hot: 1 }, { auth: true }),
}

export const hbApi = {
  getUserInfo: () => http.post('/hb/user_info', undefined, { auth: true }),
}

export const activityApi = {
  getTypes: () => http.post('/activity_type', undefined, { auth: true }),
  getList: payload => http.post('/activity', payload, { auth: true }),
}

export const regApi = {
  getRegConfig: () => http.post('/reg_c', undefined, { auth: false }),
}

export const captchaApi = {
  getCaptcha: () => http.post('/captcha', undefined, { auth: false }),
  getCaptchaRaw: () => http.request('/captcha', { auth: false, raw: true }),
}

export const smsApi = {
  sendCode: phone => http.post('/sms', { phone }, { auth: false }),
}

export const emailApi = {
  sendCode: email => http.post('/email', { email }, { auth: false }),
}

export const homeApi = {
  getHomeData: () => http.post('/api/home', {}, { auth: true }),
}
