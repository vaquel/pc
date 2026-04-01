import { reactive } from 'vue'

export const modalState = reactive({
  visible: false,
  title: '提示',
  message: '',
})

export function showError(message, title = '错误') {
  modalState.title = title
  modalState.message = String(message || '请求失败')
  modalState.visible = true
}

export function hideModal() {
  modalState.visible = false
}

