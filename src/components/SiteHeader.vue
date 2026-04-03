<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLoading from './AppLoading.vue'
import { API_BASE_URL, activityApi, gameTypeApi, hbApi } from '../api'
import { siteState } from '../store/site'

const route = useRoute()
const router = useRouter()

function backToLogin() {
  router.push('/login')
}

const logoSrc = computed(() => siteState.webLogo || '/assets/logo_blue-B7kOdN8N.png')

const isWap = ref(false)
function updateIsWap() {
  if (typeof window === 'undefined') return
  isWap.value = window.matchMedia?.('(max-width: 740px)')?.matches ?? window.innerWidth <= 740
}

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/+$/, '')
  const p = String(path || '').replace(/^\/+/, '')
  if (!b) return `/${p}`
  if (!p) return b
  return `${b}/${p}`
}

function normalizeAssetUrl(input) {
  if (!input) return ''
  const s = String(input).replaceAll('\\', '/').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.includes('api.msgameapi.com') && !s.startsWith('http')) return `https://${s}`
  return joinUrl(API_BASE_URL, s)
}

const navItems = [
  { label: '首页', path: '/home' },
  { label: '活动', path: '' },
  { label: '娱乐', path: '' },
  { label: '管理', path: '' },
]

const navRef = ref(null)
const gameMenuVisible = ref(false)
const gameMenuLeft = ref(0)
const gameTypes = ref([])
const gameTypeLoading = ref(false)
const activityMenuVisible = ref(false)
const activityMenuLeft = ref(0)
const activityTypes = ref([])
const activityTypeLoading = ref(false)
const gameMenuWidth = 980
let gameMenuHideTimer = 0

function cancelHideGameMenu() {
  if (!gameMenuHideTimer) return
  window.clearTimeout(gameMenuHideTimer)
  gameMenuHideTimer = 0
}
function scheduleHideGameMenu() {
  cancelHideGameMenu()
  gameMenuHideTimer = window.setTimeout(() => {
    gameMenuVisible.value = false
    activityMenuVisible.value = false
    gameMenuHideTimer = 0
  }, 120)
}

function computeMenuLeft(ev) {
  const navEl = navRef.value
  const target = ev?.currentTarget
  if (navEl && target?.getBoundingClientRect) {
    const navRect = navEl.getBoundingClientRect()
    const tRect = target.getBoundingClientRect()
    const center = tRect.left - navRect.left + tRect.width / 2
    const half = gameMenuWidth / 2
    return Math.max(half, Math.min(navRect.width - half, center))
  }
  return 0
}
function resolveGameTypeIcon(item) {
  const icon = isWap.value ? item?.wap_icon : item?.pc_icon
  return normalizeAssetUrl(icon || '')
}
async function loadGameTypesIfNeeded() {
  if (gameTypeLoading.value) return
  if (gameTypes.value.length) return
  gameTypeLoading.value = true
  try {
    const res = await gameTypeApi.getGameTypes()
    const list = Array.isArray(res?.data) ? res.data : []
    const mapped = list
      .map(it => ({
        title: String(it?.title || ''),
        type: Number(it?.type ?? 0),
        orders: Number(it?.orders ?? 0),
        icon: resolveGameTypeIcon(it),
      }))
      .filter(it => it.title)
      .sort((a, b) => (a.orders ?? 0) - (b.orders ?? 0))
    gameTypes.value = mapped
  } catch {
  } finally {
    gameTypeLoading.value = false
  }
}

function resolveActivityIcon(item) {
  const icon = isWap.value ? item?.wap_icon : item?.pc_icon
  return normalizeAssetUrl(icon || '')
}

async function loadActivityTypesIfNeeded() {
  if (activityTypeLoading.value) return
  if (activityTypes.value.length) return
  activityTypeLoading.value = true
  try {
    const res = await activityApi.getTypes()
    const list = Array.isArray(res?.data) ? res.data : []
    const mapped = list
      .map(it => ({
        title: String(it?.title || ''),
        type: Number(it?.type ?? it?.type_id ?? it?.id ?? it?.typeId ?? 0),
        orders: Number(it?.orders ?? 0),
        icon: resolveActivityIcon(it),
      }))
      .filter(it => it.title)
      .sort((a, b) => (a.orders ?? 0) - (b.orders ?? 0))
    activityTypes.value = mapped
  } catch {
  } finally {
    activityTypeLoading.value = false
  }
}

function onNavItemEnter(it, ev) {
  if (it?.label === '娱乐') {
    cancelHideGameMenu()
    activityMenuVisible.value = false
    gameMenuVisible.value = true
    gameMenuLeft.value = computeMenuLeft(ev)
    loadGameTypesIfNeeded()
    return
  }
  if (it?.label === '活动') {
    cancelHideGameMenu()
    gameMenuVisible.value = false
    activityMenuVisible.value = true
    activityMenuLeft.value = computeMenuLeft(ev)
    loadActivityTypesIfNeeded()
    return
  }
  if (gameMenuVisible.value || activityMenuVisible.value) scheduleHideGameMenu()
}

function isActiveNav(it) {
  if (!it?.path) return false
  return route.path === it.path
}

function onNavItemClick(it, ev) {
  if (it?.label === '首页') {
    gameMenuVisible.value = false
    activityMenuVisible.value = false
    if (route.path !== '/home') router.push('/home')
    return
  }
  if (it?.label === '娱乐') {
    cancelHideGameMenu()
    activityMenuVisible.value = false
    gameMenuVisible.value = !gameMenuVisible.value
    if (gameMenuVisible.value) {
      gameMenuLeft.value = computeMenuLeft(ev)
      loadGameTypesIfNeeded()
    }
    return
  }
  if (it?.label === '活动') {
    cancelHideGameMenu()
    gameMenuVisible.value = false
    activityMenuVisible.value = !activityMenuVisible.value
    if (activityMenuVisible.value) {
      activityMenuLeft.value = computeMenuLeft(ev)
      loadActivityTypesIfNeeded()
    }
    return
  }
}

function onGameTypeClick(g) {
  if (!g?.type) return
  gameMenuVisible.value = false
  router.push({ path: `/games/${g.type}`, query: { title: g.title || '' } })
}

function onActivityTypeClick(a) {
  const tid = Number(a?.type ?? a?.type_id ?? a?.id ?? 0)
  if (!tid) return
  activityMenuVisible.value = false
  router.push({ path: `/activities/${tid}`, query: { title: a.title || '' } })
}

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
const userInfo = ref(null)
const userAvatar = computed(() => normalizeAssetUrl(userInfo.value?.avatar || ''))
const userName = computed(() => String(userInfo.value?.nickname || userInfo.value?.account || ''))
const userMoney = computed(() => Number(userInfo.value?.money ?? 0))

onMounted(async () => {
  updateIsWap()
  if (getLocalToken()) {
    try {
      const res = await hbApi.getUserInfo()
      userInfo.value = res?.data && typeof res.data === 'object' ? res.data : null
    } catch {}
  }
})
</script>

<template>
  <header class="siteHeader">
    <div class="headerInner">
      <div class="brand" aria-label="站点品牌">
        <img class="brandLogo" :src="logoSrc" alt="蓝图 blueprint" />
      </div>

      <nav ref="navRef" class="nav" aria-label="主导航" @mouseleave="scheduleHideGameMenu">
        <a
          v-for="it in navItems"
          :key="it.label"
          class="navItem"
          href="javascript:void(0)"
          :data-active="isActiveNav(it) ? '1' : '0'"
          :data-label="it.label"
          :data-open="
            it.label === '娱乐'
              ? gameMenuVisible
                ? '1'
                : '0'
              : it.label === '活动'
                ? activityMenuVisible
                  ? '1'
                  : '0'
                : '0'
          "
          @mouseenter="e => onNavItemEnter(it, e)"
          @click.prevent="e => onNavItemClick(it, e)"
        >
          {{ it.label }}
        </a>

        <div
          v-if="gameMenuVisible"
          class="gameMenu"
          :style="{ left: `${gameMenuLeft}px`, width: `${gameMenuWidth}px` }"
          @mouseenter="cancelHideGameMenu"
          @mouseleave="scheduleHideGameMenu"
        >
          <AppLoading v-if="gameTypeLoading && !gameTypes.length" class="gameMenuHint" size="sm" />
          <div v-else class="gameMenuGrid">
            <button v-for="g in gameTypes" :key="g.type" class="gameMenuCard" type="button" @click="onGameTypeClick(g)">
              <div class="gameMenuCardTitle">{{ g.title }}</div>
              <div class="gameMenuCardMedia" aria-hidden="true">
                <img v-if="g.icon" :src="g.icon" alt="" />
              </div>
            </button>
          </div>
        </div>

        <div
          v-if="activityMenuVisible"
          class="gameMenu"
          :style="{ left: `${activityMenuLeft}px`, width: `${gameMenuWidth}px` }"
          @mouseenter="cancelHideGameMenu"
          @mouseleave="scheduleHideGameMenu"
        >
          <AppLoading v-if="activityTypeLoading && !activityTypes.length" class="gameMenuHint" size="sm" />
          <div v-else class="gameMenuGrid">
            <button v-for="a in activityTypes" :key="a.type" class="gameMenuCard" type="button" @click="onActivityTypeClick(a)">
              <div class="gameMenuCardTitle">{{ a.title }}</div>
              <div class="gameMenuCardMedia" aria-hidden="true">
                <img v-if="a.icon" :src="a.icon" alt="" />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div class="headerRight">
        <div class="userInfo">
          <img v-if="userAvatar" class="userAvatar" :src="userAvatar" alt="" />
          <span class="userGreet">您好</span>
          <a class="userLink" href="javascript:void(0)" @click.prevent="router.push('/user')">{{ userName }}</a>
          <span class="userMeta">余额：{{ userMoney }}</span>
        </div>
        <button class="headerBtn primary" type="button">充值</button>
        <button class="headerBtn secondary" type="button">提现</button>
        <button class="iconBtn" type="button" aria-label="消息" data-icon="msg"></button>
        <button class="iconBtn" type="button" aria-label="退出" data-icon="logout" @click="backToLogin"></button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.siteHeader {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.headerInner {
  height: 64px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 18px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brandLogo {
  width: 150px;
  height: 44px;
  object-fit: contain;
}
.nav {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
  position: relative;
}
.navItem {
  color: rgba(51, 51, 51, 0.98);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 10px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.navItem[data-active='1'] {
  color: rgba(51, 51, 51, 0.98);
  background: transparent;
}
.navItem[data-label='娱乐']::after,
.navItem[data-label='活动']::after {
  content: '▾';
  font-size: 12px;
  transform: translateY(-1px);
}

.navItem[data-label='娱乐'][data-open='1']::after,
.navItem[data-label='活动'][data-open='1']::after {
  content: '▴';
}
.gameMenu {
  position: absolute;
  top: calc(100% + 10px);
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  padding: 14px;
  z-index: 100;
}
.gameMenuHint {
  padding: 18px 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(51, 51, 51, 0.98);
}
.gameMenuGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.gameMenuCard {
  border: 1px solid rgba(11, 123, 255, 0.18);
  background: linear-gradient(180deg, rgba(235, 248, 255, 1), rgba(255, 255, 255, 1));
  border-radius: 10px;
  height: 140px;
  padding: 14px 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-align: left;
}
.gameMenuCard:hover {
  border-color: rgba(11, 123, 255, 0.3);
  background: linear-gradient(180deg, rgba(226, 245, 255, 1), rgba(255, 255, 255, 1));
}
.gameMenuCardTitle {
  font-size: 16px;
  font-weight: 600;
  color: rgba(51, 51, 51, 0.98);
  position: relative;
  z-index: 1;
}
.gameMenuCardMedia {
  position: absolute;
  left: 10px;
  right: 10px;
  top: 44px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gameMenuCardMedia img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
.headerRight {
  display: flex;
  align-items: center;
  gap: 10px;
}
.userInfo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
  color: rgba(51, 51, 51, 0.98);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.userAvatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.04);
}
.userGreet {
  color: rgba(51, 51, 51, 0.98);
}
.userLink {
  color: rgba(51, 51, 51, 0.98);
  text-decoration: none;
  font-weight: 500;
}
.userMeta {
  color: rgba(51, 51, 51, 0.98);
}
.headerBtn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: rgba(51, 51, 51, 0.98);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}
.headerBtn.primary {
  border: 0;
  color: #fff;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 64.29%), #0281fb;
  background-blend-mode: overlay, normal;
}
.headerBtn.secondary {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.06);
}
.iconBtn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 34px 34px;
  cursor: pointer;
}
.iconBtn[data-icon='msg'] {
  background-image: url('/lt01/icon-msg.svg');
}
.iconBtn[data-icon='logout'] {
  background-image: url('/lt01/icon-logout.svg');
}
</style>
