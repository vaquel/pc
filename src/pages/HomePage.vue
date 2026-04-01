<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { bannerApi, noticeApi } from '../api'
import { siteState } from '../store/site'

const router = useRouter()

function backToLogin() {
  router.push('/login')
}

const logoSrc = () => siteState.webLogo || '/assets/logo_blue-B7kOdN8N.png'

const isWap = ref(false)

function updateIsWap() {
  if (typeof window === 'undefined') return
  isWap.value = window.matchMedia?.('(max-width: 740px)')?.matches ?? window.innerWidth <= 740
}

function normalizeAssetUrl(input) {
  if (!input) return ''
  const s = String(input).replaceAll('\\/', '/').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.startsWith('/')) return s
  return `https://${s}`
}

function normalizeGoUrl(input) {
  if (!input) return ''
  const s = String(input).replaceAll('`', '').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  return s
}

const banners = ref([])
const bannerLoaded = ref(false)
const activeBannerIndex = ref(0)
const bannerCount = computed(() => banners.value.length)
const activeDotIndex = computed(() => (bannerCount.value ? activeBannerIndex.value % bannerCount.value : 0))
const bannerReady = computed(() => bannerLoaded.value && bannerCount.value > 0)

let bannerTimer = 0
let resizeListenerAttached = false

function setBannerIndex(next) {
  const n = bannerCount.value
  if (!n) return
  const v = ((next % n) + n) % n
  activeBannerIndex.value = v
}

function nextBanner() {
  setBannerIndex(activeBannerIndex.value + 1)
}

function prevBanner() {
  setBannerIndex(activeBannerIndex.value - 1)
}

function startBannerTimer() {
  stopBannerTimer()
  if (bannerCount.value <= 1) return
  bannerTimer = window.setInterval(() => {
    nextBanner()
  }, 5000)
}

function stopBannerTimer() {
  if (!bannerTimer) return
  window.clearInterval(bannerTimer)
  bannerTimer = 0
}

function onBannerClick(b) {
  const url = b?.goUrl
  if (!url) return
  try {
    window.location.href = url
  } catch {}
}

function preloadImage(url) {
  return new Promise(resolve => {
    if (!url) return resolve(false)
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

onMounted(async () => {
  updateIsWap()
  if (typeof window !== 'undefined' && !resizeListenerAttached) {
    window.addEventListener('resize', updateIsWap)
    resizeListenerAttached = true
  }
  try {
    const res = await bannerApi.getBanners(2)
    const list = Array.isArray(res?.data) ? res.data : []
    const mapped = list
      .map(it => {
        const showStatus = Number(it?.show_status ?? 1)
        const allowed =
          showStatus === 1 || (showStatus === 2 && !isWap.value) || (showStatus === 3 && isWap.value)
        if (!allowed) return null
        const img = normalizeAssetUrl(it?.img)
        const goUrl = normalizeGoUrl(it?.go_url)
        return {
          title: String(it?.title || ''),
          sub: '',
          image: img,
          art: '/lt01/hero-art.svg',
          goUrl,
          orders: Number(it?.orders ?? 0),
        }
      })
      .filter(Boolean)
      .sort((a, b) => (a.orders ?? 0) - (b.orders ?? 0))
    if (mapped.length) {
      const checks = await Promise.all(mapped.map(it => preloadImage(it.image)))
      const ok = mapped.filter((_, i) => checks[i])
      if (ok.length) {
        banners.value = ok
        activeBannerIndex.value = 0
      }
    }
  } catch {}
  bannerLoaded.value = true

  try {
    const res = await noticeApi.getNotices()
    const list = Array.isArray(res?.data) ? res.data : []
    const mapped = list
      .map(it => ({
        title: String(it?.title || ''),
        date: formatNoticeDate(it?.create_at),
      }))
      .filter(it => it.title)
      .slice(0, 8)
    if (mapped.length) notices.value = mapped
  } catch {}

  startBannerTimer()
})

onBeforeUnmount(() => {
  stopBannerTimer()
  if (typeof window !== 'undefined' && resizeListenerAttached) {
    window.removeEventListener('resize', updateIsWap)
    resizeListenerAttached = false
  }
})

const navItems = [
  { label: '首页', active: true },
  { label: '彩票', active: false },
  { label: '娱乐', active: false },
  { label: '管理', active: false },
  { label: '理财', active: false },
]

const hotLottery = [
  '台湾5分彩',
  '以太坊5分彩',
  '波场5分彩',
  '币安5分彩',
  '以太坊12秒',
  '波场极速30秒',
]

const hotEntertain = ['波场极速15秒', '币安极速15秒', '币安极速30秒']

function formatNoticeDate(input) {
  if (!input) return ''
  const s = String(input).trim()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[2]}-${m[3]}`
  return s.slice(0, 10)
}

const notices = ref([])

const hotLiveGames = [
  { title: 'AG真人', img: '/lt01/game-ag.svg' },
  { title: 'PG电子', img: '/lt01/game-pg.svg' },
  { title: 'OG真人', img: '/lt01/game-og.svg' },
  { title: '视讯彩票', img: '/lt01/game-lottery.svg' },
]

const advantages = [
  {
    title: '资金安全',
    desc: '无需绑定任何个人身份信息，高度匿名保护用户隐私，确保账户操作安全。全程采用 SSL/TLS 加密传输技术。',
  },
  {
    title: '公平游戏',
    desc: '游戏结果均来源于权威机构，开奖机制公开透明，坚决落实“公平、公正、公开”的运营理念。',
  },
  {
    title: '极速出款',
    desc: '全新财务系统 3.0，效率更优；自动化审核流程，提升用户资金流转体验。',
  },
  {
    title: '数据互通',
    desc: '全面支持 PC 端与移动端数据互通，跨端同步更方便，随时随地畅玩。',
  },
]

const securityIndex = 20

const downloadCards = [
  { label: '安卓下载', img: '/lt01/qr-android.svg' },
  { label: '苹果扫码下载', img: '/lt01/qr-apple.svg' },
]

const browserRecommends = [
  { label: 'Chrome', img: '/lt01/browser-chrome.svg' },
  { label: 'Edge', img: '/lt01/browser-edge.svg' },
]

const floatMenus = [
  { key: 'finance', label: '理财' },
  { key: 'activity', label: '活动' },
  { key: 'service', label: '客服' },
  { key: 'download', label: '下载' },
  { key: 'notice', label: '公告' },
  { key: 'chat', label: '聊天' },
]
</script>

<template>
  <div class="site">
    <header class="siteHeader">
      <div class="headerInner">
        <div class="brand" aria-label="站点品牌">
          <img class="brandLogo" :src="logoSrc()" alt="蓝图 blueprint" />
        </div>

        <nav class="nav" aria-label="主导航">
          <a
            v-for="it in navItems"
            :key="it.label"
            class="navItem"
            href="javascript:void(0)"
            :data-active="it.active ? '1' : '0'"
          >
            {{ it.label }}
          </a>
        </nav>

        <div class="headerRight">
          <div class="userInfo">
            <span class="userGreet">您好</span>
            <a class="userLink" href="javascript:void(0)">zxm111222</a>
            <span class="userMeta">余额：0</span>
          </div>
          <button class="headerBtn primary" type="button">充值</button>
          <button class="headerBtn secondary" type="button">提现</button>
          <button class="iconBtn" type="button" aria-label="消息" data-icon="msg"></button>
          <button class="iconBtn" type="button" aria-label="退出" data-icon="logout" @click="backToLogin"></button>
        </div>
      </div>
    </header>

    <main class="siteMain" role="main">
      <section class="hero" aria-label="横幅" @mouseenter="stopBannerTimer" @mouseleave="startBannerTimer">
        <div class="heroViewport">
          <template v-if="bannerReady">
            <div class="heroTrack" :style="{ transform: `translateX(-${activeDotIndex * 100}%)` }">
              <div v-for="(b, idx) in banners" :key="`${b.image}-${idx}`" class="heroSlide">
                <div
                  class="heroInner"
                  :style="{ backgroundImage: `url(${b.image})` }"
                  :data-clickable="b.goUrl ? '1' : '0'"
                  @click="onBannerClick(b)"
                >
                  <img class="heroArt" :src="b.art" alt="" aria-hidden="true" />
                </div>
              </div>
            </div>

            <button v-if="bannerCount > 1" class="heroNav heroPrev" type="button" aria-label="上一张" @click="prevBanner"></button>
            <button v-if="bannerCount > 1" class="heroNav heroNext" type="button" aria-label="下一张" @click="nextBanner"></button>

            <div v-if="bannerCount > 1" class="heroDots" aria-label="轮播指示器">
              <button
                v-for="(_, i) in banners"
                :key="i"
                class="dot"
                type="button"
                :data-active="i === activeDotIndex ? '1' : '0'"
                :aria-label="`切换到第${i + 1}张`"
                @click="setBannerIndex(i)"
              ></button>
            </div>
          </template>
          <div v-else class="heroInner heroInnerLoading" aria-label="banner加载中"></div>
        </div>
      </section>

      <section class="content">
        <div class="grid">
          <div class="panel">
            <div class="panelHeader">
              <div class="panelTitle">热门彩票游戏</div>
            </div>
            <div class="btnGrid">
              <button v-for="t in hotLottery" :key="t" class="tileBtn" type="button">{{ t }}</button>
            </div>
          </div>

          <div class="panel">
            <div class="panelHeader">
              <div class="panelTitle">系统公告</div>
              <a class="panelMore" href="javascript:void(0)">全部 &gt;</a>
            </div>
            <div class="noticeList" role="list">
              <div v-for="n in notices" :key="n.title" class="noticeItem" role="listitem">
                <div class="noticeTitle">
                  <span class="noticeIcon" aria-hidden="true"></span>
                  <span class="noticeText">{{ n.title }}</span>
                </div>
                <div class="noticeDate">[{{ n.date }}]</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="panel">
            <div class="panelHeader">
              <div class="panelTitle">热门娱乐游戏</div>
            </div>
            <div class="gameGrid">
              <button v-for="g in hotLiveGames" :key="g.title" class="gameCard" type="button">
                <img class="gameImg" :src="g.img" :alt="g.title" />
              </button>
            </div>
          </div>

          <div class="panel">
            <div class="panelHeader">
              <div class="panelTitle">安全中心</div>
            </div>
            <div class="securityBody">
              <div class="securityRow">
                <div class="securityLeft">
                  <div class="securityTitle">安全指数 <span class="securityPct">{{ securityIndex }}%</span></div>
                  <div class="securityDesc">您的账号级别为 低，安全指数偏低</div>
                </div>
                <div class="securityLevel" aria-hidden="true"></div>
              </div>
              <div class="securityRow">
                <div class="securityLeft">
                  <div class="securityTitle">防护模式</div>
                  <div class="securityDesc">开启模式将关闭您所有资金操作权限</div>
                </div>
                <div class="securityToggle" aria-hidden="true"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="panel">
            <div class="panelHeader">
              <div class="panelTitle">蓝图在线优势</div>
            </div>
            <div class="advGrid">
              <div v-for="a in advantages" :key="a.title" class="advItem">
                <div class="advIcon" aria-hidden="true"></div>
                <div class="advTitle">{{ a.title }}</div>
                <div class="advDesc">{{ a.desc }}</div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panelHeader">
              <div class="panelTitle">蓝图下载中心</div>
            </div>
            <div class="downloadBody">
              <div class="downloadGrid">
                <div v-for="d in downloadCards" :key="d.label" class="downloadCard">
                  <img class="downloadQr" :src="d.img" :alt="d.label" />
                  <div class="downloadLabel">{{ d.label }}</div>
                </div>
              </div>
              <div class="downloadLogo" aria-label="蓝图 logo">
                <img :src="logoSrc()" alt="蓝图 blueprint" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <aside class="floatBar" aria-label="快捷入口">
      <button v-for="m in floatMenus" :key="m.label" class="floatItem" type="button">
        <span class="floatIcon" aria-hidden="true" :data-key="m.key"></span>
        <span class="floatLabel">{{ m.label }}</span>
      </button>
    </aside>

    <footer class="siteFooter" aria-label="底部信息">
      <div class="footerInner">
        <div class="footerLeft">
          <span class="footerLabel">经营公司</span>
          <img class="footerBrand" :src="logoSrc()" alt="蓝图 blueprint" />
        </div>
        <div class="footerMid">
          <span class="footerLabel">推荐浏览器</span>
          <div class="footerIcons">
            <img v-for="b in browserRecommends" :key="b.label" class="footerIcon" :src="b.img" :alt="b.label" />
          </div>
        </div>
        <div class="footerRight">
          <span class="footerLabel">数据来源</span>
          <div class="footerData">
            <span class="dataDot"></span>
            <span class="dataDot"></span>
            <span class="dataDot"></span>
            <span class="dataDot"></span>
            <span class="dataDot"></span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site {
  min-height: 100vh;
  background:
    radial-gradient(800px 420px at 50% 0%, rgba(11, 102, 255, 0.06), rgba(11, 102, 255, 0) 70%),
    linear-gradient(180deg, rgba(245, 247, 251, 1), rgba(245, 247, 251, 1));
  color: #333;
}

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
}

.navItem {
  color: rgba(17, 17, 17, 0.75);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 10px;
  border-radius: 10px;
}

.navItem[data-active='1'] {
  color: rgba(17, 17, 17, 0.88);
  background: transparent;
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
  color: rgba(17, 17, 17, 0.6);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.userGreet {
  color: rgba(17, 17, 17, 0.55);
}

.userLink {
  color: rgba(11, 102, 255, 1);
  text-decoration: none;
  font-weight: 500;
}

.userMeta {
  color: rgba(17, 17, 17, 0.6);
}

.headerBtn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  color: rgba(17, 17, 17, 0.7);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.headerBtn:hover {
  background: rgba(0, 0, 0, 0.03);
}

.headerBtn.primary {
  border: 0;
  color: #fff;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 64.29%), #0281fb;
  background-blend-mode: overlay, normal;
}

.headerBtn.primary:hover {
  filter: brightness(1.03);
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

.iconBtn:hover {
  background: rgba(0, 0, 0, 0.03);
}

.siteMain {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 16px 26px;
  box-sizing: border-box;
}

.hero {
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
}

.heroViewport {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.heroTrack {
  display: flex;
  width: 100%;
  transition: transform 320ms ease;
}

.heroSlide {
  width: 100%;
  flex: 0 0 100%;
}

.heroInner {
  min-height: 270px;
  padding: 56px 56px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    url('/lt01/banner-bg.svg') center / cover no-repeat,
    radial-gradient(1000px 520px at 70% 30%, rgba(11, 102, 255, 0.6), rgba(2, 20, 64, 0.95));
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;
}

.heroInnerLoading {
  background: radial-gradient(1000px 520px at 70% 30%, rgba(11, 102, 255, 0.45), rgba(2, 20, 64, 0.92));
}

.heroInner[data-clickable='1'] {
  cursor: pointer;
}

.heroContent {
  max-width: 640px;
}

.heroArt {
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  width: 420px;
  max-width: 48%;
  height: auto;
  pointer-events: none;
}

.heroTitle {
  color: rgba(172, 232, 255, 0.98);
  font-size: 58px;
  font-weight: 500;
  letter-spacing: 4px;
}

.heroSub {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 18px;
  font-weight: 400;
}

.heroDots {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 2;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.35);
  border: 0;
  padding: 0;
  cursor: pointer;
}

.dot[data-active='1'] {
  width: 18px;
  background: rgba(255, 255, 255, 0.7);
}

.heroNav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  z-index: 2;
}

.heroNav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.heroPrev {
  left: 14px;
}

.heroNext {
  right: 14px;
}

.heroPrev::before,
.heroNext::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-right: 3px solid rgba(255, 255, 255, 0.9);
  border-bottom: 3px solid rgba(255, 255, 255, 0.9);
  transform: translate(-50%, -50%) rotate(135deg);
}

.heroNext::before {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.content {
  margin-top: 14px;
}

.grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 14px;
}

.grid + .grid {
  margin-top: 14px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panelHeader {
  height: 46px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.panelTitle {
  color: rgba(17, 17, 17, 0.82);
  font-size: 14px;
  font-weight: 500;
}

.panelMore {
  color: rgba(11, 102, 255, 0.9);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
}

.btnGrid {
  padding: 12px 12px 14px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.btnGridSmall {
  grid-template-columns: repeat(3, 1fr);
}

.gameGrid {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.gameCard {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(246, 249, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
}

.gameImg {
  width: 100%;
  height: 112px;
  object-fit: cover;
  display: block;
  background: rgba(0, 0, 0, 0.03);
}

.securityBody {
  padding: 12px 14px 14px;
}

.securityRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.securityRow:last-child {
  border-bottom: 0;
}

.securityLeft {
  min-width: 0;
}

.securityTitle {
  color: rgba(17, 17, 17, 0.78);
  font-size: 13px;
  font-weight: 500;
}

.securityPct {
  color: rgba(251, 77, 64, 1);
  margin-left: 6px;
}

.securityDesc {
  margin-top: 6px;
  color: rgba(17, 17, 17, 0.55);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
}

.securityLevel {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(11, 102, 255, 0.12);
  border: 1px solid rgba(11, 102, 255, 0.18);
}

.securityToggle {
  width: 46px;
  height: 26px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  position: relative;
}

.securityToggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}

.downloadBody {
  padding: 12px 14px 14px;
  display: flex;
  gap: 12px;
  align-items: stretch;
  flex: 1;
}

.downloadGrid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.downloadCard {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  background: rgba(246, 249, 255, 0.9);
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.downloadQr {
  width: 120px;
  height: 120px;
  object-fit: contain;
  background: #fff;
  border-radius: 10px;
}

.downloadLabel {
  color: rgba(17, 17, 17, 0.7);
  font-size: 12px;
  font-weight: 500;
}

.downloadLogo {
  width: 92px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.downloadLogo img {
  width: 72px;
  height: auto;
}

.advGrid {
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.advItem {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 1);
  padding: 14px 14px;
}

.advIcon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(11, 102, 255, 0.12);
  border: 1px solid rgba(11, 102, 255, 0.18);
}

.advTitle {
  margin-top: 10px;
  color: rgba(17, 17, 17, 0.82);
  font-size: 14px;
  font-weight: 500;
}

.advDesc {
  margin-top: 8px;
  color: rgba(17, 17, 17, 0.6);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.6;
}

.siteFooter {
  height: 68px;
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.footerInner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  height: 68px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 16px;
  box-sizing: border-box;
}

.footerLabel {
  color: rgba(17, 17, 17, 0.55);
  font-size: 12px;
  font-weight: 500;
  margin-right: 10px;
}

.footerLeft,
.footerMid,
.footerRight {
  display: flex;
  align-items: center;
}

.footerBrand {
  height: 28px;
  width: auto;
}

.footerIcons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footerIcon {
  width: 32px;
  height: 32px;
}

.footerData {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dataDot {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.tileBtn {
  height: 44px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(246, 249, 255, 0.9);
  color: rgba(17, 17, 17, 0.72);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.tileBtn:hover {
  background: rgba(11, 102, 255, 0.06);
  border-color: rgba(11, 102, 255, 0.16);
}

.noticeList {
  padding: 10px 14px 14px;
}

.noticeItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.noticeItem:last-child {
  border-bottom: 0;
}

.noticeTitle {
  color: #333;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
}

.noticeIcon {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: url('/lt01/notice-icon.svg') center / 14px 14px no-repeat;
  flex: 0 0 auto;
}

.noticeText {
  overflow: hidden;
  text-overflow: ellipsis;
}

.noticeDate {
  color: rgba(51, 51, 51, 0.55);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.panelSplit {
  height: 10px;
  background: rgba(245, 247, 251, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.panelEmpty {
  min-height: 210px;
}

.panelHint {
  padding: 14px;
  color: rgba(17, 17, 17, 0.55);
  font-size: 12px;
  font-weight: 800;
}

.floatBar {
  position: fixed;
  right: 14px;
  top: 110px;
  width: 56px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  z-index: 50;
}

.floatItem {
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: rgba(17, 17, 17, 0.7);
  font-size: 12px;
  font-weight: 500;
}

.floatItem + .floatItem {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.floatItem:hover {
  background: rgba(11, 102, 255, 0.06);
}

.floatIcon {
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: rgba(11, 102, 255, 0.12);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 22px 22px;
}

.floatIcon[data-key='finance'] {
  background-image: url('/lt01/float-finance.svg');
}

.floatIcon[data-key='activity'] {
  background-image: url('/lt01/float-activity.svg');
}

.floatIcon[data-key='service'] {
  background-image: url('/lt01/float-service.svg');
}

.floatIcon[data-key='download'] {
  background-image: url('/lt01/float-download.svg');
}

.floatIcon[data-key='notice'] {
  background-image: url('/lt01/float-notice.svg');
}

.floatIcon[data-key='chat'] {
  background-image: url('/lt01/float-chat.svg');
}

@media (max-width: 980px) {
  .heroTitle {
    font-size: 40px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .gameGrid {
    grid-template-columns: 1fr 1fr;
  }

  .advGrid {
    grid-template-columns: 1fr 1fr;
  }

  .footerInner {
    grid-template-columns: 1fr;
    height: auto;
    padding: 10px 16px;
    gap: 10px;
  }

  .siteFooter {
    height: auto;
  }
}

@media (max-width: 740px) {
  .nav {
    display: none;
  }

  .btnGrid {
    grid-template-columns: 1fr 1fr;
  }

  .floatBar {
    display: none;
  }
}
</style>
