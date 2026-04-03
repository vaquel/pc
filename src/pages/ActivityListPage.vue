<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLoading from '../components/AppLoading.vue'
import SiteHeader from '../components/SiteHeader.vue'
import { activityApi } from '../api'

const route = useRoute()
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

const typeId = computed(() => Number(route.params.typeId ?? 0))
const pageTitle = computed(() => String(route.query.title || '活动列表'))

const loading = ref(false)
const items = ref([])

function normalizeAssetUrl(input) {
  if (!input) return ''
  const s = String(input).replaceAll('\\/', '/').trim()
  if (!s) return ''
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.includes('api.msgameapi.com') && !s.startsWith('http')) return `https://${s}`
  return s.startsWith('/') ? s : `/${s}`
}

function resolveImg(item) {
  return normalizeAssetUrl(item?.pc_img || item?.wap_img || item?.img || item?.cover || '')
}

async function loadList() {
  if (!typeId.value) return
  if (!getLocalToken()) return router.push('/login')
  loading.value = true
  try {
    const res = await activityApi.getList({ type_id: typeId.value })
    const list = Array.isArray(res?.data) ? res.data : []
    const mapped = list
      .map(it => ({
        title: String(it?.title || ''),
        orders: Number(it?.orders ?? it?.order ?? it?.sort ?? 0),
        img: resolveImg(it),
      }))
      .filter(it => it.title)
      .sort((a, b) => (a.orders ?? 0) - (b.orders ?? 0))
    items.value = mapped
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadList)
watch(typeId, loadList)
</script>

<template>
  <div class="page">
    <SiteHeader />

    <main class="main">
      <div class="panel">
        <div class="panelHeader">
          <div class="panelTitle">{{ pageTitle }}</div>
        </div>

        <AppLoading v-if="loading" class="state" variant="block" size="sm" />
        <div v-else-if="!items.length" class="state">暂无数据</div>
        <div v-else class="grid">
          <button v-for="g in items" :key="g.title" class="card" type="button">
            <div class="cardTitle">{{ g.title }}</div>
            <div class="cardMedia" aria-hidden="true">
              <img v-if="g.img" :src="g.img" alt="" />
            </div>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: rgba(245, 247, 251, 1);
}
.main {
  max-width: 1380px;
  margin: 0 auto;
  padding: 14px 16px 26px;
  box-sizing: border-box;
}
.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
  color: rgba(51, 51, 51, 0.98);
  font-size: 14px;
  font-weight: 600;
}
.state {
  padding: 18px 14px;
  color: rgba(51, 51, 51, 0.98);
  font-size: 14px;
  font-weight: 500;
}
.grid {
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.card {
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
.card:hover {
  border-color: rgba(11, 123, 255, 0.3);
  background: linear-gradient(180deg, rgba(226, 245, 255, 1), rgba(255, 255, 255, 1));
}
.cardTitle {
  font-size: 16px;
  font-weight: 600;
  color: rgba(51, 51, 51, 0.98);
  position: relative;
  z-index: 1;
}
.cardMedia {
  position: absolute;
  left: 10px;
  right: 10px;
  top: 44px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cardMedia img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
</style>
