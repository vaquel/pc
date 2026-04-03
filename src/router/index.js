import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import HomePage from '../pages/HomePage.vue'
import GameListPage from '../pages/GameListPage.vue'
import ActivityListPage from '../pages/ActivityListPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/home', name: 'home', component: HomePage },
    { path: '/games/:apiType', name: 'games', component: GameListPage },
    { path: '/activities/:typeId', name: 'activities', component: ActivityListPage },
  ],
})

export default router
