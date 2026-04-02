<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '../components/BaseModal.vue'
import ImageCaptcha from '../components/ImageCaptcha.vue'
import { authApi, captchaApi, emailApi, regApi, siteApi, smsApi } from '../api'
import { applySite, siteState } from '../store/site'
import { showError } from '../ui/modal'

const router = useRouter()

const logoSrc = computed(() => siteState.webLogo || '/assets/logo_blue-B7kOdN8N.png')

const username = ref('')
const password = ref('')
const remember = ref(true)
const captchaCode = ref('')
const captchaSrc = ref('')
const captchaLoading = ref(false)
const loginLoading = ref(false)
let captchaObjectUrl = ''

const forgotVisible = ref(false)
const forgotAccount = ref('')
const forgotGoogleCode = ref('')

const registerVisible = ref(false)
const registerEnabled = ref(true)
const regConfig = ref({
  register_state: '1',
  phone_state: '1',
  phone_code: '1',
  email_state: '1',
  email_code: '1',
  Invitation_code: '2',
})
const registerAccount = ref('')
const registerPassword = ref('')
const registerPhone = ref('')
const registerPhoneCode = ref('')
const registerEmail = ref('')
const registerEmailCode = ref('')
const registerInviteCode = ref('')
const registerCaptchaVerified = ref(false)
const registerCaptcha = ref('')
const phoneCodeCooldown = ref(0)
const phoneCodeSending = ref(false)
let phoneCodeTimer = null

const emailCodeCooldown = ref(0)
const emailCodeSending = ref(false)
let emailCodeTimer = null

function normalizeRegConfig(input) {
  const cfg = input && typeof input === 'object' ? input : {}
  return {
    register_state: String(cfg.register_state ?? cfg.registerState ?? regConfig.value.register_state),
    phone_state: String(cfg.phone_state ?? cfg.phoneState ?? regConfig.value.phone_state),
    phone_code: String(cfg.phone_code ?? cfg.phoneCode ?? regConfig.value.phone_code),
    email_state: String(cfg.email_state ?? cfg.emailState ?? regConfig.value.email_state),
    email_code: String(cfg.email_code ?? cfg.emailCode ?? regConfig.value.email_code),
    Invitation_code: String(
      cfg.Invitation_code ?? cfg.invitation_code ?? cfg.invitationCode ?? cfg.InvitationCode ?? regConfig.value.Invitation_code,
    ),
  }
}

const showPhone = computed(() => String(regConfig.value.phone_state || '') !== '3')
const phoneRequired = computed(() => String(regConfig.value.phone_state || '') === '2')
const phoneCodeEnabled = computed(() => String(regConfig.value.phone_code || '') === '2')
const phoneCodeVisible = computed(
  () => showPhone.value && phoneCodeEnabled.value && (phoneRequired.value || Boolean(registerPhone.value.trim())),
)
const phonePlaceholder = computed(() => (phoneRequired.value ? '请输入手机号' : '请输入手机号（选填）'))

const showEmail = computed(() => String(regConfig.value.email_state || '') !== '3')
const emailRequired = computed(() => String(regConfig.value.email_state || '') === '2')
const emailCodeEnabled = computed(() => String(regConfig.value.email_code || '') === '2')
const emailCodeVisible = computed(
  () => showEmail.value && emailCodeEnabled.value && (emailRequired.value || Boolean(registerEmail.value.trim())),
)
const emailPlaceholder = computed(() => (emailRequired.value ? '请输入邮箱' : '请输入邮箱（选填）'))

const inviteRequired = computed(() => String(regConfig.value.Invitation_code || '') === '1')
const inviteVisible = computed(() => inviteRequired.value)
const invitePlaceholder = computed(() => (inviteRequired.value ? '请输入邀请码' : '请输入邀请码（选填）'))

const lines = ref([
  { id: 1, time: 0.101 },
  { id: 2, time: 1.768 },
  { id: 3, time: 1.873 },
])

const selectedLineId = ref(lines.value[0]?.id ?? 1)

const selectedLine = computed(() => lines.value.find(l => l.id === selectedLineId.value) ?? lines.value[0])

function getLineColor(time) {
  if (time <= 1) return 'green'
  if (time <= 1.5) return 'yellow'
  return 'red'
}

function getLinePercent(time) {
  const v = (2.8 - time) / 2.8
  return Math.max(0.08, Math.min(1, v))
}

function refreshLines() {
  lines.value = lines.value.map(l => ({
    ...l,
    time: Number((Math.random() * 2.8 + 0.08).toFixed(3)),
  }))
}

function selectLine(id) {
  selectedLineId.value = id
}

function openForgot() {
  forgotVisible.value = true
}

function openRegister() {
  if (!registerEnabled.value) return
  registerAccount.value = ''
  registerPassword.value = ''
  registerPhone.value = ''
  registerPhoneCode.value = ''
  registerEmail.value = ''
  registerEmailCode.value = ''
  registerInviteCode.value = ''
  registerCaptchaVerified.value = false
  registerCaptcha.value = ''
  phoneCodeCooldown.value = 0
  phoneCodeSending.value = false
  if (phoneCodeTimer) {
    clearInterval(phoneCodeTimer)
    phoneCodeTimer = null
  }
  emailCodeCooldown.value = 0
  emailCodeSending.value = false
  if (emailCodeTimer) {
    clearInterval(emailCodeTimer)
    emailCodeTimer = null
  }
  registerVisible.value = true
}

function onForgotNext() {
  const payload = {
    account: forgotAccount.value.trim(),
    googleCode: forgotGoogleCode.value.trim(),
  }
  console.log('forgot next', payload)
  alert('已展示找回密码弹窗：这里仅做 UI 演示，未接入真实接口。')
}

function onRegisterSubmit() {
  if (!registerCaptchaVerified.value) {
    alert('请先完成图形验证码。')
    return
  }

  const account = registerAccount.value.trim()
  if (!account) {
    alert('请输入账号。')
    return
  }
  if (!registerPassword.value) {
    alert('请输入密码。')
    return
  }

  const phone = registerPhone.value.trim()
  if (showPhone.value) {
    if (phoneRequired.value && !phone) {
      alert('请输入手机号。')
      return
    }
    if (phoneCodeEnabled.value && (phoneRequired.value || phone)) {
      if (!registerPhoneCode.value.trim()) {
        alert('请输入手机号验证码。')
        return
      }
    }
  }

  const email = registerEmail.value.trim()
  if (showEmail.value) {
    if (emailRequired.value && !email) {
      alert('请输入邮箱。')
      return
    }
    if (emailCodeEnabled.value && (emailRequired.value || email)) {
      if (!registerEmailCode.value.trim()) {
        alert('请输入邮箱验证码。')
        return
      }
    }
  }

  if (inviteRequired.value && !registerInviteCode.value.trim()) {
    alert('请输入邀请码。')
    return
  }

  const payload = {
    account,
    password: registerPassword.value,
    phone,
    phoneCode: registerPhoneCode.value.trim(),
    email,
    emailCode: registerEmailCode.value.trim(),
    inviteCode: registerInviteCode.value.trim(),
    captcha: registerCaptcha.value.trim(),
  }
  console.log('register submit', payload)
  alert('已展示注册弹窗：这里仅做 UI 演示，未接入真实接口。')
}

async function onSendPhoneCode() {
  if (!registerPhone.value.trim()) {
    alert('请先填写手机号。')
    return
  }
  if (phoneCodeSending.value || phoneCodeCooldown.value > 0) return
  phoneCodeSending.value = true
  try {
    await smsApi.sendCode(registerPhone.value.trim())
    alert('验证码已发送。')
    phoneCodeCooldown.value = 60
    if (phoneCodeTimer) clearInterval(phoneCodeTimer)
    phoneCodeTimer = setInterval(() => {
      phoneCodeCooldown.value = Math.max(0, phoneCodeCooldown.value - 1)
      if (phoneCodeCooldown.value <= 0) {
        clearInterval(phoneCodeTimer)
        phoneCodeTimer = null
      }
    }, 1000)
  } catch {
  } finally {
    phoneCodeSending.value = false
  }
}

async function onSendEmailCode() {
  if (!registerEmail.value.trim()) {
    alert('请先填写邮箱。')
    return
  }
  if (emailCodeSending.value || emailCodeCooldown.value > 0) return
  emailCodeSending.value = true
  try {
    await emailApi.sendCode(registerEmail.value.trim())
    alert('邮箱验证码已发送。')
    emailCodeCooldown.value = 60
    if (emailCodeTimer) clearInterval(emailCodeTimer)
    emailCodeTimer = setInterval(() => {
      emailCodeCooldown.value = Math.max(0, emailCodeCooldown.value - 1)
      if (emailCodeCooldown.value <= 0) {
        clearInterval(emailCodeTimer)
        emailCodeTimer = null
      }
    }, 1000)
  } catch {
  } finally {
    emailCodeSending.value = false
  }
}

async function onLogin() {
  const account = username.value.trim()
  const pwd = password.value
  const cap = captchaCode.value.trim()

  if (!account) return showError('请输入您的用户名', '登录失败')
  if (!pwd) return showError('请输入您的登录密码', '登录失败')
  if (!cap) return showError('请输入验证码', '登录失败')
  if (loginLoading.value) return

  loginLoading.value = true
  try {
    const res = await authApi.login({ account, password: pwd, captcha: cap })
    const token =
      (res && res.data && (res.data.token || res.data.Token || res.data.access_token || res.data.accessToken)) ||
      (res && (res.token || res.Token || res.access_token || res.accessToken)) ||
      ''
    if (token) localStorage.setItem('token', String(token))
    forgotVisible.value = false
    registerVisible.value = false
    router.push('/home')
  } catch (e) {
    showError(e?.message || '登录失败', '登录失败')
    captchaCode.value = ''
    loadCaptcha()
  } finally {
    loginLoading.value = false
  }
}

function toDataUrlFromSvg(svg) {
  const s = String(svg || '').trim()
  if (!s) return ''
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`
}

function normalizeCaptchaSrc(input) {
  if (!input) return ''
  if (typeof input === 'string') {
    const s = input.trim()
    if (!s) return ''
    if (s.startsWith('data:')) return s
    if (s.startsWith('<svg')) return toDataUrlFromSvg(s)
    if (/^https?:\/\//i.test(s)) return s
    if (s.startsWith('/')) return s
    if (/^[A-Za-z0-9+/=]+$/.test(s) && s.length > 80) return `data:image/png;base64,${s}`
    return s
  }
  if (typeof input === 'object') {
    const v = input.image || input.img || input.captcha || input.base64 || input.url || ''
    return normalizeCaptchaSrc(v)
  }
  return ''
}

async function loadCaptcha() {
  if (captchaLoading.value) return
  captchaLoading.value = true
  try {
    const res = await captchaApi.getCaptchaRaw()
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (ct.includes('application/json')) {
      const json = await res.json().catch(() => null)
      const src = normalizeCaptchaSrc(json?.data ?? json)
      if (src) captchaSrc.value = src
      return
    }
    if (ct.startsWith('image/')) {
      const blob = await res.blob()
      if (captchaObjectUrl) URL.revokeObjectURL(captchaObjectUrl)
      captchaObjectUrl = URL.createObjectURL(blob)
      captchaSrc.value = captchaObjectUrl
      return
    }
    const text = await res.text().catch(() => '')
    const src = normalizeCaptchaSrc(text)
    if (src) captchaSrc.value = src
  } catch {
  } finally {
    captchaLoading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await siteApi.getSite()
    applySite(res?.data)
  } catch {}

  try {
    const res = await regApi.getRegConfig()
    const cfg = normalizeRegConfig(res?.data ?? res)
    regConfig.value = cfg
    registerEnabled.value = String(cfg.register_state || '') !== '2'
  } catch {}

  loadCaptcha()
})

watch(
  () => registerVisible.value,
  v => {
    if (v) return
    phoneCodeCooldown.value = 0
    phoneCodeSending.value = false
    if (phoneCodeTimer) {
      clearInterval(phoneCodeTimer)
      phoneCodeTimer = null
    }
    emailCodeCooldown.value = 0
    emailCodeSending.value = false
    if (emailCodeTimer) {
      clearInterval(emailCodeTimer)
      emailCodeTimer = null
    }
  },
)

onUnmounted(() => {
  if (phoneCodeTimer) {
    clearInterval(phoneCodeTimer)
    phoneCodeTimer = null
  }
  if (emailCodeTimer) {
    clearInterval(emailCodeTimer)
    emailCodeTimer = null
  }
  if (captchaObjectUrl) {
    URL.revokeObjectURL(captchaObjectUrl)
    captchaObjectUrl = ''
  }
})
</script>

<template>
  <div class="loginbg">
    <div class="LoginContent" role="main" aria-label="登录页">
      <section class="LoginLeft" aria-label="左侧信息区">
        <div class="welcome">
          <div class="text1">Welcome</div>
          <div class="text2">Always!</div>
        </div>

        <div class="leftLower">
          <div class="LoginLeft_bot" aria-label="客户端下载">
            <button class="downloadItem" type="button">
              <span class="btnIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.6 9.48l1.84-3.18a.25.25 0 0 0-.09-.34.25.25 0 0 0-.34.09l-1.85 3.2A9.94 9.94 0 0 0 12 8c-1.86 0-3.61.51-5.16 1.39L4.99 6.19a.25.25 0 0 0-.34-.09.25.25 0 0 0-.09.34L6.4 9.48A9.94 9.94 0 0 0 2 17h20a9.94 9.94 0 0 0-4.4-7.52ZM9.5 14.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                  />
                </svg>
              </span>
              Android端下载
            </button>
            <button class="downloadItem" type="button">
              <span class="btnIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M16.5 13.1c-.1-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 6.9 1.1 9.2.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-.1 3-1.5.6-.9.8-1.3 1.3-2.4-.1 0-2.6-1-2.6-3.6ZM14.3 6.2c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.4-.6.7-1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.3Z"
                  />
                </svg>
              </span>
              IOS端下载
            </button>
          </div>

          <div class="group" aria-label="线路选择">
            <div class="title">
              <span>线路选择</span>
              <div class="cont">
                <span>刷新</span>
                <button class="refresh" type="button" @click="refreshLines" aria-label="刷新线路">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 13.65-6.65Z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div class="LoginLeft_top">
              <div class="scrollbar-flex-content">
                <button
                  v-for="l in lines"
                  :key="l.id"
                  class="scrollbar-item"
                  type="button"
                  @click="selectLine(l.id)"
                >
                  <div class="content" :class="[getLineColor(l.time), { active: l.id === selectedLineId }]">
                    <div class="ms">{{ l.time.toFixed(3) }} s</div>
                    <div class="progress" aria-hidden="true">
                      <div class="progressFill" :style="{ width: `${Math.round(getLinePercent(l.time) * 100)}%` }"></div>
                    </div>
                  </div>
                  <div class="title">线路{{ l.id }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="LoginRight" aria-label="右侧登录区">
        <div class="top_login">
          <img :src="logoSrc" alt="蓝图 blueprint" />
        </div>

        <form class="LoginRight_div loginWithCaptcha" @submit.prevent="onLogin">
          <ul>
            <li>
              <span class="icon a" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                  />
                </svg>
              </span>
              <input v-model="username" type="text" autocomplete="username" placeholder="请输入您的用户名" />
            </li>
            <li>
              <span class="icon b" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-3 0H9V9a3 3 0 0 1 6 0v2Z"
                  />
                </svg>
              </span>
              <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入您的登录密码" />
            </li>
            <li class="captchaLi">
              <span class="icon c" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 18.1c-3.46-1.15-6-4.93-6-8.8V6.35L12 3.7l6 2.65v3.95c0 3.87-2.54 7.65-6 8.8Z" />
                </svg>
              </span>
              <input v-model="captchaCode" type="text" autocomplete="off" placeholder="请输入验证码" />
              <button class="captchaBox" type="button" :disabled="captchaLoading" @click="loadCaptcha">
                <img v-if="captchaSrc" :src="captchaSrc" alt="验证码" />
                <span v-else>{{ captchaLoading ? '加载中' : '获取验证码' }}</span>
              </button>
            </li>
          </ul>

          <div class="remember">
            <label class="rememberLeft">
              <input v-model="remember" class="checkbox" type="checkbox" />
              <span>记住密码</span>
            </label>
            <div class="forgetPwd">
              <a href="javascript:void(0)" @click.prevent="openForgot">忘记密码?</a>
            </div>
          </div>

          <button class="loginBtn" type="submit" :disabled="loginLoading">{{ loginLoading ? '登录中...' : '登 陆' }}</button>

          <div class="change" aria-label="辅助链接">
            <a v-if="registerEnabled" class="item" href="javascript:void(0)" @click.prevent="openRegister">
              <span class="bottomIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm1-13h-2v5.59l-2.29 2.3 1.42 1.41L13 13.41Z"
                  />
                </svg>
              </span>
              立即注册
            </a>
            <span v-if="registerEnabled" class="split" aria-hidden="true"></span>
            <a class="item" href="javascript:void(0)">
              <span class="bottomIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 1a10 10 0 0 0-10 10v7a3 3 0 0 0 3 3h1v-9H5a7 7 0 0 1 14 0h-1v9h1a3 3 0 0 0 3-3v-7A10 10 0 0 0 12 1Z"
                  />
                </svg>
              </span>
              联系客服
            </a>
          </div>
        </form>
      </section>
    </div>
  </div>

  <BaseModal v-model="forgotVisible" title="找回密码">
    <div class="modalField">
      <div class="modalLabel">平台账号</div>
      <input v-model="forgotAccount" class="modalInput" type="text" autocomplete="username" placeholder="请输入您的平台账号" />
    </div>

    <div class="modalField">
      <div class="modalLabel">谷歌验证码</div>
      <input v-model="forgotGoogleCode" class="modalInput" type="text" inputmode="numeric" placeholder="请输入您绑定的谷歌验证码" />
    </div>

    <template #footer>
      <button class="modalBtn" type="button" @click="onForgotNext">下一步</button>
    </template>
  </BaseModal>

  <BaseModal v-model="registerVisible" title="立即注册" class="registerModal">
    <div class="modalField">
      <div class="modalLabel"><span class="required">*</span>账号</div>
      <input v-model="registerAccount" class="modalInput" type="text" autocomplete="username" placeholder="请输入账号" />
    </div>

    <div class="modalField">
      <div class="modalLabel"><span class="required">*</span>密码</div>
      <input v-model="registerPassword" class="modalInput" type="password" autocomplete="new-password" placeholder="请输入密码" />
    </div>

    <div v-if="showPhone" class="modalField">
      <div class="modalLabel"><span v-if="phoneRequired" class="required">*</span>手机号</div>
      <input
        v-model="registerPhone"
        class="modalInput"
        type="text"
        inputmode="tel"
        autocomplete="tel"
        :placeholder="phonePlaceholder"
      />
    </div>

    <div v-if="phoneCodeVisible" class="modalField">
      <div class="modalLabel"><span v-if="phoneRequired || registerPhone.trim()" class="required">*</span>手机号验证码</div>
      <div class="codeRow">
        <input v-model="registerPhoneCode" class="modalInput" type="text" inputmode="numeric" placeholder="请输入手机号验证码" />
        <button
          class="codeBtn"
          type="button"
          :disabled="phoneCodeSending || phoneCodeCooldown > 0"
          @click="onSendPhoneCode"
        >
          {{ phoneCodeCooldown > 0 ? `${phoneCodeCooldown}s` : '获取验证码' }}
        </button>
      </div>
    </div>

    <div v-if="showEmail" class="modalField">
      <div class="modalLabel"><span v-if="emailRequired" class="required">*</span>邮箱</div>
      <input
        v-model="registerEmail"
        class="modalInput"
        type="email"
        inputmode="email"
        autocomplete="email"
        :placeholder="emailPlaceholder"
      />
    </div>

    <div v-if="emailCodeVisible" class="modalField">
      <div class="modalLabel"><span v-if="emailRequired || registerEmail.trim()" class="required">*</span>邮箱验证码</div>
      <div class="codeRow">
        <input v-model="registerEmailCode" class="modalInput" type="text" inputmode="numeric" placeholder="请输入邮箱验证码" />
        <button
          class="codeBtn"
          type="button"
          :disabled="emailCodeSending || emailCodeCooldown > 0"
          @click="onSendEmailCode"
        >
          {{ emailCodeCooldown > 0 ? `${emailCodeCooldown}s` : '获取验证码' }}
        </button>
      </div>
    </div>

    <div class="modalField">
      <div class="modalLabel"><span class="required">*</span>图形验证码</div>
      <ImageCaptcha v-model="registerCaptchaVerified" v-model:code="registerCaptcha" />
    </div>

    <div v-if="inviteVisible" class="modalField">
      <div class="modalLabel"><span v-if="inviteRequired" class="required">*</span>邀请码</div>
      <input v-model="registerInviteCode" class="modalInput" type="text" :placeholder="invitePlaceholder" />
    </div>

    <template #footer>
      <button class="modalBtn" type="button" :disabled="!registerCaptchaVerified" @click="onRegisterSubmit">注册</button>
    </template>
  </BaseModal>
</template>

<style>
.required {
  color: red;
  margin-right: 4px;
}

.loginWithCaptcha ul li {
  margin-bottom: 16px;
}

.loginWithCaptcha .loginBtn {
  margin-top: 24px;
}

.loginWithCaptcha .change {
  margin: 26px 0 0;
}

.captchaLi input {
  padding-right: 150px;
}

.captchaBox {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 42px;
  min-width: 120px;
  padding: 0 10px;
  border-radius: 7.2px;
  border: 1.44px solid #e8f4ff;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.captchaBox:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.captchaBox img {
  height: 36px;
  width: auto;
  display: block;
}

.captchaBox span {
  color: #7f818f;
  font-size: 14px;
  font-weight: 500;
}

.loginbg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/assets/bg-CjwezJAO.png') #d3d3d3 50% / cover no-repeat;
  padding: 24px;
  box-sizing: border-box;
}

.LoginContent {
  width: 1000px;
  max-width: 100%;
  min-height: 540px;
  display: flex;
  border-radius: 7.2px;
  overflow: hidden;
  box-shadow: 0 7.707px 7.707px rgba(44, 160, 246, 0.2);
  background: #fff;
}
</style>
