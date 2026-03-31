<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const trackRef = ref(null)
const progress = ref(0)
const dragging = ref(false)
const locked = ref(false)
const pointerId = ref(null)

const label = computed(() => (props.modelValue ? '验证通过' : '请按住滑块，拖动到最右边'))

function reset() {
  progress.value = 0
  dragging.value = false
  locked.value = false
  pointerId.value = null
}

watch(
  () => props.modelValue,
  v => {
    if (v) {
      progress.value = 100
      locked.value = true
      dragging.value = false
    } else {
      reset()
    }
  },
  { immediate: true },
)

function setVerified(v) {
  emit('update:modelValue', v)
}

function onPointerDown(e) {
  if (locked.value) return
  if (!trackRef.value) return
  dragging.value = true
  pointerId.value = e.pointerId
  try {
    e.currentTarget?.setPointerCapture?.(e.pointerId)
  } catch {}
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp, { once: true })
}

function onPointerMove(e) {
  if (!dragging.value) return
  if (pointerId.value != null && e.pointerId !== pointerId.value) return
  if (!trackRef.value) return

  const rect = trackRef.value.getBoundingClientRect()
  const max = Math.max(1, rect.width - 44)
  const raw = (e.clientX - rect.left - 22) / max
  const pct = Math.max(0, Math.min(1, raw))
  const next = Math.round(pct * 100)
  progress.value = next

  if (next >= 100) {
    locked.value = true
    dragging.value = false
    progress.value = 100
    setVerified(true)
    cleanupListeners()
  }
}

function onPointerUp(e) {
  if (pointerId.value != null && e.pointerId !== pointerId.value) return
  if (!dragging.value) return

  dragging.value = false
  pointerId.value = null
  if (!locked.value) {
    progress.value = 0
    setVerified(false)
  }
  cleanupListeners()
}

function cleanupListeners() {
  window.removeEventListener('pointermove', onPointerMove)
}

onBeforeUnmount(() => {
  cleanupListeners()
})
</script>

<template>
  <div class="sliderCaptcha" :data-verified="modelValue ? '1' : '0'">
    <div ref="trackRef" class="track">
      <div class="fill" :style="{ width: `${progress}%` }"></div>
      <div class="text">{{ label }}</div>
      <button
        class="handle"
        type="button"
        :aria-label="label"
        :data-dragging="dragging ? '1' : '0'"
        :data-locked="locked ? '1' : '0'"
        :style="{ left: `calc(${progress}% - 22px)` }"
        @pointerdown="onPointerDown"
      >
        <span class="arrow" aria-hidden="true">»</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sliderCaptcha {
  width: 100%;
}

.track {
  position: relative;
  height: 44px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  user-select: none;
}

.fill {
  position: absolute;
  inset: 0;
  width: 0%;
  background: linear-gradient(90deg, rgba(2, 129, 251, 0.2), rgba(2, 129, 251, 0.35));
  transition: width 80ms linear;
}

.text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(17, 17, 17, 0.7);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}

.handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 0;
  background: #fff;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
  cursor: grab;
  touch-action: none;
}

.handle[data-dragging='1'] {
  cursor: grabbing;
}

.arrow {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: rgba(17, 17, 17, 0.65);
  font-size: 18px;
  font-weight: 800;
}

.sliderCaptcha[data-verified='1'] .track {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(2, 129, 251, 0.35);
}

.sliderCaptcha[data-verified='1'] .fill {
  background: linear-gradient(90deg, rgba(46, 204, 113, 0.22), rgba(46, 204, 113, 0.38));
}

.sliderCaptcha[data-verified='1'] .text {
  color: rgba(17, 17, 17, 0.72);
}
</style>
