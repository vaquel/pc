<script setup>
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeOnMask: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])

let lastBodyOverflow = ''
let hasLockedScroll = false

function setVisible(v) {
  emit('update:modelValue', v)
  if (!v) emit('close')
}

function close() {
  setVisible(false)
}

function onMaskClick() {
  if (!props.closeOnMask) return
  close()
}

function onKeydown(e) {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  v => {
    if (typeof document !== 'undefined') {
      if (v) {
        if (!hasLockedScroll) {
          lastBodyOverflow = document.body.style.overflow
          hasLockedScroll = true
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeydown)
      } else {
        if (hasLockedScroll) {
          document.body.style.overflow = lastBodyOverflow
          hasLockedScroll = false
        }
        window.removeEventListener('keydown', onKeydown)
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    if (hasLockedScroll) document.body.style.overflow = lastBodyOverflow
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="baseModal">
      <div
        v-if="modelValue"
        class="modalMask"
        role="dialog"
        aria-modal="true"
        :aria-label="title || '弹窗'"
      >
        <div class="modalMaskInner" @click="onMaskClick"></div>
        <div class="modal" @click.stop>
          <div class="modalHeader">
            <div class="modalTitle">{{ title }}</div>
            <button class="modalClose" type="button" aria-label="关闭" @click="close">×</button>
          </div>

          <div class="modalBody">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modalFooter">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modalMask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.modalMaskInner {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.modal {
  position: relative;
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
}

.modalHeader {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modalTitle {
  color: #111;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.modalClose {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(17, 17, 17, 0.85);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.modalClose:hover {
  background: rgba(0, 0, 0, 0.06);
}

.modalBody {
  padding: 18px 18px 8px;
  background: #f6f8fb;
}

.modalFooter {
  padding: 14px 18px 18px;
  background: #f6f8fb;
}

:deep(.modalField) {
  margin-bottom: 16px;
}

:deep(.modalLabel) {
  color: #2f2f2f;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

:deep(.modalInput) {
  width: 100%;
  height: 52px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  padding: 0 14px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
}

:deep(.modalInput:focus) {
  border-color: rgba(2, 129, 251, 0.85);
  box-shadow: 0 0 0 3px rgba(2, 129, 251, 0.12);
  background: #fff;
}

:deep(.modalBtn) {
  width: 100%;
  height: 56px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 64.29%), #0281fb;
  background-blend-mode: overlay, normal;
}

:deep(.modalBtn:hover) {
  filter: brightness(1.03);
}

.baseModal-enter-active,
.baseModal-leave-active {
  transition: opacity 160ms ease;
}

.baseModal-enter-from,
.baseModal-leave-to {
  opacity: 0;
}

.baseModal-enter-active .modal,
.baseModal-leave-active .modal {
  transition:
    transform 160ms ease,
    opacity 160ms ease;
}

.baseModal-enter-from .modal,
.baseModal-leave-to .modal {
  transform: translateY(10px) scale(0.98);
  opacity: 0;
}
</style>
