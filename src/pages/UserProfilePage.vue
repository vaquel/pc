<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SiteHeader from '../components/SiteHeader.vue'
import { hbApi } from '../api'

const router = useRouter()

function getLocalToken() {
  try {
    const t = localStorage.getItem('token') || ''
    const s = String(t || '').trim()
    if (!s || s === 'undefined' || s === 'null') return ''
    return s
  } catch {
    return ''
  }
}

function normalizeAssetUrl(input) {
  if (!input) return ''
  const s = String(input).replaceAll('\\/', '/').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.includes('api.msgameapi.com') && !s.startsWith('http')) return `https://${s}`
  return s.startsWith('/') ? s : `/${s}`
}

const loading = ref(false)
const userInfo = ref(null)

const avatar = computed(() => normalizeAssetUrl(userInfo.value?.avatar || ''))
const nickname = computed(() => String(userInfo.value?.nickname || ''))
const account = computed(() => String(userInfo.value?.account || ''))
const money = computed(() => Number(userInfo.value?.money ?? 0))
const levelTitle = computed(() => String(userInfo.value?.level_title || ''))
const levels = computed(() => Number(userInfo.value?.levels ?? 0))
const phone = computed(() => String(userInfo.value?.phone || ''))
const email = computed(() => String(userInfo.value?.email || ''))
const transf = computed(() => Number(userInfo.value?.transf ?? 0))
const flowingWater = computed(() => Number(userInfo.value?.flowing_water ?? 0))
const rechargeAmount = computed(() => Number(userInfo.value?.recharge_amount ?? 0))
const withdrawalAmount = computed(() => Number(userInfo.value?.withdrawal_amount ?? 0))
const integrals = computed(() => Number(userInfo.value?.integrals ?? 0))
const loginIp = computed(() => String(userInfo.value?.login_ip || ''))
const createAt = computed(() => String(userInfo.value?.create_at || ''))
const describes = computed(() => String(userInfo.value?.describes || ''))
const invitationCode = computed(() => (userInfo.value?.Invitation_code == null ? '' : String(userInfo.value.Invitation_code)))

const transfText = computed(() => (transf.value === 2 ? '免转' : '手动'))

const rebate = computed(() => {
  const v =
    userInfo.value?.rebate ??
    userInfo.value?.rebate_point ??
    userInfo.value?.rebatePoints ??
    userInfo.value?.point ??
    userInfo.value?.points ??
    ''
  if (v === 0) return 0
  if (v === null || v === undefined || v === '') return '-'
  return v
})

const lastLoginAt = computed(() => {
  const v =
    userInfo.value?.last_login_time ??
    userInfo.value?.last_login_at ??
    userInfo.value?.last_login ??
    userInfo.value?.login_time ??
    userInfo.value?.login_at ??
    ''
  return v ? String(v) : '-'
})

async function loadUserInfo() {
  if (!getLocalToken()) return router.push('/login')
  loading.value = true
  try {
    const res = await hbApi.getUserInfo()
    userInfo.value = res?.data && typeof res.data === 'object' ? res.data : null
  } catch {
    userInfo.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadUserInfo)
</script>

<template>
  <div class="page">
    <SiteHeader />

    <main class="main">
      <div class="grid2">
        <section class="card profileCard" aria-label="用户信息">
          <div class="profileLeft">
            <div class="avatarWrap" aria-hidden="true">
              <img v-if="avatar" class="avatar" :src="avatar" alt="" />
            </div>
            <div class="profileMeta">
              <div class="name">{{ nickname || account || '-' }}</div>
              <div class="sub">
                <span>账号：</span>
                <span class="subVal">{{ account || '-' }}</span>
              </div>
              <div class="sub">
                <span>VIP：</span>
                <span class="subVal">{{ levelTitle || `VIP${levels}` }}</span>
              </div>
            </div>
          </div>

          <div class="profileRight">
            <div class="kvRow">
              <div class="kvLabel">余额</div>
              <div class="kvValue">{{ money }}</div>
            </div>
            <div class="kvRow">
              <div class="kvLabel">免转模式</div>
              <div class="kvValue">{{ transfText }}</div>
            </div>
            <div class="kvRow">
              <div class="kvLabel">上次登录 IP</div>
              <div class="kvValue">{{ loginIp || '-' }}</div>
            </div>
          </div>
        </section>

        <section class="card infoCard" aria-label="账号信息">
          <div class="infoList">
            <div class="infoRow">
              <div class="infoLabel">
                <span class="infoIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                    />
                  </svg>
                </span>
                用户名：
              </div>
              <div class="infoValue">{{ account || '-' }}</div>
            </div>
            <div class="infoRow">
              <div class="infoLabel">
                <span class="infoIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M17 3H7a4 4 0 0 0-4 4v10a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4ZM8.5 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm7 7a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm2.06-8.94 1.38 1.38L7.44 19.44l-1.38-1.38L17.56 6.56Z"
                    />
                  </svg>
                </span>
                账户返点：
              </div>
              <div class="infoValue">{{ rebate }}</div>
            </div>
            <div class="infoRow">
              <div class="infoLabel">
                <span class="infoIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9Zm.5-14H11v6l5.25 3.15.75-1.23-4.5-2.67Z"
                    />
                  </svg>
                </span>
                上次登录时间：
              </div>
              <div class="infoValue">{{ lastLoginAt }}</div>
            </div>
          </div>
        </section>
      </div>

      <section class="card fullCard" aria-label="联系方式">
        <div class="row3">
          <div class="kvRow">
            <div class="kvLabel">手机号</div>
            <div class="kvValue">{{ phone || '-' }}</div>
          </div>
          <div class="kvRow">
            <div class="kvLabel">邮箱</div>
            <div class="kvValue">{{ email || '-' }}</div>
          </div>
          <div class="kvRow">
            <div class="kvLabel">邀请码</div>
            <div class="kvValue">{{ invitationCode || '-' }}</div>
          </div>
        </div>
      </section>

      <section class="card fullCard" aria-label="个人简介">
        <div class="sectionTitle">个人简介</div>
        <div class="desc">{{ describes || '暂无' }}</div>
      </section>

      <section class="card fullCard" aria-label="其他信息">
        <div class="row3">
          <div class="kvRow">
            <div class="kvLabel">用户ID</div>
            <div class="kvValue">{{ userInfo?.id ?? '-' }}</div>
          </div>
          <div class="kvRow">
            <div class="kvLabel">创建时间</div>
            <div class="kvValue">{{ createAt || '-' }}</div>
          </div>
          <div class="kvRow">
            <div class="kvLabel">等级ID</div>
            <div class="kvValue">{{ levels || '-' }}</div>
          </div>
        </div>
      </section>

      <div v-if="loading" class="loadingMask">加载中...</div>
    </main>
  </div>
</template>

<style scoped>
.page {
  --homeText: rgba(51, 51, 51, 0.98);
  --homeTextSoft: rgba(51, 51, 51, 0.75);
  min-height: 100vh;
  background:
    radial-gradient(900px 520px at 50% 0%, rgba(11, 102, 255, 0.06), rgba(11, 102, 255, 0) 70%),
    linear-gradient(180deg, rgba(245, 247, 251, 1), rgba(245, 247, 251, 1));
  color: var(--homeText);
}

.main {
  max-width: 1380px;
  margin: 0 auto;
  padding: 14px 16px 26px;
  box-sizing: border-box;
  position: relative;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.profileCard {
  padding: 16px;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 18px;
  min-height: 120px;
}

.infoCard {
  padding: 0;
  min-height: 120px;
  display: flex;
  align-items: stretch;
}

.infoList {
  width: 100%;
  padding: 10px 14px;
  box-sizing: border-box;
}

.infoRow {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 12px;
  height: 44px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.infoRow:last-child {
  border-bottom: 0;
}

.infoLabel {
  color: var(--homeTextSoft);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.infoIcon {
  width: 16px;
  height: 16px;
  color: rgba(11, 123, 255, 0.9);
  flex: 0 0 auto;
  display: inline-flex;
}

.infoIcon svg {
  width: 16px;
  height: 16px;
}

.infoValue {
  color: var(--homeText);
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profileLeft {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.avatarWrap {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profileMeta {
  min-width: 0;
}

.name {
  font-size: 16px;
  font-weight: 700;
  color: var(--homeText);
}

.sub {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--homeTextSoft);
}

.subVal {
  color: var(--homeText);
}

.profileRight {
  display: grid;
  gap: 10px;
  min-width: 0;
  align-content: center;
}

.profileRight.wide {
  grid-template-columns: 1fr 1fr;
  column-gap: 18px;
}

.kvRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.kvLabel {
  font-size: 12px;
  font-weight: 500;
  color: var(--homeTextSoft);
  white-space: nowrap;
}

.kvValue {
  font-size: 12px;
  font-weight: 600;
  color: var(--homeText);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fullCard {
  margin-top: 14px;
  padding: 16px;
}

.row3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.sectionTitle {
  font-size: 14px;
  font-weight: 700;
  color: var(--homeText);
}

.desc {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--homeTextSoft);
  line-height: 1.6;
}

.loadingMask {
  position: absolute;
  left: 16px;
  right: 16px;
  top: 14px;
  height: 46px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--homeText);
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 980px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
  .row3 {
    grid-template-columns: 1fr;
  }
  .profileRight.wide {
    grid-template-columns: 1fr;
  }
}
</style>
