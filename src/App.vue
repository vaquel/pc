<script setup>
import { onMounted } from 'vue'
import GlobalModalHost from './components/GlobalModalHost.vue'
import GlobalToastHost from './components/GlobalToastHost.vue'
import { siteApi } from './api'
import { applySite } from './store/site'

onMounted(async () => {
  try {
    const res = await siteApi.getSite()
    applySite(res?.data)
  } catch {}
})
</script>

<template>
  <RouterView />
  <GlobalModalHost />
  <GlobalToastHost />
</template>

<style>
html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    'Noto Sans',
    'Liberation Sans',
    sans-serif;
}

#app {
  width: 100%;
  max-width: none;
  margin: 0;
  min-height: 100vh;
  display: block;
  border: 0;
  text-align: initial;
}

.loginbg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/assets/bg-CjwezJAO.png') #d3d3d3 50% / cover no-repeat;
  padding: 24px;
  box-sizing: border-box;
}

.LoginContent {
  width: 1000px;
  max-width: 100%;
  min-height: 540px;
  display: flex;
  border-radius: 7.2px;
  overflow: hidden;
  box-shadow: 0 7.707px 7.707px rgba(44, 160, 246, 0.2);
  background: #fff;
}

.LoginLeft {
  width: 500px;
  height: 540px;
  padding: 30px 22px;
  box-sizing: border-box;
  background: radial-gradient(234.87% 110.61% at 94.81% 78.75%, #0752c2 0.91%, #63b2fc 98.6%);
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 7.2px 0 0 7.2px;
  box-shadow: 0 7.707px 7.707px rgba(44, 160, 246, 0.2);
}

.welcome {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.leftLower {
  transform: translateY(10px);
}

.text1 {
  font-size: 60px;
  line-height: 1;
  font-weight: 400;
}

.text2 {
  font-size: 38.4px;
  line-height: 1;
  font-weight: 400;
}

.btnIcon {
  width: 18px;
  height: 18px;
  display: inline-flex;
}

.btnIcon svg {
  width: 18px;
  height: 18px;
}

.group {
  margin: 20px 0 0;
  background: url('/assets/group-jM_XPrRu.png') no-repeat;
  background-size: 100% 100%;
  height: 218px;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.group > .title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 0;
}

.group > .title > span {
  color: #333;
  font-size: 14.4px;
  font-weight: 500;
}

.group > .title .cont {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  top: -11px;
  right: 20px;
  gap: 10px;
}

.group > .title .cont span {
  color: #fff;
  font-size: 14.4px;
  font-weight: 500;
}

.group > .title .refresh {
  border: 0;
  background: transparent;
  padding: 0;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.group > .title .refresh svg {
  width: 18px;
  height: 18px;
}

.LoginLeft_top {
  height: 158px;
  overflow: hidden;
  display: flex;
  border-radius: 7.2px;
  border: 1.2px solid #fff;
  background: #fff;
  margin: 7px 20px;
}

.scrollbar-flex-content {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}

.scrollbar-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  text-align: center;
  flex-direction: column;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.scrollbar-item .content {
  width: 100px;
  height: 90px;
  border-radius: 7.2px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scrollbar-item .content .ms {
  height: 62px;
  line-height: 62px;
  text-align: center;
  font-size: 19.2px;
  font-weight: 500;
}

.scrollbar-item .content .progress {
  width: 80px;
  height: 4px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.scrollbar-item .content .progressFill {
  height: 100%;
  border-radius: 999px;
  background: currentColor;
}

.scrollbar-item .content.green {
  border: 1.2px solid rgba(33, 195, 59, 0.4);
  background: rgba(33, 195, 59, 0.1);
}

.scrollbar-item .content.green .ms {
  color: #21c33b;
}

.scrollbar-item .content.green .progressFill {
  background: #21c33b;
}

.scrollbar-item .content.green .progress {
  background: rgba(33, 195, 59, 0.15);
}

.scrollbar-item .content.yellow {
  border: 1.2px solid rgba(255, 153, 0, 0.4);
  background: rgba(255, 153, 0, 0.05);
}

.scrollbar-item .content.yellow .ms {
  color: #f90;
}

.scrollbar-item .content.yellow .progressFill {
  background: #f90;
}

.scrollbar-item .content.yellow .progress {
  background: rgba(255, 153, 0, 0.14);
}

.scrollbar-item .content.red {
  border: 1.2px solid rgba(251, 77, 64, 0.4);
  background: rgba(251, 77, 64, 0.05);
}

.scrollbar-item .content.red .ms {
  color: #fb4d40;
}

.scrollbar-item .content.red .progressFill {
  background: #fb4d40;
}

.scrollbar-item .content.red .progress {
  background: rgba(251, 77, 64, 0.12);
}

.scrollbar-item .content.active {
  box-shadow: 0 0 0 2px rgba(6, 159, 255, 0.25);
}

.scrollbar-item > .title {
  margin-top: 10px;
  color: #666;
  font-size: 14.4px;
  font-weight: 500;
}

.LoginLeft_bot {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  gap: 12px;
  margin: 40px 0 0;
}

.LoginLeft_bot .downloadItem {
  cursor: pointer;
  border-radius: 7.2px;
  background: rgba(255, 255, 255, 0.2);
  flex: 1;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  gap: 9px;
  border: 0;
}

.LoginRight {
  width: 500px;
  height: 540px;
  padding: 30px 50px 50px;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 0 7.2px 7.2px 0;
  box-shadow: 0 7.707px 7.707px rgba(44, 160, 246, 0.05);
}

.top_login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.top_login img {
  width: 180px;
}

.LoginRight_div {
  display: flex;
  flex-direction: column;
}

.LoginRight_div ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.LoginRight_div ul li {
  margin-bottom: 20px;
  position: relative;
}

.LoginRight_div ul li:focus-within input {
  border: 1px solid #069fff;
}

.LoginRight_div ul li input {
  width: 100%;
  height: 63px;
  padding: 0 5px 0 52px;
  color: #a1a1a1;
  box-sizing: border-box;
  border-radius: 7.2px;
  border: 1.44px solid #e8f4ff;
  background: #f8fbff;
  font-size: 20.16px;
  font-weight: 500;
  outline: none;
}

.LoginRight_div ul li input::placeholder {
  color: #a1a1a1;
  font-weight: 500;
}

.icon {
  color: #16a1fe;
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon svg {
  width: 20px;
  height: 20px;
}

.remember {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #292d45;
  font-size: 17.28px;
  font-weight: 400;
}

.rememberLeft {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #0b7bff;
}

.forgetPwd a {
  color: rgba(41, 45, 69, 0.6);
  font-size: 17.28px;
  font-weight: 400;
  text-decoration: none;
}

.forgetPwd a:hover {
  color: rgba(11, 123, 255, 1);
}

.loginBtn {
  width: 100%;
  height: 72px;
  line-height: 72px;
  border: 0;
  border-radius: 7.2px;
  cursor: pointer;
  color: #fff;
  user-select: none;
  text-align: center;
  margin-top: 40px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0) 64.29%), #0281fb;
  background-blend-mode: overlay, normal;
  font-size: 20.16px;
  font-weight: 500;
}

.loginBtn:hover {
  filter: brightness(1.03);
}

.change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 40px 0 0;
}

.item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f818f;
  font-size: 20.16px;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
}

.item:hover {
  color: rgba(11, 123, 255, 1);
}

.bottomIcon {
  width: 16px;
  height: 16px;
  display: inline-flex;
}

.bottomIcon svg {
  width: 16px;
  height: 16px;
}

.split {
  width: 2px;
  background: #d3d3d3;
  height: 20px;
  border-radius: 10px;
}

.registerModal .modal {
  width: 420px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
}

.registerModal .modalTitle {
  font-size: 18px;
}

.registerModal .modalBody {
  padding: 18px 16px 14px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
}

.registerModal .modalFooter {
  padding: 10px 16px 14px;
}

.registerModal .modalField {
  margin-bottom: 16px;
}

.registerModal .modalLabel {
  font-size: 14px;
  margin-bottom: 6px;
}

.registerModal .modalInput {
  height: 44px;
}

.codeRow {
  display: flex;
  gap: 10px;
  align-items: center;
}

.codeRow .modalInput {
  flex: 1;
}

.codeBtn {
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  color: rgba(17, 17, 17, 0.72);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.codeBtn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.codeBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.codeBtn:disabled:hover {
  background: #fff;
}

.registerModal .modalBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.registerModal .modalBtn:disabled:hover {
  filter: none;
}

@media (max-width: 520px) {
  .registerModal .modal {
    width: 420px;
  }
}

@media (max-width: 860px) {
  .LoginContent {
    flex-direction: column;
    min-height: auto;
  }

  .LoginLeft {
    width: 100%;
    height: auto;
    border-radius: 7.2px 7.2px 0 0;
  }

  .group {
    height: 218px;
  }

  .LoginRight {
    width: 100%;
    height: auto;
    border-radius: 0 0 7.2px 7.2px;
  }
}
</style>
