<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppLoading from '../components/AppLoading.vue'
import SiteHeader from '../components/SiteHeader.vue'
import { API_BASE_URL, hbApi } from '../api'

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

const loading = ref(false)
const userInfo = ref(null)
const vipLoading = ref(false)
const vipInfo = ref(null)
const vipPicError = ref(false)

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
const isAgent = computed(() => Number(userInfo.value?.is_agent ?? 0) === 2)

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

const vipCurrentLevel = computed(() =>
  Number(
    vipInfo.value?.user_current_level ??
      vipInfo.value?.current_level ??
      vipInfo.value?.level ??
      vipInfo.value?.levels ??
      userInfo.value?.levels ??
      userInfo.value?.level ??
      0,
  ),
)
const vipList = computed(() => (Array.isArray(vipInfo.value?.list) ? vipInfo.value.list : []))

function getVipKey(it, idx) {
  return String(it?.id ?? it?.level ?? idx)
}

function getRequirementText(requirement) {
  const v = Number(requirement ?? 0)
  if (v === 2) return '充值达标'
  if (v === 3) return '流水达标'
  if (v === 1) return '全部达标'
  return ''
}

const currentVip = computed(() => {
  const list = vipList.value
  if (!list.length) return null
  const byCurrentFlag = list.find(it => String(it?.is_current ?? '') === '1')
  if (byCurrentFlag) return byCurrentFlag
  const cur = vipCurrentLevel.value
  if (cur) {
    const byLevel = list.find(it => Number(it?.level ?? 0) === cur)
    if (byLevel) return byLevel
    const byId = list.find(it => Number(it?.id ?? 0) === cur)
    if (byId) return byId
  }
  return list[0] || null
})

const vipDisplayList = computed(() => {
  const list = vipList.value
  return [...list]
    .map((it, idx) => {
      const key = getVipKey(it, idx)
      const title = String(it?.title || '')
      const level = Number(it?.level ?? it?.id ?? 0)
      const pic = normalizeAssetUrl(it?.pic || '')
      const requirement = Number(it?.requirement ?? 0)
      const money = Number(it?.money ?? 0)
      const flowingWater = Number(it?.flowing_water ?? 0)
      const upgradeBonus = it?.upgrade_money ?? it?.upgrade_bonus ?? it?.level_money ?? it?.bonus ?? ''
      const isCurrent = String(it?.is_current ?? '') === '1' || (level && level === vipCurrentLevel.value)
      return { key, title, level, pic, requirement, money, flowingWater, upgradeBonus, isCurrent, raw: it }
    })
    .filter(it => it.title)
    .sort((a, b) => (a.level || 0) - (b.level || 0))
})

const vipSelectedKey = ref('')
const vipSelected = computed(() => {
  const key = String(vipSelectedKey.value || '')
  if (!key) return null
  return vipDisplayList.value.find(it => it.key === key) || null
})

const vipCarouselRef = ref(null)
const vipCarouselViewportRef = ref(null)
const vipCardRefs = new Map()

function setVipCardRef(key, el) {
  if (!key) return
  if (el) vipCardRefs.set(String(key), el)
  else vipCardRefs.delete(String(key))
}

function ensureVipSelectedVisible() {
  if (typeof window === 'undefined') return
  const key = String(vipSelectedKey.value || '')
  const el = key ? vipCardRefs.get(key) : null
  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

function selectVipByIndex(idx) {
  const list = vipDisplayList.value
  if (!list.length) return
  const i = Math.max(0, Math.min(list.length - 1, Number(idx) || 0))
  vipSelectedKey.value = list[i].key
}

function selectPrevVip() {
  const list = vipDisplayList.value
  if (!list.length) return
  const curIdx = list.findIndex(it => it.key === vipSelectedKey.value)
  selectVipByIndex((curIdx >= 0 ? curIdx : 0) - 1)
}

function selectNextVip() {
  const list = vipDisplayList.value
  if (!list.length) return
  const curIdx = list.findIndex(it => it.key === vipSelectedKey.value)
  selectVipByIndex((curIdx >= 0 ? curIdx : -1) + 1)
}

const vipMarqueeEnabled = computed(() => vipDisplayList.value.length > 1)
const vipMarqueePaused = ref(false)
let vipMarqueeRaf = 0
let vipMarqueeLastTs = 0

function stopVipMarquee() {
  if (!vipMarqueeRaf) return
  cancelAnimationFrame(vipMarqueeRaf)
  vipMarqueeRaf = 0
  vipMarqueeLastTs = 0
}

function tickVipMarquee(ts) {
  const viewport = vipCarouselViewportRef.value
  if (!viewport) {
    stopVipMarquee()
    return
  }
  if (!vipMarqueeEnabled.value) {
    stopVipMarquee()
    return
  }
  if (!vipMarqueePaused.value) {
    const last = vipMarqueeLastTs || ts
    const dt = Math.max(0, Math.min(64, ts - last))
    const speed = 26
    const dx = (dt * speed) / 1000
    const max = viewport.scrollWidth - viewport.clientWidth
    if (max > 0) {
      const next = viewport.scrollLeft + dx
      viewport.scrollLeft = next >= max - 1 ? 0 : next
    } else {
      viewport.scrollLeft = 0
    }
    vipMarqueeLastTs = ts
  } else {
    vipMarqueeLastTs = ts
  }
  vipMarqueeRaf = requestAnimationFrame(tickVipMarquee)
}

function startVipMarquee() {
  stopVipMarquee()
  if (typeof window === 'undefined') return
  if (!vipMarqueeEnabled.value) return
  vipMarqueeRaf = requestAnimationFrame(tickVipMarquee)
}

function pauseVipMarquee() {
  vipMarqueePaused.value = true
}

function resumeVipMarquee() {
  vipMarqueePaused.value = false
}

const vipSelectedRequirementText = computed(() => getRequirementText(vipSelected.value?.requirement))
const vipSelectedUpgradeBonus = computed(() => {
  const v = vipSelected.value?.upgradeBonus
  if (v === 0) return 0
  if (v === null || v === undefined || v === '') return '-'
  return v
})
const vipSelectedMoney = computed(() => Number(vipSelected.value?.money ?? 0))
const vipSelectedFlowingWater = computed(() => Number(vipSelected.value?.flowingWater ?? 0))

const vipTitle = computed(() => String(currentVip.value?.title ?? vipInfo.value?.title ?? ''))
const vipPic = computed(() => normalizeAssetUrl(currentVip.value?.pic ?? vipInfo.value?.pic ?? ''))
const vipRequirement = computed(() => Number(currentVip.value?.requirement ?? vipInfo.value?.requirement ?? 0))
const vipRechargeGift = computed(() => String(currentVip.value?.recharge_gift ?? vipInfo.value?.recharge_gift ?? ''))
const vipRechargeGiftInte = computed(() => String(currentVip.value?.recharge_gift_inte ?? vipInfo.value?.recharge_gift_inte ?? ''))
const vipMoneyDiscount = computed(() => String(currentVip.value?.money_discount ?? vipInfo.value?.money_discount ?? ''))
const vipIntegralsDiscount = computed(() => String(currentVip.value?.integrals_discount ?? vipInfo.value?.integrals_discount ?? ''))

const userRecharge = computed(() => Number(vipInfo.value?.user_recharge ?? 0))
const userFlowing = computed(() => Number(vipInfo.value?.user_flowing ?? 0))

const nextVip = computed(() => {
  if (vipInfo.value?.next_vip) return vipInfo.value.next_vip
  const list = vipList.value
  if (!list.length) return null
  const cur = Number(currentVip.value?.level ?? vipCurrentLevel.value ?? 0)
  if (!cur) return null
  const sorted = [...list].sort((a, b) => Number(a?.level ?? a?.id ?? 0) - Number(b?.level ?? b?.id ?? 0))
  return sorted.find(it => Number(it?.level ?? it?.id ?? 0) > cur) ?? null
})
const nextVipTitle = computed(() => String(nextVip.value?.title || ''))
const nextVipMoney = computed(() => Number(nextVip.value?.money ?? 0))
const nextVipFlowing = computed(() => Number(nextVip.value?.flowing_water ?? 0))

const requirementText = computed(() => {
  return getRequirementText(vipRequirement.value)
})

const rechargeProgress = computed(() => {
  const target = nextVipMoney.value || Number(currentVip.value?.money ?? vipInfo.value?.money ?? 0) || 0
  if (!target) return 0
  return Math.max(0, Math.min(1, userRecharge.value / target))
})

const flowingProgress = computed(() => {
  const target = nextVipFlowing.value || Number(currentVip.value?.flowing_water ?? vipInfo.value?.flowing_water ?? 0) || 0
  if (!target) return 0
  return Math.max(0, Math.min(1, userFlowing.value / target))
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

async function loadVipInfo() {
  if (!getLocalToken()) return router.push('/login')
  vipLoading.value = true
  try {
    const res = await hbApi.getLevel()
    vipInfo.value = res?.data && typeof res.data === 'object' ? res.data : null
  } catch {
    vipInfo.value = null
  } finally {
    vipLoading.value = false
  }
}

watch(vipPic, () => {
  vipPicError.value = false
})

onMounted(async () => {
  await Promise.all([loadUserInfo(), loadVipInfo()])
  vipPicError.value = false
  await nextTick()
  const cur = vipDisplayList.value.find(it => it.isCurrent) || vipDisplayList.value[0] || null
  if (cur) vipSelectedKey.value = cur.key
  await nextTick()
  ensureVipSelectedVisible()
  startVipMarquee()
})

watch(vipDisplayList, async list => {
  if (!list.length) return
  if (vipSelectedKey.value && list.some(it => it.key === vipSelectedKey.value)) return
  const cur = list.find(it => it.isCurrent) || list[0]
  vipSelectedKey.value = cur?.key || ''
  await nextTick()
  ensureVipSelectedVisible()
  startVipMarquee()
})

watch(vipSelectedKey, async () => {
  await nextTick()
  ensureVipSelectedVisible()
})

onBeforeUnmount(() => {
  try {
    stopVipMarquee()
  } catch {}
})
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

      <section class="card fullCard vipCard" aria-label="VIP等级">
        <div class="vipHead">
          <div class="vipHeadLeft">
            <div class="vipIcon" aria-hidden="true">
              <img v-if="vipPic && !vipPicError" :src="vipPic" alt="" @error="vipPicError = true" />
              <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path
                  d="M3 7a1 1 0 0 1 1.78-.625L8 10.2l2.07-4.14a1 1 0 0 1 1.86 0L14 10.2l3.22-3.825A1 1 0 0 1 19 7v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm2 2.763V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.763l-2.22 2.637a1 1 0 0 1-1.665-.157L11 7.973l-2.115 4.23a1 1 0 0 1-1.665.157L5 9.763Z"
                />
              </svg>
            </div>
            <div class="vipText">
              <div class="vipTitle">{{ vipTitle || levelTitle || '-' }}</div>
              <div class="vipSub">
                <span v-if="nextVipTitle" class="vipNext">下一等级：{{ nextVipTitle }}</span>
              </div>
            </div>
          </div>
          <div class="vipBadges">
            <span v-if="vipRechargeGift" class="badge">充值赠送 {{ vipRechargeGift }}%</span>
            <span v-if="vipRechargeGiftInte" class="badge">赠送积分 {{ vipRechargeGiftInte }}</span>
            <span v-if="vipMoneyDiscount" class="badge">余额折扣 {{ vipMoneyDiscount }}</span>
            <span v-if="vipIntegralsDiscount" class="badge">积分折扣 {{ vipIntegralsDiscount }}</span>
          </div>
        </div>

        <div v-if="vipDisplayList.length" class="vipRules" aria-label="VIP晋升规则">
          <div class="vipRulesTitle">VIP晋升规则</div>
          <div class="vipCarousel" ref="vipCarouselRef">
            <button class="vipArrow" type="button" aria-label="上一等级" @click="selectPrevVip">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 19a1 1 0 0 1-.707-.293l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 1 1 1.414 1.414L10.914 12l5.293 5.293A1 1 0 0 1 15.5 19Z" />
              </svg>
            </button>
            <div
              ref="vipCarouselViewportRef"
              class="vipCarouselViewport"
              :data-marquee="vipMarqueeEnabled ? '1' : '0'"
              @mouseenter="pauseVipMarquee"
              @mouseleave="resumeVipMarquee"
              @touchstart.passive="pauseVipMarquee"
              @touchend.passive="resumeVipMarquee"
              @wheel.passive="pauseVipMarquee"
            >
              <div class="vipCarouselTrack">
                <button
                  v-for="it in vipDisplayList"
                  :key="it.key"
                  :ref="el => setVipCardRef(it.key, el)"
                  class="vipCarouselCard"
                  type="button"
                  :data-active="vipSelectedKey === it.key ? '1' : '0'"
                  @click="vipSelectedKey = it.key; pauseVipMarquee()"
                >
                  <div class="vipCarouselCardTop">
                    <div class="vipCarouselTitle">{{ it.title }}</div>
                    <img v-if="it.pic" class="vipCarouselImg" :src="it.pic" alt="" />
                  </div>
                  <div class="vipCarouselStats">
                    <div class="vipCarouselStat">
                      <div class="vipCarouselStatVal">{{ Number(it.money ?? 0) || '-' }}</div>
                      <div class="vipCarouselStatLab">存款额(¥)</div>
                    </div>
                    <div class="vipCarouselStat">
                      <div class="vipCarouselStatVal">{{ Number(it.flowingWater ?? 0) || '-' }}</div>
                      <div class="vipCarouselStatLab">投注额(¥)</div>
                    </div>
                    <div class="vipCarouselStat">
                      <div class="vipCarouselStatVal">{{ it.upgradeBonus === 0 ? 0 : it.upgradeBonus || '-' }}</div>
                      <div class="vipCarouselStatLab">晋级彩金(¥)</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <button class="vipArrow" type="button" aria-label="下一等级" @click="selectNextVip">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.5 19a1 1 0 0 1-.707-1.707L13.086 12 7.793 6.707a1 1 0 0 1 1.414-1.414l6 6a1 1 0 0 1 0 1.414l-6 6A1 1 0 0 1 8.5 19Z" />
              </svg>
            </button>
          </div>

          <div class="vipRuleGrid" v-if="vipSelected">
            <div class="vipRuleItem">
              <div class="vipRuleItemTop">
                <span class="vipRuleIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a1 1 0 0 1 1 1v1.07a8.002 8.002 0 0 1 6.93 6.93H21a1 1 0 1 1 0 2h-1.07A8.002 8.002 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A8.002 8.002 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A8.002 8.002 0 0 1 11 4.07V3a1 1 0 0 1 1-1Zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
                  </svg>
                </span>
                晋级彩金
              </div>
              <div class="vipRuleItemVal">{{ vipSelectedUpgradeBonus }}</div>
            </div>
            <div class="vipRuleItem">
              <div class="vipRuleItemTop">
                <span class="vipRuleIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 5v4.382l2.447 1.223a1 1 0 1 1-.894 1.79l-3-1.5A1 1 0 0 1 11 12V7a1 1 0 1 1 2 0Z" />
                  </svg>
                </span>
                存款额
              </div>
              <div class="vipRuleItemVal">&gt;= {{ vipSelectedMoney || 0 }}</div>
            </div>
            <div class="vipRuleItem">
              <div class="vipRuleItemTop">
                <span class="vipRuleIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1Zm0 20a9 9 0 1 1 9-9 9 9 0 0 1-9 9Zm.5-14H11v6l5.25 3.15.75-1.23-4.5-2.67Z" />
                  </svg>
                </span>
                投注额
              </div>
              <div class="vipRuleItemVal">&gt;= {{ vipSelectedFlowingWater || 0 }}</div>
            </div>
            <div class="vipRuleItem">
              <div class="vipRuleItemTop">
                <span class="vipRuleIcon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2a1 1 0 0 1-2 0V7H7v14h10v-3a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2V3Zm2 0v1h2V3h-2Zm2.707 12.707a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L13 13.586l4.293-4.293a1 1 0 0 1 1.414 1.414l-5 5Z" />
                  </svg>
                </span>
                晋升条件
              </div>
              <div class="vipRuleItemVal">{{ vipSelectedRequirementText || '-' }}</div>
            </div>
          </div>
        </div>

        <div class="vipBody">
          <div class="vipRow" v-if="vipRequirement !== 3">
            <div class="vipRowTop">
              <span class="vipLabel">当前累计充值</span>
              <span class="vipValue">{{ userRecharge }} / {{ nextVipMoney || '-' }}</span>
            </div>
            <div class="bar">
              <div class="barFill" :style="{ width: `${Math.round(rechargeProgress * 100)}%` }"></div>
            </div>
          </div>

          <div class="vipRow" v-if="vipRequirement !== 2">
            <div class="vipRowTop">
              <span class="vipLabel">当前累计流水</span>
              <span class="vipValue">{{ userFlowing }} / {{ nextVipFlowing || '-' }}</span>
            </div>
            <div class="bar">
              <div class="barFill" :style="{ width: `${Math.round(flowingProgress * 100)}%` }"></div>
            </div>
          </div>

          <AppLoading v-if="vipLoading" class="vipLoading" size="sm" />
        </div>
      </section>

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
          <div class="kvRow" v-if="isAgent">
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

      <AppLoading v-if="loading" class="loadingMask" size="sm" />
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

.vipCard {
  padding: 14px 16px 16px;
}

.vipHead {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.vipHeadLeft {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.vipIcon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(11, 123, 255, 0.12);
  border: 1px solid rgba(11, 123, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: 0 0 auto;
}

.vipIcon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.vipIcon svg {
  width: 22px;
  height: 22px;
  color: rgba(11, 123, 255, 0.9);
}

.vipText {
  min-width: 0;
}

.vipTitle {
  font-size: 15px;
  font-weight: 800;
  color: var(--homeText);
}

.vipSub {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--homeTextSoft);
  font-size: 12px;
  font-weight: 600;
}

.vipTag {
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(11, 123, 255, 0.1);
  border: 1px solid rgba(11, 123, 255, 0.18);
  color: rgba(11, 123, 255, 0.9);
}

.vipNext {
  color: var(--homeTextSoft);
}

.vipBadges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.vipRules {
  margin-top: 12px;
}

.vipRulesTitle {
  font-size: 14px;
  font-weight: 800;
  color: var(--homeText);
}

.vipCarousel {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 42px 1fr 42px;
  align-items: center;
  gap: 10px;
}

.vipArrow {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.vipArrow svg {
  width: 20px;
  height: 20px;
  color: rgba(51, 51, 51, 0.75);
}

.vipCarouselViewport {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: none;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.vipCarouselViewport::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.vipCarouselTrack {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 4px 2px;
}

.vipCarouselCard {
  scroll-snap-align: center;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(245, 198, 167, 0.98), rgba(231, 171, 134, 0.98));
  width: 320px;
  min-width: 320px;
  padding: 12px 12px;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transform: scale(0.965);
  opacity: 0.72;
  filter: saturate(0.9);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease, filter 180ms ease;
}

.vipCarouselCard::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(160px 120px at 18% 18%, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0) 62%),
    radial-gradient(220px 140px at 92% 20%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 60%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.18));
  pointer-events: none;
}

.vipCarouselCard[data-active='1'] {
  border-color: rgba(231, 171, 134, 0.65);
  box-shadow: 0 16px 26px rgba(0, 0, 0, 0.14);
  transform: scale(1.02);
  opacity: 1;
  filter: saturate(1);
}

.vipCarouselCardTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.vipCarouselTitle {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 6px 12px rgba(0, 0, 0, 0.16);
}

.vipCarouselImg {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.16));
}

.vipCarouselStats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  position: relative;
  z-index: 1;
}

.vipCarouselStat {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  padding: 10px 10px;
  min-width: 0;
}

.vipCarouselStatVal {
  font-size: 14px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.96);
  text-shadow: 0 6px 12px rgba(0, 0, 0, 0.14);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vipCarouselStatLab {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}

.vipRuleGrid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.vipRuleItem {
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
  overflow: hidden;
}

.vipRuleItemTop {
  padding: 12px 12px;
  background: linear-gradient(90deg, rgba(238, 211, 196, 1), rgba(231, 186, 157, 1));
  color: rgba(255, 255, 255, 0.96);
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.vipRuleIcon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.vipRuleIcon svg {
  width: 18px;
  height: 18px;
}

.vipRuleItemVal {
  padding: 14px 12px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--homeText);
}

@media (max-width: 900px) {
  .vipRuleGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.badge {
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(246, 249, 255, 0.9);
  color: var(--homeText);
  font-size: 12px;
  font-weight: 600;
}

.vipBody {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.vipRowTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.vipLabel {
  color: var(--homeTextSoft);
  font-size: 12px;
  font-weight: 600;
}

.vipValue {
  color: var(--homeText);
  font-size: 12px;
  font-weight: 700;
}

.bar {
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.barFill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(11, 123, 255, 0.9), rgba(2, 129, 251, 1));
}

.vipLoading {
  color: var(--homeTextSoft);
  font-size: 12px;
  font-weight: 600;
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
