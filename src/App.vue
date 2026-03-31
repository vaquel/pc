<script setup>
import { computed, ref } from 'vue'

const username = ref('')
const password = ref('')
const remember = ref(true)

const lines = ref([
  { id: 1, time: 0.101 },
  { id: 2, time: 1.768 },
  { id: 3, time: 1.873 },
])

const selectedLineId = ref(lines.value[0]?.id ?? 1)

const selectedLine = computed(() => lines.value.find(l => l.id === selectedLineId.value) ?? lines.value[0])

function getLineColor(time) {
  if (time <= 1) return 'green'
  if (time <= 1.5) return 'yellow'
  return 'red'
}

function getLinePercent(time) {
  const v = (2.8 - time) / 2.8
  return Math.max(0.08, Math.min(1, v))
}

function refreshLines() {
  lines.value = lines.value.map(l => ({
    ...l,
    time: Number((Math.random() * 2.8 + 0.08).toFixed(3)),
  }))
}

function selectLine(id) {
  selectedLineId.value = id
}

function onLogin() {
  const payload = {
    username: username.value.trim(),
    password: password.value,
    remember: remember.value,
    line: selectedLine.value?.id ?? null,
  }
  console.log('login payload', payload)
  alert('页面已复刻：这里仅做 UI 展示，未接入真实登录接口。')
}
</script>

<template>
  <div class="loginbg">
    <div class="LoginContent" role="main" aria-label="登录页">
      <section class="LoginLeft" aria-label="左侧信息区">
        <div class="welcome">
          <div class="text1">Welcome</div>
          <div class="text2">Always!</div>
        </div>

        <div class="LoginLeft_bot" aria-label="客户端下载">
          <button class="downloadItem" type="button">
            <span class="btnIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17.6 9.48l1.84-3.18a.25.25 0 0 0-.09-.34.25.25 0 0 0-.34.09l-1.85 3.2A9.94 9.94 0 0 0 12 8c-1.86 0-3.61.51-5.16 1.39L4.99 6.19a.25.25 0 0 0-.34-.09.25.25 0 0 0-.09.34L6.4 9.48A9.94 9.94 0 0 0 2 17h20a9.94 9.94 0 0 0-4.4-7.52ZM9.5 14.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
            </span>
            Android端下载
          </button>
          <button class="downloadItem" type="button">
            <span class="btnIcon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M16.5 13.1c-.1-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.8-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 6.9 1.1 9.2.7 1.1 1.6 2.3 2.8 2.3 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-.1 3-1.5.6-.9.8-1.3 1.3-2.4-.1 0-2.6-1-2.6-3.6ZM14.3 6.2c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.4-.6.7-1 1.7-.9 2.6 1 .1 1.9-.5 2.5-1.3Z"
                />
              </svg>
            </span>
            IOS端下载
          </button>
        </div>

        <div class="group" aria-label="线路选择">
          <div class="title">
            <span>线路选择</span>
            <div class="cont">
              <span>刷新</span>
              <button class="refresh" type="button" @click="refreshLines" aria-label="刷新线路">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 13.65-6.65Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div class="LoginLeft_top">
            <div class="scrollbar-flex-content">
              <button
                v-for="l in lines"
                :key="l.id"
                class="scrollbar-item"
                type="button"
                @click="selectLine(l.id)"
              >
                <div class="content" :class="[getLineColor(l.time), { active: l.id === selectedLineId }]">
                  <div class="ms">{{ l.time.toFixed(3) }} s</div>
                  <div class="progress" aria-hidden="true">
                    <div class="progressFill" :style="{ width: `${Math.round(getLinePercent(l.time) * 100)}%` }"></div>
                  </div>
                </div>
                <div class="title">线路{{ l.id }}</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="LoginRight" aria-label="右侧登录区">
        <div class="top_login">
          <img src="/assets/logo_blue-B7kOdN8N.png" alt="蓝图 blueprint" />
        </div>

        <form class="LoginRight_div" @submit.prevent="onLogin">
          <ul>
            <li>
              <span class="icon a" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                  />
                </svg>
              </span>
              <input v-model="username" type="text" autocomplete="username" placeholder="请输入您的用户名" />
            </li>
            <li>
              <span class="icon b" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-6h-1V9a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-3 0H9V9a3 3 0 0 1 6 0v2Z"
                  />
                </svg>
              </span>
              <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入您的登录密码" />
            </li>
          </ul>

          <div class="remember">
            <label class="rememberLeft">
              <input v-model="remember" class="checkbox" type="checkbox" />
              <span>记住密码</span>
            </label>
            <div class="forgetPwd">
              <a href="javascript:void(0)">忘记密码?</a>
            </div>
          </div>

          <button class="loginBtn" type="submit">登 陆</button>

          <div class="change" aria-label="辅助链接">
            <a class="item" href="javascript:void(0)">
              <span class="bottomIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Zm1-13h-2v5.59l-2.29 2.3 1.42 1.41L13 13.41Z"
                  />
                </svg>
              </span>
              解除锁定
            </a>
            <span class="split" aria-hidden="true"></span>
            <a class="item" href="javascript:void(0)">
              <span class="bottomIcon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 1a10 10 0 0 0-10 10v7a3 3 0 0 0 3 3h1v-9H5a7 7 0 0 1 14 0h-1v9h1a3 3 0 0 0 3-3v-7A10 10 0 0 0 12 1Z"
                  />
                </svg>
              </span>
              联系客服
            </a>
          </div>
        </form>
      </section>
    </div>
  </div>
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
