<script setup>
import { toastState, hideToast } from '../ui/toast'
</script>

<template>
  <div class="toastHost" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div" class="toastList">
      <div
        v-for="t in toastState.toasts"
        :key="t.id"
        class="toast"
        :data-type="t.type"
        role="status"
        @click="hideToast(t.id)"
      >
        <span class="toastMsg">{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toastHost {
  position: fixed;
  left: 50%;
  top: 24px;
  transform: translateX(-50%);
  z-index: 1000;
  pointer-events: none;
}
.toastList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.toast {
  min-width: 220px;
  max-width: 90vw;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(51, 51, 51, 0.92);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
  pointer-events: auto;
}
.toast[data-type='error'] {
  background: rgba(251, 77, 64, 0.92);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 220ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.toastMsg {
  word-break: break-word;
}
</style>
