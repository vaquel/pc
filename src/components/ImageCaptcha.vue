<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { captchaApi } from '../api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  code: { type: String, default: '' },
  length: { type: Number, default: 4 },
})

const emit = defineEmits(['update:modelValue', 'update:code'])

const inputValue = ref(props.code || '')
const imgSrc = ref('')
const loading = ref(false)

const normalizedInput = computed(() => inputValue.value.trim())

async function refresh() {
  inputValue.value = ''
  emit('update:code', '')
  emit('update:modelValue', false)
  loading.value = true
  try {
    const res = await captchaApi.getCaptcha()
    imgSrc.value = String(res?.data?.img || '')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.code,
  v => {
    if (String(v || '') === inputValue.value) return
    inputValue.value = String(v || '')
  },
)

watch(normalizedInput, () => {
  emit('update:code', inputValue.value)
  const need = Math.max(1, Number(props.length) || 0)
  const ok = normalizedInput.value.length >= need
  emit('update:modelValue', ok)
})

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="imageCaptcha" :data-verified="modelValue ? '1' : '0'">
    <input v-model="inputValue" class="input" type="text" placeholder="请输入图形验证码" />
    <div
      class="box"
      role="button"
      tabindex="0"
      aria-label="点击图片刷新验证码"
      @click="refresh"
      @keydown.enter.prevent="refresh"
      @keydown.space.prevent="refresh"
    >
      <img v-if="imgSrc" class="img" :src="imgSrc" alt="图形验证码" :aria-busy="loading ? 'true' : 'false'" />
      <div v-else class="imgPlaceholder" :aria-busy="loading ? 'true' : 'false'">加载中</div>
    </div>
  </div>
</template>

<style scoped>
.imageCaptcha {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
}

.input {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  padding: 0 14px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
}

.input:focus {
  border-color: rgba(2, 129, 251, 0.85);
  box-shadow: 0 0 0 3px rgba(2, 129, 251, 0.12);
  background: #fff;
}

.box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 44px;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #f8f9fa;
  flex-shrink: 0;
}

.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.imgPlaceholder {
  width: 100%;
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  user-select: none;
}
</style>
