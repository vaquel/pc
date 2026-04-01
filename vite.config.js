import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/site': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/banner': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/notice': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/reg_c': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/captcha': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/sms': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: 'https://api.msgameapi.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
