<script setup>
defineProps({
  text: { type: String, default: '加载中...' },
  variant: { type: String, default: 'inline' },
  size: { type: String, default: 'md' },
  showText: { type: Boolean, default: true },
})
</script>

<template>
  <div class="appLoading" :data-variant="variant" :data-size="size" role="status" aria-live="polite">
    <span class="spinner" aria-hidden="true"></span>
    <span v-if="showText && text" class="text">{{ text }}</span>
  </div>
</template>

<style scoped>
.appLoading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(51, 51, 51, 0.78);
  font-size: 12px;
  font-weight: 600;
}

.appLoading[data-variant='block'] {
  display: flex;
  width: 100%;
}

.appLoading[data-variant='overlay'] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  z-index: 50;
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid rgba(2, 129, 251, 0.22);
  border-top-color: rgba(2, 129, 251, 0.92);
  animation: appLoadingSpin 0.78s linear infinite;
  flex: 0 0 auto;
}

.appLoading[data-size='xs'] .spinner {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.appLoading[data-size='sm'] .spinner {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.appLoading[data-size='lg'] .spinner {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

.text {
  white-space: nowrap;
}

@keyframes appLoadingSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
