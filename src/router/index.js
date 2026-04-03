import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import HomePage from '../pages/HomePage.vue'
import GameListPage from '../pages/GameListPage.vue'
import ActivityListPage from '../pages/ActivityListPage.vue'
import UserProfilePage from '../pages/UserProfilePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/home', name: 'home', component: HomePage },
    { path: '/games/:apiType', name: 'games', component: GameListPage },
    { path: '/activities/:typeId', name: 'activities', component: ActivityListPage },
    { path: '/user', name: 'user', component: UserProfilePage },
  ],
})

export default router
