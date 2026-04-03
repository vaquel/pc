import { reactive } from 'vue'
import { showToast } from './toast'

export const modalState = reactive({
  visible: false,
  title: '提示',
  message: '',
})

export function showError(message, title = '错误') {
  void title
  showToast(String(message || '请求失败'), { type: 'error' })
}

export function hideModal() {
  modalState.visible = false
}
