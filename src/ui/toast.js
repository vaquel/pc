import { reactive } from 'vue'

export const toastState = reactive({
  toasts: [],
})

let nextId = 1

export function showToast(message, { type = 'info', durationMs = 3000 } = {}) {
  const text = String(message || '').trim()
  if (!text) return 0

  const id = nextId++
  toastState.toasts.push({
    id,
    message: text,
    type: String(type || 'info'),
  })

  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      hideToast(id)
    }, Math.max(1000, Number(durationMs || 3000)))
  }

  return id
}

export function hideToast(id) {
  const i = toastState.toasts.findIndex(t => t.id === id)
  if (i >= 0) toastState.toasts.splice(i, 1)
}

